import { Injectable } from '@angular/core';
import {DataDumpClass} from '../models/data-dump';
import {PayPeriodClass} from '../models/pay-period';
import {TransactionItem} from '../models/transaction-item';
import { BudgetItem } from '../models/budget-item';

@Injectable({
  providedIn: 'root'
})
export class CalculatorService {

  constructor(
  ) {  }

  GetCurrentPayPeriod(dataSnapshot: DataDumpClass): PayPeriodClass {
    if (dataSnapshot.Settings !== null) {
      // No settings yet, so try to extrapolate
      return(this.GetAssumedPayPeriod());
    } else {
      const today = new Date();
      const targetDate: Date = dataSnapshot.Settings.PayPeriodStart;
      let measureDate: Date = targetDate;
      if (targetDate === null) {
        return(this.GetAssumedPayPeriod());
      }
      do {
        targetDate.setDate(targetDate.getDate() + 14);
        measureDate = targetDate;
        measureDate.setDate(targetDate.getDate() + 14);
      } while (targetDate <= today && measureDate <= today);

      return(new PayPeriodClass(targetDate, measureDate));
    }
  }

  GetAssumedPayPeriod(): PayPeriodClass {
    const startDate = new Date(2019, 1, 15);
    const today = new Date((new Date()).toDateString());
    const targetDate = new Date(2019, 1, 15);
    let measureDate = new Date();
    measureDate.setDate(targetDate.getDate() + 14);
    measureDate = new Date(measureDate.toDateString());

    while (today.getTime() <= targetDate.getTime()) {
      targetDate.setDate(targetDate.getDate() + 14);
      measureDate.setDate(targetDate.getDate() + 14);
    }
    return new PayPeriodClass(targetDate, measureDate);
  }

  GetCurrentPayPeriodRemainingTotal(dataSnapshot: DataDumpClass, payPeriod: PayPeriodClass) {
    let remainingTotal = 0;
    const activeBudgetItems = this.GetBudgetItemsForPayPeriod(dataSnapshot, payPeriod);
    const activeTransactions = this.GetFullPayPeriodTransactionTotal(dataSnapshot, payPeriod);
    activeBudgetItems.forEach(budgetItem => {
      let transactionTotal = activeTransactions[budgetItem.name];
      if (transactionTotal == null) {
        transactionTotal = 0;
      }
      if (transactionTotal < budgetItem.averagePayment) {
        remainingTotal += (budgetItem.averagePayment - transactionTotal);
      }
    });
    return remainingTotal;
  }

  GetBudgetItemsForPayPeriod(dataSnapshot: DataDumpClass, payPeriod: PayPeriodClass): BudgetItem[] {
    const activeBudgetItems = dataSnapshot.BudgetItems.filter((value: BudgetItem, index: number, array: BudgetItem[]) => {
      return this.IsDayInPayPeriod(value.dueDay, payPeriod);
    });
    return activeBudgetItems;
  }

  GetFullPayPeriodTransactionTotal(dataSnapshot: DataDumpClass, payPeriod?: PayPeriodClass): number {
    const totals = this.GetPayPeriodTransactionTotals(dataSnapshot, payPeriod);
    let total = 0;
    Object.keys(totals).forEach(key => {
      total += totals[key];
    });
    return total;
  }

  GetPayPeriodTransactionTotals(dataSnapshot: DataDumpClass, payPeriod?: PayPeriodClass): any {
    const currentTotals = {};
    if (dataSnapshot.TransactionItems === null) {
      return currentTotals;
    }
    if (payPeriod == null) {
      payPeriod = this.GetCurrentPayPeriod(dataSnapshot);
    }
    dataSnapshot.TransactionItems.map((value: TransactionItem, index: number, array: TransactionItem[]) => {
      if (value.transactionDate.getTime() >= payPeriod.StartDate.getTime()
      && value.transactionDate.getTime() <= payPeriod.EndDate.getTime()) {
        if (currentTotals[value.transactionType] === null) {
          currentTotals[value.transactionType] = value.actualAmount;
        } else {
          currentTotals[value.transactionType] = currentTotals[value.transactionType] + value.actualAmount;
        }
      }
    });

    return currentTotals;
  }

  GetCurrentPayPeriodTotalForCategory(category: string, dataSnapshot: DataDumpClass): number {
    const currentTotals = this.GetPayPeriodTransactionTotals(dataSnapshot);
    if (currentTotals[category] === null) {
      return 0;
    } else {
      return currentTotals[category];
    }
  }

  GetExpectedTotalAmount(dataSnapshot: DataDumpClass): number {
    let expectedTotal = 0;
    dataSnapshot.BudgetItems.forEach(budgetItem => {
      if (budgetItem.everyPayPeriod === true || this.IsDayInPayPeriod(budgetItem.dueDay, this.GetCurrentPayPeriod(dataSnapshot) )) {
        expectedTotal += budgetItem.averagePayment;
      }
    });
    return expectedTotal;
  }

  IsDayInPayPeriod(day: number, payPeriod: PayPeriodClass): boolean {
    if (day >= payPeriod.StartDate.getDate() && day < payPeriod.EndDate.getDate()
      && payPeriod.EndDate.getDate() > payPeriod.StartDate.getDate()) {
      // Day falls in between smaller start and larger end
      return true;
    }
    if (day >= payPeriod.StartDate.getDate() && payPeriod.EndDate.getDate() < payPeriod.StartDate.getDate()) {
      return true;
    }
    if (day < payPeriod.StartDate.getDate() && day < payPeriod.EndDate.getDate()
      && payPeriod.EndDate.getDate() < payPeriod.StartDate.getDate()) {
      return true;
    }
    return false;
  }

  GetExpectedAmountForCategory(category: string, dataSnapshot: DataDumpClass): number {
    let expectedAmount = 0;

    for (let i = 0; i < dataSnapshot.BudgetItems.length; i++) {
      if (dataSnapshot.BudgetItems[i].name === category) {
        expectedAmount = dataSnapshot.BudgetItems[i].averagePayment;
        break;
      }
    }
    return expectedAmount;
  }

  HasCategoryMetExpectedAmount(category: string, dataSnapshot: DataDumpClass): boolean {
    if (dataSnapshot === null) {
      return false;
    }
    const expectedAmount: number = this.GetExpectedAmountForCategory(category, dataSnapshot);
    const actualAmount: number = this.GetCurrentPayPeriodTotalForCategory(category, dataSnapshot);
    return actualAmount >= expectedAmount;
  }
}

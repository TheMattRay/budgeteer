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
      } while (targetDate.getTime() <= today.getTime() && measureDate.getTime() <= today.getTime());

      return(new PayPeriodClass(targetDate, measureDate));
    }
  }

  GetJustDateString(date: Date): string {
    const result = (date.getUTCMonth() + 1) + '/' + date.getUTCDate() + '/' + date.getUTCFullYear();
    return result;
  }

  GetAssumedPayPeriod(): PayPeriodClass {
    const startDate = new Date(2019, 1, 15);
    const today = new Date((new Date()).toDateString());
    const targetDate = new Date(2019, 1, 15);
    let measureDate = new Date(2019, 1, 28);
    measureDate = new Date(this.GetJustDateString(measureDate));

    while (today.getTime() > measureDate.getTime()) {
      targetDate.setDate(targetDate.getDate() + 14);
      measureDate.setDate(measureDate.getDate() + 14);
    }
    return new PayPeriodClass(targetDate, measureDate);
  }

  GetCurrentPayPeriodRemainingTotal(dataSnapshot: DataDumpClass, payPeriod: PayPeriodClass) {
    let remainingTotal = 0;
    const activeBudgetItems = this.GetBudgetItemsForPayPeriod(dataSnapshot, payPeriod);
    activeBudgetItems.forEach(budgetItem => {
      let activeTransactions = this.GetPayPeriodTotalForCategory(budgetItem.name, dataSnapshot, payPeriod);
      if (activeTransactions === null || activeTransactions === undefined) {
        activeTransactions = 0;
      }
      if (activeTransactions < budgetItem.averagePayment) {
        remainingTotal += (budgetItem.averagePayment - activeTransactions);
      }
    });
    return remainingTotal;
  }

  GetBudgetItemsForPayPeriod(dataSnapshot: DataDumpClass, payPeriod: PayPeriodClass): BudgetItem[] {
    const activeBudgetItems = dataSnapshot.BudgetItems.filter((value: BudgetItem, index: number, array: BudgetItem[]) => {
      return this.IsDayInPayPeriod(value.dueDay, payPeriod) || value.everyPayPeriod === true;
    });
    return activeBudgetItems;
  }

  GetFullPayPeriodTransactionTotal(dataSnapshot: DataDumpClass, payPeriod?: PayPeriodClass): number {
    const totals = this.GetPayPeriodTransactionTotals(dataSnapshot, payPeriod);
    let total = 0;
    Object.keys(totals).forEach(key => {
      total += Number.parseFloat(totals[key]);
    });
    return total;
  }

  GetPayPeriodTransactionTotals(dataSnapshot: DataDumpClass, payPeriod?: PayPeriodClass): any {
    const currentTotals = {};
    if (dataSnapshot.TransactionItems === null || dataSnapshot.TransactionItems === undefined) {
      return currentTotals;
    }
    if (payPeriod == null) {
      payPeriod = this.GetCurrentPayPeriod(dataSnapshot);
    }
    dataSnapshot.TransactionItems.map((value: TransactionItem, index: number, array: TransactionItem[]) => {
      const txTime = new Date(value.transactionDate).getTime();
      if (txTime >= payPeriod.StartDate.getTime()
      && txTime <= payPeriod.EndDate.getTime()) {
        if (currentTotals[value.transactionType] === null || currentTotals[value.transactionType] === undefined) {
          currentTotals[value.transactionType] = value.actualAmount;
        } else {
          currentTotals[value.transactionType] = currentTotals[value.transactionType] + value.actualAmount;
        }
      }
    });

    return currentTotals;
  }

  GetPayPeriodTotalForCategory(category: string, dataSnapshot: DataDumpClass, payPeriod?: PayPeriodClass): number {
    const currentTotals = this.GetPayPeriodTransactionTotals(dataSnapshot, payPeriod);
    if (currentTotals[category] === null || currentTotals[category] === undefined) {
      return 0;
    } else {
      return currentTotals[category];
    }
  }

  GetExpectedTotalAmount(dataSnapshot: DataDumpClass, payPeriod?: PayPeriodClass): number {
    let expectedTotal = 0;
    if (payPeriod === null || payPeriod === undefined) {
      payPeriod = this.GetCurrentPayPeriod(dataSnapshot);
    }
    dataSnapshot.BudgetItems.forEach(budgetItem => {
      if (budgetItem.everyPayPeriod === true || this.IsDayInPayPeriod(budgetItem.dueDay, payPeriod )) {
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
    const actualAmount: number = this.GetPayPeriodTotalForCategory(category, dataSnapshot);
    return actualAmount >= expectedAmount;
  }
}

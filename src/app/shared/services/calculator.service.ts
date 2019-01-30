import { Injectable } from '@angular/core';
import {DataDumpClass} from '../models/data-dump';
import {PayPeriodClass} from '../models/pay-period';
import {TransactionItem} from '../models/transaction-item';

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
      if (targetDate === null) {
        return(this.GetAssumedPayPeriod());
      }
      do {
        targetDate.setDate(targetDate.getDate() + 14);
      } while (targetDate <= today && new Date(targetDate.getDate() + 14) <= today);

      return(new PayPeriodClass(targetDate, new Date(targetDate.getDate() + 14)));
    }
  }

  GetAssumedPayPeriod(): PayPeriodClass {
    const startDate = new Date(2019, 1, 18);
    const today = new Date();
    const targetDate = startDate;

    do {
      targetDate.setDate(targetDate.getDate() + 14);
    } while (targetDate <= today && new Date(targetDate.getDate() + 14) <= today);

    return new PayPeriodClass(targetDate, new Date(targetDate.getDate() + 14));
  }

  GetCurrentPayPeriodTransactionTotals(dataSnapshot: DataDumpClass): any {
    const currentTotals = {};
    if (dataSnapshot.TransactionItems === null) {
      return currentTotals;
    }
    const payPeriod: PayPeriodClass = this.GetCurrentPayPeriod(dataSnapshot);
    dataSnapshot.TransactionItems.map((value: TransactionItem, index: number, array: TransactionItem[]) => {
      if (value.transactionDate >= payPeriod.StartDate && value.transactionDate <= payPeriod.EndDate) {
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
    const currentTotals = this.GetCurrentPayPeriodTransactionTotals(dataSnapshot);
    if (currentTotals[category] === null) {
      return 0;
    }
    else {
      return currentTotals[category];
    }
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

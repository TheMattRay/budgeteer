import {Injectable, OnInit} from '@angular/core';
import {BudgetItem} from '../models/budget-item';
import {DataDumpClass} from '../models/data-dump';
import {TransactionItem} from '../models/transaction-item';
import {Router} from '@angular/router';
import {FirebaseService} from './firebase.service';
import {IncomeItem} from '../models/income-item';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  public currentBudgetItem: BudgetItem;
  public currentDataSnapshot: DataDumpClass;
  public currentTransactionItem: TransactionItem;
  public currentBudget: BudgetItem[];
  public currentTransactions: TransactionItem[];
  public currentIncome: IncomeItem;
  public currentSettings: any;

  constructor(
      private router: Router,
      private fbs: FirebaseService
  ) {
    this.initThisB();
  }

  private initThisB() {
    this.newBudgetItem();
    this.newTransactionItem();
    this.currentBudget = [];
    this.currentTransactions = [];
    this.currentIncome = {} as IncomeItem;
    this.currentSettings = {};
    this.fbs.getData().then((dataSnapshot: DataDumpClass) => {
      this.setSnapshot(dataSnapshot);
    });
  }

  getJSON(thing: any): string {
    return JSON.stringify(thing);
  }

  setSnapshot(dataSnapshot: DataDumpClass) {
    this.currentDataSnapshot = dataSnapshot;
    this.currentBudget = dataSnapshot.BudgetItems === undefined ? [] : dataSnapshot.BudgetItems;
    this.currentIncome = dataSnapshot.IncomeItem === undefined || dataSnapshot.IncomeItem.expectedPay === undefined ?
        {} as IncomeItem : dataSnapshot.IncomeItem;
    this.currentTransactions = dataSnapshot.TransactionItems === undefined ? [] : dataSnapshot.TransactionItems;
    this.currentSettings = dataSnapshot.Settings === undefined ? {} : dataSnapshot.Settings;

    this.currentBudget.sort(this.budgetSorter);

    this.currentDataSnapshot = {
      BudgetItems: this.currentBudget,
      IncomeItem: this.currentIncome,
      TransactionItems: this.currentTransactions,
      Settings: this.currentSettings
    };
  }

  newTransactionItem() {
    this.currentTransactionItem = {
      id: -1,
      transactionType: '',
      transactionDate: new Date(),
      actualAmount: 0,
      estimatedAmount: null,
      note: '',
      vendorPlace: ''
    };
  }

  setTransactionItemById(id: number) {
    for (let i = 0; i < this.currentTransactions.length; i++) {
      if (this.currentTransactions[i].id === id) {
        this.currentTransactionItem = this.currentTransactions[i];
        break;
      }
    }
  }

  saveTransactionItem() {
    if (this.currentTransactionItem.id > -1) {
      for (let i = 0; i < this.currentBudget.length; i++) {
        if (this.currentTransactions[i].id === this.currentTransactionItem.id) {
          this.currentTransactions[i] = this.currentTransactionItem;
          break;
        }
      }
    } else {
      this.currentTransactionItem.id = this.getNewId(this.currentTransactions);
      this.currentTransactions.push(this.currentTransactionItem);
    }

    // Set whole budget
    this.currentDataSnapshot.TransactionItems = this.currentTransactions;

    // Persist to FB
    this.fbs.setData(this.currentDataSnapshot).then((value: any) => {
      this.router.navigate(['/tabs/transactions']).then((value: boolean) => {
      });
    });
  }

  newBudgetItem() {
    this.currentBudgetItem = {
      id: -1,
      name: '',
      everyPayPeriod: false,
      includeInCalculations: true,
      dueDay: new Date().getDate(),
      averagePayment: 0,
      note: ''
    };
  }

  setBudgetItemById(id: number) {
    for (let i = 0; i < this.currentBudget.length; i++) {
      if (this.currentBudget[i].id === id) {
        this.currentBudgetItem = this.currentBudget[i];
        break;
      }
    }
  }

  saveIncomeItem() {
    // Set whole budget
    this.currentDataSnapshot.IncomeItem = this.currentIncome;

    // Persist to FB
    this.fbs.setData(this.currentDataSnapshot).then((value: any) => {
    });
  }

  saveBudgetItem() {
    if (this.currentBudgetItem.id > -1) {
      for (let i = 0; i < this.currentBudget.length; i++) {
        if (this.currentBudget[i].id === this.currentBudgetItem.id) {
          this.currentBudget[i] = this.currentBudgetItem;
          break;
        }
      }
    } else {
      this.currentBudgetItem.id = this.getNewId(this.currentBudget);
      this.currentBudget.push(this.currentBudgetItem);
    }

    // Set whole budget
    this.currentDataSnapshot.BudgetItems = this.currentBudget;

    // Persist to FB
    this.fbs.setData(this.currentDataSnapshot).then((value: any) => {
      this.router.navigate(['/tabs/budget']).then((value: boolean) => {
      });
    });
  }

  getHighestId(collection: any): number {
    let max = -1;
    for (let i = 0; i < collection.length; i++) {
      if (collection[i].id > max) {
        max = collection[i].id;
      }
    }
    return max;
  }

  getNewId(collection: any): number {
    return this.getHighestId(collection) + 1;
  }

  private budgetSorter(a: BudgetItem, b: BudgetItem): number {
    if (a.includeInCalculations && !b.includeInCalculations) {
      return -1;
    }
    if (a.includeInCalculations && a.everyPayPeriod && !b.everyPayPeriod && b.includeInCalculations) {
      return -1;
    }
    if (a.dueDay < b.dueDay) {
      return -1;
    } else if (a.dueDay > b.dueDay) {
      return +1;
    }
    if (a.name < b.name) {
      return -1;
    } else if (a.name > b.name) {
      return +1;
    }
    return 0;
  }

  getBudgetItemByName(name: string): BudgetItem {
    return this.currentBudget.find((value: BudgetItem, index: number, obj: BudgetItem[]) => {
      return value.name === name;
    });
  }
}



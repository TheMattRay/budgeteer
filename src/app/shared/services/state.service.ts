import {Injectable, OnInit} from '@angular/core';
import {BudgetItem} from '../models/budget-item';
import {DataDumpClass} from '../models/data-dump';
import {TransactionItem} from '../models/transaction-item';
import {Router} from '@angular/router';
import {FirebaseService} from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  public currentBudgetItem: BudgetItem;
  public currentDataSnapshot: DataDumpClass;
  public currentTransactionItem: TransactionItem;
  public currentBudget: BudgetItem[];
  public currentTransactions: TransactionItem[];
  public currentIncome: any;
  public currentSettings: any;

  constructor(
      private router: Router,
      private fbs: FirebaseService
  ) {
    this.initThisB();
  }

  private initThisB() {
    this.fbs.getData().then((dataSnapshot: DataDumpClass) => {
      this.setSnapshot(dataSnapshot);
    });
    this.newBudgetItem();
  }

  getJSON(thing: any): string {
    return JSON.stringify(thing);
  }

  setSnapshot(dataSnapshot: DataDumpClass) {
    this.currentDataSnapshot = dataSnapshot;
    this.currentBudget = dataSnapshot.BudgetItems === undefined ? [] : dataSnapshot.BudgetItems;
    this.currentIncome = dataSnapshot.IncomeItems === undefined ? [] : dataSnapshot.IncomeItems;
    this.currentTransactions = dataSnapshot.TransactionItems === undefined ? [] : dataSnapshot.TransactionItems;
    this.currentSettings = dataSnapshot.Settings === undefined ? {} : dataSnapshot.Settings;

    this.currentBudget.sort(this.budgetSorter);

    this.currentDataSnapshot = {
      BudgetItems: this.currentBudget,
      IncomeItems: this.currentIncome,
      TransactionItems: this.currentTransactions,
      Settings: this.currentSettings
    };
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
    }
    if (a.name < b.name) {
      return -1;
    }
    return 0;
  }
}



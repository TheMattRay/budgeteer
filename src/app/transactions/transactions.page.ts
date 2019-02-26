import { Component, OnInit, ViewChild } from '@angular/core';
import {FirebaseService} from '../shared/services/firebase.service';
import {DataDumpClass} from '../shared/models/data-dump';
import {CalculatorService} from '../shared/services/calculator.service';
import {PayPeriodClass} from '../shared/models/pay-period';
import {StateService} from '../shared/services/state.service';
import {Router} from '@angular/router';
import { TransactionItem } from '../shared/models/transaction-item';
import { EditTransactionPage } from './edit-transaction/edit-transaction.page';

@Component({
  selector: 'app-tab3',
  templateUrl: 'transactions.page.html',
  styleUrls: ['transactions.page.scss']
})
export class TransactionsPage {
  @ViewChild( EditTransactionPage )
  private editPage: EditTransactionPage;

  public listOfTransactions: TransactionItem[];
  private payPeriod: PayPeriodClass;

  constructor(
    private fbs: FirebaseService,
    private cs: CalculatorService,
    private stateService: StateService,
    private router: Router
  ) {
  }

  ionViewDidEnter() {
    // Retrieve list of budget items from storage
    this.fbs.getData().then((dataSnapshot: DataDumpClass) => {
      this.stateService.setSnapshot(dataSnapshot);
      this.listOfTransactions = this.stateService.currentTransactions;

      // Sort items by date
      this.listOfTransactions.sort((a: TransactionItem, b: TransactionItem) => {
        if (a.transactionDate < b.transactionDate) {
          return -1;
        } else if (a.transactionDate > b.transactionDate) {
          return 1;
        }
        if (a.transactionType < b.transactionType) {
          return -1;
        } else if (a.transactionType > b.transactionType) {
          return 1;
        }
        return 0;
      });
      // Set pay period
      this.payPeriod = this.cs.GetCurrentPayPeriod(this.stateService.currentDataSnapshot);
    });
  }

  addTransaction() {
    this.stateService.newTransactionItem();

    this.router.navigate(['/tabs/transactions/edit']).then((value: boolean) => {
    });
  }

  formatShortDate(period: Date) {
    return period.getMonth() + 1 + '/' + period.getDate() + '/' + period.getFullYear();
  }

  formatShortDateString(stringDate: string) {
    const period = new Date(stringDate);
    return period.getMonth() + 1 + '/' + period.getDate() + '/' + period.getFullYear();
  }
}

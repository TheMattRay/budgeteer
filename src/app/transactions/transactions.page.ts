import { Component, OnInit } from '@angular/core';
import {FirebaseService} from '../shared/services/firebase.service';
import {DataDumpClass} from '../shared/models/data-dump';
import {CalculatorService} from '../shared/services/calculator.service';
import {PayPeriodClass} from '../shared/models/pay-period';
import {StateService} from '../shared/services/state.service';
import {Router} from '@angular/router';
import { TransactionItem } from '../shared/models/transaction-item';

@Component({
  selector: 'app-tab3',
  templateUrl: 'transactions.page.html',
  styleUrls: ['transactions.page.scss']
})
export class TransactionsPage implements OnInit {

  private listOfTransactions: TransactionItem[];
  private payPeriod: PayPeriodClass;

  constructor(
    private fbs: FirebaseService,
    private cs: CalculatorService,
    private stateService: StateService,
    private router: Router
  ) {
  }

  ngOnInit() {
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
}

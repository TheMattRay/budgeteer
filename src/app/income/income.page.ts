import {Component, OnInit} from '@angular/core';
import {BudgetItem} from '../shared/models/budget-item';
import {PayPeriodClass} from '../shared/models/pay-period';
import {FirebaseService} from '../shared/services/firebase.service';
import {CalculatorService} from '../shared/services/calculator.service';
import {StateService} from '../shared/services/state.service';
import {Router} from '@angular/router';
import {DataDumpClass} from '../shared/models/data-dump';

@Component({
  selector: 'app-tab2',
  templateUrl: 'income.page.html',
  styleUrls: ['income.page.scss']
})
export class IncomePage implements OnInit {
  private currentPayPeriod: PayPeriodClass;
  private expectedPay: number;
  private actualPay: number;
  private expectedExpenses: number;
  private expectedRemainingAfterExpenses: number;
  private currentTransactionTotal: number;
  private remainingExpenses: number;
  private carryover: number;
  private estimatedRemainingBalance: number;

  private earliestPayPeriod: PayPeriodClass;

  constructor(
      private fbs: FirebaseService,
      private cs: CalculatorService,
      private stateService: StateService,
      private router: Router
  ) {
  }

  ngOnInit() {
    // Use generic placeholders
    this.currentPayPeriod = new PayPeriodClass(new Date(), new Date());

    // Retrieve list of budget items from storage
    this.fbs.getData().then((dataSnapshot: DataDumpClass) => {
      this.stateService.setSnapshot(dataSnapshot);

      // Set pay period
      this.currentPayPeriod = this.cs.GetCurrentPayPeriod(this.stateService.currentDataSnapshot);
      this.earliestPayPeriod = this.cs.GetCurrentPayPeriod(this.stateService.currentDataSnapshot);

      this.calculate();
    });
  }

  left() {
    if (this.currentPayPeriod.StartDate > this.earliestPayPeriod.StartDate) {
      this.currentPayPeriod.StartDate.setDate(this.currentPayPeriod.StartDate.getDate() - 14);
      this.currentPayPeriod.EndDate.setDate(this.currentPayPeriod.EndDate.getDate() - 14);
      this.calculate();
    }
  }

  right() {
    this.currentPayPeriod.StartDate.setDate(this.currentPayPeriod.StartDate.getDate() + 14);
    this.currentPayPeriod.EndDate.setDate(this.currentPayPeriod.EndDate.getDate() + 14);
    this.calculate();
  }

  getCurrentPayPeriod() {
    return this.formatShortDate(this.currentPayPeriod.StartDate) + ' - ' + this.formatShortDate(this.currentPayPeriod.EndDate);
  }

  formatShortDate(period: Date) {
    return period.getMonth() + '/' + period.getDate() + '/' + period.getFullYear();
  }

  calculate() {

  }
}

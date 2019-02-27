import {Component, OnInit} from '@angular/core';
import {Platform, AlertController} from '@ionic/angular';
import {BudgetItem} from '../shared/models/budget-item';
import {PayPeriodClass} from '../shared/models/pay-period';
import {FirebaseService} from '../shared/services/firebase.service';
import {CalculatorService} from '../shared/services/calculator.service';
import {StateService} from '../shared/services/state.service';
import {Router} from '@angular/router';
import {DataDumpClass} from '../shared/models/data-dump';
import { IncomeItem } from '../shared/models/income-item';

@Component({
  selector: 'app-tab2',
  templateUrl: 'income.page.html',
  styleUrls: ['income.page.scss']
})
export class IncomePage {
  private currentPayPeriod: PayPeriodClass;
  private expectedPay: number;
  private actualPay: number;
  public expectedExpenses: number;
  public expectedRemainingAfterExpenses: number;
  public currentTransactionTotal: number;
  public remainingExpenses: number;
  public carryover: number;
  public estimatedRemainingBalance: number;

  private earliestPayPeriod: PayPeriodClass;

  constructor(
      private fbs: FirebaseService,
      private cs: CalculatorService,
      public stateService: StateService,
      private router: Router,
      private alertController: AlertController
  ) {
  }

  ionViewDidEnter() {
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
    if (this.currentPayPeriod !== null && this.currentPayPeriod !== undefined) {
      return this.formatShortDate(this.currentPayPeriod.StartDate) + ' - ' + this.formatShortDate(this.currentPayPeriod.EndDate);
    }
    return '';
  }

  formatShortDate(period: Date) {
    return period.getMonth() + 1 + '/' + period.getDate() + '/' + period.getFullYear();
  }

  calculate() {
    const currentTransactionTotals = this.cs.GetPayPeriodTransactionTotals(this.stateService.currentDataSnapshot);
    this.expectedExpenses = Math.round(this.cs.GetExpectedTotalAmount(this.stateService.currentDataSnapshot, this.currentPayPeriod));
    this.expectedRemainingAfterExpenses = Math.round(this.stateService.currentIncome.expectedPay - this.expectedExpenses);
    this.currentTransactionTotal = Math.round(this.cs.GetFullPayPeriodTransactionTotal(this.stateService.currentDataSnapshot, this.currentPayPeriod));
    this.remainingExpenses = Math.round(this.cs.GetCurrentPayPeriodRemainingTotal(this.stateService.currentDataSnapshot, this.currentPayPeriod));
    this.estimatedRemainingBalance = Math.round(Number.parseFloat(this.stateService.currentIncome.actualPay.toString()) +
      Number.parseFloat(this.stateService.currentIncome.carryover.toString()) - Number.parseFloat(this.currentTransactionTotal.toString())
      - Number.parseFloat(this.remainingExpenses.toString()));
  }

  saveChanges() {
    this.stateService.saveIncomeItem();
  }

  async presentAlertPrompt() {
    const alert = await this.alertController.create({
      header: 'Warning',
      subHeader: '',
      message: 'Continuing will archive your transactions and clear them from the transactions view. Do you wish to continue?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
          }
        }, {
          text: 'Continue',
          handler: () => {
            this.stateService.newPayPeriod();
          }
        }
      ]
    });

    return await alert.present();
  }
}

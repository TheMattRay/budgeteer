import {Component, OnInit, ViewChild, ChangeDetectorRef, AfterViewInit} from '@angular/core';
import {Platform, AlertController} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {BudgetItem} from '../shared/models/budget-item';
import {FirebaseService} from '../shared/services/firebase.service';
import {DataDumpClass} from '../shared/models/data-dump';
import {CalculatorService} from '../shared/services/calculator.service';
import {PayPeriodClass} from '../shared/models/pay-period';
import {EditPage} from './edit/edit.page';
import {StateService} from '../shared/services/state.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-budget',
  templateUrl: 'budget.page.html',
  styleUrls: ['budget.page.scss']
})
export class BudgetPage implements AfterViewInit {
  @ViewChild( EditPage )
    private editPage: EditPage;

  listOfBudgetItems: BudgetItem[];
  private payPeriod: PayPeriodClass;
  private todayMarker: number;

  constructor(
      private fbs: FirebaseService,
      private cs: CalculatorService,
      private stateService: StateService,
      private router: Router,
      private alertController: AlertController,
      private cd: ChangeDetectorRef
  ) {
  }

  ionViewDidEnter() {
    // Retrieve list of budget items from storage
    this.fbs.getData().then((dataSnapshot: DataDumpClass) => {
      this.stateService.setSnapshot(dataSnapshot);
      this.listOfBudgetItems = this.stateService.currentBudget;

      // Sort items by date
      this.listOfBudgetItems.sort((a: BudgetItem, b: BudgetItem) => {
        if (a.dueDay < b.dueDay) {
          return -1;
        }
        if (a.dueDay > b.dueDay) {
          return 1;
        }
      });

      // Set pay period
      this.payPeriod = this.cs.GetCurrentPayPeriod(this.stateService.currentDataSnapshot);

      // Set marker for today
      this.todayMarker = this.setTodayMarker();
    });
  }

  ngAfterViewInit() {
    this.cd.detectChanges();
  }

  private setTodayMarker(): number {
    return new Date().getDate();
  }

  async presentAlertPrompt() {
    const alert = await this.alertController.create({
      header: 'Settings',
      subHeader: 'Login Information',
      inputs: [
        {
          name: 'LoginUsername',
          label: 'Email',
          type: 'text',
          value: this.fbs.getUsername(),
          placeholder: 'Email'
        },
        {
          name: 'LoginPassword',
          label: 'Password',
          type: 'password',
          value: '',
          placeholder: 'Password'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: (data) => {
            this.fbs.setCredentials(data.LoginUsername, data.LoginPassword);
            console.log('Confirm Ok');
          }
        }
      ]
    });

    await alert.present();
  }

  getActual(budgeItem: BudgetItem): number {
    return this.cs.GetPayPeriodTotalForCategory(budgeItem.name, this.stateService.currentDataSnapshot);
  }

  isChecked(budgetItem: BudgetItem): boolean {
    return this.cs.HasCategoryMetExpectedAmount(budgetItem.name, this.stateService.currentDataSnapshot);
  }

  checkIcon(budgetItem: BudgetItem): string {
    if (this.isChecked(budgetItem)) {
      return 'checkmark-circle';
    } else {
      return 'radio-button-off';
    }
  }

  getLineClass(budgetItem: BudgetItem, index: number): string {
    let rowClass = '';
    const isInPeriod: boolean = this.cs.IsDayInPayPeriod(budgetItem.dueDay,
      this.cs.GetCurrentPayPeriod(this.stateService.currentDataSnapshot));
    rowClass += isInPeriod ? 'highlight ' : '';

    if (budgetItem.dueDay >= this.todayMarker) {
      rowClass += 'today';
    }

    return rowClass;
  }

  getGuid() {
    return this.fbs.getGuid();
  }

  showSettings() {
    this.presentAlertPrompt();
  }

  addBudgetItem() {
    this.stateService.newBudgetItem();

    this.router.navigate(['/tabs/budget/edit']).then((value: boolean) => {
    });
  }
}

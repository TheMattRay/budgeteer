import {Component, OnInit, ViewChild} from '@angular/core';
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
export class BudgetPage implements OnInit {
  @ViewChild( EditPage )
    private editPage: EditPage;

  listOfBudgetItems: BudgetItem[];
  private payPeriod: PayPeriodClass;

  constructor(
      private fbs: FirebaseService,
      private cs: CalculatorService,
      private stateService: StateService,
      private router: Router,
      private alertController: AlertController
  ) {
  }

  ngOnInit() {
    // Retrieve list of budget items from storage
    this.fbs.getData().then((dataSnapshot: DataDumpClass) => {
      this.stateService.setSnapshot(dataSnapshot);
      this.listOfBudgetItems = this.stateService.currentBudget;

      // Set pay period
      this.payPeriod = this.cs.GetCurrentPayPeriod(this.stateService.currentDataSnapshot);
    });
  }

  async presentAlertPrompt() {
    const alert = await this.alertController.create({
      header: 'Settings',
      subHeader: 'Login Information',
      inputs: [
        // {
        //   name: 'AccountGuid',
        //   label: 'Account Guid',
        //   type: 'text',
        //   value: this.fbs.getGuid(),
        //   placeholder: ''
        // },
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
            this.fbs.setCredentials(data.LoginUsername, data.LoginPassword)
            console.log('Confirm Ok');
          }
        }
      ]
    });

    await alert.present();
  }



  getActual(budgeItem: BudgetItem): number {
    return this.cs.GetCurrentPayPeriodTotalForCategory(budgeItem.name, this.stateService.currentDataSnapshot);
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

  getGuid() {
    return this.fbs.getGuid();
  }

  showSettings() {
    // this.router.navigate(['/tabs/budget/settings']).then((value: boolean) => {
    // });
    this.presentAlertPrompt();
  }

  addBudgetItem() {
    this.stateService.newBudgetItem();

    this.router.navigate(['/tabs/budget/edit']).then((value: boolean) => {
    });
  }
}

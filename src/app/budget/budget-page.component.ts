import {Component, OnInit, ViewChild} from '@angular/core';
import {Platform} from '@ionic/angular';
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
      private router: Router
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

  addBudgetItem() {
    this.stateService.newBudgetItem();

    this.router.navigate(['/tabs/budget/edit']).then((value: boolean) => {
    });
  }
}

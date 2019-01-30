import {Component, OnInit} from '@angular/core';
import {Platform} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {BudgetItem} from '../shared/models/budget-item';
import {FirebaseService} from '../shared/services/firebase.service';
import {DataDumpClass} from '../shared/models/data-dump';
import {CalculatorService} from '../shared/services/calculator.service';
import {PayPeriodClass} from '../shared/models/pay-period';

@Component({
  selector: 'app-budget',
  templateUrl: 'budget.page.html',
  styleUrls: ['budget.page.scss']
})
export class BudgetPage implements OnInit {
  listOfBudgetItems: BudgetItem[];
  private payPeriod: PayPeriodClass;
  private dataSnapshot: DataDumpClass;

  constructor(
      private fbs: FirebaseService,
      private cs: CalculatorService
  ) {
  }

  ngOnInit() {
    // Retrieve list of budget items from storage
    this.fbs.getData().then((dataSnapshot: DataDumpClass) => {
      this.dataSnapshot = dataSnapshot;
      this.listOfBudgetItems = dataSnapshot.BudgetItems;

      // Sort the items
      this.listOfBudgetItems.sort(this.budgetSorter);

      // Set pay period
      this.payPeriod = this.cs.GetCurrentPayPeriod(dataSnapshot);
    });
  }

  budgetSorter(a: BudgetItem, b: BudgetItem): number {
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

  isChecked(budgetItem: BudgetItem) {
    this.cs.HasCategoryMetExpectedAmount(budgetItem.name, this.dataSnapshot);
  }
}

import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {TransactionItem} from '../../shared/models/transaction-item';
import {StateService} from '../../shared/services/state.service';
import { BudgetItem } from 'src/app/shared/models/budget-item';

@Component({
  selector: 'app-edit-transaction',
  templateUrl: './edit-transaction.page.html',
  styleUrls: ['./edit-transaction.page.scss'],
})
export class EditTransactionPage implements OnInit {
  public trashRoute = 'delete';
  private id: number = null;

  constructor(
      private route: ActivatedRoute,
      public stateService: StateService
  ) {
  }

  ngOnInit() {
    const tempId: string = this.route.snapshot.params['id'];
    if (tempId !== undefined) {
      this.id = parseInt(tempId);
      this.trashRoute = 'delete';
      this.stateService.setTransactionItemById(this.id);
    } else {
      this.trashRoute = '/tabs/transactions';
      this.stateService.newTransactionItem();
    }
  }

  getBudgetSortedByName() {
    return this.stateService.currentBudget.sort((a: BudgetItem, b: BudgetItem) => {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    });
  }

  saveTransactionItem() {
    this.stateService.saveTransactionItem();
  }

  budgetItemChanged(event: CustomEvent) {
    const item: BudgetItem = this.stateService.getBudgetItemByName(event.detail.value);
    this.stateService.currentTransactionItem.estimatedAmount = item.averagePayment;
    this.stateService.currentTransactionItem.transactionType = item.name;
  }
}

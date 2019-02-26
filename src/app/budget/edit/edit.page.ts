import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {BudgetItem} from '../../shared/models/budget-item';
import {StateService} from '../../shared/services/state.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.page.html',
  styleUrls: ['./edit.page.scss'],
})

export class EditPage implements OnInit {
  public trashRoute = 'delete';
  private id: number = null;

  constructor(
      private route: ActivatedRoute,
      public stateService: StateService
  ) {
  }

  ngOnInit() {
    let tempId: string = this.route.snapshot.params['id'];
    if (tempId !== undefined) {
      this.id = parseInt(tempId);
      this.trashRoute = 'delete';
      this.stateService.setBudgetItemById(this.id);
    } else {
      this.trashRoute = '/tabs/budget';
      this.stateService.newBudgetItem();
    }
  }
}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'budget',
        children: [
          {
            path: '',
            loadChildren: '../budget/budget.module#BudgetPageModule'
          }
        ]
      },
      {
        path: 'income',
        children: [
          {
            path: '',
            loadChildren: '../income/income.module#IncomePageModule'
          }
        ]
      },
      {
        path: 'transactions',
        children: [
          {
            path: '',
            loadChildren: '../transactions/transactions.module#TransactionsPageModule'
          }
        ]
      },
      {
        path: '',
        redirectTo: '/tabs/budget',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/budget',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}

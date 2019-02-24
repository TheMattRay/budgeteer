import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: './tabs/tabs.module#TabsPageModule' },
  { path: 'tabs/budget/edit', loadChildren: './budget/edit/edit.module#EditPageModule' },
  { path: 'tabs/budget/edit/:id', loadChildren: './budget/edit/edit.module#EditPageModule' },
  { path: 'tabs/transactions/edit', loadChildren: './transactions/edit-transaction/edit-transaction.module#EditTransactionPageModule' },
  { path: 'tabs/transactions/edit/:id', loadChildren: './transactions/edit-transaction/edit-transaction.module#EditTransactionPageModule' }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}

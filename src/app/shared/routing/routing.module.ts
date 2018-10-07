import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OverviewComponent } from '../../components/overview/overview.component';
import { OptionsComponent } from '../../components/options/options.component';


const routes: Routes = [
  { path: '', component: OverviewComponent },
  { path: 'options', component: OptionsComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class RoutingModule { }
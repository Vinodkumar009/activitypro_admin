import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MenuOrDashboard } from './menuordashboard';

@NgModule({
  declarations: [MenuOrDashboard],
  imports: [IonicPageModule.forChild(MenuOrDashboard)],
  exports: [MenuOrDashboard]
})
export class MenuOrDashboardPageModule { }

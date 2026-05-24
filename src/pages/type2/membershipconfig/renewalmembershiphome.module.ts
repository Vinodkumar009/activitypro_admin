import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2RenewalMembershipHome } from './renewalmembershiphome';

@NgModule({
  declarations: [
    Type2RenewalMembershipHome,
  ],
  imports: [
    IonicPageModule.forChild(Type2RenewalMembershipHome),
  ],
  exports: [
    Type2RenewalMembershipHome
  ]
})
export class Type2RenewalMembershipHomeModule {}
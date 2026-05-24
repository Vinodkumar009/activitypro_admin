import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2NewMembershipHome } from './newmembershiphome';

@NgModule({
  declarations: [
    Type2NewMembershipHome,
  ],
  imports: [
    IonicPageModule.forChild(Type2NewMembershipHome),
  ],
  exports: [
    Type2NewMembershipHome
  ]
})
export class Type2NewMembershipHomeModule {}
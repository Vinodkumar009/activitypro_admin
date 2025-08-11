import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2AddMembershipEmailSetup } from './addmembershipemailsetup';

@NgModule({
  declarations: [
    Type2AddMembershipEmailSetup,
  ],
  imports: [
    IonicPageModule.forChild(Type2AddMembershipEmailSetup),
  ],
  exports: [
    Type2AddMembershipEmailSetup
  ]
})
export class Type2AddMembershipEmailSetupModule {}
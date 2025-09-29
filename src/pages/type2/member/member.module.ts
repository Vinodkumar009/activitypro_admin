import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2Member } from './member';
import { CallNumber } from '@ionic-native/call-number';
import { ThemeService } from '../../../services/theme.service';
@NgModule({
  declarations: [
    Type2Member,
  ],
  imports: [
    IonicPageModule.forChild(Type2Member),
  ],
  exports: [
    Type2Member
  ],
  providers: [
    CallNumber,
    ThemeService
  ]
})
export class Type2MemberModule {}
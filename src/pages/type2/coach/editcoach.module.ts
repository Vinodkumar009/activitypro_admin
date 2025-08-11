import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2EditCoach } from './editcoach';

@NgModule({
  declarations: [
    Type2EditCoach,
  ],
  imports: [
    IonicPageModule.forChild(Type2EditCoach),
  ],
  exports: [
    Type2EditCoach
  ]
})
export class Type2EditCoachModule {}
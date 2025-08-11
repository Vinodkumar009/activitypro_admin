import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2AddCoach } from './addcoach';

@NgModule({
  declarations: [
    Type2AddCoach,
  ],
  imports: [
    IonicPageModule.forChild(Type2AddCoach),
  ],
  exports: [
    Type2AddCoach
  ]
})
export class Type2AddCoachModule {}
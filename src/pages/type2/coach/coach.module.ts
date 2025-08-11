import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2Coach } from './coach';

@NgModule({
  declarations: [
    Type2Coach,
  ],
  imports: [
    IonicPageModule.forChild(Type2Coach),
  ],
  exports: [
    Type2Coach
  ]
})
export class Type2CoachModule {}
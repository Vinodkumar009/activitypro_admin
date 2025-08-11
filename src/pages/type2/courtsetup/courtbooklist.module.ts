import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2CourtBookList } from './courtbooklist';

@NgModule({
  declarations: [
    Type2CourtBookList,
  ],
  imports: [
    IonicPageModule.forChild(Type2CourtBookList),
  ],
  exports: [
    Type2CourtBookList
  ]
})
export class Type2CourtBookListModule {}
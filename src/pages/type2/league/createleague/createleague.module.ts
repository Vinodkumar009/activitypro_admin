import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateleaguePage } from './createleague';


@NgModule({
  declarations: [
    CreateleaguePage,
  ],
  imports: [
  
    IonicPageModule.forChild(CreateleaguePage),
  ],
})
export class CreateleaguePageModule {}

import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ComposenotificationPage } from './composenotification';
import { HttpModule } from '@angular/http';
import { Clipboard } from '@ionic-native/clipboard';
@NgModule({
  declarations: [
    ComposenotificationPage,
  ],
  imports: [
    IonicPageModule.forChild(ComposenotificationPage),
    HttpModule
  ],
  exports: [
    ComposenotificationPage
  ],
  providers:[Clipboard]
})
export class ComposenotificationPageModule {}

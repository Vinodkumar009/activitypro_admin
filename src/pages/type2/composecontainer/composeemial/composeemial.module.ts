import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ComposeemialPage } from './composeemial';
import { Clipboard } from '@ionic-native/clipboard';
@NgModule({
  declarations: [
    ComposeemialPage,
  ],
  imports: [
    IonicPageModule.forChild(ComposeemialPage),
  ],
  exports: [
    ComposeemialPage
  ],
  providers:[Clipboard]
})
export class ComposeemialPageModule {}

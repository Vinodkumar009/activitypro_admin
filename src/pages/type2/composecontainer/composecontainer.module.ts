import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ComposecontainerPage } from './composecontainer';
import { ComposeemialPage } from './composeemial/composeemial';
import { ComposenotificationPage } from './composenotification/composenotification';
import { HttpModule } from '@angular/http';
import { Clipboard } from '@ionic-native/clipboard';
@NgModule({
  declarations: [
    ComposeemialPage,
    ComposenotificationPage,
    ComposecontainerPage,
  ],
  imports: [
    IonicPageModule.forChild(ComposecontainerPage),HttpModule
  ],
  providers:[Clipboard]
})
export class ComposecontainerPageModule {}

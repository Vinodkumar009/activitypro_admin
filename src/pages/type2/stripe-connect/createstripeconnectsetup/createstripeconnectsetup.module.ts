import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreatestripeconnectsetupPage } from './createstripeconnectsetup';
import { InAppBrowser } from '@ionic-native/in-app-browser';
@NgModule({
  declarations: [
    CreatestripeconnectsetupPage,
  ],
  imports: [
    IonicPageModule.forChild(CreatestripeconnectsetupPage),
  ],
  providers:[InAppBrowser]
})
export class CreatestripeconnectsetupPageModule {}

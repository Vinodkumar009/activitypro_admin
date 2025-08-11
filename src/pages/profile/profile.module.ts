import { NgModule } from '@angular/core';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { IonicPageModule } from 'ionic-angular';
import { Profile } from './profile';

@NgModule({
  declarations: [
    Profile,
  ],
  imports: [
    IonicPageModule.forChild(Profile),
  ],
  exports: [
    Profile
  ],
  providers:[InAppBrowser]
})
export class ProfileModule { }
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreatemandatesPage } from './createmandates';
import { InAppBrowser } from '@ionic-native/in-app-browser';
@NgModule({
  declarations: [
    CreatemandatesPage,
  ],
  imports: [
    IonicPageModule.forChild(CreatemandatesPage),
    
  ],
  providers:[
    InAppBrowser
  ]
})
export class CreatemandatesPageModule {}

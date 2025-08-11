import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { IonicStorageModule } from '@ionic/storage';
import { IonicPageModule } from 'ionic-angular';
//import { PkPage } from './leagueteamlisting';
import {LeagueteamlistingPage } from './leagueteamlisting'

@NgModule({
  declarations: [
   // PkPage,
   LeagueteamlistingPage 
    
  ],
  imports: [IonicPageModule.forChild(LeagueteamlistingPage),IonicStorageModule.forRoot()],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class LeagueteamlistingPageModule {}

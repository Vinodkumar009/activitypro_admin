import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { IonicStorageModule } from '@ionic/storage';
import { IonicPageModule } from 'ionic-angular';
//import { PkPage } from './leagueteamlisting';
import {LeagueteamlistingPage } from './leagueteamlisting'
import { ThemeService } from '../../../../services/theme.service';

@NgModule({
  declarations: [
   // PkPage,
   LeagueteamlistingPage 
    
  ],
  imports: [IonicPageModule.forChild(LeagueteamlistingPage),IonicStorageModule.forRoot()],
  providers: [ThemeService],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class LeagueteamlistingPageModule {}

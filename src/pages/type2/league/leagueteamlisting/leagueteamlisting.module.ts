import { NgModule } from '@angular/core';
import { IonicStorageModule } from '@ionic/storage';
import { IonicPageModule } from 'ionic-angular';
import {LeagueteamlistingPage } from './leagueteamlisting'
import { ThemeService } from '../../../../services/theme.service';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';

@NgModule({
  declarations: [
   LeagueteamlistingPage 
  ],
  imports: [IonicPageModule.forChild(LeagueteamlistingPage), IonicStorageModule.forRoot(), SharedComponentsModule],
  providers: [ThemeService]
})
export class LeagueteamlistingPageModule {}

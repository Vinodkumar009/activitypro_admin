import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SendnotificationteamPage } from './sendnotificationteam';

//import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

 

@NgModule({
  declarations: [
    SendnotificationteamPage,
  ],
  imports: [
   // BrowserModule,
    HttpClientModule,
    IonicPageModule.forChild(SendnotificationteamPage),
  ],
})
export class SendnotificationteamPageModule {}

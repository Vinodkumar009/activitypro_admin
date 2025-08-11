import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreatenotePage } from './createnote';
import { LocalNotifications } from '@ionic-native/local-notifications';
@NgModule({
  declarations: [
    CreatenotePage,
  ],
  imports: [
    IonicPageModule.forChild(CreatenotePage),
  ],
  providers:[LocalNotifications]
})
export class CreatenotePageModule {}

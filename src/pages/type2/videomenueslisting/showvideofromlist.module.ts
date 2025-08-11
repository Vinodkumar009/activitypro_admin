import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ShowvideofromlistPage } from './showvideofromlist';
import { SocialSharing } from '@ionic-native/social-sharing';
@NgModule({
  declarations: [
    ShowvideofromlistPage,
  ],
  imports: [
    IonicPageModule.forChild(ShowvideofromlistPage),
  ],
  providers:[SocialSharing]
})
export class ShowvideofromlistPageModule {}

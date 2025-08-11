import { NgModule} from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateSuperPromotion } from './createsuperpromotion';

@NgModule({
  declarations: [
    CreateSuperPromotion,
    
  ],

  
  imports: [
    IonicPageModule.forChild(CreateSuperPromotion),
 
  ],

})
export class CreateSuperPromotionModule {}

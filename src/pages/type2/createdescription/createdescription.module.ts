import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular'; 
import { CreateDescription } from './createdescription';

@NgModule({
  declarations: [
    CreateDescription,
  ],
  imports: [
    IonicPageModule.forChild(CreateDescription),
  ],
  exports: [
    CreateDescription
  ]
})
export class CreateDescriptionModule {}
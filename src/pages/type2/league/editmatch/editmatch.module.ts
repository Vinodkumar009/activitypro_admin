import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditmatchPage } from './editmatch';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';

@NgModule({
  declarations: [EditmatchPage],
  imports: [
    IonicPageModule.forChild(EditmatchPage),
    SharedComponentsModule,
  ],
})
export class EditmatchPageModule {}

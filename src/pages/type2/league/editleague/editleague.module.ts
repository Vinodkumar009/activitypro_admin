import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditleaguePage } from './editleague';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';

@NgModule({
  declarations: [
    EditleaguePage,
  ],
  imports: [
    IonicPageModule.forChild(EditleaguePage),
    SharedComponentsModule
  ],
})
export class EditleaguePageModule {}

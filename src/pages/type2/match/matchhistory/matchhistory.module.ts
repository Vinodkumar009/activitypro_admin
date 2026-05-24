import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MatchhistoryPage } from './matchhistory';
import { ThemeService } from '../../../../services/theme.service';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';

@NgModule({
  declarations: [
    MatchhistoryPage,
  ],
  imports: [
    IonicPageModule.forChild(MatchhistoryPage),
    SharedComponentsModule,
  ],
  providers: [ThemeService],
})
export class MatchhistoryPageModule {}

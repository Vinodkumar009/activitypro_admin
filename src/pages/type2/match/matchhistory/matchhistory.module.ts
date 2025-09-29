import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MatchhistoryPage } from './matchhistory';
import { ThemeService } from '../../../../services/theme.service';

@NgModule({
  declarations: [
    MatchhistoryPage,
  ],
  imports: [
    IonicPageModule.forChild(MatchhistoryPage),
  ],
  providers: [ThemeService],
})
export class MatchhistoryPageModule {}

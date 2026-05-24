import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Theme } from './theme';
import { ColorPickerModule } from 'ngx-color-picker';

@NgModule({
  declarations: [
    Theme,
  ],
  imports: [
    ColorPickerModule,
    IonicPageModule.forChild(Theme),
  ],
})
export class ThemePageModule {}

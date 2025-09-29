import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { MatchladderPage } from "./matchladder";
import { ThemeService } from "../../../../services/theme.service";

@NgModule({
  declarations: [MatchladderPage],
  imports: [IonicPageModule.forChild(MatchladderPage)],
  providers: [ThemeService],
  exports: [MatchladderPage],
})
export class MatchladderPageModule {}

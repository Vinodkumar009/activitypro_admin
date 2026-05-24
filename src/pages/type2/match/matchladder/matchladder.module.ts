import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { MatchladderPage } from "./matchladder";
import { ThemeService } from "../../../../services/theme.service";
import { SharedComponentsModule } from "../../../../shared/components/shared-components.module";

@NgModule({
  declarations: [MatchladderPage],
  imports: [IonicPageModule.forChild(MatchladderPage), SharedComponentsModule],
  providers: [ThemeService],
  exports: [MatchladderPage],
})
export class MatchladderPageModule {}

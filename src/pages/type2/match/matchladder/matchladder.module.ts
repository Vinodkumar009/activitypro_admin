import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { MatchladderPage } from "./matchladder";

@NgModule({
  declarations: [MatchladderPage],
  imports: [IonicPageModule.forChild(MatchladderPage)],
  exports: [MatchladderPage],
})
export class MatchladderPageModule {}

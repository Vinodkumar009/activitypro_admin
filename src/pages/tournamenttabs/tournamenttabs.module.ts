import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
// import { MatchhistoryPage } from "../type2/match/matchhistory/matchhistory";
// import { SharedmoduleModule } from "../sharedmodule/sharedmodule.module";
import { TournamenttabsPage } from "./tournamenttabs";


@NgModule({
  declarations: [TournamenttabsPage, ],
  imports: [IonicPageModule.forChild(TournamenttabsPage), ],
  entryComponents: [TournamenttabsPage, ],
})
export class TournamenttabsPageModule {}

import { NgModule, CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import { IonicStorageModule } from "@ionic/storage";
import { storage } from "firebase";
import { IonicPageModule } from "ionic-angular";
import { MatchPage } from "./match";

@NgModule({
  declarations: [
    MatchPage
  ],
  imports: [IonicPageModule.forChild(MatchPage), IonicStorageModule.forRoot()],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class MatchPageModule {}

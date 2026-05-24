import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { ProfilematchesPage } from "./profilematches";

@NgModule({
  declarations: [ProfilematchesPage],
  imports: [IonicPageModule.forChild(ProfilematchesPage)],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProfilematchesPageModule {}

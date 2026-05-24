import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { ProfilelockerPage } from "./profilelocker";

@NgModule({
  declarations: [ProfilelockerPage],
  imports: [IonicPageModule.forChild(ProfilelockerPage)],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProfilelockerPageModule {}

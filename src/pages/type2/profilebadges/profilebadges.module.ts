import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { ProfilebadgesPage } from "./profilebadges";

@NgModule({
  declarations: [ProfilebadgesPage],
  imports: [IonicPageModule.forChild(ProfilebadgesPage)],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProfilebadgesPageModule {}

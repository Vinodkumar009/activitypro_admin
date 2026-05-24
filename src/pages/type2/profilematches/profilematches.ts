import { Component } from "@angular/core";
import {
  IonicPage,
  LoadingController,
  NavController,
  NavParams,
} from "ionic-angular";
import { CommonService } from "../../../services/common.service";
import { FirebaseService } from "../../../services/firebase.service";
import { Storage } from "@ionic/storage";
import { SharedServices } from "../../services/sharedservice";
import { first } from "rxjs/operators";
import { Apollo } from "apollo-angular";

/**
 * Generated class for the ProfilematchesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-profilematches",
  templateUrl: "profilematches.html",
})
export class ProfilematchesPage {
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private apollo: Apollo,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public fb: FirebaseService,
    public sharedservice: SharedServices
  ) {
    this.commonService.category.pipe(first()).subscribe((data) => {
      if (data == "profilematches") {
        this.storage.get("userObj").then((val) => {
          val = JSON.parse(val);
          // if (val.$key != "") {
          //   this.ParentClubTeamFetchInput.ParentClubKey =
          //     val.UserInfo[0].ParentClubKey;
          // }
          // this.getTeamsForParentClub();
        });
      }
    });
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad ProfilematchesPage");
  }
}

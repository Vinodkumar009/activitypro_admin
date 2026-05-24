import { Component } from "@angular/core";
import { Apollo } from "apollo-angular";
import {
  IonicPage,
  LoadingController,
  NavController,
  NavParams,
} from "ionic-angular";
import {
  CommonService,
  ToastMessageType,
  ToastPlacement,
} from "../../../services/common.service";
import { FirebaseService } from "../../../services/firebase.service";
import { SharedServices } from "../../services/sharedservice";
import { Storage } from "@ionic/storage";
import gql from "graphql-tag";
import { BadgeTransactionModel } from "./models/badges.model";
import { first } from "rxjs/operators";

/**
 * Generated class for the ProfilebadgesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-profilebadges",
  templateUrl: "profilebadges.html",
})
export class ProfilebadgesPage {
  getUserBadgesInput: GetUserBadgesInput = {
    MemberKey: "",
    // ParentClubKey: "",
    AppType: 0,
    // RewardCategory: "",
    // RewardCategoryName: "",
    // RewardedBy: "",
    // RewardedDescription: "",
    // BadgeCategory: ""
  };
  badges: BadgeTransactionModel[] = [];
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
      if (data == "profilebadges") {
        console.log("ionViewDidLoad ProfilebadgesPage");
        this.storage.get("userObj").then((val) => {
          val = JSON.parse(val);
          if (val.$key != "") {
            this.getUserBadgesInput.MemberKey = val.UserInfo[0].MemberKey;
          }
          this.fetchBadges();
        });
      }
    });
  }

  ionViewDidLoad() {}
  // ionViewWillEnter() {
  //   console.log("ionViewDidLoad ProfilebadgesPage");
  //   this.storage.get("userObj").then((val) => {
  //     val = JSON.parse(val);
  //     if (val.$key != "") {
  //       this.getUserBadgesInput.MemberKey = val.UserInfo[0].MemberKey;
  //     }
  //     this.fetchBadges();
  //   });
  // }

  fetchBadges = () => {
    const badgesQuery = gql`
      query getBadgesForPlayer($badgeInput: GetUserBadgesInput!) {
        getBadgesForPlayer(badgeInput: $badgeInput) {
          id
          created_at
          is_active
          Badge {
            image_url
          }
          reward_category
          reward_categoryname
          rewardedBy
          reward_description
          reward_date
          isClaimed
        }
      }
    `;
    this.apollo
      .query({
        query: badgesQuery,
        fetchPolicy: "no-cache",
        variables: {
          badgeInput: this.getUserBadgesInput,
        },
      })
      .subscribe(
        ({ data }) => {
          console.log(
            "badges data" + JSON.stringify(data["getBadgesForPlayer"])
          );
          this.badges = data["getBadgesForPlayer"];
        },
        (err) => {
          // this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage(
            "Failed to fetch badges",
            2500,
            ToastMessageType.Error,
            ToastPlacement.Bottom
          );
        }
      );
  };
}

export class GetUserBadgesInput {
  MemberKey: string;
  // ParentClubKey: string;
  AppType: number;
  // RewardCategory: string;
  // RewardCategoryName: string;
  // RewardedBy: string;
  // RewardedDescription: string;
  // BadgeCategory: string;
}

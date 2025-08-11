import { FirebaseService } from "../../../services/firebase.service";
import { Component } from "@angular/core";
import {
  NavController,
  PopoverController,
  AlertController,
  Platform,
} from "ionic-angular";
import { SharedServices } from "../../services/sharedservice";
import { Storage } from "@ionic/storage";
import { IonicPage } from "ionic-angular";
import { CommonService } from "../../../services/common.service";
/**
 * Generated class for the PerformancelistPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-performancelist",
  templateUrl: "performancelist.html",
})
export class Performancelist {
  themeType: number;
  isAndroid: boolean = false;
  parentClubKey: any;
  performanceList = [];

  constructor(
    platform: Platform,
    public alertCtrl: AlertController,
    storage: Storage,
    public fb: FirebaseService,
    public navCtrl: NavController,
    public sharedservice: SharedServices,
    public popoverCtrl: PopoverController,
    private commonService: CommonService,
  ) {
    this.themeType = sharedservice.getThemeType();
    this.isAndroid = platform.is("android");

    this.performanceList = [
      {
        DisplayName: "Challenges",
        Description: "Listing user challanges",
        Component: "Challengesreport",
        ImageUrl: "assets/images/challenges.svg",
      },
      {
        DisplayName: "Leaderboard",
        Description: "Listing user points",
        Component: "Leaderboardlist",
        ImageUrl: "assets/images/trophy.svg",
      },

      // { DisplayName:'Subscriptions', Description:"Kids subscriptions", Component:"Apkidsubscriptions", ImageUrl: "assets/images/subscribe.svg" }
    ];

    storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
      }
    });
  }

  gotoPlayground() {
    this.navCtrl.push("PlaygroundPage");
  }
  gotoLevel() {
    this.commonService.updateCategory('activity_levels');
    this.navCtrl.push("LevelsPage");
  }
  gotoMemberDetails() {
    //this.commonService.updateCategory("member_approvals");
    this.navCtrl.push("MemberdetailsPage");
  }
  goTo(index: number) {
    this.navCtrl.push(this.performanceList[index].Component);
    //this.showAlert();
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent,
    });
  }
  gotoSessionPayment() {
    this.navCtrl.push("Payment");
  }

  showAlert() {
    let confirm = this.alertCtrl.create({
      title: "Coming Soon...",

      buttons: [
        {
          text: "Ok",
          role: "cancel",
          handler: () => {
            console.log("Disagree clicked");
          },
        },
      ],
    });
    confirm.present();
  }
}

import { FirebaseService } from "../../../services/firebase.service";
import { Component } from "@angular/core";
import {
  NavController,
  PopoverController,
  AlertController,
  Platform,
} from "ionic-angular";
import { SharedServices } from "../../services/sharedservice";
import {
  CommonService,
  ToastMessageType,
  ToastPlacement,
} from "../../../services/common.service";
import { Storage } from "@ionic/storage";
import { IonicPage } from "ionic-angular";

/**
 * Generated class for the PerformancelistPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-performancesetup",
  templateUrl: "performancesetup.html",
})
export class PerformanceSetup {
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
    public commonService: CommonService,
    public popoverCtrl: PopoverController
  ) {
    this.themeType = sharedservice.getThemeType();
    this.isAndroid = platform.is("android");

    this.performanceList = [
      {
        DisplayName: "Challenges",
        Description: "Manage challenges and templates here",
        Component: "ChallengeTemplate",
        ImageUrl: "assets/images/challenges.svg",
      },
      {
        DisplayName: "Leaderboard",
        Description: "Check for AP Pro+ Leaderboard",
        Component: "LeaderboardPage",
        ImageUrl: "assets/images/trophy.svg",
      },
      {
        DisplayName: "Virtual Points",
        Description: "Manage your virtual loyalty",
        Component: "LoyaltyvirtualPage",
        ImageUrl: "assets/imgs/virtualpoint.png",
      },
      {
        DisplayName: "Tips",
        Description: "Manage tips",
        Component: "TipsPage",
        ImageUrl: "assets/imgs/chat.png",
      },
      {
        DisplayName: "Quiz",
        Description: "Setup sports for quiz",
        Component: "QuizactivityPage",
        ImageUrl: "assets/imgs/quiz.png",
      },
      {
        DisplayName: "Gallery",
        Description: "Manage gallery",
        Component: "GalleryPage",
        ImageUrl: "assets/imgs/all.svg",
      },
      {
        DisplayName: "Level Management",
        Description: "Manage levels",
        Component: "LevelmanagementPage",
        ImageUrl: "assets/images/activitylevels.png",
      },
      // { DisplayName: 'Court Booking', Component:'Facility Booking', ImageUrl: "assets/images/tennis-court.svg" },
      // { DisplayName: 'Events', Component:'Events', ImageUrl: "https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815/o/ActivityPro%2FActivityIcons%2Feventcalendar.svg?alt=media&token=294cf1f3-bb52-4b16-bfe5-64b45d9971f4" },
    ];

    storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
      }
    });
  }
  goTo(index: number) {
    if (this.performanceList[index].Component == "GalleryPage") {
      this.commonService.updateCategory("gallerylist");
    }
    if(this.performanceList[index].Component == 'ChallengeTemplate'){ //to refresh the list
      this.commonService.updateCategory("challenge_template_list");
    }
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

import { Component, ElementRef, Renderer2 } from '@angular/core';
import { ActionSheetController, IonicPage, LoadingController, NavController, NavParams } from 'ionic-angular';
import { Storage } from "@ionic/storage";
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { Apollo } from 'apollo-angular';
import { FirebaseService } from '../../../../services/firebase.service';
import gql from 'graphql-tag';
import { UserFocusAreaProgressModel, UserLevelProgressModel } from '../../levels/models/levels.model';
import { first } from "rxjs/operators";
import { GraphqlService } from '../../../../services/graphql.service';


/**
 * Generated class for the MemberdetailsfocusareaPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-memberdetailsfocusarea',
  templateUrl: 'memberdetailsfocusarea.html',
  providers:[GraphqlService]
})
export class MemberdetailsfocusareaPage {
  getUserProgressInput: getUserProgressInput = {
    ParentClubKey: '',
    ClubKey: '',
    MemberKey: '',
    AppType: 0,
    ActionType: 1,
    DeviceType: 1,
    userId: '',
    // userId: '5debe89e-e8ec-4df9-a3dd-41b2dc72cbb9',
    levelId: '',
    // levelId: 'c7a0fb90-a05e-4d31-95ea-1aab3513b420',
    // activityId: "-KhXV3cvTWxz5SSZdIxU"
    activityId: ""
  }
  userFocusAreaProgress: UserFocusAreaProgressModel[] = [];
  userlevelProgress: UserLevelProgressModel[] = [];
  mem: any;
  selectedActivityKey: any;
  selectedUser: any;
  level: any;
  selectedLevel: any;

  selectedStepId: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private apollo: Apollo,
    public actionSheetCtrl: ActionSheetController,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public fb: FirebaseService,
    private el: ElementRef,
    private renderer: Renderer2,
    private graphqlService:GraphqlService
  ) {

  }

  ionViewWillEnter() {
    this.commonService.category.pipe(first()).subscribe((data) => {
      if (data == "upgradedowngradelevel") {

        this.storage.get("userObj").then((val) => {
          this.level = this.navParams.get("level");
          console.log(this.level);
          this.selectedActivityKey = this.navParams.get("selectedActivityKey");
          this.getUserProgressInput.activityId = this.selectedActivityKey;
          this.mem = this.navParams.get("mem");
          this.getUserProgressInput.levelId = this.level.id
          this.getUserProgressInput.userId = this.mem.user.Id;
          val = JSON.parse(val);
          if (val.$key != "") {
            this.getUserProgressInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
          }
          this.GetUserLevelProgress();
          this.GetUserFocusAreaProgress();
        });
      }
    });
  }
  ionViewWillLeave() {
    this.commonService.updateCategory('');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MemberdetailsfocusareaPage');
  }

  gotoNext() {
    this.navCtrl.push("UpgradedowngradelevelPage", {
      // mem: this.mem,
      selectedActivityKey: this.selectedActivityKey,
      level: this.level,
      userId: this.getUserProgressInput.userId
    });
  }
  gotoFocusProgressInfo(focus) {
    this.navCtrl.push("FocusprogressinfoPage", {
      // mem: this.mem,
      selectedActivityKey: this.selectedActivityKey,
      level: this.level,
      focus: focus,
      userId: this.getUserProgressInput.userId,
      selectedLeveL: this.selectedLevel// Add selectedLevel here
    });
  }




  onclicklevel(index: number) {
    this.userlevelProgress[index]["is_selected"] = true;
    if (this.userlevelProgress[index]["is_selected"]) {
      this.userlevelProgress.filter((item, itemIndex) =>
        itemIndex != index
      ).map((item) => {
        item["is_selected"] = false;
      });
      this.getUserProgressInput.levelId = this.userlevelProgress[index].id;
      this.selectedLevel = this.userlevelProgress[index].id;
      this.GetUserFocusAreaProgress();

      const divs = Array.from(this.el.nativeElement.querySelectorAll('.step'));
      divs.forEach((div: HTMLElement, i: number) => {
        this.renderer.removeClass(div, 'selected');
      });


      this.renderer.addClass(divs[index], 'selected');
    }
  }

  GetUserFocusAreaProgress = () => {
    const getUserFocusAreaProgressQuery = gql`
      query getUserFocusAreaProgress(
        $userFocusAreaProgressInput: getUserProgressInput!
      ) {
        getUserFocusAreaProgress(
          userFocusAreaProgressInput: $userFocusAreaProgressInput
        ) {
          id
          focus_area_name
          user_count
          total_count
          total_points
          percentage
          is_completed
          image_url  
        }
      }
    `;
    this.graphqlService.query(getUserFocusAreaProgressQuery,{userFocusAreaProgressInput: this.getUserProgressInput},1)
      .subscribe(
        ({ data }) => {
          console.log(
            "getUserFocusAreaProgress DATA" +
            JSON.stringify(data["getUserFocusAreaProgress"])
          );
          // this.commonService.hideLoader();
          this.userFocusAreaProgress = data["getUserFocusAreaProgress"];

        },
        (err) => {
          // this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage(
            "Failed to fetch getUserFocusAreaProgress",
            2500,
            ToastMessageType.Error,
            ToastPlacement.Bottom
          );
        }
      );
  };
  GetUserLevelProgress = () => {
    this.commonService.showLoader("Fetching Details...");
    const getUserLevelProgressQuery = gql`
      query getUserLevelProgress(
        $userLevelProgressInput: getUserProgressInput!
      ) {
        getUserLevelProgress(
          userLevelProgressInput: $userLevelProgressInput
        ) {
          id
          is_completed
          is_current_user_level
          is_active
          sequence
          level_name 
        }
      }
    `;
    this.graphqlService.query(getUserLevelProgressQuery,{userLevelProgressInput: this.getUserProgressInput},1)
      .subscribe(
        ({ data }) => {
          console.log(
            "getUserLevelProgress DATA" +
            JSON.stringify(data["getUserLevelProgress"])
          );
          this.commonService.hideLoader();
          this.userlevelProgress = data["getUserLevelProgress"];
          if (this.userlevelProgress.length > 0) {
            for (let level of this.userlevelProgress) {
              level["is_selected"] = false;
            }

            const selectedLevelIndex = this.userlevelProgress.findIndex(level => level.is_current_user_level);
            const selectedLevel = this.userlevelProgress[selectedLevelIndex];
            if (selectedLevel) {
              this.getUserProgressInput.levelId = selectedLevel.id;
            } else {
              this.getUserProgressInput.levelId = this.userlevelProgress[0].id;
            }
            this.selectedLevel = selectedLevel ? selectedLevel.id : this.userlevelProgress[0].id;
            this.GetUserFocusAreaProgress();
          }
        },
        (err) => {
          this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage(
            "Failed to fetch getUserLevelProgress",
            2500,
            ToastMessageType.Error,
            ToastPlacement.Bottom
          );
        }
      );
  };

}

export class getUserProgressInput {
  ParentClubKey: string;
  ClubKey: string;
  MemberKey: string;
  AppType: number;
  ActionType: number;
  DeviceType: number;
  userId: string;
  levelId: string;
  activityId: string;
}

import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from "@ionic/storage";
import { Apollo } from 'apollo-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { LoadingController } from 'ionic-angular/components/loading/loading-controller';
import { FirebaseService } from '../../../../services/firebase.service';
import gql from 'graphql-tag';
import { UserLevelProgressModel } from '../../levels/models/levels.model';
import { GraphqlService } from '../../../../services/graphql.service';

/**
 * Generated class for the UpgradedowngradelevelPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-upgradedowngradelevel',
  templateUrl: 'upgradedowngradelevel.html',
  providers:[GraphqlService]
})
export class UpgradedowngradelevelPage {
  getUserProgressInput: getUserProgressInput = {
    ParentClubKey: '',
    ClubKey: '',
    MemberKey: '',
    AppType: 0,
    ActionType: 1,
    DeviceType: 1,
    userId: '',
    levelId: '',
    activityId: ''
  }
  UpdateUserlevelsProgressInput: UpdateUserlevelsProgressInput = {
    ParentClubKey: '',
    ClubKey: '',
    MemberKey: '',
    AppType: 0,
    ActionType: 0,
    DeviceType: 1,
    level_id: '',
    challenge_classification_id: '',
    target_id: '',
    user_id: '',
    activity_id: ''
  }
  userlevelProgress: UserLevelProgressModel[] = [];
  selectedActivityKey: any;
  level: any;
  userId: any;
  mem: any;
  confirmText = '';
  selectedLevel: any;
  // levelChange: boolean = false;
  loading;


  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private apollo: Apollo,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    private graphqlService:GraphqlService
  ) {
    this.storage.get("userObj").then((val) => {
      this.level = this.navParams.get("level");
      console.log('LEVEL', this.level);
      this.selectedActivityKey = this.navParams.get("selectedActivityKey");
      this.getUserProgressInput.activityId = this.selectedActivityKey;
      this.userId = this.navParams.get("userId");
      this.mem = this.navParams.get("mem");
      console.log('selected userId', this.userId);
      this.getUserProgressInput.levelId = this.level.id;
      this.getUserProgressInput.userId = this.userId;
      // this.UpdateUserlevelsProgressInput.activity_id = this.selectedActivityKey;
      // this.UpdateUserlevelsProgressInput.level_id = this.level.id;
      // this.UpdateUserlevelsProgressInput.user_id = this.userId;
      val = JSON.parse(val);
      if (val.$key != "") {
        this.getUserProgressInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
        this.UpdateUserlevelsProgressInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
      }
      this.GetUserLevelProgress();
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UpgradedowngradelevelPage');
  }
  changeLevel() {
    if (this.confirmText != 'CONFIRM') {
      this.commonService.toastMessage("Type 'CONFIRM' in the text box", 2000, ToastMessageType.Error);
    }
    else if (this.selectedLevel.is_current_user_level) {

      this.commonService.toastMessage('Selected level is already the current user level', 2000, ToastMessageType.Error);
    }
    else {
      {
        // this.loading = this.loadingCtrl.create({
        //   content: 'Please wait...'
        // });
        // this.loading.present();

        this.UpdateUserlevelsProgressInput.level_id = this.selectedLevel.id;

        this.changeUserLevel();

      }
    }
  }

  changeUserLevel() {
    this.UpdateUserlevelsProgressInput.user_id = this.userId;

    this.apollo
      .mutate({
        mutation: gql`
          mutation changeUserLevel(
            $updateUserlevelProgress: UpdateUserlevelsProgressInput!
          ) {
            changeUserLevel(updateUserlevelProgress: $updateUserlevelProgress) 
          }
        `,
        variables: { updateUserlevelProgress: this.UpdateUserlevelsProgressInput },
      })
      .subscribe(
        ({ data }) => {
          // this.commonService.hideLoader();
          this.commonService.updateCategory('upgradedowngradelevel');
          this.navCtrl.pop();
          console.log(
            "Upadte USER LEVEL DATA" + data["changeUserLevel"]
          );
          this.commonService.toastMessage(
            "Level updated successfully",
            2500,
            ToastMessageType.Success,
            ToastPlacement.Bottom
          );
        },
        (err) => {
          // this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage(
            "Failed to update",
            2500,
            ToastMessageType.Error,
            ToastPlacement.Bottom
          );
        }
      );
  }

  updateUserLevelProgress() {
    this.UpdateUserlevelsProgressInput.activity_id = this.selectedActivityKey;
    // this.UpdateUserlevelsProgressInput.level_id = this.level.id;
    this.UpdateUserlevelsProgressInput.user_id = this.userId;

    this.apollo
      .mutate({
        mutation: gql`
          mutation updateUserLevelProgress(
            $updateUserlevelProgressInput: UpdateUserlevelsProgressInput!
          ) {
            updateUserLevelProgress(updateUserlevelProgressInput: $updateUserlevelProgressInput) 
          }
        `,
        variables: { updateUserlevelProgressInput: this.UpdateUserlevelsProgressInput },
      })
      .subscribe(
        ({ data }) => {
          // this.commonService.hideLoader();
          console.log(
            "Upadte USER LEVEL DATA" + data["updateUserLevelProgress"]
          );
          this.commonService.toastMessage(
            "Level updated successfully",
            2500,
            ToastMessageType.Success,
            ToastPlacement.Bottom
          );
        },
        (err) => {
          // this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage(
            "Failed to update",
            2500,
            ToastMessageType.Error,
            ToastPlacement.Bottom
          );
        }
      );
  }

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
    this.graphqlService.query( getUserLevelProgressQuery,{userLevelProgressInput: this.getUserProgressInput},1)
      .subscribe(
        ({ data }) => {
          console.log(
            "getUserLevelProgress DATA" +
            JSON.stringify(data["getUserLevelProgress"])
          );
          this.commonService.hideLoader();
          this.userlevelProgress = data["getUserLevelProgress"];

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

export class UpdateUserlevelsProgressInput {
  ParentClubKey: string;
  ClubKey: string;
  MemberKey: string;
  AppType: number;
  ActionType: number;
  DeviceType: number;
  level_id: string;
  challenge_classification_id: string;
  target_id: string;
  user_id: string;
  activity_id: string;
} {

}

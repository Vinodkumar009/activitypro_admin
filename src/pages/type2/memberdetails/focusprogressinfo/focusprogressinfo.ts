import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { LoadingController } from 'ionic-angular/components/loading/loading-controller';
import { Storage } from "@ionic/storage";
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { UserLevelChallengeModel } from '../../levels/models/levels.model';
import { UpdateUserlevelsProgressInput } from '../upgradedowngradelevel/upgradedowngradelevel';

/**
 * Generated class for the FocusprogressinfoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-focusprogressinfo',
  templateUrl: 'focusprogressinfo.html',
})
export class FocusprogressinfoPage {

  getUserLevelChallengeInput: GetUserLevelChallengeInput = {
    ParentClubKey: '',
    ClubKey: '',
    MemberKey: '',
    AppType: 0,
    ActionType: 0,
    DeviceType: 1,
    levelId: '',
    userId: '',
    focusAreaId: ''
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

  userLevelChallengeModel: UserLevelChallengeModel[] = [];
  selectedActivityKey: any;
  selectedLevelId: any;
  level: any;
  userId: any;
  mem: any;
  focus: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, private apollo: Apollo,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,) {

    this.storage.get("userObj").then((val) => {
      this.level = this.navParams.get("level");
      // this.mem = this.navParams.get("mem");
      this.selectedActivityKey = this.navParams.get("selectedActivityKey");
      this.selectedLevelId = this.navParams.get("selectedLeveL");
      this.focus = this.navParams.get("focus");
      this.userId = this.navParams.get("userId");
      // console.log('MEMBER', this.mem);
      console.log('LEVEL', this.level);
      console.log('SELECTED ACTIVITY', this.selectedActivityKey);
      console.log('SELECTED LEVEL ID', this.selectedLevelId);
      console.log('SELECTED FOCUS', this.focus);
      console.log('SELECTED USERID', this.userId);
      this.getUserLevelChallengeInput.focusAreaId = this.focus.id;
      this.getUserLevelChallengeInput.userId = this.userId;
      this.getUserLevelChallengeInput.levelId = this.selectedLevelId;
      // this.getUserLevelChallengeInput.levelId = this.level.id
      val = JSON.parse(val);
      if (val.$key != "") {
        this.getUserLevelChallengeInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
      }
      this.GetUserLevelChallenges();
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FocusprogressinfoPage');
  }
  gotoNext() {
    this.navCtrl.push("ApprovalPage");
  }
  // getTargetApprovalStatus(approvalStatus: number): string {
  //   switch (approvalStatus) {
  //     case 0:
  //       return 'NotStarted';
  //     case 1:
  //       return 'Pending';
  //     case 2:
  //       return 'Approved';
  //     case 3:
  //       return 'Rejected';
  //     default:
  //       return 'Pending';
  //   }
  // }

  // getApprovalStatusColor(approvalStatus: number): string {
  //   switch (approvalStatus) {
  //     case 0:
  //       return 'black'; // NotStarted
  //     case 1:
  //       return 'orange'; // Pending
  //     case 2:
  //       return 'green'; // Approved
  //     case 3:
  //       return 'red'; // Rejected
  //     default:
  //       return 'orange'; // Default color if the status is unknown
  //   }
  // }

  getTargetApprovalStatus(approvalStatus: number): string {
    const statusMap: { [key: number]: string } = {
      0: 'Pending',
      1: 'Pending Approval',
      2: 'Approved',
      3: 'Rejected',
    };
    return statusMap[approvalStatus] || 'Pending';
  }

  getApprovalStatusColor(approvalStatus: number): string {
    const colorMap: { [key: number]: string } = {
      0: 'black',
      1: 'orange',
      2: 'green',
      3: 'red',
    };
    return colorMap[approvalStatus] || 'orange';
  }




  // updateUserLevelProgress(index: number) {
  //   this.UpdateUserlevelsProgressInput.activity_id = this.selectedActivityKey;
  //   this.UpdateUserlevelsProgressInput.level_id = this.level.id;
  //   this.UpdateUserlevelsProgressInput.user_id = this.userId;
  //   this.UpdateUserlevelsProgressInput.target_id = this.userLevelChallengeModel[index].target_area[index].id;
  //   this.UpdateUserlevelsProgressInput.challenge_classification_id = this.userLevelChallengeModel[index].target_area[index].challenge_classification_id;

  //   this.apollo
  //     .mutate({
  //       mutation: gql`
  //         mutation updateUserLevelProgress(
  //           $updateUserlevelProgressInput: UpdateUserlevelsProgressInput!
  //         ) {
  //           updateUserLevelProgress(updateUserlevelProgressInput: $updateUserlevelProgressInput) 
  //         }
  //       `,
  //       variables: { updateUserlevelProgressInput: this.UpdateUserlevelsProgressInput },
  //     })
  //     .subscribe(
  //       ({ data }) => {
  //         // this.commonService.hideLoader();
  //         console.log(
  //           "Upadte USER LEVEL DATA" + data["updateUserLevelProgress"]
  //         );
  //         this.commonService.toastMessage(
  //           "Level updated successfully",
  //           2500,
  //           ToastMessageType.Success,
  //           ToastPlacement.Bottom
  //         );
  //       },
  //       (err) => {
  //         // this.commonService.hideLoader();
  //         console.log(JSON.stringify(err));
  //         this.commonService.toastMessage(
  //           "Failed to update",
  //           2500,
  //           ToastMessageType.Error,
  //           ToastPlacement.Bottom
  //         );
  //       }
  //     );
  // }

  GetUserLevelChallenges = () => {
    // this.commonService.showLoader("Fetching Details...");
    const getUserLevelChallengesQuery = gql`
      query getUserLevelChallenges(
        $userLevelChallengeInput: getUserLevelChallengeInput!
      ) {
        getUserLevelChallenges(
          userLevelChallengeInput: $userLevelChallengeInput
        ) {
          id
          challenge_name
          challenge_id
          points
          level_id
          help_text
          target_area {
            challenge_classification_id
            target_area_Id
            target_area_name
            status
            approval_status
          }
        }
      }
    `;
    this.apollo
      .query({
        query: getUserLevelChallengesQuery,
        fetchPolicy: "network-only",
        variables: {
          userLevelChallengeInput: this.getUserLevelChallengeInput,
        },
      })
      .subscribe(
        ({ data }) => {
          console.log(
            "getUserLevelChallenges DATA" +
            JSON.stringify(data["getUserLevelChallenges"])
          );
          // this.commonService.hideLoader();
          this.userLevelChallengeModel = data["getUserLevelChallenges"];

        },
        (err) => {
          // this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage(
            "Failed to fetch getUserLevelChallenges",
            2500,
            ToastMessageType.Error,
            ToastPlacement.Bottom
          );
        }
      );
  };

}

export class GetUserLevelChallengeInput {
  ParentClubKey: string;
  ClubKey: string;
  MemberKey: string;
  AppType: number;
  ActionType: number;
  DeviceType: number;
  levelId: string;
  userId: string;
  focusAreaId: string;
}

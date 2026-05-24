import { Component } from '@angular/core';
import { ActionSheetController, IonicPage, LoadingController, NavController, NavParams } from 'ionic-angular';
import { Storage } from "@ionic/storage";
import { FirebaseService } from '../../../../services/firebase.service';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { ChallengeClassificationModel } from '../models/levels.model';

/**
 * Generated class for the FocusdetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-focusdetails',
  templateUrl: 'focusdetails.html',
})
export class FocusdetailsPage {

  getChallengeClassificationInput: getChallengeClassificationInput = {
    ParentClubKey: "",
    ClubKey: "",
    MemberKey: "",
    AppType: 0,
    ActionType: 1,
    DeviceType: 1,
    challengeId: "",
    levelId: "",
    // levelId: "c89b2e14-0a3d-4c18-876f-a77d657ac30e",
    focus_area_Id: "",
    activityKey: ""
  }

  updateUserLevelChallengeInput: UpdateUserLevelChallengeInput = {
    ParentClubKey: '',
    ClubKey: '',
    MemberKey: '',
    AppType: 0,
    ActionType: 0,
    DeviceType: 0,
    level_assignment_id: ''
  }
  challenges: ChallengeClassificationModel[] = [];
  focus: any;
  needRefresh:boolean = false;
  constructor(
    public navParams: NavParams,
    private apollo: Apollo,
    public actionSheetCtrl: ActionSheetController,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public fb: FirebaseService) {
    this.focus = this.navParams.get("focus");
    this.getChallengeClassificationInput.focus_area_Id = this.focus.id;
    this.getChallengeClassificationInput.levelId = this.navParams.get("selectedlevelId");
    this.getChallengeClassificationInput.activityKey = this.navParams.get("selectedActivityKey");
    this.storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.getChallengeClassificationInput.ClubKey = val.UserInfo[0].ClubKey;
        this.getChallengeClassificationInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
        this.updateUserLevelChallengeInput.ParentClubKey = val.UserInfo[0].ParentClubKey;

      }
      this.GetChallengeFocusAreaAndTargetArea();
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FocusdetailsPage');
  }

  presentActionSheet(chal: ChallengeClassificationModel) {
    let actionSheet = this.actionSheetCtrl.create({
      // title: "Do you want to remove the assigned challenge?",
      buttons: [
        // {
        //   text: "Yes",
        //   role: "destructive",
        //   icon: "checkmark",
        //   handler: () => {
        //     // this.invite(selectedparticipant);
        //   },
        // },
        {
          text: "Remove",
          role: "destructive",
          // role: "cancel",
          icon: "close",
          handler: () => {
            this.RemoveAssignedChallengeFromLevel(chal);
          },
        },
      ],
    });

    actionSheet.present();
  }

  RemoveAssignedChallengeFromLevel(chal) {
    // setTimeout(() => {
    // this.commonService.showLoader("Please wait...");
    this.updateUserLevelChallengeInput.level_assignment_id = chal.id;
    this.apollo
      .mutate({
        mutation: gql`
        mutation removeAssignedChallengeFromLevel(
          $updateChallengeClassificationInput: updateUserLevelChallengeInput!
        ) {
          removeAssignedChallengeFromLevel(updateChallengeClassificationInput: $updateChallengeClassificationInput) 
        }
        `,
        variables: { updateChallengeClassificationInput: this.updateUserLevelChallengeInput },
      })
      .subscribe(
        ({ data }) => {
          // this.commonService.hideLoader();
          console.log(
            "REMOVE CHALLENGE DATA" + data["removeAssignedChallengeFromLevel"]
          );

          this.commonService.toastMessage(
            "Challenge removed successfully",
            2500,
            ToastMessageType.Success,
            ToastPlacement.Bottom
          );
          this.needRefresh = true;
          this.GetChallengeFocusAreaAndTargetArea();
        },
        (err) => {
          // this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage(
            "Failed to remove challenge",
            2500,
            ToastMessageType.Error,
            ToastPlacement.Bottom
          );
        }
      );
  }

  ionViewWillLeave() { //need to refresh levels screens when any challenges removed here
    if(this.needRefresh){
      this.commonService.updateCategory('activity_levels');
    }
  }

  GetChallengeFocusAreaAndTargetArea = () => {
    const getChallengeFocusAreaAndTargetAreaQuery = gql`
      query getChallengeFocusAreaAndTargetArea(
        $getChallengeClassificationInput: getChallengeClassificationInput!
      ) {
        getChallengeFocusAreaAndTargetArea(
          getChallengeClassificationInput: $getChallengeClassificationInput
        ) {
          id
          challenge {
            Id
            ChallengeName
          }
          focus_area {
            id
            focus_area_name
          }
          target_area {
            id
            target_area_name
          }    
        }
      }
    `;
    this.apollo
      .query({
        query: getChallengeFocusAreaAndTargetAreaQuery,
        fetchPolicy: "network-only",
        variables: {
          getChallengeClassificationInput: this.getChallengeClassificationInput,
        },
      })
      .subscribe(
        ({ data }) => {
          console.log(
            "getChallengeFocusAreaAndTargetArea DATA" +
            JSON.stringify(data["getChallengeFocusAreaAndTargetArea"])
          );
          // this.commonService.hideLoader();
          this.challenges = data["getChallengeFocusAreaAndTargetArea"];


        },
        (err) => {
          // this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage(
            "Failed to fetch challenges",
            2500,
            ToastMessageType.Error,
            ToastPlacement.Bottom
          );
        }
      );
  };

}
export class getChallengeClassificationInput {
  ParentClubKey: string;
  ClubKey: string;
  MemberKey: string;
  AppType: number;
  ActionType: number;
  DeviceType: number;
  challengeId: string;
  focus_area_Id: string;
  levelId: string;
  activityKey: string;
}

export class UpdateUserLevelChallengeInput {
  ParentClubKey: string;
  ClubKey: string;
  MemberKey: string;
  AppType: number;
  ActionType: number;
  DeviceType: number;
  level_assignment_id: string;
}

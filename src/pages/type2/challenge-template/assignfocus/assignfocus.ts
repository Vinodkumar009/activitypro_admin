import { Component } from '@angular/core';
import { ActionSheetController, Checkbox, IonicPage, LoadingController, NavController, NavParams } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import gql from 'graphql-tag';
import { Storage } from "@ionic/storage";
import { FirebaseService } from '../../../../services/firebase.service';
import { SharedServices } from '../../../services/sharedservice';
import { Apollo } from 'apollo-angular';
import { AssignedChallengeDetailsModel, ChallengeClassificationModel, ChallengeFocusAreaModel, ChallengeTargetAreaModel } from '../../levels/models/levels.model';
import { s } from '@angular/core/src/render3';

/**
 * Generated class for the AssignfocusPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-assignfocus',
  templateUrl: 'assignfocus.html',
})
export class AssignfocusPage {
  GetAllFocusAreaInput: GetAllFocusAreaInput = {
    ParentClubKey: "",
    ClubKey: "",
    MemberKey: "",
    AppType: 0,
    ActionType: 0,
    DeviceType: 1,
    activityKey: ""
  }
  GetAllTargetAreaInput: GetAllTargetAreaInput = {
    ParentClubKey: "",
    ClubKey: "",
    MemberKey: "",
    AppType: 0,
    ActionType: 0,
    DeviceType: 1,
    activity_key: ""
  }
  challengeClassficationAssignmentInput: challengeClassficationAssignmentInput = {
    ParentClubKey: "",
    ClubKey: "",
    MemberKey: "",
    AppType: 0,
    ActionType: 0,
    DeviceType: 1,
    // challengeId: "34f1f125-e677-4c12-abbb-9dadfd8def0c",
    challengeId: "",
    focusAreaId: "",
    // focusAreaId: "760fe1af-92d5-48ae-9558-5a2802c7bd7e",
    targetArea: []
  }
  getChallengeClassificationInput: getChallengeClassificationInput = {
    ParentClubKey: "",
    ClubKey: "",
    MemberKey: "",
    AppType: 0,
    ActionType: 3,
    DeviceType: 1,
    challengeId: "",
    levelId: "",
    activityKey: "",
    focus_area_Id: ""
  };
  focusAreaList: ChallengeFocusAreaModel[] = [];
  targetAreaList: ChallengeTargetAreaModel[] = [];
  existingTargetAreaList: ChallengeTargetAreaModel[] = [];
  assignChallengeFocusAreaAndTargetAreaResponse: ChallengeClassificationModel[] = [];
  assignedChallengeDetailsList: AssignedChallengeDetailsModel[] = [];
  challengeObj: any;
  challengeName: any;
  constructor(public navCtrl: NavController, public navParams: NavParams, private apollo: Apollo,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public sharedservice: SharedServices,
    public actionSheetCtrl: ActionSheetController,
    public fb: FirebaseService) {
    this.storage.get("userObj").then((val) => {
      this.GetAllFocusAreaInput.activityKey = this.navParams.get("selectedActivityKey");
      // console.log(this.GetAllFocusAreaInput.activityKey);
      this.GetAllTargetAreaInput.activity_key = this.navParams.get("selectedActivityKey");
      this.challengeObj = this.navParams.get("ChallengeOrTempObj");
      this.challengeClassficationAssignmentInput.challengeId = this.challengeObj.Id;
      this.challengeName = this.challengeObj.ChallengeName;
      this.getChallengeClassificationInput.challengeId = this.challengeObj.Id;
      console.log(this.challengeName);
      val = JSON.parse(val);
      if (val.$key != "") {
        this.GetAllFocusAreaInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
        this.GetAllTargetAreaInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
        this.challengeClassficationAssignmentInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
        this.getChallengeClassificationInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
      }
      this.GetAllFocusArea();
      this.GetAllTargetArea();
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AssignfocusPage');
  }

  getAssignedFocusAreaAndTargetAreas = () => {
    // this.commonService.showLoader("Please wait...");
    const getAssignedFocusAreaAndTargetAreasQuery = gql`
      query getAssignedFocusAreaAndTargetAreas(
        $getChallengeClassificationInput: getChallengeClassificationInput!
      ) {
        getAssignedFocusAreaAndTargetAreas(
          getChallengeClassificationInput: $getChallengeClassificationInput
        ) {
          is_active
          ChallengeId
          ChallengeName
          FocusId
          FocusAreaName
          TargetId
          TargetAreaName
        }
      }
    `;
    this.apollo
      .query({
        query: getAssignedFocusAreaAndTargetAreasQuery,
        fetchPolicy: "network-only",
        variables: {
          getChallengeClassificationInput: this.getChallengeClassificationInput,
        },
      })
      .subscribe(
        ({ data }) => {
          console.log(
            "GET ALL Assigned Challenge DATA" +
            JSON.stringify(data["getAssignedFocusAreaAndTargetAreas"])
          );
          // this.commonService.hideLoader();
          this.assignedChallengeDetailsList = data["getAssignedFocusAreaAndTargetAreas"];
          if (this.targetAreaList.length > 0) {

            for (let i = 0; i < this.targetAreaList.length; i++) {

              this.targetAreaList[i]["isAllreadySelected"] = false;
              // this.assignedChallengeDetailsList[i]["is_active"] = false;
              // this.targetAreaList[i].id==this.assignedChallengeDetailsList[i].TargetId
              if (this.targetAreaList.length > 0) {
                for (let j = 0; j < this.assignedChallengeDetailsList.length; j++) {
                  if (this.targetAreaList[i].id === this.assignedChallengeDetailsList[j].TargetId) {
                    this.targetAreaList[i]["isAllreadySelected"] = true;
                    // this.assignedChallengeDetailsList[i]["is_active"] = true;
                  }
                }
              }
            }
            console.log('target area text', this.targetAreaList);
          }

        },
        (err) => {
          // this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage(
            "Failed to fetch getAssignedFocusAreaAndTargetAreas",
            2500,
            ToastMessageType.Error,
            ToastPlacement.Bottom
          );
        }
      );
  };

  GetAllFocusArea = () => {
    this.commonService.showLoader("Please wait...");
    const getAllFocusAreaQuery = gql`
      query getAllFocusArea(
        $getAllFocusArea: GetAllFocusAreaInput!
      ) {
        getAllFocusArea(
          getAllFocusArea: $getAllFocusArea
        ) {
          id
          focus_area_name
          is_active
        }
      }
    `;
    this.apollo
      .query({
        query: getAllFocusAreaQuery,
        fetchPolicy: "network-only",
        variables: {
          getAllFocusArea: this.GetAllFocusAreaInput,
        },
      })
      .subscribe(
        ({ data }) => {
          console.log(
            "GET ALL FOCUS AREA DATA" +
            JSON.stringify(data["getAllFocusArea"])
          );
          this.commonService.hideLoader();
          this.focusAreaList = data["getAllFocusArea"];
          if (this.focusAreaList.length > 0) {
            for (let focusarea of this.focusAreaList) {
              focusarea["is_selected"] = false;
            }
            this.focusAreaList[0].is_selected = true
            this.challengeClassficationAssignmentInput.focusAreaId = this.focusAreaList[0].id;
            this.getChallengeClassificationInput.focus_area_Id = this.focusAreaList[0].id;
            this.getAssignedFocusAreaAndTargetAreas();
          }
        },
        (err) => {
          this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage(
            "Failed to fetch getAllFocusArea",
            2500,
            ToastMessageType.Error,
            ToastPlacement.Bottom
          );
        }
      );
  };

  selectFocusArea(index: number) {
    this.focusAreaList[index]["is_selected"] = true;
    if (this.focusAreaList[index]["is_selected"]) {
      this.focusAreaList.filter((item, itemIndex) =>
        itemIndex != index
      ).map((item) => {
        item["is_selected"] = false;
      });
      this.challengeClassficationAssignmentInput.focusAreaId = this.focusAreaList[index].id;
      this.getChallengeClassificationInput.focus_area_Id = this.focusAreaList[index].id;
      this.getAssignedFocusAreaAndTargetAreas();
    }
  }

  GetAllTargetArea = () => {
    // this.commonService.showLoader("Fetching Term Session...");
    const getAllTargetAreaQuery = gql`
      query getAllTargetArea(
        $getAllTargetArea: GetAllTargetAreaInput!
      ) {
        getAllTargetArea(
          getAllTargetArea: $getAllTargetArea
        ) {
          id
          target_area_name
          is_active
        }
      }
    `;
    this.apollo
      .query({
        query: getAllTargetAreaQuery,
        fetchPolicy: "network-only",
        variables: {
          getAllTargetArea: this.GetAllTargetAreaInput,
        },
      })
      .subscribe(
        ({ data }) => {
          console.log(
            "GET ALL TARGET AREA DATA" +
            JSON.stringify(data["getAllTargetArea"])
          );
          // this.commonService.hideLoader();
          this.targetAreaList = data["getAllTargetArea"];
          if (this.targetAreaList.length > 0) {
            // this.getAssignedFocusAreaAndTargetAreas();
          }
        },
        (err) => {
          // this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage(
            "Failed to fetch Target Area",
            2500,
            ToastMessageType.Error,
            ToastPlacement.Bottom
          );
        }
      );
  };

  selectTargetArea(index: number, cbox: Checkbox) {
    const selectedTargetArea = this.targetAreaList[index];
    console.log('selected target', cbox.checked);
    if (!cbox.checked) {
      const targetIndex = this.challengeClassficationAssignmentInput.targetArea.findIndex(targetArea => targetArea.targetAreaId == selectedTargetArea.id)
      if (targetIndex !== -1) {
        this.challengeClassficationAssignmentInput.targetArea[targetIndex].status = 0;
      }
      else {
        const newTargetArea: TargetAreaInput = {
          targetAreaId: selectedTargetArea.id,
          status: 0
        };
        this.challengeClassficationAssignmentInput.targetArea.push(newTargetArea);
      }
    }
    else if (cbox.checked) {
      const targetIndex = this.challengeClassficationAssignmentInput.targetArea.findIndex(targetArea => targetArea.targetAreaId == selectedTargetArea.id)
      if (targetIndex !== -1) {
        this.challengeClassficationAssignmentInput.targetArea[targetIndex].status = 1;
      }
      else {
        const newTargetArea: TargetAreaInput = {
          targetAreaId: selectedTargetArea.id,
          status: 1
        };
        this.challengeClassficationAssignmentInput.targetArea.push(newTargetArea);
      }

    }
    console.log(this.challengeClassficationAssignmentInput.targetArea);
    // cbox.checked = !cbox.checked;
    // const targetIndex = this.challengeClassficationAssignmentInput.targetArea.findIndex(targetArea => targetArea.targetAreaId == selectedTargetArea.id)
    // if (!cbox.checked && targetIndex !== -1) {
    //   // this.challengeClassficationAssignmentInput.targetArea.splice(targetIndex, 1);

    // } else if (cbox.checked == true && targetIndex == -1) {
    //   const newTargetArea: TargetAreaInput = {
    //     targetAreaId: selectedTargetArea.id,
    //     status: 1
    //   };
    //   this.challengeClassficationAssignmentInput.targetArea.push(newTargetArea);
    // }
    // if (!cbox.checked && targetIndex !== -1) {
    //   this.challengeClassficationAssignmentInput.targetArea.splice(targetIndex, 1);
    // } else if (cbox.checked == true && targetIndex == -1) {
    //   const newTargetArea: TargetAreaInput = {
    //     targetAreaId: selectedTargetArea.id,
    //     status: 1
    //   };
    //   this.challengeClassficationAssignmentInput.targetArea.push(newTargetArea);
    // }
  }

  AssignChallengeFocusAreaAndTargetArea() {

    this.challengeClassficationAssignmentInput.focusAreaId = this.focusAreaList.filter(level => level.is_selected)[0].id,
      // this.challengeClassficationAssignmentInput.targetArea[0].targetAreaId = this.targetAreaList.;
      this.apollo
        .mutate({
          mutation: gql`
          mutation assignChallengeFocusAreaAndTargetArea(
            $assignChallengeClassificationInput: challengeClassficationAssignmentInput!
          ) {
            assignChallengeFocusAreaAndTargetArea(assignChallengeClassificationInput: $assignChallengeClassificationInput) {
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
        `,
          variables: { assignChallengeClassificationInput: this.challengeClassficationAssignmentInput },
        })
        .subscribe(
          ({ data }) => {
            this.commonService.hideLoader();

            this.assignChallengeFocusAreaAndTargetAreaResponse = data["assignChallengeFocusAreaAndTargetArea"];
            //this.commonService.updateCategory("challenge");
            this.commonService.updateCategory("challenge_template_list");
            this.navCtrl.pop();
            //empty the array before poping the page
            this.assignedChallengeDetailsList = [];
            this.commonService.toastMessage(
              "Assigned successfully",
              2500,
              ToastMessageType.Success,
              ToastPlacement.Bottom
            );
          },
          (err) => {
            this.commonService.hideLoader();
            console.log(JSON.stringify(err));
            this.commonService.toastMessage(
              "Target area is already assigned",
              2500,
              ToastMessageType.Error,
              ToastPlacement.Bottom
            );
          }
        );
  }
}

export class GetAllFocusAreaInput {
  ParentClubKey: string;
  ClubKey: string;
  MemberKey: string;
  AppType: number;
  ActionType: number;
  DeviceType: number;
  activityKey: string;
}
export class GetAllTargetAreaInput {
  ParentClubKey: string;
  ClubKey: string;
  MemberKey: string;
  AppType: number;
  ActionType: number;
  DeviceType: number;
  activity_key: string;
}

export class challengeClassficationAssignmentInput {
  ParentClubKey: string;
  ClubKey: string;
  MemberKey: string;
  AppType: number;
  ActionType: number;
  DeviceType: number;
  challengeId: string;
  focusAreaId: string;
  targetArea: TargetAreaInput[];
}

export class TargetAreaInput {
  targetAreaId: string;
  status: number;
}

export class getChallengeClassificationInput {
  ParentClubKey: string;
  ClubKey: string;
  MemberKey: string;
  AppType: number;
  ActionType: number;
  DeviceType: number;
  challengeId: string;
  levelId: string;
  activityKey: string;
  focus_area_Id: string;
}
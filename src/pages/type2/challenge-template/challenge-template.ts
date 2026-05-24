import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  AlertController,
  ActionSheetController,
  LoadingController,
} from "ionic-angular";
import { FirebaseService } from "../../../services/firebase.service";
import { SharedServices } from "../../services/sharedservice";
import {
  CommonService,
  ToastMessageType,
  ToastPlacement,
} from "../../../services/common.service";
import { Storage } from "@ionic/storage";
import { Apollo } from "apollo-angular";
import { HttpLink } from "apollo-angular-link-http";
import gql from "graphql-tag";
import {
  TemplateModel,
  ChallengeModel,
  Levelmodel,
  Approval,
} from "./model/challenge_templatemodel";
import { AssignedChallengeDetailsModel } from "../levels/models/levels.model";
import { first } from "rxjs/operators";
@IonicPage()
@Component({
  selector: "page-challenge-template",
  templateUrl: "challenge-template.html",
})
export class ChallengeTemplate {
  activityList = [];
  isChallangesAvail: boolean = true;
  isTemplatesAvail: boolean = true;
  selectedActivity: string = '';
  temp_selectedActivity: string = '';
  parentClubKey: string = "";

  selectedType: boolean = true;
  Challenges: ChallengeModel[];
  UnmutatedChallenges = [];
  Templates: TemplateModel[];
  UnmutatedTemplates = [];

  getChallengeClassificationInput: getChallengeClassificationInput = {
    ParentClubKey: "",
    ClubKey: "",
    MemberKey: "",
    AppType: 0,
    ActionType: 1,
    DeviceType: 1,
    challengeId: "",
    levelId: "",
    activityKey: "",
    focus_area_Id: ""
  };
  assignedChallengeDetailsList: AssignedChallengeDetailsModel[] = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private apollo: Apollo,
    private httpLink: HttpLink,
    public actionSheetCtrl: ActionSheetController,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public fb: FirebaseService,
    public sharedservice: SharedServices
  ) { }

  ionViewDidLoad() { }

  ionViewWillEnter() {
    console.log("ionViewDidLoad ChallengeTemplatePage");
    this.selectedType = true;
    this.commonService.category.pipe(first()).subscribe((data) => {
      this.parentClubKey = this.sharedservice.getParentclubKey();
      this.getChallengeClassificationInput.ParentClubKey = this.parentClubKey;
      console.log("parentclub",this.parentClubKey);
      console.log("subject",data);
      if (data == "challenge_template_list") {
        this.getActivityList();
        this.getAssignedFocusAreaAndTargetAreas();
      }
    });
  }

  //getting activities
  getActivityList() {
    //this.commonService.showLoader("Please wait...");
    this.fb.getAll("/Activity/" + this.parentClubKey).subscribe(
      (data) => {
        if (data.length > 0) {
          this.activityList = [];
          for (let j = 0; j < data.length; j++) {
            let ActivityList = this.commonService.convertFbObjectToArray(
              data[j]
            );
            for (let k = 0; k < ActivityList.length; k++) {
              let flag = true;
              for (let i = 0; i < this.activityList.length; i++) {
                if (ActivityList[k].IsEnable) {
                  if (ActivityList[k].Key == this.activityList[i].Key) {
                    flag = false;
                    break;
                  }
                }
              }
              if (
                flag &&
                ActivityList[k].Key &&
                ActivityList[k].Key != undefined &&
                ActivityList[k].ActivityName
              ) {
                this.activityList.push(ActivityList[k]);
                this.selectedActivity = this.activityList[0].Key;
                this.temp_selectedActivity = this.activityList[0].Key;
                flag = false;
                console.log(this.selectedActivity);
              }
            }
          }
          //this.commonService.hideLoader();
          this.getChallenges();
        }
      },
      (err) => {
        //this.commonService.hideLoader();
        this.commonService.toastMessage(
          "Activities fetch failed",
          2500,
          ToastMessageType.Error,
          ToastPlacement.Bottom
        );
      }
    );
  }

  onChangeActivity() {
    if(this.selectedActivity!=this.temp_selectedActivity){
      this.temp_selectedActivity = this.selectedActivity;
      this.selectedType ? this.getChallenges() : this.getTemplates();
    }
  }

  refreshList() {
    this.selectedType ? this.getChallenges() : this.getTemplates();
  }

  getChallengeId(challId: string): string[] {
    const matchedChallenges = this.assignedChallengeDetailsList.filter(
      (assignedChallenge) => assignedChallenge.ChallengeId === challId
    );
    if (matchedChallenges.length > 0) {
      return matchedChallenges.map(
        (matchedChallenge) =>
          `${matchedChallenge.FocusAreaName}: ${matchedChallenge.TargetAreaName}`
      );
    } else {
      return [];
    }
  }

  getAssignedFocusAreaAndTargetAreas = () => {
    // this.commonService.showLoader("Fetching Term Session...");
    const getAssignedFocusAreaAndTargetAreasQuery = gql`
      query getAssignedFocusAreaAndTargetAreas(
        $getChallengeClassificationInput: getChallengeClassificationInput!
      ) {
        getAssignedFocusAreaAndTargetAreas(
          getChallengeClassificationInput: $getChallengeClassificationInput
        ) {
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

  //getting Challenges
  getChallenges = () => {
    this.commonService.showLoader("Fetching challenges...");
    //const parentClub = "78c25502-a302-4276-9460-2114db73de03";

    const challengesQuery = gql`
      query getChallengesByParentClubAndActivity(
        $parentClub: String!
        $activity: String!
      ) {
        getChallengesByParentClubAndActivity(
          parentClubFirebaseId: $parentClub
          activityKey: $activity
        ) {
          Id
          ChallengeName
          ChallengsImageURL
          ChallengeCategory
          ParentClub {
            Id
          }
          Activity {
            Id
            ActivityCode
            FirebaseActivityKey
          }
          Levels {
            Id
            LevelName
            LevelChallenge
            LevelSequence
            Points
            PointsDetails {
              Id
              PointsName
              PointsValue
            }
            ApprovalDetails {
              Id
              ApprovedBy
            }
          }
        }
      }
    `;
    this.apollo
      .query({
        query: challengesQuery,
        fetchPolicy: "network-only",
        variables: {
          parentClub: this.parentClubKey,
          activity: this.selectedActivity,
        },
      })
      .subscribe(
        ({ data }) => {
          //console.log('challenges data' + data["getChallengesByParentClubAndActivity"]);
          this.commonService.hideLoader();
          //this.commonService.toastMessage("Challenges fetched",2500,ToastMessageType.Success,ToastPlacement.Bottom);
          this.Challenges = data[
            "getChallengesByParentClubAndActivity"
          ] as ChallengeModel[];
          this.UnmutatedChallenges = JSON.parse(
            JSON.stringify(this.Challenges)
          );
          this.isChallangesAvail = this.Challenges.length > 0 ? true : false;
          if (this.Challenges.length > 0) {
            this.Challenges.forEach((challenge) => {
              challenge["TotPts"] = 0;
              challenge.Levels.forEach((level) => {
                challenge["TotPts"] += level.Points;
              });
            });
          }

          console.log("challenges data" + JSON.stringify(this.Challenges));
        },
        (err) => {
          this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage(
            "Challenges fetch failed",
            2500,
            ToastMessageType.Error,
            ToastPlacement.Bottom
          );
        }
      );
  };

  //getting Templates
  getTemplates = () => {
    this.commonService.showLoader("Fetching templates");
    //const parentClub = "78c25502-a302-4276-9460-2114db73de03";
    // const activity = "1001";
    //123456
    const templateQuery = gql`
      query getTemplateByParentClubAndActivity(
        $parentClub: String!
        $activity: String!
      ) {
        getTemplateByParentClubAndActivity(
          parentClubKey: $parentClub
          activityKey: $activity
        ) {
          Id
          TemplateName
          AgeGroupStart
          AgeGroupEnd

          Challenge {
            Id
            ChallengeName
            ChallengsImageURL
            Levels {
              LevelName
              LevelChallenge
              LevelSequence
              Points
              ApprovalDetails {
                ApprovedBy
              }
            }
          }
        }
      }
    `;
    this.apollo
      .query({
        query: templateQuery,
        fetchPolicy: "network-only",
        variables: {
          parentClub: this.parentClubKey,
          activity: this.selectedActivity,
        },
      })
      .subscribe(
        ({ data }) => {
          console.log(
            "templateses data" + data["getTemplateByParentClubAndActivity"]
          );
          this.commonService.hideLoader();
          //this.commonService.toastMessage("Templates fetched",2500,ToastMessageType.Success,ToastPlacement.Bottom);
          this.Templates = data[
            "getTemplateByParentClubAndActivity"
          ] as TemplateModel[];
          this.UnmutatedTemplates = JSON.parse(JSON.stringify(this.Templates));
          this.isTemplatesAvail = this.Templates.length > 0 ? true : false;
          if (this.Templates.length > 0) {
            this.Templates.forEach((template) => {
              template["TotPts"] = 0;
              template.Challenge.forEach((challenge) => {
                challenge.Levels.forEach((level) => {
                  template["TotPts"] += level.Points;
                });
              });
            });
          }
          console.log("templates data" + JSON.stringify(this.Templates));
        },
        (err) => {
          this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage(
            "Templates fetch failed",
            2500,
            ToastMessageType.Error,
            ToastPlacement.Bottom
          );
        }
      );
  };

  //Tabs Toggle b/w challenge&template
  changeType(val) {
    this.selectedType = val;
    this.selectedType ? this.getChallenges() : this.getTemplates();
  }

  gotoAssignFocus(challenge) {
    this.navCtrl.push("AssignfocusPage", {
      challenge: challenge,
      selectedActivityKey: this.selectedActivity,
    });
  }

  showActions(from: string, ChallengeOrTempObj: any) {
    // need to remove once template update functionality done
    let actionSheet;
    actionSheet = this.actionSheetCtrl.create({
      title:
        from == "challenge"
          ? ChallengeOrTempObj.Challenge
          : ChallengeOrTempObj.TemplateName,
      cssClass: "action-sheets-basic-page",
      buttons: [
        {
          text: "Assign focus area",
          icon: "ios-create",
          handler: () => {
            // this.gotoAssignFocus(ChallengeOrTempObj);
            this.navCtrl.push("AssignfocusPage", {
              ChallengeOrTempObj, selectedActivityKey: this.selectedActivity,
            });
          },
        },
        {
          text: from == "challenge" ? "Edit" : "View",
          icon: from == "challenge" ? "ios-create" : "ios-eye",
          handler: () => {
            if (from == "challenge") {
              this.navCtrl.push("Editchallenge", {
                challenge: ChallengeOrTempObj,
                ParentClubKey: this.parentClubKey,
              });
            } else {
              this.navCtrl.push("EdittemplatePage", {
                template: ChallengeOrTempObj,
              });
            }
          },
        },
        {
          text: "Delete",
          icon: "ios-trash",
          handler: () => {
            this.deleteChallengeOrTemplate(from, ChallengeOrTempObj);
          },
        },
        {
          text: "Close",
          icon: "ios-close",
          role: "cancel",
          handler: () => { },
        },
      ],
    });
    actionSheet.present();
  }

  deleteChallengeOrTemplate(from, ReqObj: any) {
    let alert = this.alertCtrl.create({
      title: from == "challenge" ? "Delete Challenge" : "Delete Template",
      message:
        from == "challenge"
          ? "Are you sure, You want to delete challenge ?"
          : "Are you sure, You want to delete template ?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          handler: () => {
            //console.log('Cancel clicked');
          },
        },
        {
          text: "Yes:Delete",
          handler: () => {
            if (from == "challenge") {
              this.deleteChallenge(ReqObj);
            } else {
              this.deleteTemplate(ReqObj);
            }
          },
        },
      ],
    });
    alert.present();
  }

  deleteChallenge(challenge) {
    this.commonService.showLoader("Please wait...");
    this.apollo
      .mutate({
        mutation: gql`
          mutation deleteChallengesByChallengeId($challengeId: String!) {
            deleteChallengesByChallengeId(challengeId: $challengeId)
          }
        `,
        variables: { challengeId: challenge.Id },
      })
      .subscribe(
        ({ data }) => {
          this.commonService.hideLoader();
          this.commonService.toastMessage(
            "Challenge deleted successfully",
            2500,
            ToastMessageType.Success,
            ToastPlacement.Bottom
          );
          console.log("challeges data" + data["deleteChallengesByChallengeId"]);
          this.navCtrl.pop();
        },
        (err) => {
          this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage(
            "Challenge deletion failed",
            2500,
            ToastMessageType.Error,
            ToastPlacement.Bottom
          );
        }
      );
  }

  deleteTemplate(template) {
    this.commonService.showLoader("Please wait...");
    this.apollo
      .mutate({
        mutation: gql`
          mutation deleteTemplateByTemplateId($templateId: String!) {
            deleteTemplateByTemplateId(templateId: $templateId)
          }
        `,
        variables: { templateId: template.Id },
      })
      .subscribe(
        ({ data }) => {
          this.commonService.hideLoader();
          this.commonService.toastMessage(
            "Template deleted successfully",
            2500,
            ToastMessageType.Success,
            ToastPlacement.Bottom
          );
          console.log("challeges data" + data["deleteTemplateByTemplateId"]);
          this.navCtrl.pop();
        },
        (err) => {
          this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage(
            "Template deletion failed",
            2500,
            ToastMessageType.Error,
            ToastPlacement.Bottom
          );
        }
      );
  }

  //Filter challnges
  FilterChallenges(ev: any) {
    let val = ev.target.value;

    if (val && val.trim() != "") {
      this.Challenges = this.UnmutatedChallenges.filter((challenge) => {
        if (challenge.ChallengeName != undefined) {
          if (
            challenge.ChallengeName.toLowerCase().indexOf(val.toLowerCase()) >
            -1
          ) {
            return true;
          }
        }
        // if (challenge.AgeGroup != undefined) {
        //   if (challenge.AgeGroup.indexOf(val.toLowerCase()) > -1) {
        //     return true;
        //   }
        // }
      });
    } else {
      this.Challenges = this.UnmutatedChallenges;
    }
  }

  //Filter Templates
  FilterTemplates(ev: any) {
    let val = ev.target.value;

    if (val && val.trim() != "") {
      this.Templates = this.UnmutatedTemplates.filter((template) => {
        if (template.TemplateName != undefined) {
          if (
            template.TemplateName.toLowerCase().indexOf(val.toLowerCase()) > -1
          ) {
            return true;
          }
        }
        if (template.AgeFrom != undefined) {
          if (template.AgeFrom.indexOf(val.toLowerCase()) > -1) {
            return true;
          }
        }
      });
    } else {
      this.Templates = this.UnmutatedTemplates;
    }
  }

  createTemplate() {
    this.navCtrl.push("AddtemplatePage");
  }
  createChallenge() {
    this.navCtrl.push("Createchallenge");
  }

  ionViewWillLeave() {
    this.commonService.updateCategory('');
  }


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

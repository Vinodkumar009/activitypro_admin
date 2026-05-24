import { Component } from "@angular/core";
import {
  ActionSheetController,
  Checkbox,
  IonicPage,
  LoadingController,
  NavController,
  NavParams,
  ViewController,
} from "ionic-angular";
import { Storage } from "@ionic/storage";
import { Apollo } from "apollo-angular";
import { HttpLink } from "apollo-angular-link-http";
import { CommonService, ToastMessageType, ToastPlacement } from "../../../../services/common.service";
import { FirebaseService } from "../../../../services/firebase.service";
import gql from "graphql-tag";
import { ChallengeClassificationModel, ChallengeFocusAreaModel, ChallengeModel, ChallengeTargetAreaModel, FocusAreaProgressModel } from "../models/levels.model";

/**
 * Generated class for the AssignlevelsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-assignlevels",
  templateUrl: "assignlevels.html",
  providers: [CommonService, FirebaseService],
})
export class AssignlevelsPage {

  getChallengeClassificationInput: getChallengeClassificationInput = {
    ParentClubKey: "",
    ClubKey: "",
    MemberKey: "",
    AppType: 0,
    ActionType: 1,
    DeviceType: 1,
    challengeId: "",
    focus_area_Id: "",
    levelId: "",
    // levelId: "c89b2e14-0a3d-4c18-876f-a77d657ac30e",
    activityKey: ""
    // activityId: "3e3d3b31-27f2-498c-a57c-5d5382f99932"
  }
  challenges: ChallengeClassificationModel[] = [];
  // challenges: ChallengeModel[] = [];
  filteredChallenges: ChallengeClassificationModel[] = [];
  assignUserLevelChallengeInput: assignUserLevelChallengeInput = {
    ParentClubKey: "",
    ClubKey: "",
    MemberKey: "",
    AppType: 0,
    ActionType: 1,
    DeviceType: 1,
    // levelId: "c89b2e14-0a3d-4c18-876f-a77d657ac30e",
    levelId: "",
    challenge_classification_Ids: []
  }

  existedChallenges: FocusAreaProgressModel[] = [];
  // selectedlevelId: any;
  searchInput = "";

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private apollo: Apollo,
    public actionSheetCtrl: ActionSheetController,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public fb: FirebaseService,
    public viewCtrl: ViewController
  ) {
    this.getChallengeClassificationInput.levelId = this.navParams.get("selectedlevelId");
    console.log(this.getChallengeClassificationInput.levelId);
    this.existedChallenges = this.navParams.get('existedChallenges');
    this.getChallengeClassificationInput.activityKey = this.navParams.get("selectedActivityKey");
    console.log(this.getChallengeClassificationInput.activityKey);

    // console.log(this.existedChallenges);
    this.storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.getChallengeClassificationInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
        this.assignUserLevelChallengeInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
      }
      this.GetChallengeFocusAreaAndTargetArea();
    });
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad AssignlevelsPage");
  }

  dismiss() {
    this.viewCtrl.dismiss({ canRefreshData: true });
  }

  selectChallenges(id: string, cbox: Checkbox) {
    const selectedChallenge = this.challenges.find(challenge => challenge.id == id);
    cbox.checked = !cbox.checked;
    const challengeIndex = this.assignUserLevelChallengeInput.challenge_classification_Ids.findIndex(chalId => chalId === selectedChallenge.id)
    if (challengeIndex !== -1) {
      this.assignUserLevelChallengeInput.challenge_classification_Ids.splice(challengeIndex, 1)
    } else {
      this.assignUserLevelChallengeInput.challenge_classification_Ids.push(selectedChallenge.id)
    }
    console.log(this.assignUserLevelChallengeInput.challenge_classification_Ids);
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
          if (this.challenges.length > 0) {
            for (let i = 0; i < this.challenges.length; i++) {
              this.challenges[i]["isSelect"] = false;
              this.challenges[i]["isAlreadExisted"] = false;
              if (this.challenges.length > 0) {
                for (let j = 0; j < this.existedChallenges.length; j++) {
                  if (this.challenges[i].challenge.Id === this.existedChallenges[j].id) {
                    this.challenges[i]["isSelect"] = true;
                    this.challenges[i]["isAlreadExisted"] = true;
                  }
                }
              }
            }
          }
          this.filteredChallenges = JSON.parse(JSON.stringify(this.challenges));

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

  getFilterItems(ev: any) {
    let val = ev.target.value;
    if (val && val.trim() != "") {
      this.filteredChallenges = this.challenges.filter((item) => {
        if (item.challenge.ChallengeName != undefined) {
          if (item.challenge.ChallengeName.toLowerCase().indexOf(val.toLowerCase()) > -1) return true;
        }
        if (item.focus_area.focus_area_name != undefined) {
          if (item.focus_area.focus_area_name.toLowerCase().indexOf(val.toLowerCase()) > -1) return true;
        }
        if (this.checkTargetAreaName(item.target_area, val.toLowerCase()))
          return true;
      });
    } else this.initializeItems();
  }
  initializeItems() {
    this.filteredChallenges = this.challenges;
  }

  checkTargetAreaName(targetArea: ChallengeTargetAreaModel[], val: string): boolean {
    for (let area of targetArea) {
      if (area.target_area_name != undefined && area.target_area_name.toLowerCase().indexOf(val) > -1)
        return true;
    }
    return false;
  }

  assignChallengeToLevel() {
    this.assignUserLevelChallengeInput.levelId = this.getChallengeClassificationInput.levelId;
    // this.assignUserLevelChallengeInput.levelId = this.getChallengeClassificationInput.challengeId;
    this.apollo
      .mutate({
        mutation: gql`
          mutation assignChallengeToLevel(
            $assignChallengeInput: assignUserLevelChallengeInput!
          ) {
            assignChallengeToLevel(assignChallengeInput: $assignChallengeInput) 
          }
        `,
        variables: { assignChallengeInput: this.assignUserLevelChallengeInput },
      })
      .subscribe(
        ({ data }) => {
          // this.commonService.hideLoader();
          console.log(
            "Assign Challenge TO LEVEL DATA" + data["assignChallengeToLevel"]
          );
          this.commonService.toastMessage(
            "Challenge(s) assigned successfully",
            2500,
            ToastMessageType.Success,
            ToastPlacement.Bottom
          );
          this.viewCtrl.dismiss({ canRefreshData: true });
        },
        (err) => {
          // this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage(
            "Challenge is already assigned",
            2500,
            ToastMessageType.Error,
            ToastPlacement.Bottom
          );
        }
      );
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
  focus_area_Id: string;
  levelId: string;
  activityKey: string;
}
export class assignUserLevelChallengeInput {
  ParentClubKey: string;
  ClubKey: string;
  MemberKey: string;
  AppType: number;
  ActionType: number;
  DeviceType: number;
  levelId: string;
  challenge_classification_Ids: string[];
}

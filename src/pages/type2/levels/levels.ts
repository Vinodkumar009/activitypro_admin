import { Component } from "@angular/core";
import {
  ActionSheetController,
  IonicPage,
  LoadingController,
  ModalController,
  NavController,
  NavParams,
} from "ionic-angular";
import {
  CommonService,
  ToastMessageType,
  ToastPlacement,
} from "../../../services/common.service";
import { Apollo } from "apollo-angular";
import { SharedServices } from "../../services/sharedservice";
import { Storage } from "@ionic/storage";
import gql from "graphql-tag";
import { ChallengeFocusAreaModel, FocusAreaProgressModel, getAllLevelsInParentclubModel } from "./models/levels.model";
import { FirebaseService } from "../../../services/firebase.service";
import { ClubVenueModel } from "./models/venue.model";
import { Activity_V2Model } from "./models/activity.model";
import { first } from "rxjs/operators";
/**
 * Generated class for the LevelsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-levels",
  templateUrl: "levels.html",
})
export class LevelsPage {
  GetAllUserlevelsInput: GetAllUserlevelsInput = {
    ParentClubKey: "",
    ClubKey: "",
    MemberKey: "",
    AppType: 0,
    ActionType: 0,
    DeviceType: 1,
    activityKey: ""
  };
  levelsList: getAllLevelsInParentclubModel[] = [];

  VenueDetailsInput: VenueDetailsInput = {
    ParentClubKey: "",
    ClubKey: "",
    MemberKey: "",
    AppType: 0,
    ActionType: 0,
    DeviceType: 1,
    VenueKey: ""
  };
  FocusAreaProgressInput: FocusAreaProgressInput = {
    ParentClubKey: "",
    ClubKey: "",
    MemberKey: "",
    AppType: 0,
    ActionType: 1,
    DeviceType: 1,
    level_id: "",
    // level_id: "c89b2e14-0a3d-4c18-876f-a77d657ac30e",
    activity_key: "",
  };
  focusAreaProgressList: FocusAreaProgressModel[] = [];
  clubVenues: ClubVenueModel[] = [];
  focusAreaList: ChallengeFocusAreaModel[] = [];
  activities: Activity_V2Model[] = [];
  selectedActivity: any;
  parentClubKey: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private apollo: Apollo,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public sharedservice: SharedServices,
    public actionSheetCtrl: ActionSheetController,
    public fb: FirebaseService,
    public modalCtrl: ModalController,

  ) {
    // this.storage.get("userObj").then((val) => {
    //   val = JSON.parse(val);
    //   if (val.$key != "") {
    //     this.FocusAreaProgressInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
    //     this.GetAllUserlevelsInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
    //     this.VenueDetailsInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
    //     this.parentClubKey = val.UserInfo[0].ParentClubKey;
    //   }
    //   this.getClubVenues();
    // });
  }

  ionViewWillEnter(){
    this.commonService.category.pipe(first()).subscribe((data) => {
      if (data == "activity_levels") {
        this.storage.get("userObj").then((val) => {
          val = JSON.parse(val);
          if (val.$key != "") {
            this.FocusAreaProgressInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
            this.GetAllUserlevelsInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
            this.VenueDetailsInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
            this.parentClubKey = val.UserInfo[0].ParentClubKey;
          }
          this.getClubVenues();
        });
      }
    });
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad LevelsPage");
  }

  ionViewWillLeave() {
    this.commonService.updateCategory('');
  }
  
  gotoAssignLevels() {
    // this.navCtrl.push("AssignlevelsPage");
    let profileModal = this.modalCtrl.create("AssignlevelsPage", {
      existedChallenges: this.focusAreaProgressList,
      selectedlevelId: this.levelsList.filter(level => level.is_selected)[0].id,
      selectedActivityKey: this.selectedActivity,
    });
    profileModal.onDidDismiss(data => {
      console.log(data);
      if (data.canRefreshData) this.GetFocusAreaProgress();
    });
    profileModal.present();
  }

  gotoFocusDetails(focus) {
    this.navCtrl.push("FocusdetailsPage", {
      focus: focus,
      selectedlevelId: this.levelsList.filter(level => level.is_selected)[0].id,
      selectedActivityKey: this.selectedActivity,
    });
  }

  presentActionSheet() {
    let actionSheet = this.actionSheetCtrl.create({
      title: "Are you sure?",
      buttons: [
        {
          text: "Yes",
          role: "destructive",
          icon: "checkmark",
          handler: () => {
            // this.invite(selectedparticipant);
          },
        },
        {
          text: "No",
          role: "cancel",
          icon: "close",
          handler: () => {
            console.log("Cancel clicked");
          },
        },
      ],
    });

    actionSheet.present();
  }

  getClubVenues = () => {
    // this.commonService.showLoader("Please wait...");
    const clubVenuesQuery = gql`
      query getAllClubVenues($ParentClub: String!) {
        getAllClubVenues(ParentClub: $ParentClub) {
          ClubName
          ClubKey
        }
      }
    `;
    this.apollo
      .query({
        query: clubVenuesQuery,
        fetchPolicy: "network-only",
        variables: { ParentClub: this.parentClubKey },
      })
      .subscribe(
        ({ data }) => {
          // this.commonService.hideLoader();
          console.log(
            "clubVENUE DATA" + JSON.stringify(data["getAllClubVenues"])
          );
          // this.commonService.hideLoader();
          this.clubVenues = data["getAllClubVenues"];
          if (this.clubVenues.length > 0) {
            this.VenueDetailsInput.VenueKey = this.clubVenues[0].ClubKey;
            this.getAllActivityByVenue();
          }
        },
        (err) => {
          this.commonService.toastMessage(
            "Club venue fetch failed",
            2500,
            ToastMessageType.Error,
            ToastPlacement.Bottom
          );
        }
      );
  };

  getAllActivityByVenue = () => {
    // this.commonService.showLoader("Fetching Term Session...");
    const getAllActivityByVenueQuery = gql`
      query getAllActivityByVenue(
        $venueDetailsInput: VenueDetailsInput!
      ) {
        getAllActivityByVenue(
          venueDetailsInput: $venueDetailsInput
        ) {
          ActivityKey
          ActivityCode
          ActivityName
        }
      }
    `;
    this.apollo
      .query({
        query: getAllActivityByVenueQuery,
        fetchPolicy: "network-only",
        variables: {
          venueDetailsInput: this.VenueDetailsInput,
        },
      })
      .subscribe(
        ({ data }) => {
          console.log(
            "getAllActivityByVenue DATA" +
            JSON.stringify(data["getAllActivityByVenue"])
          );
          // this.commonService.hideLoader();
          this.activities = data["getAllActivityByVenue"];
          this.selectedActivity = this.activities[0].ActivityKey;
          this.GetAllUserlevelsInput.activityKey = this.selectedActivity;
          this.FocusAreaProgressInput.activity_key = this.selectedActivity;
          this.getAllLevelsInParentclub();

        },
        (err) => {
          // this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage(
            "Failed to fetch getAllActivityByVenue",
            2500,
            ToastMessageType.Error,
            ToastPlacement.Bottom
          );
        }
      );
  };

  selectActivity(activityKey: string) {
    this.selectedActivity = activityKey;
    this.GetAllUserlevelsInput.activityKey = activityKey;
    this.getAllLevelsInParentclub();
    this.FocusAreaProgressInput.activity_key = this.selectedActivity;
    this.GetFocusAreaProgress();
  }

  getAllLevelsInParentclub = () => {
    this.commonService.showLoader("Please wait...");
    const getAllLevelsInParentclubQuery = gql`
      query getAllLevelsInParentclub(
        $getAllUserlevelsInput: GetAllUserLevelsInput!
      ) {
        getAllLevelsInParentclub(
          getAllUserlevelsInput: $getAllUserlevelsInput
        ) {
          id
          level_name
          sequence
          is_active
        }
      }
    `;
    this.apollo
      .query({
        query: getAllLevelsInParentclubQuery,
        fetchPolicy: "network-only",
        variables: {
          getAllUserlevelsInput: this.GetAllUserlevelsInput,
        },
      })
      .subscribe(
        ({ data }) => {
          console.log(
            "GET ALL LEVELS IN PARENTCLUB DATA" +
            JSON.stringify(data["getAllLevelsInParentclub"])
          );
          this.commonService.hideLoader();
          this.levelsList = data["getAllLevelsInParentclub"];
          if (this.levelsList.length > 0) {
            for (let level of this.levelsList) {
              level["is_selected"] = false;
            }
            this.levelsList[0].is_selected = true
            this.FocusAreaProgressInput.level_id = this.levelsList[0].id;
            // this.FocusAreaProgressInput.activity_key = this.selectedActivity;
            this.GetFocusAreaProgress();
          }
        },
        (err) => {
          this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage(
            "Failed to fetch getAllLevelsInParentclub",
            2500,
            ToastMessageType.Error,
            ToastPlacement.Bottom
          );
        }
      );
  };

  //select Level
  selectLevel(index: number) {
    this.levelsList[index]["is_selected"] = true;
    if (this.levelsList[index]["is_selected"]) {
      this.levelsList.filter((item, itemIndex) =>
        itemIndex != index
      ).map((item) => {
        item["is_selected"] = false;
      });
      this.FocusAreaProgressInput.level_id = this.levelsList[index].id;
      this.GetFocusAreaProgress();
    }
  }
  onActivityChange() {
    this.FocusAreaProgressInput.activity_key = this.selectedActivity;
    this.GetFocusAreaProgress();
  }


  GetFocusAreaProgress = () => {
    // this.commonService.showLoader("Fetching Term Session...");
    const getFocusAreaProgressQuery = gql`
      query getFocusAreaProgress(
        $focusAreaProgressInput: focusAreaProgressInput!
      ) {
        getFocusAreaProgress(
          focusAreaProgressInput: $focusAreaProgressInput
        ) {
          id
          focus_area_name
          count
        }
      }
    `;
    this.apollo
      .query({
        query: getFocusAreaProgressQuery,
        fetchPolicy: "network-only",
        variables: {
          focusAreaProgressInput: this.FocusAreaProgressInput,
        },
      })
      .subscribe(
        ({ data }) => {
          console.log(
            "GET ALL FOCUS AREA PROGRESS DATA" +
            JSON.stringify(data["getFocusAreaProgress"])
          );
          // this.commonService.hideLoader();
          this.focusAreaProgressList = data["getFocusAreaProgress"];
          // console.log(this.monthlySessions[0].end_date);
        },
        (err) => {
          // this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage(
            "Failed to fetch focus Area progress",
            2500,
            ToastMessageType.Error,
            ToastPlacement.Bottom
          );
        }
      );
  };

}
export class GetAllUserlevelsInput {
  ParentClubKey: String;
  ClubKey: String
  MemberKey: String
  AppType: number
  ActionType: number
  DeviceType: number
  activityKey: string
}

export class CreateUserlevelInput {
  ParentClubKey: String;
}

export class UpdateUserlevelInput {
  ParentClubKey: String;
}

export class VenueDetailsInput {
  ParentClubKey: String
  ClubKey: String
  MemberKey: String
  AppType: number
  ActionType: number
  DeviceType: number
  VenueKey: String
}
export class FocusAreaProgressInput {
  ParentClubKey: String;
  ClubKey: String;
  MemberKey: String;
  AppType: number;
  ActionType: number;
  DeviceType: number;
  level_id: String;
  activity_key: String;
}
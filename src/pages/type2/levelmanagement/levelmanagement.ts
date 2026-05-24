import { Component } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { ActionSheetController, IonicPage, NavController, NavParams } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import { LoadingController } from 'ionic-angular/components/loading/loading-controller';
import { SharedServices } from '../../services/sharedservice';
import { FirebaseService } from '../../../services/firebase.service';
import { ClubVenueModel } from '../levels/models/venue.model';
import { Storage } from "@ionic/storage";
import { getAllLevelsInParentclubModel } from '../levels/models/levels.model';
import { Activity_V2Model } from '../levels/models/activity.model';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';

/**
 * Generated class for the LevelmanagementPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-levelmanagement',
  templateUrl: 'levelmanagement.html',
})
export class LevelmanagementPage {
  GetAllUserlevelsInput: GetAllUserlevelsInput = {
    ParentClubKey: "",
    ClubKey: "",
    MemberKey: "",
    AppType: 0,
    ActionType: 0,
    DeviceType: 1,
    activityKey: "",
  };
  UpdateUserlevelInput: UpdateUserlevelInput = {
    ParentClubKey: "",
    ClubKey: '',
    MemberKey: '',
    AppType: 0,
    ActionType: 0,
    levelId: "",
    levelName: "",
  };
  VenueDetailsInput: VenueDetailsInput = {
    ParentClubKey: "",
    ClubKey: "",
    MemberKey: "",
    AppType: 0,
    ActionType: 0,
    DeviceType: 1,
    VenueKey: ""
  };
  levelsList: getAllLevelsInParentclubModel[] = [];
  filteredLevels: getAllLevelsInParentclubModel[] = [];
  clubVenues: ClubVenueModel[] = [];
  activities: Activity_V2Model[] = [];
  parentClubKey: string;
  selectedActivity: any;
  searchInput = ""
  // Status = false;


  constructor(public navCtrl: NavController, public navParams: NavParams,
    private apollo: Apollo,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public sharedservice: SharedServices,
    public actionSheetCtrl: ActionSheetController,
    public fb: FirebaseService, private alertCtrl: AlertController) {
    this.storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.GetAllUserlevelsInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
        this.VenueDetailsInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
        this.UpdateUserlevelInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
      }
      this.getClubVenues();
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LevelmanagementPage');
  }

  async EditLevelNamePopUp(index: number) {
    let alert = this.alertCtrl.create({
      title: 'Update level name',
      inputs: [
        {
          name: 'levelName',
          placeholder: 'Level Name ',
          type: 'text'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Update',
          handler: (data) => {
            console.log(data);
            this.UpdateUserlevelInput.levelName = data.levelName;
            this.UpdateUserlevelInput.levelId = this.filteredLevels[index].id;
            console.log(this.UpdateUserlevelInput.levelName, this.UpdateUserlevelInput.levelId);
            this.UpdateUserLevel();
          }
        }
      ]
    });
    alert.present();
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
  }

  getAllLevelsInParentclub = () => {
    this.commonService.showLoader("Fetching Levels...");
    this.GetAllUserlevelsInput.activityKey = this.selectedActivity;
    const getAllLevelsInParentclubQuery = gql`
      query getAllLevelsInParentclub(
        $getAllUserlevelsInput: GetAllUserLevelsInput!
      ) {
        getAllLevelsInParentclub(
          getAllUserlevelsInput: $getAllUserlevelsInput
        ) {
          id
          level_name
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
          // this.GetAllUserlevelsInput.activityKey = this.selectedActivity;
          this.levelsList = data["getAllLevelsInParentclub"];
          this.filteredLevels = JSON.parse(JSON.stringify(this.levelsList));
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

  UpdateUserLevel() {
    this.commonService.showLoader("Please wait...");

    this.apollo
      .mutate({
        mutation: gql`
          mutation updateUserLevel(
            $updateUserlevelInput: UpdateUserlevelsInput!
          ) {
            updateUserLevel(updateUserlevelInput: $updateUserlevelInput)            
          }
        `,
        variables: { updateUserlevelInput: this.UpdateUserlevelInput },
      })
      .subscribe(
        ({ data }) => {
          this.commonService.hideLoader();
          console.log("UPDATE USER LEVEL DATA" + data["updateUserLevel"]);
          this.getAllLevelsInParentclub();
          this.commonService.toastMessage(
            "Level updated successfully",
            2500,
            ToastMessageType.Success,
            ToastPlacement.Bottom
          );
        },
        (err) => {
          this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage(
            "Updation of level failed",
            2500,
            ToastMessageType.Error,
            ToastPlacement.Bottom
          );
        }
      );
  }

  deactivateUserLevel(index: number) {
    // setTimeout(() => {
    // this.commonService.showLoader("Please wait...");
    // this.Status = !this.Status
    this.UpdateUserlevelInput.levelName = this.filteredLevels[index].level_name;
    this.UpdateUserlevelInput.levelId = this.filteredLevels[index].id;
    this.UpdateUserlevelInput.ActionType = this.filteredLevels[index].is_active ? this.UpdateUserlevelInput.ActionType = 2 : this.UpdateUserlevelInput.ActionType = 1;
    const actionMessage = this.filteredLevels[index].is_active ? 'deactivated' : 'activated';


    console.log('deactivated call');
    this.apollo
      .mutate({
        mutation: gql`
          mutation deactivateUserLevel(
            $updateUserlevelInput: UpdateUserlevelsInput!
          ) {
            deactivateUserLevel(updateUserlevelInput: $updateUserlevelInput) 
          }
        `,
        variables: { updateUserlevelInput: this.UpdateUserlevelInput },
      })
      .subscribe(
        ({ data }) => {
          // this.commonService.hideLoader();
          console.log(
            "DEACTIVATE USER LEVEL DATA" + data["deactivateUserLevel"]
          );

          this.commonService.toastMessage(
            `Level ${actionMessage} successfully`,
            2500,
            ToastMessageType.Success,
            ToastPlacement.Bottom
          );
        },
        (err) => {
          // this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage(
            `Failed to ${actionMessage} level`,
            2500,
            ToastMessageType.Error,
            ToastPlacement.Bottom
          );
        }
      );
    // }, 200)

  }

  getFilterItems(ev: any) {
    let val = ev.target.value;
    if (val && val.trim() != "") {
      this.filteredLevels = this.levelsList.filter((item) => {
        if (item.level_name != undefined) {
          if (item.level_name.toLowerCase().indexOf(val.toLowerCase()) > -1) return true;
        }
      });
    } else this.initializeItems();
  }
  initializeItems() {
    this.filteredLevels = this.levelsList;
  }
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

export class UpdateUserlevelInput {
  ParentClubKey: string;
  ClubKey: string;
  MemberKey: string;
  AppType: number;
  ActionType: number;
  levelId: String;
  levelName: String;
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

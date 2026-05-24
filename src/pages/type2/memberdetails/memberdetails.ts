import { Component } from '@angular/core';
import { ActionSheetController, IonicPage, LoadingController, ModalController, NavController, NavParams } from 'ionic-angular';
import { Storage } from "@ionic/storage";
import { Apollo } from 'apollo-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import { SharedServices } from '../../services/sharedservice';
import { FirebaseService } from '../../../services/firebase.service';
import gql from 'graphql-tag';
import { UserLevelStats } from '../levels/models/levels.model';
import { ClubVenueModel } from '../levels/models/venue.model';
import { Activity_V2Model } from '../levels/models/activity.model';
import { first } from "rxjs/operators";
import { GraphqlService } from '../../../services/graphql.service';
/**
 * Generated class for the MemberdetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-memberdetails',
  templateUrl: 'memberdetails.html',
  providers:[GraphqlService]
})
export class MemberdetailsPage {
  getLevelStatsInput: getLevelStatsInput = {
    ParentClubKey: "",
    ClubKey: "",
    MemberKey: "",
    AppType: 0,
    ActionType: 0,
    DeviceType: 1,
    activityKey: ""
    // activityKey: "-KuFUu6J8WZtitsp8uT6"
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
  levelsList: UserLevelStats[] = [];
  clubVenues: ClubVenueModel[] = [];
  activities: Activity_V2Model[] = [];
  selectedActivity: any;
  parentClubKey: string;
  // parentClubKey: string = "-KuAlAWygfsQX9t_RqNZ";

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private apollo: Apollo,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public sharedservice: SharedServices,
    public actionSheetCtrl: ActionSheetController,
    public fb: FirebaseService,
    private graphqlService:GraphqlService,
    public modalCtrl: ModalController,) {
      // this.commonService.category.pipe(first()).subscribe((data) => {
      //   if (data == "member_approvals" || data == 'upgradedowngradelevel') {
          
      //   }
      // });
  }

  ionViewWillEnter() {
    this.storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.getLevelStatsInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
        this.VenueDetailsInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        this.getClubVenues();
      }
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MemberdetailsPage');
  }

  gotoMemberlist(level) {
    this.commonService.updateCategory('upgradedowngradelevel');
    this.navCtrl.push("MemberlistPage", {
      level: level,
      selectedActivityKey: this.selectedActivity
      // selectedActivity:this.selectedActivity
    });
  }

  gotoNext() {
    this.navCtrl.push("ApprovalPage", {

    });
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
    this.graphqlService.query(clubVenuesQuery,{ ParentClub: this.parentClubKey },1)
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
    this.graphqlService.query(getAllActivityByVenueQuery,{venueDetailsInput: this.VenueDetailsInput},1)
      .subscribe(
        ({ data }) => {
          console.log(
            "getAllActivityByVenue DATA" +
            JSON.stringify(data["getAllActivityByVenue"])
          );
          // this.commonService.hideLoader();
          this.activities = data["getAllActivityByVenue"];
          this.selectedActivity = this.activities[0].ActivityKey;
          this.getLevelStatsInput.activityKey = this.selectedActivity;
          this.getUserLevelStats();          // console.log(this.monthlySessions[0].end_date);
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
  getUserLevelStats = () => {
    this.commonService.showLoader("Fetching Levels...");
    this.getLevelStatsInput.activityKey = this.selectedActivity;
    const getUserLevelStatsQuery = gql`
      query getUserLevelStats(
        $levelStatsInput: getLevelStatsInput!
      ) {
        getUserLevelStats(
          levelStatsInput: $levelStatsInput
        ) {
          id
          level_name
          count
        }
      }
    `;
    this.graphqlService.query(getUserLevelStatsQuery,{levelStatsInput: this.getLevelStatsInput},1)
      .subscribe(
        ({ data }) => {
          console.log(
            "GET USER LEVELS STATS" +
            JSON.stringify(data["getUserLevelStats"])
          );
          this.commonService.hideLoader();
          this.levelsList = data["getUserLevelStats"];
        },
        (err) => {
          this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage(
            "Failed to fetch getUserLevelStats",
            2500,
            ToastMessageType.Error,
            ToastPlacement.Bottom
          );
        }
      );
  };

  ionViewWillLeave() {
    // this.commonService.updateCategory("");
  }

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

export class getLevelStatsInput {
  ParentClubKey: string;
  ClubKey: string;
  MemberKey: string;
  AppType: number;
  ActionType: number;
  DeviceType: number;
  activityKey: string;
}

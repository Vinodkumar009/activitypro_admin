import { Component } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular-link-http';
import {
  AlertController,
  IonicPage,
  LoadingController,
  NavController,
  NavParams,
  PopoverController,
  ToastController
} from 'ionic-angular';
import {
  CommonService,
  ToastMessageType,
  ToastPlacement,
} from "../../../../services/common.service";
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../../services/firebase.service';
import { SharedServices } from '../../../services/sharedservice';
import moment from "moment";
import gql from 'graphql-tag';
import { ClubVenue } from "../models/venue.model"
import { LeaguesForParentClubModel } from '../models/league.model';


/**
 * Generated class for the EditmatchPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-editmatch',
  templateUrl: 'editmatch.html',
})
export class EditmatchPage {

  min: any;
  max: any;
  publicType: boolean = true;
  privateType: boolean = true;
  parentClubKey: string = "";
  // saveLeagues: LeaguesForParentClubModel[] = [];
  allactivity = [];
  types = [];
  arrow = false;
  clubVenues: ClubVenue[] = [];
  LocationName = "";
  startTime: any;
  locations = [];

  Match = {
    $key: "",
    AgeGroup: "",
    TournamentName: "",
    TournamentType: "Round Robin", //Single day || Half day || multiple day codes
    ClubKey: "",
    ClubName: "",
    Location: {},
    // LocationName: "",
    // LocationType: '',
    MatchType: "Singles",
    CreationDate: new Date().getTime(),
    Description: "",
    EndDate: "",
    FullAmountForMember: "0.00",
    FullAmountForNonMember: "0.00",
    Grade: "6",
    IsActive: true,
    IsMultiday: false,
    LastEnrolmentDate: "",
    LastWithdrawalDate: "",
    ParentClubKey: "",
    PayLater: true,
    PerDayAmountForMember: "0.00",
    PerDayAmountForNonMember: "0.00",
    RatingGroup: "",
    StartDate: "",
    Season: "",
    UpdatedDate: new Date().getTime(),
    ActivityKey: "",
    ActivityName: "",
    PrimaryEmail: "",
    PrimaryPhone: "",
    SecondaryEmail: "",
    SecondaryPhone: 0,
    UmpireName: "",
    UmpireKey: "",
    UmpireType: "coach",
    AssistantUmpireName: "",
    AssistantUmpireKey: "",
    AssistantUmpireType: "coach",
    StartTime: "",
    EndTime: "",
    EarlyArrival: "",
    IsPaid: false,
    TournmentStatus: 1,
    Capacity: 16,
    AllowWaitingList: false,
  };

  constructor(
    public alertCtrl: AlertController,
    public navCtrl: NavController,
    public navParams: NavParams,
    private apollo: Apollo,
    private httpLink: HttpLink,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public fb: FirebaseService,
    public sharedservice: SharedServices,
    public popoverCtrl: PopoverController,
    private toastCtrl: ToastController,) {

      this.min = new Date().toISOString();
      this.max = "2049-12-31";
      this.startTime = "09:00";
  
      this.storage.get("userObj").then((val) => {
        val = JSON.parse(val);
        if (val.$key != "") {
         
          this.getClubVenues();
        }
  
      });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditmatchPage');
  }
  changeType(val) {
    this.publicType = val == "public" ? true : false;
    //this.privateType = 'private'? true : false;

    // this.CreateMatchInput.MatchVisibility = val == 'private'? 1 : 0;
  }

  

  getClubVenues = () => {
    this.commonService.showLoader("Please wait...");
    const clubVenuesQuery = gql`
      query getAllClubVenues($ParentClub: String!) {
        getAllClubVenues(ParentClub: $ParentClub) {
          ClubName
          ClubKey
          LocationType
        }
      }
    `;
    this.apollo
      .query({
        query: clubVenuesQuery,
        fetchPolicy: "network-only",
        variables: { ParentClub: "-KuAlAWygfsQX9t_RqNZ" },
      })
      .subscribe(
        ({ data }) => {
          this.commonService.hideLoader();
          console.log(
            "leagues data" + JSON.stringify(data["getAllClubVenues"])
          );
          this.commonService.hideLoader();
          this.clubVenues = data["getAllClubVenues"];
          if (this.clubVenues.length > 0) {
            // this.leagueCreationInput.league.venueKey = this.clubVenues[0].ClubKey;
            // this.leagueCreationInput.league.venueType = this.clubVenues[0].LocationType;
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
}

import { Component } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular-link-http';
import { create } from 'domain';
import { IonicPage, LoadingController, NavController, NavParams } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { FirebaseService } from '../../../../services/firebase.service';
import { SharedServices } from '../../../services/sharedservice';
import { Storage } from "@ionic/storage";
import { ClubVenue } from '../../match/models/venue.model';

/**
 * Generated class for the TeamFormationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-team-formation',
  templateUrl: 'team-formation.html',
})
export class TeamFormationPage {
  publicType: boolean = true;
  privateType: boolean = true;
  TeamInput:TeamInput = {
    ActivityKey: "",
    MatchType: 0,
    MatchVenueName: "",
    MatchVenueKey: "",
    GameType: 0,
    MatchTitle: "",
    CreatedBy: "-KuAlAXTl7UQ2hFp4ljQ",
    MatchCreator: 2,
    MatchStartDate: null,
    MatchVisibility: 0,
    MatchStatus: 0,
    MatchDetails: "",
    ParentClubKey: "-KuAlAWygfsQX9t_RqNZ",
    MatchPaymentType: 0,
    MemberFees: 0,
    NonMemberFees: 0,
    Hosts: {
      FirebaseKey: "-KuAlAXTl7UQ2hFp4ljQ",
      RoleType: 2,
      UserType: 2,
    },
  };
  clubVenues: ClubVenue[] = [];
  selectedClub: any;
  allactivity = [];
  types = [];
  parentClubKey: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private apollo: Apollo,
    private httpLink: HttpLink,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public fb: FirebaseService,
    public sharedservice: SharedServices,
    ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TeamFormationPage');
  }

  ionViewWillEnter() {
    console.log("ionViewDidLoad CreatematchPage");
    this.storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.TeamInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
      }
      this.getAllActivities();
      this.getClubVenues();
      // this.getSchoolVenues();
      // this.saveMatchDetails();
    });
  }
  getClubVenues() {
    throw new Error('Method not implemented.');
  }
  getAllActivities() {
    this.fb.getAll("/Activity/" + this.parentClubKey).subscribe((data) => {
      this.allactivity = data;
      if (data.length > 0) {
        this.types = data;
        this.types = this.commonService.convertFbObjectToArray(data[0]);
        // for (let i = 0; i < this.types.length; i++) {
        //   this.types[i].$key = this.types[i].Key;
        // }
        if (this.types.length != 0) {
          this.TeamInput.ActivityKey = this.types[0].Key;
        }
      }
      // this.getCoachList();
      console.log("activity", this.types);
    });
  }
  selectClubName() {
    const cluubIndex = this.clubVenues.findIndex(
      (club) => club.ClubKey === this.TeamInput.MatchVenueKey
    );
    this.TeamInput.MatchVenueName =
      cluubIndex > -1 ? this.clubVenues[cluubIndex].ClubName : "";
  }
 
}
export class TeamInput {
  Hosts: {
    FirebaseKey: string;
    RoleType: number;
    UserType: number;
  };

  ActivityKey: string;
  MatchType: number;
  MatchVenueName: string;
  MatchVenueKey: any;
  GameType: number;
  MatchTitle: string;
  CreatedBy: string;
  MatchCreator: number;
  MatchStartDate: any;
  MatchVisibility: number;
  MatchStatus: number;
  MatchDetails: string;
  ParentClubKey: string;
  MatchPaymentType: number;
  MemberFees: number;
  NonMemberFees: number;
}




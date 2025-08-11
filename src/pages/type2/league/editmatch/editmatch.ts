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
import { LeagueParticipantModel, LeaguesForParentClubModel } from '../models/league.model';
import { CreateLeagueMatchInput, UserDeviceMetadataField, UserPostgreMetadataField } from '../leaguemodels/creatematchforleague.dto';
import { GraphqlService } from '../../../../services/graphql.service';
import { HttpService } from '../../../../services/http.service';
import { API } from '../../../../shared/constants/api_constants';
import { AppType } from '../../../../shared/constants/module.constants';
import { RoundTypesModel } from '../../../../shared/model/league.model';


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
  providers: [HttpService]
})
export class EditmatchPage {
  min: any;
  max: any;
  publicType: boolean = true;
  privateType: boolean = true;
  parentClubKey: string = "";
  clubVenues: ClubVenue[] = [];
  LocationName = "";
  startTime: any;
  endTime: any;
  startDate: any;
  leagueStartDate: any;
  leagueEndDate: any;
  locations = [];
  roundTypes: RoundTypesModel[] = [];
  currency: string;
  
  roundTypeInput: RoundTypeInput = {
    parentclubId: '',
    clubId: '',
    activityId: '',
    memberId: '',
    action_type: 0,
    device_type: 0,
    app_type: 0,
    device_id: '',
    updated_by: ''
  }

  parentClubId: string
  leagueId: string
  matchId: string
  matchType: string
  isChecked: boolean = false;

  inputObj: CreateLeagueMatchInput = {
    MatchName: '',
    CreatedBy: '',
    LeagueId: '',
    GroupId: '',
    Stage: 0,
    Round: 0,
    MatchVisibility: 0,
    MatchDetails: '',
    StartDate: '',
    primary_participant_id: '',
    secondary_participant_id: '',
    user_postgre_metadata: new UserPostgreMetadataField,
    user_device_metadata: new UserDeviceMetadataField,
    location_id: '',
    location_type: 0,
    EndDate: '',
    MatchPaymentType: 0,
    Member_Fee: '0.00',
    Non_Member_Fee: '0.00'
  }

  participantData: LeagueParticipantModel[];
  filteredParticipantData: LeagueParticipantModel[];
  filteredPrimaryParticipants: LeagueParticipantModel[];
  filteredSecondaryParticipants: LeagueParticipantModel[];

  selectedParticipant1: LeagueParticipantModel;
  location_id: string;
  location_type: number;

  primary_participant_id2: string;
  secondary_participant_id2: string
  postgre_parentclub_id: string = "";
  constructor(
    public alertCtrl: AlertController,
    public navCtrl: NavController,
    public navParams: NavParams,
    private httpService: HttpService,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public fb: FirebaseService,
    public sharedservice: SharedServices,
    public popoverCtrl: PopoverController,
    private graphqlService: GraphqlService,
    private sharedService: SharedServices,
    ) {

    this.storage.get("userObj").then((val) => {
      val = JSON.parse(val);

      this.roundTypeInput.parentclubId = this.sharedservice.getPostgreParentClubId();
      this.roundTypeInput.clubId = val.$key;
      this.roundTypeInput.action_type = 0;
      this.roundTypeInput.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2;
      this.roundTypeInput.app_type = AppType.ADMIN_NEW;

      this.getRoundTypes();
    });

    this.leagueId = this.navParams.get("leagueId");
    this.matchId = this.navParams.get("matchId");
    this.location_id = this.navParams.get('location_id');
    this.location_type = this.navParams.get('location_type');
    this.inputObj.location_id = this.location_id;
    this.inputObj.location_type = this.location_type;
    this.leagueStartDate = this.navParams.get("leagueStartDate");
    this.leagueEndDate = this.navParams.get("leagueEndDate");

    this.startTime = "09:00";
    this.endTime = "23:59"

    this.parentClubId = this.sharedService.getPostgreParentClubId();
    this.inputObj.user_postgre_metadata.UserParentClubId = this.parentClubId;
    this.inputObj.user_device_metadata.UserActionType = 0;
    this.inputObj.user_device_metadata.UserAppType = 0;
    this.inputObj.user_device_metadata.UserDeviceType = this.sharedservice.getPlatform() == "android" ? 1 : 2;

    this.inputObj.CreatedBy = this.sharedservice.getLoggedInId();
    this.inputObj.LeagueId = this.leagueId;

    this.matchType = this.navParams.get("league_type_text");

    const inputFormat = 'DD-MMM-YYYY, ddd';

    if (this.leagueStartDate) {
      this.min = moment(this.leagueStartDate, inputFormat).format('YYYY-MM-DD');
      this.startDate = moment(this.leagueStartDate, inputFormat).format('YYYY-MM-DD');
      this.max = this.leagueEndDate ? moment(this.leagueEndDate, inputFormat).format('YYYY-MM-DD') : moment('2049-12-31', 'YYYY-MM-DD').format('YYYY-MM-DD');
    } else {
      this.min = moment().format('YYYY-MM-DD');
      this.startDate = moment().format('YYYY-MM-DD');
    }

    this.getParticipants();
    this.getMatchDetails();
    this.getLoggedInData();
  }

  async getLoggedInData() {
       const [login_obj,postgre_parentclub] = await Promise.all([
            this.storage.get('userObj'),
            this.storage.get('postgre_parentclub'),
        ])
      
          if(login_obj) {
            this.parentClubKey = JSON.parse(login_obj).UserInfo[0].ParentClubKey;
            const val = JSON.parse(login_obj);
            
          }
          if(postgre_parentclub){
             this.postgre_parentclub_id = postgre_parentclub.Id
             console.log("parentclubid is:", this.postgre_parentclub_id);
             this.getClubVenues();
          }    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditmatchPage');
  }

  changeType(val) {
    this.publicType = val == 'public' ? true : false;
    this.inputObj.MatchVisibility = val == 'private' ? 1 : 0;
  }

  updateMatchPaymentType(isChecked: boolean): void {
    this.inputObj.MatchPaymentType = isChecked ? 1 : 0;
  }

  getRoundTypes() {
    this.httpService.post(`${API.Get_Round_Types}`, this.roundTypeInput).subscribe((res: any) => {
      if (res) {
        this.roundTypes = res.data || [];
        console.log("Get_Round_Types RESPONSE", JSON.stringify(res.data));
      } else {
        this.commonService.hideLoader();
        console.log("error in fetching",)
      }
    },(error) => {
      console.error("Error fetching round types:", error);
      if (error && error.error && error.error.message) {
        this.commonService.toastMessage(error.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      } else {
        this.commonService.toastMessage('Failed to fetch round types', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
    });
  }

  getParticipants() {
    const parentclubId = this.sharedservice.getPostgreParentClubId();
    let leagueId = this.leagueId;
    const GetLeagueParticipantInput = {
      user_postgre_metadata: {
        UserParentClubId: parentclubId
      },
      leagueId: leagueId
    }
    const participantsStatusQuery = gql`
    query getLeagueParticipants($leagueParticipantInput: GetLeagueParticipantInput!) {
      getLeagueParticipants(leagueParticipantInput:$leagueParticipantInput) {
        id
        participant_name
      }
    }
  `;

    this.graphqlService.query(participantsStatusQuery, { leagueParticipantInput: GetLeagueParticipantInput }, 0)
      .subscribe((data: any) => {
        this.participantData = data.data.getLeagueParticipants;
        this.filteredPrimaryParticipants = [...this.participantData];
        this.filteredSecondaryParticipants = [...this.participantData];
      },
      (error) => {
        console.error("Error fetching league participants:", error);
        if (error && error.error && error.error.message) {
          this.commonService.toastMessage(error.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        } else {
          this.commonService.toastMessage('Failed to fetch match participants', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        }
      });
  }

  filterParticipants() {
    if (this.matchType === 'Singles') {
      this.filteredPrimaryParticipants = this.participantData.filter(
        participant => participant.id !== this.inputObj.secondary_participant_id
      );

      this.filteredSecondaryParticipants = this.participantData.filter(
        participant => participant.id !== this.inputObj.primary_participant_id
      );
    } else if (this.matchType === 'Doubles') {
      this.filteredPrimaryParticipants = this.participantData.filter(
        participant =>
          participant.id !== this.inputObj.secondary_participant_id &&
          participant.id !== this.secondary_participant_id2 &&
          participant.id !== this.primary_participant_id2 &&
          participant.id !== this.inputObj.primary_participant_id
      );

      this.filteredSecondaryParticipants = this.participantData.filter(
        participant =>
          participant.id !== this.inputObj.primary_participant_id &&
          participant.id !== this.primary_participant_id2 &&
          participant.id !== this.secondary_participant_id2 &&
          participant.id !== this.inputObj.secondary_participant_id
      );
    }
  }

  getMatchDetails() {
    // Get match details to populate the form
    const matchDetailsQuery = gql`
      query getMatchDetails($matchId: String!) {
        getMatchDetails(matchId: $matchId) {
          Id
          match_title
          start_date
          start_time
          match_details
          match_visibility
          round
          primary_participant_id
          secondary_participant_id
          match_payment_type
          member_fee
          non_member_fee
        }
      }
    `;

    this.graphqlService.query(matchDetailsQuery, { matchId: this.matchId }, 0)
      .subscribe((res: any) => {
        if (res.data.getMatchDetails) {
          const match = res.data.getMatchDetails;
          this.inputObj.MatchName = match.match_title;
          this.startDate = match.start_date;
          this.startTime = match.start_time;
          this.inputObj.MatchDetails = match.match_details;
          this.inputObj.MatchVisibility = match.match_visibility;
          this.publicType = match.match_visibility === 0;
          this.inputObj.Round = match.round;
          this.inputObj.primary_participant_id = match.primary_participant_id;
          this.inputObj.secondary_participant_id = match.secondary_participant_id;
          this.inputObj.MatchPaymentType = match.match_payment_type;
          this.isChecked = match.match_payment_type === 1;
          this.inputObj.Member_Fee = match.member_fee || '0.00';
          this.inputObj.Non_Member_Fee = match.non_member_fee || '0.00';
        }
      },
      (error) => {
        console.error("Error fetching match details:", error);
        this.commonService.toastMessage('Failed to fetch match details', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      });
  }

  updateMatchConfirm() {
    if (!this.validateInputs()) {
      return;
    }

    this.commonService.showLoader('Updating match...');

    const updateMatchMutation = gql`
      mutation editLeagueMatch($updateMatchInput: EditLeagueMatchInput!) {
        editLeagueMatch(updateMatchInput: $updateMatchInput) {
          Id
          match_title
        }
      }
    `;

    const updateMatchInput = {
      Id: this.matchId,
      match_title: this.inputObj.MatchName,
      start_date: moment(new Date(this.startDate + ' ' + this.startTime).getTime()).format('YYYY-MM-DD HH:mm'),
      match_details: this.inputObj.MatchDetails,
      match_visibility: this.inputObj.MatchVisibility,
      round: this.inputObj.Round,
      primary_participant_id: this.inputObj.primary_participant_id,
      secondary_participant_id: this.inputObj.secondary_participant_id,
      match_payment_type: this.inputObj.MatchPaymentType,
      member_fee: this.inputObj.Member_Fee,
      non_member_fee: this.inputObj.Non_Member_Fee,
      user_postgre_metadata: this.inputObj.user_postgre_metadata,
      user_device_metadata: this.inputObj.user_device_metadata
    };

    this.graphqlService.mutate(updateMatchMutation, { updateMatchInput }, 0)
      .subscribe((response: any) => {
        this.commonService.hideLoader();
        this.commonService.toastMessage('Match updated successfully',2500,ToastMessageType.Success,ToastPlacement.Bottom);
        this.navCtrl.pop();
      }, (error) => {
        this.commonService.hideLoader();
        console.error('Error updating match:', error);
        this.commonService.toastMessage('Failed to update match',2500,ToastMessageType.Error,ToastPlacement.Bottom);
      });
  }

  validateInputs(): boolean {
    if (!this.inputObj.MatchName || this.inputObj.MatchName.trim() === '') {
      this.commonService.toastMessage('Please enter match title', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    }

    if (!this.startDate) {
      this.commonService.toastMessage('Please select match date', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    }

    if (!this.startTime) {
      this.commonService.toastMessage('Please select match time', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    }

    if (!this.inputObj.primary_participant_id) {
      this.commonService.toastMessage('Please select first participant', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    }

    if (!this.inputObj.secondary_participant_id) {
      this.commonService.toastMessage('Please select second participant', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    }

    return true;
  }

  

  getClubVenues() {
      const clubs_input = {
          parentclub_id:this.postgre_parentclub_id,
          user_postgre_metadata:{
            UserMemberId:this.sharedservice.getLoggedInUserId()
          },
          user_device_metadata:{
            UserAppType:0,
            UserDeviceType:this.sharedservice.getPlatform() == "android" ? 1:2
          }
        }
        const clubs_query = gql`
            query getVenuesByParentClub($clubs_input: ParentClubVenuesInput!){
              getVenuesByParentClub(clubInput:$clubs_input){
                    Id
                    ClubName
                    FirebaseId
                    MapUrl
                    sequence
                }
            }
            `;
            this.graphqlService.query(clubs_query,{clubs_input: clubs_input},0)
                .subscribe((res: any) => {
                  this.clubVenues = res.data.getVenuesByParentClub;
                  //console.log("clubs lists:", JSON.stringify(this.clubs));
                  //this.selectedClub = this.clubs[0].FirebaseId;
                },
               (error) => {
                //this.commonService.hideLoader();
                console.error("Error in fetching:", error);
                // Handle the error here, you can display an error message or take appropriate action.
            });                    
  }
}

export class RoundTypeInput {
  parentclubId: string;
  clubId: string;
  activityId: string;
  memberId: string;
  action_type: number;
  device_type: number;
  app_type: number;
  device_id: string;
  updated_by: string;
}

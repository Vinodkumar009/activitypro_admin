import { Component } from '@angular/core';
import {
  AlertController,
  IonicPage,
  LoadingController,
  NavController,
  NavParams,
  PopoverController,
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
import { LeagueParticipantModel } from '../models/league.model';
import { CreateLeagueMatchInput, LeagueGroup, LeagueGroupInput, UserDeviceMetadataField, UserPostgreMetadataField } from '../leaguemodels/creatematchforleague.dto';
import { GraphqlService } from '../../../../services/graphql.service';
import { HttpService } from '../../../../services/http.service';
import { API } from '../../../../shared/constants/api_constants';
import { AppType } from '../../../../shared/constants/module.constants';
import { RoundTypeInput, RoundTypesModel } from '../../../../shared/model/league.model';


/**
 * Generated class for the CreatematchleaguePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-creatematchleague",
  templateUrl: "creatematchleague.html",
  providers: [HttpService]
})
export class CreatematchleaguePage {
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
  endTime: any;
  startDate: any;
  leagueStartDate: any;
  leagueEndDate: any;
  locations = [];
  roundTypes: RoundTypesModel[] = [];

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
  leagueGroup: LeagueGroup[]
  leagueId: string
  matchType: string
  isChecked: boolean = false;
  leagueGroupInput: LeagueGroupInput = {
    ParentClubKey: '',
    ParentClubId: '',
    ClubKey: '',
    ClubId: '',
    MemberKey: '',
    MemberId: '',
    AppType: 0,
    ActionType: 0,
    DeviceType: 0,
    leagueId: ''
  }

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
  secondary_participant_id2: string;
  postgre_parentclub_id: string;
  activityId: string;
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

    this.leagueId = this.navParams.get("leagueId");
    this.location_id = this.navParams.get('location_id');
    this.location_type = this.navParams.get('location_type');
    this.inputObj.location_id = this.location_id;
    this.inputObj.location_type = this.location_type;
    this.leagueStartDate = this.navParams.get("leagueStartDate");
    this.leagueEndDate = this.navParams.get("leagueEndDate");
    this.activityId = this.navParams.get("activityId");
    console.log("activityId from navParams:", this.activityId);
    //console.log("league start date is:", this.leagueStartDate);


    // this.max = "2049-12-31";
    this.startTime = "09:00";
    this.endTime = "23:59"

    this.parentClubId = this.sharedService.getPostgreParentClubId();
    this.leagueGroupInput.ParentClubId = this.parentClubId;
    this.leagueGroupInput.leagueId = this.leagueId;
    this.inputObj.user_postgre_metadata.UserParentClubId = this.parentClubId;
    this.inputObj.user_device_metadata.UserActionType = 0;
    this.inputObj.user_device_metadata.UserAppType = 0;
    this.inputObj.user_device_metadata.UserDeviceType = this.sharedservice.getPlatform() == "android" ? 1 : 2;

    this.inputObj.CreatedBy = this.sharedservice.getLoggedInId();

    this.inputObj.LeagueId = this.leagueId;

    this.matchType = this.navParams.get("league_type_text");

    const inputFormat = 'DD-MMM-YYYY, ddd';

    if (this.leagueStartDate) {
      // Parse the date string using moment and format it to ISO 8601
      this.min = moment(this.leagueStartDate, inputFormat).format('YYYY-MM-DD');
      this.startDate = moment(this.leagueStartDate, inputFormat).format('YYYY-MM-DD');
      this.max = this.leagueEndDate ? moment(this.leagueEndDate, inputFormat).format('YYYY-MM-DD') : moment('2049-12-31', 'YYYY-MM-DD').format('YYYY-MM-DD');
      
    } else {
      // If leagueStartDate is not valid, use the current date as the default
      this.min = moment().format('YYYY-MM-DD');
      this.startDate = moment().format('YYYY-MM-DD');
    }

    this.getLoggedInData();
    this.getParticipants();
    //  this.getLocationForParentClub();

    // this.getLeagueGroups();
  }

  async getLoggedInData() {
     const [login_obj,postgre_parentclub] = await Promise.all([
          this.storage.get('userObj'),
          this.storage.get('postgre_parentclub'),
      ])
    
        if(login_obj) {
          this.parentClubKey = JSON.parse(login_obj).UserInfo[0].ParentClubKey;
          const val = JSON.parse(login_obj);
          this.roundTypeInput = new RoundTypeInput();
          this.roundTypeInput.updated_by = this.sharedservice.getLoggedInUserId();
          this.roundTypeInput.device_id = this.sharedservice.getDeviceId() || ""; 
          this.roundTypeInput.parentclubId = this.sharedservice.getPostgreParentClubId();
          this.roundTypeInput.clubId = val.$key;
          this.roundTypeInput.action_type = 0;
          this.roundTypeInput.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2;
          this.roundTypeInput.app_type = AppType.ADMIN_NEW;
          this.getRoundTypes();
        }
        if(postgre_parentclub){
           this.postgre_parentclub_id = postgre_parentclub.Id
           console.log("parentclubid is:", this.postgre_parentclub_id);
           this.getClubVenues();
        }    
        
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad CreatematchleaguePage");
  }
  saveLeagueDetails() {
    this.navCtrl.push("LeaguelistingPage");
  }


  changeType(val) {
    this.publicType = val == 'public' ? true : false;
    this.inputObj.MatchVisibility = val == 'private' ? 1 : 0;
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

  //this api will give all the location available for parentclub
  getLocationForParentClub() {
    const ParentClubLocationInput = {
      parentclub_id: this.sharedservice.getPostgreParentClubId()
    }
    const getLocation = gql`
    query getLocationByParentClub($locationInput: ParentClubLocationInput!){
      getLocationByParentClub(locationInput:$locationInput){
        id
        address1
        address2
        city
        map_latitude
        map_longitude
        map_url
        name
        note
        post_code
        website_url
        is_bar_available
        is_wc_available
        is_drinking_water
        is_resturant
        is_disabled_friendly
        is_baby_change
        is_parking_available
      }
    }`;
    this.graphqlService.query(getLocation, { locationInput: ParentClubLocationInput }, 0)
      .subscribe((res: any) => {
        //  this.commonService.hideLoader();
        this.locations = res.data.getLocationByParentClub;
        if (this.locations.length > 0) {
          // this.leagueCreationInput.league.location = this.locations[0].id;
        }
      },
        (error) => {
          this.commonService.toastMessage("Locations fetch failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          console.error("Error in fetching:", error);
        })
  }

  filterSecondaryParticipants() {
    this.filteredParticipantData = this.participantData.filter(
      participant => participant.id !== this.inputObj.primary_participant_id
    );
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
      // Doubles filtering logic
      // Filter for Team 1 (exclude all Team 2 players and selected Team 1 players)
      this.filteredPrimaryParticipants = this.participantData.filter(
        participant =>
          participant.id !== this.inputObj.secondary_participant_id &&
          participant.id !== this.secondary_participant_id2 &&
          participant.id !== this.primary_participant_id2 &&
          participant.id !== this.inputObj.primary_participant_id
      );

      // Filter for Team 2 (exclude all Team 1 players and selected Team 2 players)
      this.filteredSecondaryParticipants = this.participantData.filter(
        participant =>
          participant.id !== this.inputObj.primary_participant_id &&
          participant.id !== this.primary_participant_id2 &&
          participant.id !== this.secondary_participant_id2 &&
          participant.id !== this.inputObj.secondary_participant_id
      );
    }
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

    this.graphqlService.query(participantsStatusQuery, { leagueParticipantInput: GetLeagueParticipantInput }, 0).subscribe((data: any) => {
      this.participantData = data.data.getLeagueParticipants;
      //this.filteredParticipantData = [...this.participantData];
      this.filteredPrimaryParticipants = [...this.participantData];
      this.filteredSecondaryParticipants = [...this.participantData];
      console.log("participants are", JSON.stringify(this.participantData));
    },
      (error) => {
        console.error("Error in fetching:", error);
        if (error.graphQLErrors) {
          console.error("GraphQL Errors:", error.graphQLErrors);
          for (const gqlError of error.graphQLErrors) {
            console.error("Error Message:", gqlError.message);
            console.error("Error Extensions:", gqlError.extensions);
          }
        }
        if (error.networkError) {
          console.error("Network Error:", error.networkError);
        }
      }
    )
  }
  // location select and add options ----(Alert box)


  onParticipant1Change(event: any) {
    // this.selectedParticipant1 = event.detail.value;
    // this.filteredParticipantData = this.participantData.filter(
    //   (participant) => participant.id !== this.selectedParticipant1.id
    // );

    if (event && event.detail && event.detail.value) {

      // this.selectedParticipant1 = event.detail.value;
      // this.filteredParticipantData = this.participantData.filter(
      //   (participant) => participant.id !== this.selectedParticipant1.id
      // );
      const selectedParticipantId = event.detail.value;
      this.selectedParticipant1 = this.participantData.find(participant => participant.id === selectedParticipantId) || null;
      this.filteredParticipantData = this.participantData.filter(
        (participant) => participant.id !== selectedParticipantId
      );
    } else {
      this.selectedParticipant1 = null;
      this.filteredParticipantData = [...this.participantData];
    }

  }

  addLocation() {
    this.navCtrl.push("AddlocationformatchPage");
  }


  //getting league groups


  getLeagueGroups() {
    const clubs_query = gql`
        query getAllleagueGroups($leagueGroupInput: LeagueGroupInput!){
          getAllleagueGroups(leagueGroupInput:$leagueGroupInput){
            id
            created_at
            created_by
            updated_at
            is_active
            name
            description
            }
        }
        `;
    this.graphqlService.query(clubs_query, { leagueGroupInput: this.leagueGroupInput }, 1)
      .subscribe((res: any) => {

        this.leagueGroup = res.data.getAllleagueGroups;
      },
        (error) => {
          console.error("Error in fetching:", error);
        })
  }

  validateInput() {
    if (this.startTime == "" || this.startTime == undefined) {
      const message = "Please enter a valid start date";
      this.commonService.toastMessage(message, 2500, ToastMessageType.Error)
      return false;
    }
    else if (this.inputObj.MatchName == "" || this.inputObj.MatchName == undefined) {
      let message = "Please enter match title";
      this.commonService.toastMessage(message, 2500, ToastMessageType.Error)
      return false;
    }
    //  if(this.inputObj.location_id==""||this.inputObj.location_id==undefined){
    //   let message="Please select location";
    //   this.commonService.toastMessage(message, 2500, ToastMessageType.Error)
    //   return false;
    // }

     else if ((this.inputObj.MatchPaymentType == 1) && (parseFloat(this.inputObj.Member_Fee) <= 0 || this.inputObj.Member_Fee == undefined || this.inputObj.Member_Fee == '0.00')) {
      const message = "Enter member fee";
      this.commonService.toastMessage(message, 2500, ToastMessageType.Error)
      return false;
    }
     else if ((this.inputObj.MatchPaymentType == 1) && (parseFloat(this.inputObj.Non_Member_Fee) <= 0 || this.inputObj.Non_Member_Fee == undefined || this.inputObj.Non_Member_Fee == '0.00')) {
      const message = "Enter non-member fee";
      this.commonService.toastMessage(message, 2500, ToastMessageType.Error)
      return false;
    }

    return true;
  }

  createMatchConfirm() {
    this.commonService.commonAlert_V4("Create Match", "Are you sure you want to create the match?", "Yes:Create", "No", () => {
      this.createMatchForLeague();
    })
  }

  updateMatchPaymentType(isChecked: boolean): void {
    this.inputObj.MatchPaymentType = isChecked ? 1 : 0;
  }

  getRoundTypes() {
    this.commonService.showLoader("Fetching info ...");

    this.httpService.post(`${API.Get_Round_Types}`, this.roundTypeInput).subscribe((res: any) => {
      if (res) {
        this.commonService.hideLoader();
        this.roundTypes = res.data || [];
        console.log("Get_Round_Types RESPONSE", JSON.stringify(res.data));

      } else {
        this.commonService.hideLoader();
        console.log("error in fetching",)
      }
    })
  }


  async createMatchForLeague() {
    try {
      if (this.validateInput()) {
        this.inputObj.primary_participant_id = this.inputObj.primary_participant_id;
        this.inputObj.secondary_participant_id = this.inputObj.secondary_participant_id;

        this.inputObj.Round = Number(this.inputObj.Round);

        if (this.inputObj.MatchPaymentType!= 1) {
          this.inputObj.Member_Fee = "0.00";
          this.inputObj.Non_Member_Fee = "0.00";
        } 

        // this.inputObj.StartDate = moment(new Date(this.startDate + " " + this.startTime).getTime()).format("YYYY-MM-DD HH:mm");
        this.inputObj.StartDate = this.startDate + " " + this.startTime;
        // this.inputObj.StartDate = new Date(this.startDate + " " + this.startTime).toISOString(); //iso date string if needed uncomment this line

        this.inputObj.EndDate = this.startDate + " " + this.endTime;

        // console.log('input date is:', this.inputObj.EndDate);
        // console.log(new Date(this.startDate + " " + this.startTime).getTime());
        this.commonService.showLoader("Creating Match...");
        const createLeagueMutation = gql`
        mutation addMatchToLeague($createLeagueMatchInput: CreateLeagueMatchInput!) {
          addMatchToLeague(createLeagueMatchInput: $createLeagueMatchInput){

              league{
                id
              }
                match{
                  Id
                }
            }
        }`;
        const mutationVariables = { createLeagueMatchInput: this.inputObj };

        this.graphqlService.mutate(createLeagueMutation, mutationVariables, 0).subscribe((res: any) => {
          this.commonService.hideLoader();
          const message = "Match created successfully";
          this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
          this.navCtrl.pop();
        }, (error) => {
          this.commonService.hideLoader();
          this.commonService.toastMessage("Match creation failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          console.error("Error in fetching:", error);
        })


      }
    } catch (error) {
      this.commonService.hideLoader();
      console.log("Error:", error);
      this.commonService.toastMessage("Match creation failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom)
    }
  }


}


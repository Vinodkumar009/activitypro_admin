import { Component } from '@angular/core';
import {
  IonicPage,
  LoadingController,
  NavController,
  NavParams,
  PopoverController
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
import { Activity } from '../models/activity.model';
import { GraphqlService } from '../../../../services/graphql.service';
import { CoachList, SchoolList } from '../leaguemodels/creatematchforleague.dto';
import { CatandType, Locations } from '../models/location.model';
import { ClubActivityInput, IClubDetails } from '../../../../shared/model/club.model';
import { HttpService } from '../../../../services/http.service';




/**
  Generated class for the CreateleaguePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-createleague",
  templateUrl: "createleague.html",
  providers: [HttpService]
})
export class CreateleaguePage {

  member_price: number = 0.00;
  non_member_price: number = 0.00;
  min: any;
  max: any;
  publicType: boolean = true;
  privateType: boolean = true;
  clubs: IClubDetails[];
  selectedClub: any;
  selectedClubLocation: any;
  schoolId: string;
  club_activities: Activity[] = [];
  selectedActivityType: any = "";
  currency: any;
  selectedSchoolLocation: any;

  leagueCreationInput: LeagueCreationInput = {
    // ParentClubKey: "",
    // MemberKey: "",
    AppType: 0,
    ActionType: 0,
    league: {
      parentclub_id: '',
      league_name: '',
      created_by: '',
      activity_code: '',
      league_type: null,
      league_category: 0,
      league_ageGroup: '',
      league_logoURL: '',
      league_description: '',
      // parentclub_key: '',
      start_date: '',
      end_date: '',
      // venue_key: '',
      location: '',
      multiday: false,
      last_enrollment_date: '',
      last_withdrawal_date: '',
      early_arrival_time: '08:00',
      start_time: '09:00',
      end_time: '04:00',
      capacity: 20,
      referee_type: 0,
      referee_name: '',
      season: '',
      grade: '',
      rating_group: '',
      contact_email: '',
      contact_phone: '',
      secondary_contact_email: '',
      secondary_contact_phone: '',
      is_paid: false,
      is_pay_later: false,
      league_visibility: 0,
      coachId: '',
      venue_id: '',
      member_price: '0.00',
      non_member_price: '0.00',
      location_type: 1,
      allow_bacs: false,
      allow_cash: false,
      show_participants: true
    }
  }

  venueDetailsInput: VenueDetailsInput = {
    ParentClubKey: '',
    MemberKey: '',
    AppType: 0,
    ActionType: 0,
    DeviceType: 0,
    VenueKey: ''
  }
  commonInput = {
    parentclubId: "",
    clubId: "",
    activityId: "",
    memberId: "",
    action_type: 0,
    device_type: 0

  }



  //parentclubkey
  parentClubKey: string = "";
  parentClubId: string = "";
  saveLeagues: LeaguesForParentClubModel[] = [];
  allactivity = [];
  types = [];
  arrow = false;
  clubVenues: ClubVenue[] = [];
  startDate: any;
  endDate: any;
  activities: Activity[] = [];
  coaches: CoachList[];
  schools: SchoolList[] = [];
  locations: Locations[];
  leagueCategory: CatandType[];
  leagueType: CatandType[]

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public fb: FirebaseService,
    public sharedservice: SharedServices,
    public popoverCtrl: PopoverController,
    private graphqlService: GraphqlService,
    private httpService: HttpService,

  ) {

    this.min = new Date().toISOString();
    this.max = "2049-12-31";
    this.leagueCreationInput.league.start_date = moment().format("YYYY-MM-DD");
    this.leagueCreationInput.league.end_date = moment().add(1, 'M').format("YYYY-MM-DD");
    this.leagueCreationInput.league.last_enrollment_date = moment().format("YYYY-MM-DD");
    this.leagueCreationInput.league.last_withdrawal_date = moment().add(1, 'M').format("YYYY-MM-DD");
    this.getCoachList();
    this.leagueCreationInput.league.parentclub_id = this.sharedservice.getPostgreParentClubId();

  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad CreateleaguePage");
  }

  ionViewWillEnter() {
    console.log("ionViewDidLoad CreateleaguePage");
    this.storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        //   this.leagueCreationInput.ParentClubKey =
        //    val.UserInfo[0].ParentClubKey;
        //   this.leagueCreationInput.MemberKey = val.$key;

        //this.venueDetailsInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
        this.parentClubKey = val.UserInfo[0].ParentClubKey
        //  this.venueDetailsInput.MemberKey = val.$key;
        this.parentClubId = this.sharedservice.getPostgreParentClubId();
        this.commonInput.parentclubId = this.sharedservice.getPostgreParentClubId();
        // this.getClubVenues();
        this.getListOfClub();
        this.getLocationForParentClub();
        this.getSchoolList();
        this.getLeagueCategory();
        this.getLeagueType();
      }
    });
    this.storage.get('Currency').then((currency) => {
      let currencydets = JSON.parse(currency);
      console.log(currencydets);
      this.currency = currencydets.CurrencySymbol;
    });
  }

  onChangeOfClub() {
    this.club_activities = [];
    this.getActivityList();
  }

  getListOfClub() {
    const clubs_input = {
      parentclub_id: this.sharedservice.getPostgreParentClubId(),
      user_postgre_metadata: {
        UserMemberId: this.sharedservice.getLoggedInId()
      },
      user_device_metadata: {
        UserAppType: 0,
        UserDeviceType: this.sharedservice.getPlatform() == "android" ? 1 : 2
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
    this.graphqlService.query(clubs_query, { clubs_input: clubs_input }, 0)
      .subscribe((res: any) => {
        this.clubs = res.data.getVenuesByParentClub as IClubDetails[];
        this.selectedClub = this.clubs[0].FirebaseId;
        this.selectedClubLocation = this.clubs[0].FirebaseId;
        console.log("selected club is:", this.selectedClub);
        console.log("selected club location is:", this.selectedClubLocation);
        this.getActivityList();
      },
        (error) => {
          this.commonService.toastMessage("No venues found", 2500, ToastMessageType.Error)
          console.error("Error in fetching:", error);
        })
  }
  getActivityList() {
    const club_activity_input: ClubActivityInput = {
      ParentClubKey: this.parentClubKey,
      ClubKey: this.selectedClub,
      VenueKey: this.selectedClub,
      AppType: 0, //0-Admin
      DeviceType: this.sharedservice.getPlatform() == "android" ? 1 : 2 //1-android,2-IOS
    }
    const clubs_activity_query = gql`
      query getAllActivityByVenue($input_obj: VenueDetailsInput!){
        getAllActivityByVenue(venueDetailsInput:$input_obj){
          ActivityCode
          ActivityName
          ActivityImageURL
          FirebaseActivityKey
          ActivityKey
        }
      }
      `;
    this.graphqlService.query(clubs_activity_query, { input_obj: club_activity_input }, 0)
      .subscribe((res: any) => {
        this.club_activities = res.data.getAllActivityByVenue as Activity[];
        if (this.club_activities.length > 0) {
          this.leagueCreationInput.league.activity_code = String(this.club_activities[0].ActivityCode);
        } else {
          this.commonService.toastMessage("No activities found", 2500, ToastMessageType.Error)
        }
      },
        (error) => {
          //this.commonService.hideLoader();
          this.commonService.toastMessage("No activities found", 2500, ToastMessageType.Error)
          console.error("Error in fetching:", error);
          // Handle the error here, you can display an error message or take appropriate action.
        })
  }

  getSchoolLocation() {

  }

  getLeagueCategory() {
    this.httpService.post(`league/getCategories`, this.commonInput).subscribe((res: any) => {

      this.leagueCategory = res["data"]
    }, (error) => {
      this.commonService.toastMessage("category fetch failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    }
    )
  }

  isTeamType: boolean = false;
  onLeagueTypeChange(value: number) {
    if (this.isTeamType = value === 3) {
      // return this.isTeamType = true;
      if (this.isTeamType) {
        this.leagueCreationInput.league.capacity = 0;
        // this.leagueCreationInput.league.end_date = "";
        // this.leagueCreationInput.league.last_enrollment_date = '';
        // this.leagueCreationInput.league.last_withdrawal_date = '';
        this.leagueCreationInput.league.start_time = '09:00';
        this.leagueCreationInput.league.end_time = '23:59';
        this.leagueCreationInput.league.contact_email = "";
        this.leagueCreationInput.league.contact_phone = "";
      }
    }

  }
  // isTeamType(): boolean {
  //   return this.leagueCreationInput.league.league_type === 3;
  // }

  getLeagueType() {
    this.httpService.post(`league/getTypes`, this.commonInput).subscribe((res: any) => {
      this.leagueType = res["data"]
    }, (error) => {
      this.commonService.toastMessage("type fetch failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    }
    )
  }

  gotoDashboard() {
    this.navCtrl.pop();
  }

  gotoHome() {
    this.navCtrl.push("Dashboard");
  }

  changeType(val) {
    this.publicType = val == 'public' ? true : false;
    this.leagueCreationInput.league.league_visibility = val == 'private' ? 1 : 0;
  }


  //School List Api Binding
  getSchoolList() {
    //  this.commonService.showLoader("fetching Coach");
    const parentClubId = this.sharedservice.getPostgreParentClubId();
    const getSchools = gql`
    query getParentClubSchoolsById($parentclubId: String!){
      getParentClubSchoolsById(parentclubId:$parentclubId){
        id
        school_name
      }
    }
    `;
    this.graphqlService.query(getSchools, { parentclubId: parentClubId }, 0)
      .subscribe((res: any) => {
        //  this.commonService.hideLoader();
        this.schools = res.data.getParentClubSchoolsById;
        console.log("school venues are:", JSON.stringify(this.schools));
      },
        (error) => {
          this.commonService.toastMessage("Schoold fetch failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          console.error("Error in fetching:", error);
        })
  }


  //Coach List Api Binding
  getCoachList() {
    //this.commonService.showLoader("fetching Coach");
    const CoachFetchInput = {
      parentclub: this.sharedservice.getPostgreParentClubId()
    }
    const getCoaches = gql`
    query fetchCoaches($coachFetchInput: CoachFetchInput!){
      fetchCoaches(coachFetchInput:$coachFetchInput){
        Id
       first_name
       last_name
       phone_no
       email_id
      }
    }
    `;
    this.graphqlService.query(getCoaches, { coachFetchInput: CoachFetchInput }, 0)
      .subscribe((res: any) => {
        //  this.commonService.hideLoader();
        this.coaches = res.data.fetchCoaches;
        if (this.coaches.length > 0) {
          this.leagueCreationInput.league.coachId = this.coaches[0].Id;
          this.updateContactInfo(); // Set initial contact info
        }
      },
        (error) => {
          this.commonService.toastMessage("Coach fetch failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          console.error("Error in fetching:", error);
        })
  }

  updateContactInfo() {
    const selectedCoachId = this.leagueCreationInput.league.coachId;
    const selectedCoach = this.coaches.find(coach => coach.Id === selectedCoachId);
    if (selectedCoach) {
      this.leagueCreationInput.league.contact_email = selectedCoach.email_id;
      this.leagueCreationInput.league.contact_phone = selectedCoach.phone_no;
    }
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
          this.leagueCreationInput.league.location = this.locations[0].id;
        }
      },
        (error) => {
          this.commonService.toastMessage("Locations fetch failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          console.error("Error in fetching:", error);
        })
  }



  //shows hint for the age group
  ageGroupHint() {
    let message = "Enter age group separated by comma (,) e.g. 12U, 14U etc.";
    this.commonService.toastMessage(message, 2500, ToastMessageType.Info);
  }



  //validating the fields
  validateInputField() {
    if (this.leagueCreationInput.league.league_name == "" || this.leagueCreationInput.league.league_name == undefined) {
      const message = "Please enter competition name";
      this.commonService.toastMessage(message, 2500, ToastMessageType.Error);
      return false;
    }
    else if (this.leagueCreationInput.league.league_type == null || this.leagueCreationInput.league.capacity == undefined) {
      const message = "Please select league type";
      this.commonService.toastMessage(message, 2500, ToastMessageType.Error)
      return false;
    }
    else if (!this.isTeamType && this.leagueCreationInput.league.capacity == 0 || this.leagueCreationInput.league.capacity == undefined) {
      const message = "Enter capacity";
      this.commonService.toastMessage(message, 2500, ToastMessageType.Error)
      return false;
    }
    // else if (!this.isTeamType && this.leagueCreationInput.league.season == "" || this.leagueCreationInput.league.season == undefined) {
    //   const message = "Enter season";
    //   this.commonService.toastMessage(message, 2500, ToastMessageType.Error)
    //   return false;
    // }
    else if (!this.isTeamType && this.leagueCreationInput.league.grade == "" || this.leagueCreationInput.league.grade == undefined) {
      const message = "Enter grade";
      this.commonService.toastMessage(message, 2500, ToastMessageType.Error)
      return false;

    } else if ((!this.isTeamType && this.leagueCreationInput.league.is_paid) && (parseFloat(this.leagueCreationInput.league.member_price) <= 0 || this.leagueCreationInput.league.member_price == undefined || this.leagueCreationInput.league.member_price == '')) {
      const message = "Enter member fee";
      this.commonService.toastMessage(message, 2500, ToastMessageType.Error)
      return false;
    }
    else if ((!this.isTeamType && this.leagueCreationInput.league.is_paid) && (parseFloat(this.leagueCreationInput.league.non_member_price) <= 0 || this.leagueCreationInput.league.non_member_price == undefined || this.leagueCreationInput.league.non_member_price == '')) {
      const message = "Enter non-member fee";
      this.commonService.toastMessage(message, 2500, ToastMessageType.Error)
      return false;
    } else if (!this.isTeamType && this.leagueCreationInput.league.contact_email == "" || this.leagueCreationInput.league.contact_email == undefined) {
      const message = "Enter contact email";
      this.commonService.toastMessage(message, 2500, ToastMessageType.Error)
      return false;
    } else if (!this.isTeamType && this.leagueCreationInput.league.contact_phone == "" || this.leagueCreationInput.league.contact_phone == undefined) {
      const message = "Enter contact phone";
      this.commonService.toastMessage(message, 2500, ToastMessageType.Error)
      return false;
    }
    else if (this.leagueCreationInput.league.start_date == "") {
      const msg = "Please enter a valid start date";
      this.commonService.toastMessage(msg, 2500, ToastMessageType.Error)
      return false;
    }

    else if (this.leagueCreationInput.league.end_date == "") {
      const msg = "Please enter a valid end date";
      this.commonService.toastMessage(msg, 2500, ToastMessageType.Error)
      return false;
    }
    else if (moment(this.leagueCreationInput.league.end_date, "YYYY-MM-DD").isBefore(moment(this.leagueCreationInput.league.start_date, "YYYY-MM-DD"))) {
      const msg = "Your end date is before the start date. Please enter a valid end date."
      this.commonService.toastMessage(msg, 2500, ToastMessageType.Error)
      return false;
    }
    else if (!this.isTeamType && this.leagueCreationInput.league.last_enrollment_date == "") {
      const msg = "Please enter a valid enrolment date";
      this.commonService.toastMessage(msg, 2500, ToastMessageType.Error)
      return false;
    } else if (!this.isTeamType && moment(this.leagueCreationInput.league.last_withdrawal_date, "YYYY-MM-DD").isBefore(moment(this.leagueCreationInput.league.last_enrollment_date, "YYYY-MM-DD"))) {
      const msg = "Your withdrawal date is before the enrollment date. Please enter a valid withdrawal date."
      this.commonService.toastMessage(msg, 2500, ToastMessageType.Error)
      return false;
    } else if (!this.isTeamType && moment(this.leagueCreationInput.league.last_withdrawal_date, "YYYY-MM-DD").isAfter(moment(this.leagueCreationInput.league.end_date, "YYYY-MM-DD"))) {
      const msg = "Withdrawal date is after the end date. Please enter a valid withdrawal date"
      this.commonService.toastMessage(msg, 2500, ToastMessageType.Error)
      return false;
    }

    return true;
  }


  toggleRefereeInput() {
    console.log("value of refree input is:", this.leagueCreationInput.league.referee_type)

    // if (this.leagueCreationInput.league.referee_type === 1) {
    //   // Reset referee name when referee type changes to coach
    //   // this.leagueCreationInput.league.coachId = this.coachId;
    // } else if (this.leagueCreationInput.league.referee_type === 0) {
    //   this.leagueCreationInput.league.referee_name = this.leagueCreationInput.league.referee_name;
    // } else if (this.leagueCreationInput.league.referee_type === 2) {
    //   this.leagueCreationInput.league.referee_name = this.leagueCreationInput.league.referee_name;
    // }

    if (this.leagueCreationInput.league.referee_type === 1) {
      this.leagueCreationInput.league.coachId = this.leagueCreationInput.league.coachId;
    } else if (this.leagueCreationInput.league.referee_type === 0) {
      this.leagueCreationInput.league.referee_name = this.leagueCreationInput.league.referee_name;
    } else if (this.leagueCreationInput.league.referee_type === 2) {
      this.leagueCreationInput.league.referee_name = this.leagueCreationInput.league.referee_name;
    }

  }

  //create league alert prompt
  createLeagueConfirm() {
    this.commonService.commonAlert_V4("Create League", "Are you sure you want to create the league?", "Yes:Create", "No", () => {
      this.createLeague();
    })
  }

  createLeague = async () => {
    // try {
    console.log(JSON.stringify(this.leagueCreationInput));
    if (this.validateInputField()) {
      this.commonService.showLoader("Creating league...");
      this.leagueCreationInput.league.created_by = this.sharedservice.getLoggedInId();
      this.leagueCreationInput.league.league_category = Number(this.leagueCreationInput.league.league_category);
      this.leagueCreationInput.league.league_type = Number(this.leagueCreationInput.league.league_type);
      this.leagueCreationInput.league.league_ageGroup = (this.leagueCreationInput.league.league_ageGroup);
      this.leagueCreationInput.AppType = this.leagueCreationInput.AppType;
      this.leagueCreationInput.ActionType = this.leagueCreationInput.ActionType;
      this.leagueCreationInput.league.capacity = Number(this.leagueCreationInput.league.capacity);

      // Ensure price values are properly formatted as strings
      if (this.leagueCreationInput.league.is_paid) {
        this.leagueCreationInput.league.member_price = parseFloat(this.leagueCreationInput.league.member_price || '0').toFixed(2);
        this.leagueCreationInput.league.non_member_price = parseFloat(this.leagueCreationInput.league.non_member_price || '0').toFixed(2);
      } else {
        this.leagueCreationInput.league.member_price = "0.00";
        this.leagueCreationInput.league.non_member_price = "0.00";
      }
      if (this.isTeamType) {
        this.leagueCreationInput.league.last_enrollment_date = this.leagueCreationInput.league.start_date;
        this.leagueCreationInput.league.last_withdrawal_date = this.leagueCreationInput.league.start_date;
      }
      // this.leagueCreationInput.league.start_date = moment().format("YYYY-MM-DD");


      //  this.leagueCreationInput.league.parentclub_key = this.parentClubKey;
      this.leagueCreationInput.league.referee_type = 1;
      // this.leagueCreationInput.league.location = this.leagueCreationInput.league.location
      // if(this.leagueCreationInput.league.league_type==3){
      //   this.leagueCreationInput.league.location=this.selectedSchoolLocation
      // }
      const clubId = await this.getClubByFirebaseId(this.selectedClub)
      this.leagueCreationInput.league.venue_id = clubId;

      //  console.log("selected location type and location value is:",`${typeof(this.leagueCreationInput.league.location_type)}`, `${(this.leagueCreationInput.league.location_type)}` )
      if (this.leagueCreationInput.league.location_type === 1) {
        const loc = await this.getClubByFirebaseId(this.selectedClubLocation)
        this.leagueCreationInput.league.location = loc;
      } else if (this.leagueCreationInput.league.location_type === 2) {
        // this.leagueCreationInput.league.location=this.leagueCreationInput.league.location;
      }
      else if (this.leagueCreationInput.league.location_type === 3) {
        console.log("selected location value is:", this.selectedSchoolLocation);
        const school = this.selectedSchoolLocation;
        this.leagueCreationInput.league.location = school;
      }

      console.log("league creation input is:", JSON.stringify(this.leagueCreationInput))

      const createLeagueMutation = gql`
        mutation createLeague($leagueInput:LeagueCreationInput!){
          createLeague(leagueInput:$leagueInput){
            id 
            created_at
            created_by
            updated_at
            is_active
            league_name
            activity{
             ActivityCode
             ActivityName
            }
            parentClub{
              FireBaseId
            }
            league_type
            league_category
            league_description
            start_date
            end_date
          }
        }`;
      const mutationVariable = { leagueInput: this.leagueCreationInput };
      this.graphqlService.mutate(createLeagueMutation, mutationVariable, 0).subscribe((res: any) => {
        this.commonService.hideLoader();
        const message = "League created successfully";
        this.commonService.updateCategory("leagueteamlisting");
        this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        this.navCtrl.pop();
      },
        (error) => {
          this.commonService.hideLoader();
          // this.commonService.toastMessage(error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          // this.commonService.toastMessage("League creation failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          // console.error("Error in fetching:", error);
        })
    }
    // } catch (err) {
    //   this.commonService.hideLoader();
    //   console.error("Error in fetching:", err);
    //   console.log(err.message);
    //   this.commonService.toastMessage(err.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    // }
  }

  getClubByFirebaseId(club_id): Promise<any> {
    return new Promise((res, rej) => {
      const club_query = gql`
      query getClubByFirebaseId($clubId: String!) {
        getClubByFirebaseId(firebaseId: $clubId){
          Id
          ClubName
        }  
      }`
      const club_query_variables = { clubId: club_id };
      this.graphqlService.query(
        club_query,
        club_query_variables,
        0
      ).subscribe((response) => {
        // if (response.data["getClubByFirebaseId"].length > 0) {
        res(response.data["getClubByFirebaseId"][0]["Id"]);
        // } else {
        //   rej("No club found");
        //   // this.commonService.toastMessage(err.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        // }
      }, (err) => {
        rej(err);
        this.commonService.toastMessage(err.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      });
    })
  }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent,
    });
  }


  ionViewWillLeave() {
    this.commonService.updateCategory("");
  }


}

export class LeagueCreationInput {
  // ParentClubKey: string
  // MemberKey: string
  AppType: number
  ActionType: number

  league: {
    venue_id: string
    parentclub_id: string
    league_name: string
    created_by: string
    activity_code: string
    league_type: number
    league_category: number
    league_ageGroup: string
    league_logoURL: string
    league_description: string
    // parentclub_key: string
    start_date: string
    end_date: string
    // venue_key: string
    location: string
    location_type: number
    multiday: boolean
    last_enrollment_date: string
    last_withdrawal_date: string
    early_arrival_time: string
    start_time: string
    end_time: string
    capacity: number
    referee_type: number
    referee_name: string
    season: string
    grade: string
    rating_group: string
    contact_email: string
    contact_phone: string
    secondary_contact_email: string
    secondary_contact_phone: string
    is_paid: boolean
    member_price: string
    non_member_price: string
    is_pay_later: boolean
    league_visibility: number
    coachId: string
    allow_bacs: boolean
    allow_cash: boolean
    show_participants: boolean

  }

}

export class VenueDetailsInput {
  ParentClubKey: string;
  MemberKey: string;
  AppType: number;
  ActionType: number;
  DeviceType: number;
  VenueKey: string;
}
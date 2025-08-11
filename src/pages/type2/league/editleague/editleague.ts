import { Component } from '@angular/core';
import {
  Events,
  IonicPage,
  LoadingController,
  NavController,
  NavParams,
  PopoverController
} from 'ionic-angular';
import {
  CommonService,
  ToastMessageType,
  ToastPlacement
} from '../../../../services/common.service';
import { FirebaseService } from '../../../../services/firebase.service';
import { SharedServices } from '../../../services/sharedservice';
import { LeaguesForParentClubModel } from '../models/league.model';
import { Storage } from '@ionic/storage';
import moment from "moment";
import gql from 'graphql-tag';
import { Activity } from '../models/activity.model';
import { GraphqlService } from '../../../../services/graphql.service';
import { CoachList, SchoolList } from '../leaguemodels/creatematchforleague.dto';
import { CatandType, Locations } from '../models/location.model';
import { HttpService } from '../../../../services/http.service';
import { IClubDetails } from '../../../../shared/model/club.model';

/**
 * Generated class for the EditleaguePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-editleague',
  templateUrl: 'editleague.html',
  providers: [HttpService]
})
export class EditleaguePage {
  isTeamType: boolean = false;
  min: any;
  max: any;
  publicType: boolean = true;
  privateType: boolean = true;
  coaches: CoachList[];

  leagueEditInput: LeagueEditInput = {
    AppType: 0,
    ActionType: 0,
    leagueId: "",
    leagueDetails: {
      league_name: '',
      created_by: '',
      activity_code: '',
      league_type: 0,
      league_category: 0,
      league_ageGroup: '',
      league_logoURL: '',
      league_description: '',
      //  parentclub_key: '',
      parentclub_id: '',
      start_date: '',
      end_date: '',
      // venue_key: '',
      venue_id: '',
      location: '',
      multiday: false,
      last_enrollment_date: '',
      last_withdrawal_date: '',
      early_arrival_time: '',
      start_time: '',
      end_time: '',
      capacity: 0,
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
      location_type: 1,
      member_price: '',
      non_member_price: '',
      allow_bacs: false,
      allow_cash: false,
      show_participants: false
    },

  }

  venueDetailsInput: VenueDetailsInput = {
    ParentClubKey: "",
    MemberKey: "",
    AppType: 0,
    ActionType: 0,
    DeviceType: 0,
    VenueKey: ""
  }


  locations: Locations[];
  parentClubKey: string = "";
  editLeagues: LeaguesForParentClubModel;
  allactivity = [];
  types = [];
  arrow = false;
  clubVenues: IClubDetails[] = [];
  activities: Activity[] = [];
  leagueId: string;
  clubs: IClubDetails[];
  club_activities: Activity[] = [];
  league: LeaguesForParentClubModel;
  maxDate: any;
  venueKey: string;
  StartDate: string;
  EndDate: string;
  selectedActivityType: any;
  coachId: string;
  enrol_date: string;
  withdrwal_date: string;

  currency: any;

  selectedClubLocation: string;
  locatinId: any;
  selectedSchoolLocation: any;
  selectedLocation: any;
  schools: SchoolList[];
  commonInput = {
    parentclubId: "",

  }
  leagueCategory: CatandType[];
  leagueType: CatandType[]

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public fb: FirebaseService,
    public sharedservice: SharedServices,
    public popoverCtrl: PopoverController,
    private graphqlService: GraphqlService,
    public events: Events,
    private httpService: HttpService,

  ) {
    this.min = new Date().toISOString();
    this.max = "2049-12-31";

    this.league = this.navParams.get("individualleague");

    this.leagueEditInput.leagueId = this.league.id;

    this.publicType = this.league.league_visibility == 0 ? true : false

    console.log(JSON.stringify(this.league));

    this.venueKey = this.league.club.FirebaseId;
    console.log("venue key is:", this.venueKey);

    this.leagueEditInput.leagueDetails.start_date = this.formatDateString(this.league.start_date);
    this.leagueEditInput.leagueDetails.end_date = this.formatDateString(this.league.end_date);

    this.enrol_date = this.formatDateString(this.league.last_enrollment_date);
    this.withdrwal_date = this.formatDateString(this.league.last_withdrawal_date);


    console.log(`${this.leagueEditInput.leagueDetails.start_date}`, ` ${this.leagueEditInput.leagueDetails.end_date}`, `${this.leagueEditInput.leagueDetails.last_enrollment_date}`,
      `${this.leagueEditInput.leagueDetails.last_withdrawal_date}`
    )

    this.leagueEditInput.leagueDetails.is_paid = this.league.is_paid;

    if (this.league.location_type == 1) {
      this.selectedClubLocation = this.league.location_id;
    } else if (this.league.location_type == 2) {
      this.selectedLocation = this.league.location_id;
    } else if (this.league.location_type == 3) {
      this.selectedSchoolLocation = this.league.location_id;
    }

    if (this.league.coach) {
      this.leagueEditInput.leagueDetails.coachId = this.league.coach.Id;
      this.leagueEditInput.leagueDetails.contact_email = this.league.contact_email;
      this.leagueEditInput.leagueDetails.contact_phone = this.league.contact_phone;
    }
    this.leagueEditInput.leagueDetails.show_participants = this.league.show_participants;
    this.leagueEditInput.leagueDetails.allow_cash = this.league.allow_cash;
    this.leagueEditInput.leagueDetails.allow_bacs = this.league.allow_bacs;
    this.storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        // this.leagueEditInput.ParentClubKey =
        //   val.UserInfo[0].ParentClubKey;
        // this.leagueEditInput.MemberKey =
        //   val.$key;
        this.venueDetailsInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
        this.venueDetailsInput.MemberKey = val.$key;

        this.leagueEditInput.leagueDetails.parentclub_id = this.sharedservice.getPostgreParentClubId();
        this.getClubVenues();
        this.getLocationForParentClub();
        this.getCoachList();
        this.getSchoolList();
        this.getLeagueCategory();
        this.getLeagueType();
      }
    });



  }



  ionViewDidLoad() {
    console.log('ionViewDidLoad EditleaguePage');
  }

  ionViewWillEnter() {
    console.log("ionViewDidLoad EditleaguePage");
    this.storage.get('Currency').then((currency) => {
      let currencydets = JSON.parse(currency);
      console.log(currencydets);
      this.currency = currencydets.CurrencySymbol;
    });
  }

  gotoDashboard() {
    this.navCtrl.pop();
  }

  gotoHome() {
    this.navCtrl.push("Dashboard");
  }

  changeType(val) {
    this.publicType = val == 'public' ? true : false;
    this.leagueEditInput.leagueDetails.league_visibility = val == 'private' ? 1 : 0;
  }

  formatDateString(inputDate: string): string {
    // Define the input date format
    const inputFormat = 'DD-MMM-YYYY';

    // Parse the input date
    const parsedDate = moment(inputDate, inputFormat);

    // Check if the date is valid
    if (!parsedDate.isValid()) {
      throw new Error(`Invalid date format: ${inputDate}`);
    }

    // Format the date to 'YYYY-MM-DD'
    return parsedDate.format('YYYY-MM-DD');
  }


  //getting the clubVenues
  getClubVenues = () => {
    this.commonService.showLoader("Please wait...");
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
        this.commonService.hideLoader();
        this.clubVenues = res.data["getVenuesByParentClub"];
        if (this.clubVenues.length > 0) {
          this.venueKey = this.league.club.FirebaseId
          // this.leagueEditInput.leagueDetails.venue_key = this.venueKey;
          // if(this.league.location_type == 1){
          //   this.selectedClubLocation = this.venueKey;
          // }
          this.getActivity();
        }
      },
        (error) => {
          this.commonService.hideLoader();
          console.error("Error in fetching:", error);
          // Handle the error here, you can display an error message or take appropriate action.
        })
  };

  getActivity() {
    this.venueDetailsInput.VenueKey = this.venueKey;
    const activityQuery = gql`
      query getAllActivityByVenue($venueInput: VenueDetailsInput!) {
        getAllActivityByVenue(venueDetailsInput: $venueInput) {
              ActivityCode
              ActivityName   
              ActivityKey
        }
      }
    `;
    this.graphqlService.query(activityQuery, { venueInput: this.venueDetailsInput }, 0)
      .subscribe(({ data }) => {
        //this.commonService.hideLoader();
        console.log(
          "activity data" + JSON.stringify(data["getAllActivityByVenue"])
        );
        //this.commonService.hideLoader();
        this.activities = data["getAllActivityByVenue"];
        if (this.activities.length > 0) {
          this.leagueEditInput.leagueDetails.activity_code = String(this.activities[0].ActivityCode);
          console.log("activity code is:", this.leagueEditInput.leagueDetails.activity_code);
        }
      },
        (err) => {
          this.commonService.toastMessage("Activities fetch failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        }
      );
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
        if (this.league.location_type == 3 && this.schools.length > 0) {
          this.selectedSchoolLocation = this.league.location_id;
        }
        console.log("school venues are:", this.schools);
      },
        (error) => {
          this.commonService.toastMessage("Schools fetch failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          console.error("Error in fetching:", error);
        })

  }



  //this api will give all the location available for parentclub
  getLocationForParentClub() {
    const parentClubId = this.sharedservice.getPostgreParentClubId();
    let ParentClubLocationInput = {
      parentclub_id: parentClubId

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
    }
    `;
    this.graphqlService.query(getLocation, { locationInput: ParentClubLocationInput }, 0)
      .subscribe((res: any) => {
        this.locations = res.data.getLocationByParentClub;
        if (this.locations.length > 0) {
          this.leagueEditInput.leagueDetails.location = this.locations[0].id;
        }
        if (this.league.location_type == 2) {
          this.selectedClubLocation = this.league.location_id;
        }

      },
        (error) => {
          this.commonService.toastMessage("Locations fetch failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          console.error("Error in fetching:", error);
        })
  }

  getLeagueCategory() {
    this.httpService.post(`league/getCategories`, this.commonInput).subscribe((res: any) => {

      this.leagueCategory = res["data"]
    }, (error) => {
      this.commonService.toastMessage("category fetch failed", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
    }
    )
  }

  getLeagueType() {
    this.httpService.post(`league/getTypes`, this.commonInput).subscribe((res: any) => {
      this.leagueType = res["data"]
    }, (error) => {
      this.commonService.toastMessage("type fetch failed", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
    }
    )
  }

  changeDate() {
    this.leagueEditInput.leagueDetails.start_date = this.StartDate;
  }

  validateInputField() {
    if (this.league.league_name == "" || this.league.league_name == undefined) {
      let message = "Please enter league name";
      this.commonService.toastMessage(message, 2500);
      return false;
    }

    else if (this.league.league_type != 3 && (this.league.capacity == 0 || this.league.capacity == undefined)) {
      let message = "Enter capacity";
      this.commonService.toastMessage(message, 2500)
      return false;
    }
    else if (this.league.league_type != 3 && (this.league.season == "" || this.league.season == undefined)) {
      let message = "Enter season";
      this.commonService.toastMessage(message, 2500, ToastMessageType.Error);
      return false;
    } else if (this.league.league_type != 3 && (this.league.grade == "" || this.league.grade == undefined)) {
      let message = "Enter grade";
      this.commonService.toastMessage(message, 2500, ToastMessageType.Error);
      return false;
    } else if (this.league.league_type!= 3 && this.league.is_paid && (parseFloat(this.league.member_price) <= 0.00 || this.league.member_price == '')) {
      let message = "Member fee should be greater than non-member fee";
      this.commonService.toastMessage(message, 2500, ToastMessageType.Error);
      return false;
    } 
    else if (this.league.league_type!= 3 && this.league.is_paid && (parseFloat(this.league.non_member_price) <= 0.00 || this.league.non_member_price == '')) {
      let message = "Enter non-member fee";
      this.commonService.toastMessage(message, 2500, ToastMessageType.Error);
      return false;
    } else if (this.league.league_type != 3 && (this.league.contact_email == "" || this.league.contact_email == undefined)) {
      let message = "Enter conact email";
      this.commonService.toastMessage(message, 2500, ToastMessageType.Error);
      return false;
    } else if (this.league.league_type != 3 && (this.league.contact_phone == "" || this.league.contact_phone == undefined)) {
      let message = "Enter contact phone";
      this.commonService.toastMessage(message, 2500, ToastMessageType.Error);
      return false;
    }
    else if (this.leagueEditInput.leagueDetails.start_date == "") {
      let msg = "Please enter a valid start Date";
      this.commonService.toastMessage(msg, 2500, ToastMessageType.Error)
      return false;
    } else if (
      moment(String(this.leagueEditInput.leagueDetails.end_date), "YYYY-MM-DD").isBefore(
        moment(String(this.leagueEditInput.leagueDetails.start_date), "YYYY-MM-DD")
      )
    ) {
      let msg = "Your end date is before start Date,Please enter valid end date";
      this.commonService.toastMessage(msg, 2500, ToastMessageType.Error)
      return false;
    }
    else if (this.league.league_type != 3 && this.enrol_date == "") {
      let msg = "Please enter a valid enrollment date";
      this.commonService.toastMessage(msg, 2500, ToastMessageType.Error)
      return false;
    } else if (
      this.league.league_type != 3 &&
      moment(String(this.withdrwal_date), "YYYY-MM-DD").isBefore(
        moment(String(this.enrol_date), "YYYY-MM-DD")
      )
    ) {
      let msg = "Your withdrawal Date is before enrol date,Please enter valid withdrawal date";
      this.commonService.toastMessage(msg, 2500, ToastMessageType.Error)
      return false;
    } else if (this.league.league_type != 3 && moment(this.withdrwal_date, "YYYY-MM-DD").isAfter(moment(this.league.end_date, "YYYY-MM-DD"))) {
      let msg = "Withdrawal date is after the end date. Please enter a valid withdrawal date"
      this.commonService.toastMessage(msg, 2500, ToastMessageType.Error)
      return false;
    }
    return true;
  }

  // toggleRefereeInput() {
  //   console.log("value of refree input is:", this.league.referee_type)
  //   this.leagueEditInput.leagueDetails.coachId = this.leagueEditInput.leagueDetails.coachId;

  // }



  getCoachList() {
    //  this.commonService.showLoader("fetching Coach");
    const parentClubId = this.sharedservice.getPostgreParentClubId();
    const CoachFetchInput = {
      parentclub: parentClubId
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
        // if (this.league.coach) {
        //   this.leagueEditInput.leagueDetails.coachId = this.league.coach.Id;
        //   const selectedCoach = this.coaches.find(coach => coach.Id === this.league.coach.Id);
        //   if (selectedCoach) {
        //     this.leagueEditInput.leagueDetails.contact_email = selectedCoach.email_id;
        //     this.leagueEditInput.leagueDetails.contact_phone = selectedCoach.phone_no;
        //   }
        // }



        if (this.coaches.length) {
          // this.leagueEditInput.leagueDetails.coachId = this.coaches[0].Id;
          // this.updateContactInfo()
        }

      },
        (error) => {
          console.error("Error in fetching:", error);
        })

  }

  updateContactInfo() {
    const selectedCoachId = this.leagueEditInput.leagueDetails.coachId;
    const selectedCoach = this.coaches.find(coach => coach.Id === selectedCoachId);

    if (selectedCoach) {
      this.leagueEditInput.leagueDetails.contact_email = selectedCoach.email_id;
      this.leagueEditInput.leagueDetails.contact_phone = selectedCoach.phone_no;
    }
  }
  //update league alert prompt
  updateLeagueConfirm() {
    this.commonService.commonAlert_V4("Update League", "Are you sure you want to update the league?", "Yes:Update", "No", () => {
      this.leagueUpdate();
    })
  }

  //Updating the league
  leagueUpdate = async () => {
    console.log(JSON.stringify(this.leagueEditInput));
    if (this.validateInputField()) {
      try {
        this.commonService.showLoader("Please wait");
        this.leagueEditInput.leagueDetails.created_by = this.sharedservice.getLoggedInId();
        //  this.leagueEditInput.leagueDetails.venue_key = this.venueKey;

        this.leagueEditInput.leagueDetails.league_category = Number(this.league.league_category);
        this.leagueEditInput.leagueDetails.league_type = Number(this.league.league_type);
        this.leagueEditInput.leagueDetails.league_ageGroup = (this.league.league_age_group);

        this.leagueEditInput.leagueDetails.league_name = this.league.league_name;
        this.leagueEditInput.leagueDetails.league_description = this.league.league_description;
        this.leagueEditInput.leagueDetails.league_logoURL = this.league.league_logo_url;

        this.leagueEditInput.leagueDetails.league_visibility = this.leagueEditInput.leagueDetails.league_visibility;
        // this.leagueEditInput.leagueId = this.league.id;
        this.leagueEditInput.leagueDetails.activity_code = String(this.league.activity.ActivityCode);
        this.leagueEditInput.leagueDetails.season = this.league.season;
        this.leagueEditInput.leagueDetails.last_enrollment_date = this.enrol_date;
        this.leagueEditInput.leagueDetails.last_withdrawal_date = this.withdrwal_date;
        this.leagueEditInput.leagueDetails.start_time = this.league.start_time;
        this.leagueEditInput.leagueDetails.end_time = this.league.end_time;
        this.leagueEditInput.leagueDetails.early_arrival_time = this.league.early_arrival_time;
        this.leagueEditInput.leagueDetails.capacity = Number(this.league.capacity);
        this.leagueEditInput.leagueDetails.grade = this.league.grade;

        // this.leagueEditInput.leagueDetails.contact_email = this.league.contact_email;
        // this.leagueEditInput.leagueDetails.contact_phone = this.league.contact_phone;
        if (this.leagueEditInput.leagueDetails.is_paid) {
          this.leagueEditInput.leagueDetails.member_price = this.league.member_price;
          this.leagueEditInput.leagueDetails.non_member_price = this.league.non_member_price;
        } else {
          this.leagueEditInput.leagueDetails.member_price = "0.00";
          this.leagueEditInput.leagueDetails.non_member_price = "0.00";
        }
        this.leagueEditInput.leagueDetails.is_pay_later = this.league.is_pay_later;
        this.leagueEditInput.leagueDetails.referee_type = 1;
        // this.leagueEditInput.leagueDetails.location = this.league.location.id;
        //const clubId = await this.getClubByFirebaseId(this.venueKey)

        this.leagueEditInput.leagueDetails.venue_id = this.selectedClubLocation;

        if (this.league.location_type === 1) {

          this.leagueEditInput.leagueDetails.location_type = 1;
          // const loc = await this.getClubByFirebaseId(this.selectedClubLocation)
          // this.leagueEditInput.leagueDetails.location = loc;
          this.leagueEditInput.leagueDetails.location = this.selectedClubLocation;
        } else if (this.league.location_type === 2) {
          this.leagueEditInput.leagueDetails.location_type = 2;
          this.leagueEditInput.leagueDetails.location = this.selectedLocation;
          // this.leagueCreationInput.league.location=this.leagueCreationInput.league.location;
        } else if (this.league.location_type === 3) {
          this.leagueEditInput.leagueDetails.location_type = 3;
          this.leagueEditInput.leagueDetails.location = this.selectedSchoolLocation;
        }

        console.log("input giving for update:", JSON.stringify(this.leagueEditInput.leagueDetails));

        //mutaion to update the league
        const updateLeague = gql`
               mutation modifyLeague($leaguedetails:LeagueEditInput!){
                   modifyLeague(leaguedetails:$leaguedetails){
                    id 
                }
         }`;

        const mutationVariable = { leaguedetails: this.leagueEditInput };

        this.graphqlService.mutate(updateLeague, mutationVariable, 0).subscribe(({ data }) => {
          this.commonService.hideLoader();
          const message = "League updated successfully";
          this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
          this.commonService.updateCategory("leagueteamlisting");
          this.navCtrl.pop();
        }, (err) => {
          this.commonService.hideLoader();
          console.log(JSON.stringify(err));
          this.commonService.toastMessage("League updation failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        })
      } catch (error) {
        this.commonService.hideLoader()
        console.error("Error updating league:", error);
        const errorMessage = error.message ? error.message : "An error occurred while updating the league.";
        this.commonService.toastMessage(errorMessage, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }

    }
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
        res(response.data["getClubByFirebaseId"][0]["Id"]);
      }, (err) => {
        rej(err);
      });
    })
  }
  //shows hint for the age group
  ageGroupHint() {
    let message = "Enter age group separated by comma (,) e.g. 12U, 14U etc.";
    this.commonService.toastMessage(message, 2500, ToastMessageType.Info);
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

  formatMatchStartDate(date) {
    return moment(+date).format("DD-MMM-YYYY")
  }

  ionViewWillLeave() {
    this.commonService.updateCategory("");
  }


}
export class LeagueEditInput {

  AppType: number
  ActionType: number
  leagueId: string
  leagueDetails: {
    league_name: string
    created_by: string
    activity_code: string
    league_type: number
    league_category: number
    league_ageGroup: string
    league_logoURL: string
    league_description: string
    //  parentclub_key: string
    parentclub_id: string
    start_date: string
    end_date: string
    // venue_key: string
    venue_id: string
    location: string
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
    location_type: number
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

// this.leagueEditInput.leagueDetails.start_date = moment(new Date(+this.league.start_date)).format("YYYY-MM-DD");
// this.leagueEditInput.leagueDetails.end_date = moment(new Date(+this.league.end_date)).format("YYYY-MM-DD");
// this.leagueEditInput.leagueDetails.last_enrollment_date = moment(new Date(+this.league.last_enrollment_date)).format("YYYY-MM-DD");
// this.leagueEditInput.leagueDetails.last_withdrawal_date = moment(new Date(+this.league.last_withdrawal_date)).format("YYYY-MM-DD");

// this.leagueEditInput.leagueDetails.last_enrollment_date = this.formatDateString(this.league.last_enrollment_date);
// this.leagueEditInput.leagueDetails.last_withdrawal_date = this.formatDateString(this.league.last_withdrawal_date);

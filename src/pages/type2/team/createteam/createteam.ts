import { Component, ViewChild } from "@angular/core";
import { Apollo } from "apollo-angular";
import { HttpLink } from "apollo-angular-link-http";
import {
  ActionSheetController,
  IonicPage,
  LoadingController,
  NavController,
  NavParams,
  PopoverController,
  ToastController,
} from "ionic-angular";
import {
  CommonService,
  ToastMessageType,
  ToastPlacement,
} from "../../../../services/common.service";
import { FirebaseService } from "../../../../services/firebase.service";
import { SharedServices } from "../../../services/sharedservice";
import { ClubVenue } from "../../match/models/venue.model";

import { Storage } from "@ionic/storage";
import gql from "graphql-tag";
import { TeamsForParentClubModel } from "../models/team.model";
import { Activity } from "../../league/models/activity.model";
import { GraphqlService } from "../../../../services/graphql.service";
import { HttpService } from "../../../../services/http.service";
import { ClubActivityInput, IClubDetails } from "../../../../shared/model/club.model";
import { NgModel } from "@angular/forms";
import { TeamImageUploadService } from "../team_image_upload/team_image_upload.service";
import { Camera, CameraOptions, PictureSourceType } from "@ionic-native/camera";

/**
 * Generated class for the CreateteamPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-createteam",
  templateUrl: "createteam.html",
  providers: [HttpService, TeamImageUploadService]
})
export class CreateteamPage {
  img_url: string = "";
  postgre_parentclubId: string;
  publicType: boolean = true;
  privateType: boolean = true;

  clubs: IClubDetails[];
  club_activities: Activity[] = [];


  parentClubTeamCreationInput: ParentClubTeamCreationInput = {
    user_postgre_metadata: new UserPostgreMetadataField,
    teamDetails: {
      activityCode: "",
      venueKey: "",
      ageGroup: "",
      teamName: "",
      shortName: '',
      clubId: "",
      teamStatus: 0,
      teamVisibility: 0,
      teamDescription: "",
      venueType: 0,
      logoUrl: ""
    }
  };

  venueDetailsInput: VenueDetailsInput = {
    ParentClubKey: "",
    MemberKey: "",
    AppType: 0,
    ActionType: 0,
    DeviceType: 0,
    VenueKey: ""
  }

  parentClubKey: string = "";
  saveTeams: TeamsForParentClubModel[] = [];
  clubVenues: ClubVenue[] = [];
  selectedClub: any;
  allactivity = [];
  types = [];
  activities: Activity[] = [];
  teamNameError: boolean = false;
  shortNameError: boolean = false;
  teamNameErrorMessage: string = '';
  shortNameErrorMessage: string = '';
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private apollo: Apollo,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public storage: Storage,
    public fb: FirebaseService,
    public sharedservice: SharedServices,
    public popoverCtrl: PopoverController,
    private toastCtrl: ToastController,
    private httpLink: HttpLink,
    private graphqlService: GraphqlService,
    public actionSheetCtrl: ActionSheetController,
    private imageUploadService: TeamImageUploadService,
    private camera: Camera,
    public sharedService: SharedServices,
  ) { }

  ionViewDidLoad() {
    console.log("ionViewDidLoad CreateteamPage");
  }

  ionViewWillEnter() {

    console.log("ionViewDidLoad CreateteamPage");
    this.storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        // this.parentClubTeamCreationInput.ParentClubKey =
        //   val.UserInfo[0].ParentClubKey;
        //   this.parentClubTeamCreationInput.MemberKey = val.$key;
        this.parentClubKey = val.UserInfo[0].ParentClubKey
        this.venueDetailsInput.ParentClubKey = val.UserInfo[0].ParentClubKey;
        this.venueDetailsInput.MemberKey = val.$key;
        this.postgre_parentclubId = this.sharedService.getPostgreParentClubId();
        // this.venueDetailsInput.VenueKey="-KuFU3C068bQzKW_9WO2"
        // this.venueDetailsInput.VenueKey= this.parentClubTeamCreationInput.teamDetails.venueKey;

        // this.getClubVenues();
        // this.getActivity();

        this.getListOfClub();
      }
      // this.getAllActivities();
      //this.getClubVenues();
      // this.getSchoolVenues();
      // this.saveMatchDetails();
    });
    this.parentClubTeamCreationInput.user_postgre_metadata.UserParentClubId = this.sharedservice.getPostgreParentClubId();
  }

  gotoDashboard() {
    this.navCtrl.pop();
  }

  gotoleagueteamlisting(save) {
    this.navCtrl.push("LeagueteamlistingPage", {
      selectedLeagueId: save.Id,
      // selectedParentCubKey: this.parentClubTeamCreationInput.ParentClubKey,
    });
  }

  gotoHome() {
    this.navCtrl.push("Dashboard");
  }

  changeType(val) {
    this.publicType = val == 'public' ? true : false;
    this.parentClubTeamCreationInput.teamDetails.teamVisibility = val == 'private' ? 1 : 0;
  }

  async selectTeamLogo() {
    // this.sponsorIndex = index;
    const actionSheet = await this.actionSheetCtrl.create({
      //header: 'Choose File',
      buttons: [{
        text: 'Camera',
        role: 'destructive',
        icon: 'ios-camera',
        handler: () => {
          console.log('clicked');
          this.CaptureImage(this.camera.PictureSourceType.CAMERA);
        }
      }, {
        text: 'Gallery',
        icon: 'ios-image',
        handler: () => {
          //console.log('Share clicked');
          this.CaptureImage(this.camera.PictureSourceType.PHOTOLIBRARY);
        }
      }, {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          //console.log('Cancel clicked');
        }
      }
      ]
    });
    await actionSheet.present();
  }

  async CaptureImage(sourceType: PictureSourceType) {
    const options: CameraOptions = {
      quality: 70,
      sourceType,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      //mediaType: this.camera.MediaType.PICTURE
    };

    try {
      const imageData = await this.camera.getPicture(options);
      //const mimeType = sourceType === this.camera.EncodingType.JPEG ? 'image/jpeg' : 'image/png';
      this.img_url = imageData.startsWith('data:image/jpeg;base64,') ? imageData : `data:image/jpeg;base64,${imageData}`;
      this.prepareAndUpload();
    } catch (error) {
      console.log(`err:${JSON.stringify(error)}`);
      this.commonService.toastMessage("Error capturing image", 2500, ToastMessageType.Error);
    }
  }
  async prepareAndUpload() {
    try {
      this.commonService.showLoader("Uploading image...");

      const uniqueFileName = `${this.postgre_parentclubId}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.jpeg`;
      // Step 1: Get presigned URL from server
      const presignedUrl = await this.imageUploadService.getPresignedUrl(uniqueFileName, 'team', 'ap-dev-league');

      // Step 2: Upload the image to S3 using presigned URL
      this.imageUploadService.uploadImage(presignedUrl[0].url, this.img_url).then(() => {
        this.commonService.hideLoader();
        const imageUrl = `${this.sharedService.getCloudfrontURL()}/team/${uniqueFileName}`;
        console.log(`uploadedurl:${this.sharedService.getCloudfrontURL()}/team/${uniqueFileName}`);
        this.parentClubTeamCreationInput.teamDetails.logoUrl = imageUrl;
        this.commonService.toastMessage("Image(s) uploaded successfully", 2500, ToastMessageType.Success);
      }).catch((err) => {
        console.log(`err:${JSON.stringify(err)}`);
        this.commonService.hideLoader();
        this.commonService.toastMessage("Error uploading image", 2500, ToastMessageType.Error);
      })

    } catch (error) {
      this.commonService.hideLoader();
      console.log(`err1:${JSON.stringify(error)}`);
      this.commonService.toastMessage("Error uploading image", 2500, ToastMessageType.Error);
    }
  }

  selectClubName() {
    const cluubIndex = this.clubVenues.findIndex(
      (club) => club.ClubKey === this.parentClubTeamCreationInput.teamDetails.venueKey
    );
    this.parentClubTeamCreationInput.teamDetails.venueKey =
      cluubIndex > -1 ? this.clubVenues[cluubIndex].ClubName : "";
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


        if (this.clubs.length > 0) {
          this.parentClubTeamCreationInput.teamDetails.venueKey = this.clubs[0].FirebaseId;
          this.parentClubTeamCreationInput.teamDetails.venueType = 1;
          // this.getActivity();
          this.getActivityList();
        }

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
          this.parentClubTeamCreationInput.teamDetails.activityCode = (this.club_activities[0].ActivityCode).toString();
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

  getActivity() {

    this.venueDetailsInput.VenueKey = this.parentClubTeamCreationInput.teamDetails.venueKey;

    const clubdets = this.clubs.find(club => club.FirebaseId === this.parentClubTeamCreationInput.teamDetails.venueKey);

    this.parentClubTeamCreationInput.teamDetails.clubId = clubdets.Id;

    console.log("venueKey for activity", this.venueDetailsInput.VenueKey);
    const activityQuery = gql`
      query getAllActivityByVenue($venueDetailsInput: VenueDetailsInput!) {
        getAllActivityByVenue(venueDetailsInput: $venueDetailsInput) {
             
              ActivityCode
              ActivityName   
              ActivityKey
        }
      }
    `;
    this.apollo
      .query({
        query: activityQuery,
        fetchPolicy: "network-only",
        variables: { venueDetailsInput: this.venueDetailsInput },
      })
      .subscribe(
        ({ data }) => {
          this.commonService.hideLoader();
          console.log(
            "activity data" + JSON.stringify(data["getAllActivityByVenue"])
          );
          this.commonService.hideLoader();
          this.activities = data["getAllActivityByVenue"];
          if (this.activities.length > 0) {
            this.parentClubTeamCreationInput.teamDetails.activityCode = String(this.activities[0].ActivityCode);
            console.log("activity code is:", this.parentClubTeamCreationInput.teamDetails.activityCode);

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
  }



  gototeamdetails(save) {
    this.navCtrl.push("TeamdetailsPage", {
      selectedLeagueId: save.Id,
      // selectedParentCubKey: this.parentClubTeamCreationInput.ParentClubKey,
    });
  }
  //shows hint for the age group
  ageGroupHint() {
    let message = "Enter age group separated by comma (,) e.g. 12U, 14U etc.";
    this.showToast(message, 5000);
  }
  showToast(m: string, dur: number) {
    let toast = this.toastCtrl.create({
      message: m,
      duration: dur,
      position: "bottom",
    });
    toast.present();
  }

  gotoTeamDetails() {
    this.navCtrl.push("TeamdetailsPage");
  }

  //validating the input field
  validateInputField() {
    if (this.parentClubTeamCreationInput.teamDetails.teamName == "" || this.parentClubTeamCreationInput.teamDetails.teamName == undefined) {
      let message = "Please enter team name";
      this.commonService.toastMessage(message, 3000, ToastMessageType.Info);
      return false;
    }
    if (this.parentClubTeamCreationInput.teamDetails.shortName == "" || this.parentClubTeamCreationInput.teamDetails.shortName == undefined) {
      let message = "Please enter short name";
      this.commonService.toastMessage(message, 3000, ToastMessageType.Info);
      return false;
    }
    else if (this.parentClubTeamCreationInput.teamDetails.teamName.length > 40) {
      let message = "Team name should be of maximum 40 characters";
      this.commonService.toastMessage(message, 3000, ToastMessageType.Info);
      return false;
    } else if (!/^[a-zA-Z0-9 ]*$/.test(this.parentClubTeamCreationInput.teamDetails.teamName)) {
      let message = "Team name should not contain special characters";
      this.commonService.toastMessage(message, 3000, ToastMessageType.Info);
      return false;
    }
    else if (this.parentClubTeamCreationInput.teamDetails.ageGroup == "" || this.parentClubTeamCreationInput.teamDetails.ageGroup == undefined) {
      let message = "Enter Age group";
      this.commonService.toastMessage(message, 3000, ToastMessageType.Info);
      return false;
    }
    // else if (this.parentClubTeamCreationInput.teamDetails.teamDescription == "" || this.parentClubTeamCreationInput.teamDetails.teamDescription == undefined) {
    //   let message = "Enter description";
    //   this.showToast(message, 3000)
    //   return false;
    // }
    return true;
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

  createTeamConfirm() {
    this.commonService.commonAlert_V4("Create Team", "Are you sure you want to create the team?", "Yes:Create", "No", () => {
      this.saveTeamDetails();
    })
  }

  saveTeamDetails = async () => {
    //this.CreateMatchInput.MatchStartDate = moment(this.startDate + " " + this.startTime,"DD MMM YYYY hh:mm").format("YYYY-MM-DD hh:mm");
    //this.CreateMatchInput.MatchStartDate = (new Date(this.startDate + " " + this.startTime).getTime()).toString();
    //ngnmj
    // this.CreateMatchInput.MatchStartDate = moment(
    //   new Date(this.startDate + " " + this.startTime).getTime()
    // ).format("YYYY-MM-DD HH:mm");
    // console.log(JSON.stringify(this.CreateMatchInput));
    // console.log(new Date(this.startDate + " " + this.startTime).getTime());
    // this.CreateMatchInput.GameType = Number(this.CreateMatchInput.GameType);
    // this.CreateMatchInput.MatchType = +this.CreateMatchInput.MatchType;
    console.log(JSON.stringify(this.parentClubTeamCreationInput));
    try {
      if (this.validateInputField()) {
        this.commonService.showLoader("Creating team...");
        this.parentClubTeamCreationInput.teamDetails.activityCode = (this.parentClubTeamCreationInput.teamDetails.activityCode);
        this.parentClubTeamCreationInput.teamDetails.venueKey = this.selectedClub;
        const club = this.clubs.find(club => club.FirebaseId === this.selectedClub)
        this.parentClubTeamCreationInput.teamDetails.clubId = club.Id;
        const createTeam = gql`
      mutation createTeamForParentClub(
        $teamInput: ParentClubTeamCreationInput!
      ) {
        createTeamForParentClub(teamInput: $teamInput) {
          id
          created_at
          created_by
          updated_at
          is_active
          activity {
            ActivityCode
            ActivityName
          }
          venueKey
          venueType
         
          ageGroup
          teamName
          teamStatus
          teamVisibility
          teamDescription
          parentClub{
            FireBaseId
          }
          
        }
      }
    `;
        const mutationVariable = { teamInput: this.parentClubTeamCreationInput };
        this.graphqlService.mutate(createTeam, mutationVariable, 0).subscribe((res: any) => {
          this.commonService.hideLoader();
          const message = "Team created successfully"
          this.commonService.updateCategory("leagueteamlisting");
          this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
          this.navCtrl.pop();
        }, (error) => {
          this.commonService.hideLoader();
          this.commonService.toastMessage("Team created successfully", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          console.error("error in fetching", error);
        }
        )

      }
    } catch (error) {
      this.commonService.hideLoader();
      console.error("Error in fetching:", error);
      this.commonService.toastMessage("Team creation failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    }
  }


  teamNameInputChange() {
    if (this.parentClubTeamCreationInput.teamDetails.teamName && this.parentClubTeamCreationInput.teamDetails.teamName.length > 40) {
      this.teamNameError = true;
      this.teamNameErrorMessage = "Team name should not exceed 40 characters";
    } else if (this.parentClubTeamCreationInput.teamDetails.teamName && !/^[a-zA-Z0-9 ]*$/.test(this.parentClubTeamCreationInput.teamDetails.teamName)) {
      this.teamNameError = true;
      this.teamNameErrorMessage = "Team name should not contain special characters";
    }
    else {
      this.teamNameError = false;
      this.teamNameErrorMessage = "";
    }
  }
  shortNameInputChange() {
    // 📝 Always store shortName as uppercase
    if (this.parentClubTeamCreationInput.teamDetails.shortName) {
      this.parentClubTeamCreationInput.teamDetails.shortName =
        this.parentClubTeamCreationInput.teamDetails.shortName.toUpperCase();
    }
    if (this.parentClubTeamCreationInput.teamDetails.shortName && this.parentClubTeamCreationInput.teamDetails.shortName.length > 3) {
      this.shortNameError = true;
      this.shortNameErrorMessage = "short name should not exceed 3 characters";
    } else if (this.parentClubTeamCreationInput.teamDetails.shortName && !/^[a-zA-Z0-9 ]*$/.test(this.parentClubTeamCreationInput.teamDetails.shortName)) {
      this.shortNameError = true;
      this.shortNameErrorMessage = "Team name should not contain special characters";
    }
    else {
      this.shortNameError = false;
      this.shortNameErrorMessage = "";
    }
  }
}

export class ParentClubTeamCreationInput {
  user_postgre_metadata: UserPostgreMetadataField
  teamDetails: {
    activityCode: string;
    venueKey: string;
    ageGroup: string;
    teamName: string;
    shortName: string;
    clubId: string
    teamStatus: number;
    teamVisibility: number;
    teamDescription: string;
    venueType: number;
    logoUrl: string;
  };
}

export class UserPostgreMetadataField {
  UserParentClubId: string
  UserClubId: string
  UserMemberId: string
  UserActivityId: string
}

export class VenueDetailsInput {
  ParentClubKey: string;
  MemberKey: string;
  AppType: number;
  ActionType: number;
  DeviceType: number;
  VenueKey: string;
}

// venue{
//   VenueName
//   LocationType
//   ParentClubKey
//   ClubKey
// }
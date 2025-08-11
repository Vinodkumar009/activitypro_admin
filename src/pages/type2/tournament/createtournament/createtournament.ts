import { Component, ViewChildren } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  Slides,
  ModalController,
  ToastController,
  AlertController,
} from "ionic-angular";
// import * as moment from 'moment';
import { Events } from "ionic-angular";
import { LanguageService } from "../../../../services/language.service";
import { Storage } from "@ionic/storage";
import { FirebaseService } from "../../../../services/firebase.service";
// import { forEach } from '@firebase/util';
import {
  CommonService,
  ToastPlacement,
  ToastMessageType,
} from "../../../../services/common.service";
import moment, { Moment } from "moment";

// import { IonicPage } from 'ionic-angular';
@IonicPage()
@Component({
  selector: "page-createtournament",
  templateUrl: "createtournament.html",
})
export class CreateTournamentPage {
  LangObj: any = {}; //by vinod
  parentClubKey: string;
  submitButtonTest = "Create";

  clubs = [];
  selectedClub: any;

  selectedActivityType: any;
  allactivity = [];

  types = [];
  selectedLocation: any;
  locations = [];
  primaryContact: any;
  secondaryContact: number;
  tournamentType = "";
  LocationName = "";
  Tournament = {
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
  coachs = [];
  backupCoachs = [];
  AssistantUmpireKey: any;
  UmpireKey: any;
  Type: any;
  RoleType: any;
  backupAssistantCoachs = [];
  TournamentKey: string;
  tournamentDataExists = false;
  clubLocation: any[];
  AssistantMemberUmpire: string = "";
  MemberUmpire: string = "";
  isUpdateFirst: boolean = false;
  today = moment().format("YYYY-MM-DD");
  maxDate = moment(moment().format("DD-MM-YYYY"), "DD-MM-YYYY")
    .add(10, "years")
    .format("YYYY-MM-DD");
  constructor(
    public events: Events,
    public navParams: NavParams,
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    public comonService: CommonService,
    public storage: Storage,
    public fb: FirebaseService,
    private toastCtrl: ToastController,
    private langService: LanguageService
  ) { }

  ionViewDidEnter() {
    // this.Tournament.StartTime = "09:00";
    // this.Tournament.EndTime = "12:00";
    // this.updateEarlyArival(this.Tournament.StartTime);
  }

  getParentClubPhone() {
    this.fb
      .getAllWithQuery("ParentClub/Type2", {
        orderByKey: true,
        equalTo: this.parentClubKey,
      })
      .subscribe((data) => {
        this.primaryContact = data[0].ContactPhone;
      });
  }

  ionViewDidLoad() {
    this.getLanguage();
    this.events.subscribe("language", (res) => {
      this.getLanguage();
    });
  }
  getLanguage() {
    this.storage.get("language").then((res) => {
      console.log(res["data"]);
      this.LangObj = res.data;
      this.storage.get("userObj").then((val) => {
        val = JSON.parse(val);
        if (val.$key != "") {
          this.parentClubKey = val.UserInfo[0].ParentClubKey;
          this.Tournament.PrimaryEmail = val.EmailID;
          this.RoleType = val.RoleType;
          this.Type = val.Type;
        }
        this.TournamentKey = this.navParams.get("TournamentKey");
        if (this.TournamentKey) {
          this.isUpdateFirst = true;
          this.initializeTournament();
          this.tournamentDataExists = true;
          this.submitButtonTest = "Update";
        } else {
          // if(this.Tournament.StartDate = moment().format("YYYY-MM-DD")){
          //   this.Tournament.StartDate = moment().add(1, 'M').format("YYYY-MM-DD");
          //   this.updateLastDates(this.Tournament.StartDate);
          // }
          this.Tournament.StartDate = moment().add(1, "M").format("YYYY-MM-DD");
          this.updateLastDates(this.Tournament.StartDate);
          this.Tournament.StartTime = "09:00";
          this.Tournament.EndTime = "12:00";
          this.updateEarlyArival(this.Tournament.StartTime);
        }

        this.getUserPhone();
        this.getAllActivity();
        this.getClubList();
        this.getParentClubPhone();
      });
    });
  }
  // gets and initialises tournament data
  initializeTournament() {
    this.fb
      .getAllWithQuery("Tournament/" + this.parentClubKey, {
        orderByKey: true,
        equalTo: this.TournamentKey,
      })
      .subscribe((data) => {
        this.Tournament = data[0];
        this.LocationName = data[0].Location.LocationName;
        this.selectedClub = this.Tournament.ClubKey;
        this.selectedActivityType = this.Tournament.ActivityKey;
        this.UmpireKey = this.Tournament.UmpireKey;
        this.AssistantUmpireKey = this.Tournament.AssistantUmpireKey;
        this.primaryContact = this.Tournament.PrimaryPhone;
        //this.Tournament.MatchType = data[0].MatchType;
        // this.Tournament.EndDate = data[0].EndDate;
        // this.Tournament.LastWithdrawalDate = data[0].LastWithdrawalDate;
        // this.Tournament.LastEnrolmentDate = data[0].LastEnrolmentDate;
        // this.Tournament.StartTime = data[0].StartTime;
        if (this.Tournament.UmpireType == "member") {
          this.MemberUmpire = this.Tournament.UmpireName;
        }
        if (this.Tournament.AssistantUmpireType == "member") {
          this.AssistantMemberUmpire = this.Tournament.AssistantUmpireName;
        }
        if (this.Tournament.SecondaryPhone != 0) {
          this.secondaryContact = this.Tournament.SecondaryPhone;
        }
        console.log(
          "parentClubKey",
          this.parentClubKey,
          "parentClubKey",
          this.parentClubKey,
          "Tournamnet : ",
          this.Tournament
        );
      });
  }
  // get method ends

  //------------------- get data for clubs ,school , location and activity ------------------------------------
  getClubList() {
    this.clubLocation = [];
    this.fb
      .getAllWithQuery("/Club/Type2/" + this.parentClubKey, {
        orderByChild: "IsActive",
        equalTo: true,
      })
      .subscribe((data) => {
        this.clubLocation = data;
        data.forEach((element) => {
          this.clubs.push({
            ClubName: element.ClubName,
            ClubKey: element.$key,
          });
        });
        if (data.length != 0) {
          this.selectedClub = this.TournamentKey ? this.Tournament.ClubKey : this.clubs[0].ClubKey;
        }
        console.log("Culd", this.clubs);
      });
    this.getSchools();
  }
  getSchools() {
    this.fb
      .getAllWithQuery("/School/Type2/" + this.parentClubKey, {
        orderByChild: "IsActive",
        equalTo: true,
      })
      .subscribe((data) => {
        this.locations = [];
        let schools = data;
        for (let i = 0; i < schools.length; i++) {
          this.locations.push({
            LocationType: "School",
            LocationName: schools[i].SchoolName,
            LocationKey: schools[i].$key,
            City: schools[i].City,
            PostCode: schools[i].PostCode,
            Address: schools[i].FirstLineAddress,
            Url: schools[i].MapUrl,
          });
        }
        for (let j = 0; j < this.clubLocation.length; j++) {
          this.locations.push({
            LocationType: "Club",
            LocationName: this.clubLocation[j].ClubName,
            LocationKey: this.clubLocation[j].$key,
            City: this.clubLocation[j].City,
            PostCode: this.clubLocation[j].PostCode,
            Address: this.clubLocation[j].FirstLineAddress,
            Url: this.clubLocation[j].MapURL,
            MapLatitude: this.clubLocation[j].MapLatitude,
            MapLongitude: this.clubLocation[j].MapLongitude,
          });
        }
      });
    this.getLocations();
  }
  getLocations() {
    this.fb
      .getAllWithQuery("/Location/" + this.parentClubKey, {
        orderByChild: "IsActive",
        equalTo: true,
      })
      .subscribe((data) => {
        // this.locations = this.comonService.convertFbObjectToArray(data)
        data.forEach((locationData) => {
          this.locations.push({
            LocationType: "Locations",
            LocationName: locationData.Name,
            LocationKey: locationData.$key,
            City: locationData.City,
            PostCode: locationData.PostCode,
            Address: locationData.Address1,
            Url: locationData.MapURL,
            MapLatitude: locationData.MapLatitude,
            MapLongitude: locationData.MapLongitude,
          });
        });

        if (this.locations.length != 0) {
          this.selectedLocation = this.locations[0].$key;
        }
        // console.log(this.locations)
      });
  }
  getAllActivity() {
    this.fb.getAll("/Activity/" + this.parentClubKey).subscribe((data) => {
      this.allactivity = data;
      if (data.length > 0) {
        this.types = data;
        this.types = this.comonService.convertFbObjectToArray(data[0]);
        for (let i = 0; i < this.types.length; i++) {
          this.types[i].$key = this.types[i].Key;
        }
        if (this.types.length != 0) {
          this.selectedActivityType = this.types[0].$key;
        }
      }
      this.getCoachList();
      console.log("activity", this.types);
    });
  }
  getCoachList() {
    for (let i = 0; i < this.allactivity.length; i++) {
      let activityClubkey = this.allactivity[i].$key;
      this.allactivity[i] = this.comonService.convertFbObjectToArray(
        this.allactivity[i]
      );
      for (let j = 0; j < this.allactivity[i].length; j++) {
        this.allactivity[i][j].ClubKey = activityClubkey;
        if (this.allactivity[i][j].Coach != undefined) {
          let coachList = [];

          let coachListArr = this.comonService.convertFbObjectToArray(
            this.allactivity[i][j].Coach
          );
          for (
            let activeCoachIndex = 0;
            activeCoachIndex < coachListArr.length;
            activeCoachIndex++
          ) {
            if (coachListArr[activeCoachIndex].IsActive) {
              coachList.push(coachListArr[activeCoachIndex]);
            }
          }

          this.allactivity[i][j].Coach = coachList;
          //keeping coaches
          if (this.selectedActivityType == this.allactivity[i][j].Key) {
            for (let k = 0; k < coachList.length; k++) {
              let isPresentCoach = false;
              for (let index = 0; index < this.coachs.length; index++) {
                if (this.coachs[index].Key == coachList[k].Key) {
                  isPresentCoach = true;
                  break;
                }
              }
              if (!isPresentCoach) {
                this.coachs.push(coachList[k]);
                isPresentCoach = false;
              }
            }
          }
        }
      }
    }
    this.backupCoachs = this.coachs;

    this.backupAssistantCoachs = this.coachs;
    if (this.tournamentDataExists && this.coachs.length > 0)
      this.SelectUmpire();
  }
  SelectUmpire() {
    let tempUmpire = [];
    this.coachs.forEach((element) => {
      if (this.UmpireKey != element.CoachKey) tempUmpire.push(element);
    });
    this.backupCoachs = tempUmpire;
    console.log("backupCoachs", this.backupCoachs);
  }
  SelectAssistantUmpire() {
    let tempUmpire = [];
    this.coachs.forEach((element) => {
      if (this.AssistantUmpireKey != element.CoachKey) tempUmpire.push(element);
    });
    this.backupAssistantCoachs = tempUmpire;
    console.log("backupAssistantCoachs", this.backupAssistantCoachs);
  }
  // -------------------get data block ends-----------------------------------

  // updates the LastWithdrawalDate and LastEnrolmentDate if not exists
  updateLastDates(date) {
    if (!this.isUpdateFirst) {
      // if (!this.Tournament.LastEnrolmentDate)
      this.Tournament.LastEnrolmentDate = moment(date, "YYYY-MM-DD")
        .subtract(1, "days")
        .format("YYYY-MM-DD");

      // if (!this.Tournament.LastWithdrawalDate)
      this.Tournament.LastWithdrawalDate = moment(date, "YYYY-MM-DD")
        .subtract(1, "days")
        .format("YYYY-MM-DD");
    }
    if (!this.Tournament.IsMultiday) {
      this.Tournament.EndDate = date;
    }
    this.isUpdateFirst = false;
  }
  updateEarlyArival(StartTime) {
    if (!this.Tournament.EarlyArrival || this.Tournament.EarlyArrival == "")
      // console.log(moment(StartTime).subtract(1, 'hours'))
      this.Tournament.EarlyArrival = StartTime;
  }

  //shows hint for the age group
  ageGroupHint() {
    let message = "Enter age group separated by comma (,) e.g. 12U, 14U etc.";
    this.showToast(message, 5000);
  }

  // location select and add options ----(Alert box)
  onChangeLocation() {
    let alert = this.alertCtrl.create({
      title: "Location",
      buttons: [
        {
          text: "+Add Location",
          // role: 'cancel',
          handler: () => {
            this.addLocation();
          },
        },
        {
          text: "Done",
          handler: (data) => {
            if (data) {
              this.LocationName = data.LocationName;
              if (data.Url == undefined) {
                data.Url = "";
              }
              this.Tournament.Location = data;
              if (
                !this.Tournament.Location["MapLatitude"] ||
                this.Tournament.Location["MapLatitude"] == undefined
              ) {
                this.Tournament.Location["MapLatitude"] = "";
                this.Tournament.Location["MapLongitude"] = "";
              }
              // this.Tournament.LocationKey = data.LocationKey;
              // this.Tournament.LocationType = data.LocationType;
              console.log(data);
            } else {
              this.comonService.toastMessage("Please select location", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
            }
          }
        },
      ],
    });
    this.locations.forEach((location) => {
      alert.addInput({
        type: "radio",
        label: location.LocationName,
        value: location,
      });
    });
    alert.present();
  }

  addLocation() {
    console.log("add Loaction", this.parentClubKey);
    this.navCtrl.push("AddlocationPage");
  }

  getUserPhone() {
    if (this.RoleType == "2" && this.Type == "2") {
      this.fb
        .getPropertyValue(
          "/ParentClub/Type2/" + this.parentClubKey,
          "ContactPhone"
        )
        .subscribe((data) => {
          this.primaryContact = data;
        });
    }
  }

  createTournament() {
    if (this.validate()) {
      // this.Tournament.ClubKey = this.selectedClub;
      this.Tournament.PrimaryPhone = this.primaryContact;
      if (this.secondaryContact) {
        this.Tournament.SecondaryPhone = this.secondaryContact;
      }
      this.clubs.forEach((element) => {
        if (this.selectedClub == element.ClubKey) {
          this.Tournament.ClubName = element.ClubName;
          this.Tournament.ClubKey = this.selectedClub;
        }
      });

      this.types.forEach((element) => {
        if (this.selectedActivityType == element.Key) {
          this.Tournament.ActivityName = element.ActivityName;
          this.Tournament.ActivityKey = this.selectedActivityType;
        }
      });

      this.Tournament.ParentClubKey = this.parentClubKey;
      this.coachs.forEach((element) => {
        if (element.CoachKey == this.UmpireKey) {
          this.Tournament.UmpireKey = element.CoachKey;
          this.Tournament.UmpireName =
            element.FirstName + " " + element.LastName;
        }
        if (element.CoachKey == this.AssistantUmpireKey) {
          this.Tournament.AssistantUmpireKey = element.CoachKey;
          this.Tournament.AssistantUmpireName =
            element.FirstName + " " + element.LastName;
        }
      });
      if (this.Tournament.EndDate == "") {
        this.Tournament.EndDate = this.Tournament.StartDate;
      }
      if (this.Tournament.UmpireType == "member") {
        this.Tournament.UmpireName = this.MemberUmpire;
      }
      if (this.Tournament.AssistantUmpireType == "member") {
        this.Tournament.AssistantUmpireName = this.AssistantMemberUmpire;
      }
      // --------------for save or update----------------
      if (this.tournamentDataExists) {
        delete this.Tournament.$key;
        // for update tournament
        this.fb.update(
          this.TournamentKey,
          "Tournament/" + this.parentClubKey,
          this.Tournament
        );
        console.log(this.Tournament);
        //this.showToast(this.Tournament.TournamentName + " Updated", 2000);
        let msg = this.Tournament.TournamentName + " Updated";
        this.comonService.toastMessage(
          msg,
          2500,
          ToastMessageType.Success,
          ToastPlacement.Bottom
        );

        this.navCtrl.pop();
      } else {
        delete this.Tournament.$key;
        // for creating tournament
        this.Tournament.EndDate = this.Tournament.IsMultiday
          ? this.Tournament.EndDate
          : this.Tournament.StartDate;
        let TournamentKey = this.fb.saveReturningKey(
          "Tournament/" + this.parentClubKey,
          this.Tournament
        );
        this.fb.save(
          { GroupnName: "Group A", Member: null },
          "Tournament/" + this.parentClubKey + "/" + TournamentKey + "/Group"
        );
        //this.showToast(this.Tournament.TournamentName + " Created", 2000);
        let msg = this.Tournament.TournamentName + " Created";
        this.comonService.toastMessage(
          msg,
          2500,
          ToastMessageType.Success,
          ToastPlacement.Bottom
        );
        this.navCtrl.pop();
      }
      console.log("Tournament", this.Tournament);
    }
  }
  validate() {
    if (this.Tournament.TournamentName == "") {
      let msg = "Please enter Valid Tournament Name";
      this.comonService.toastMessage(
        msg,
        2500,
        ToastMessageType.Error,
        ToastPlacement.Bottom
      );
      return false; //
    } else if (this.LocationName == "") {
      let msg = "Please select location";
      this.comonService.toastMessage(
        msg,
        2500,
        ToastMessageType.Error,
        ToastPlacement.Bottom
      );
      return false;
    } else if (this.Tournament.Season == "") {
      let msg = "Please enter season";
      this.comonService.toastMessage(
        msg,
        2500,
        ToastMessageType.Error,
        ToastPlacement.Bottom
      );
      return false;
    } else if (this.Tournament.MatchType == "") {
      let msg = "Please select match type";
      this.comonService.toastMessage(
        msg,
        2500,
        ToastMessageType.Error,
        ToastPlacement.Bottom
      );
      return false;
    } else if (this.Tournament.StartDate == "") {
      let msg = "Please enter Valid Start Date";
      this.comonService.toastMessage(
        msg,
        2500,
        ToastMessageType.Error,
        ToastPlacement.Bottom
      );
      return false;
    } else if (moment(this.Tournament.StartDate, "YYYY-MM-DD").isAfter(moment(this.Tournament.EndDate, "YYYY-MM-DD"))) {
      if(this.Tournament.IsMultiday){
        let msg = "Tournament startdate should be before enddate";
        this.comonService.toastMessage(msg,2500,ToastMessageType.Error,ToastPlacement.Bottom);
        return false;
      }else{
        return true;
      }
    }
    else if (moment(this.Tournament.LastEnrolmentDate, "YYYY-MM-DD").isAfter(moment(this.Tournament.StartDate, "YYYY-MM-DD"))) {
      let msg = "Last enrolmentdate should be before startdate";
      this.comonService.toastMessage(msg,2500,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    } 
    else if(moment(this.Tournament.LastWithdrawalDate, "YYYY-MM-DD").isAfter(moment(this.Tournament.StartDate, "YYYY-MM-DD"))) {
        let msg = "Withdrawndate should be before startdate";
        this.comonService.toastMessage(msg,2500,ToastMessageType.Error,ToastPlacement.Bottom);
        return false;
    }
    
     else if (this.Tournament.UmpireType == "coach") {
      if (this.UmpireKey == "" || this.UmpireKey == undefined) {
        let msg = "Please select coach for tournment";
        this.comonService.toastMessage(
          msg,
          2500,
          ToastMessageType.Error,
          ToastPlacement.Bottom
        );
        return false;
      } else {
        return true;
      }
    } else if (this.Tournament.UmpireType == "others") {
      if (this.Tournament.UmpireName == "") {
        let msg = "Please enter umpire/refree name for tournment";
        this.comonService.toastMessage(
          msg,
          2500,
          ToastMessageType.Error,
          ToastPlacement.Bottom
        );
        return false;
      } else {
        return true;
      }
    } else if (this.Tournament.UmpireType == "member") {
      if (this.MemberUmpire == "") {
        let msg = "Please enter umpire/refree name for tournment";
        this.comonService.toastMessage(
          msg,
          2500,
          ToastMessageType.Error,
          ToastPlacement.Bottom
        );
        return false;
      } else {
        return true;
      }
    } else if (
      this.Tournament.PrimaryEmail == "" ||
      this.primaryContact == "0" ||
      this.primaryContact == undefined
    ) {
      let msg = "Please enter valid contact details";
      this.comonService.toastMessage(
        msg,
        2500,
        ToastMessageType.Error,
        ToastPlacement.Bottom
      );
      return false;
    } else {
      return true;
    }
  }
  showToast(m: string, dur: number) {
    let toast = this.toastCtrl.create({
      message: m,
      duration: dur,
      position: "bottom",
    });
    toast.present();
  }
}

import { Component, Input } from "@angular/core";
import {
  LoadingController,
  AlertController,
  ToastController,
  NavController,
  Platform,
  ViewController,
} from "ionic-angular";
import { PopoverController } from "ionic-angular";

// import { PopoverPage } from '../../popover/popover';

import { Storage } from "@ionic/storage";
// import { Dashboard } from './../../dashboard/dashboard';
import { Http, Headers, RequestOptions } from "@angular/http";
import * as $ from "jquery";
import { IonicPage } from "ionic-angular";

import { ActionSheetController } from "ionic-angular";
import { Clipboard } from "@ionic-native/clipboard";
import { SharedServices } from "../../../services/sharedservice";
import { FirebaseService } from "../../../../services/firebase.service";
import { CommonService } from "../../../../services/common.service";

/**
 * Generated class for the ComposeemialPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-composeemial",
  templateUrl: "composeemial.html",
})
export class ComposeemialPage {
  //content:Content;
  returnKey: any;
  parentClubEmail: string;
  parentClubName: string;
  clubShortName: "";
  clubName: "";
  themeType: number;
  isAndroid: boolean = false;
  parentClubKey: any;
  selectedTab: string = "Recents";
  clubs: any;
  selectedClub: any;
  memberList = [];
  MemberListsForDeviceToken = [];
  activityObj = {
    $key: "",
    ActivityName: "",
    ActivityCode: "",
    AliasName: "",
    Coach: [],
    ActivityCategory: "",
    IsActive: true,
    IsEnable: false,
    IsExistActivityCategory: false,
  };
  selectedCoachName: any;
  session = [];
  selectedSession: "";
  notificationObj = {
    CreatedTime: "",
    Message: "",
    SendTo: "",
    SendBy: "",
    ComposeOn: "",
    Purpose: "",
    sendByRole: "",
    Status: "Unread",
    SessionName: "",
  };
  notificationObjForSesion = {
    CreatedTime: "",
    Message: "",
    SendTo: "",
    SendBy: "",
    ComposeOn: "",
    Purpose: "",
    sendByRole: "",
    Status: "Unread",
    SessionName: "",
  };
  emailObj = { Message: "", Subject: "" };
  isEmail = true;
  selectedActivityType = "";
  selectedCoach = "";
  types = [];
  coachs = [];
  sessionList = [];
  selectectedSessionObj = { Member: [] };
  allSessionMembers = [];
  currentSessionDetails: any;
  currentSessionMembers = [];
  numberOfPeopleToSend = 0;
  recentNotificationList = [];
  loading: any;
  parentClubDetails: any;

  deviceToken = [];
  blockIndex = -1;
  tempNotification = [];
  notification = [];
  currentLastIndex = 30;
  notificationCountDevider = 0;
  notificationCountreminder = 0;

  copiedText: any = "";
  constructor(
    private clipboard: Clipboard,
    public actionSheetCtrl: ActionSheetController,
    public viewController: ViewController,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private http: Http,
    public fb: FirebaseService,
    private storage: Storage,
    public navCtrl: NavController,
    public sharedservice: SharedServices,
    platform: Platform,
    public popoverCtrl: PopoverController
  ) {
    this.themeType = sharedservice.getThemeType();
    this.isAndroid = platform.is("android");
    this.storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        this.parentClubName = val.Name;
        this.parentClubEmail = val.EmailID;

        this.fb
          .getAllWithQuery("ParentClub/Type2/", {
            orderByKey: true,
            equalTo: this.parentClubKey,
          })
          .subscribe((data) => {
            this.parentClubDetails = data[0];

            this.emailObj.Message =
              "Dear All,\n\n\n\nSincerely Yours,\n" +
              this.parentClubDetails.ParentClubName +
              "\n" +
              "Ph:" +
              this.parentClubDetails.ContactPhone +
              "\n" +
              this.parentClubDetails.ParentClubAdminEmailID;
          });

        this.getClubList();
      }
    });
  }
  ionViewDidLoad() {}

  getClubList() {
    this.fb
      .getAllWithQuery("/Club/Type2/" + this.parentClubKey, {
        orderByChild: "IsEnable",
        equalTo: true,
      })
      .subscribe((data) => {
        this.MemberListsForDeviceToken = [];
        this.clubs = data;
        if (this.clubs.length != 0) {
          this.selectedClub = this.clubs[0].$key;
          //    for (var index = 0; index < this.clubs.length; index++) {
          // if (this.clubs[index].$key == this.selectedClub) {
          this.clubName = this.clubs[0].ClubName;
          this.clubShortName = this.clubs[0].ClubShortName;
          //  }

          // }
          this.getMemberList();
          this.initialGetActivityList();
          for (let i = 0; i < data.length; i++) {
            this.fb
              .getAll(
                "/DeviceToken/Member/" +
                  this.parentClubKey +
                  "/" +
                  this.clubs[i].$key +
                  "/"
              )
              .subscribe((token) => {
                for (let j = 0; j < token.length; j++) {
                  //patch
                  //Due to insufficient time given to devloper
                  token[j].ClubKey = this.clubs[i].$key;
                  this.MemberListsForDeviceToken.push(token[j]);
                }
              });
          }
        }
      });
  }
  initialGetActivityList() {
    this.fb
      .getAll("/Activity/" + this.parentClubKey + "/" + this.selectedClub + "/")
      .subscribe((data) => {
        this.types = data;
        //this.selectedClub = data[0]
      });
  }
  getActivityList() {
    this.fb
      .getAll("/Activity/" + this.parentClubKey + "/" + this.selectedClub + "/")
      .subscribe((data) => {
        this.types = data;
        if (this.types.length != 0) {
          this.selectedActivityType = this.types[0].$key;
          this.activityObj = this.types[0];
          this.getCoachListForGroup();
        }
      });
  }

  getCoachListForGroup() {
    this.coachs = [];
    if (this.activityObj.Coach != undefined) {
      this.coachs = this.commonService.convertFbObjectToArray(
        this.activityObj.Coach
      );
      //this.selectedCoach = this.coachs[0].CoachKey;
      //this.selectedCoachName = this.coachs[0].FirstName + " " + this.coachs[0].MiddleName + " " + this.coachs[0].LastName;
      this.getSessionList();
    } else {
      this.selectedCoach = "";
      this.selectedCoachName = "";
      this.coachs = [];
    }
  }

  getSessionList() {
    this.fb
      .getAll(
        "/Session/" +
          this.parentClubKey +
          "/" +
          this.selectedClub +
          "/" +
          this.selectedCoach +
          "/Group/"
      )
      .subscribe((data) => {
        this.numberOfPeopleToSend = 0;
        this.session = [];
        for (let i = 0; i < data.length; i++) {
          if (new Date(data[i].EndDate).getTime() > new Date().getTime()) {
            this.session.push(data[i]);
          }
        }

        this.sessionList = [];
        let sessionMembers = [];
        if (this.session.length != 0) {
          for (let i = 0; i < this.session.length; i++) {
            if (this.session[i].ActivityKey == this.selectedActivityType) {
              this.sessionList.push(this.session[i]);
              for (let k = 0; k < this.sessionList.length; k++) {
                let memberList = this.commonService.convertFbObjectToArray(
                  this.sessionList[k].Member
                );

                for (let i = 0; i < memberList.length; i++) {
                  let isExist = false;

                  for (let j = 0; j < sessionMembers.length; j++) {
                    if (sessionMembers[j].Key == memberList[i].Key) {
                      isExist = true;
                      break;
                    }
                  }
                  if (!isExist && memberList[i].IsActive) {
                    sessionMembers.push(memberList[i]);
                  }
                }
              }
              this.numberOfPeopleToSend = sessionMembers.length;
            }
          }
        }
        this.memberList = sessionMembers;
      });
  }

  filteredMember: Array<any> = [];
  notificationDetails: any = "";
  getMemberList() {
    this.fb
      .getAll("/Member/" + this.parentClubKey + "/" + this.selectedClub + "/")
      .subscribe((data: any) => {
        this.filteredMember = [];
        this.memberList = data;
        for (let memberIndex = 0; memberIndex < data.length; memberIndex++) {
          if (
            data[memberIndex].ParentKey == undefined ||
            data[memberIndex].ParentKey == ""
          ) {
            //this.memberList[memberIndex].$key;
            if (
              data[memberIndex].EmailID != "" &&
              data[memberIndex].EmailID != undefined &&
              data[memberIndex].IsActive
            ) {
              this.filteredMember.push({
                MemberEmail: this.memberList[memberIndex].EmailID,
                MemberName:
                  this.memberList[memberIndex].FirstName +
                  " " +
                  this.memberList[memberIndex].LastName,
              });
            }
          }
        }
        this.numberOfPeopleToSend = this.filteredMember.length;
      });
  }

  onChangeOfClub(club) {
    this.numberOfPeopleToSend = 0;
    this.selectedActivityType = "";
    this.selectedCoach = "";
    this.types = [];
    this.coachs = [];
    this.session = [];
    this.sessionList = [];
    this.selectedSession = "";

    this.getMemberList();
    this.initialGetActivityList();

    for (var index = 0; index < this.clubs.length; index++) {
      if (this.clubs[index].$key == this.selectedClub) {
        this.clubName = this.clubs[index].ClubName;
        this.clubShortName = this.clubs[index].ClubShortName;
      }
    }
  }
  onChangeActivity() {
    this.numberOfPeopleToSend = 0;
    this.selectedCoach = "";
    this.coachs = [];
    this.session = [];
    this.sessionList = [];
    this.selectedSession = "";

    if (
      this.selectedActivityType != undefined &&
      this.selectedActivityType != "" &&
      this.selectedActivityType != null &&
      this.selectedActivityType != "select"
    ) {
      for (let i = 0; i < this.types.length; i++) {
        if (this.selectedActivityType == this.types[i].$key) {
          this.activityObj = this.types[i];
        }
      }
      this.getCoachListForGroup();
    }
  }

  onChangeCoach() {
    this.numberOfPeopleToSend = 0;
    this.session = [];
    this.sessionList = [];
    this.selectedSession = "";
    this.getSessionList();
  }

  onChangeSession() {
    this.currentSessionDetails = {};
    this.currentSessionMembers = [];
    this.numberOfPeopleToSend = 0;
    let isPresent = false;

    this.currentSessionDetails = {};
    this.currentSessionMembers = [];
    for (let i = 0; i < this.sessionList.length; i++) {
      if (this.sessionList[i].$key == this.selectedSession) {
        this.currentSessionDetails = this.sessionList[i];
        break;
      }
    }

    let sessionMembers = this.commonService.convertFbObjectToArray(
      this.currentSessionDetails.Member
    );

    for (let i = 0; i < sessionMembers.length; i++) {
      if (sessionMembers[i].IsActive) {
        if (sessionMembers[i].ParentKey != "") {
          isPresent = false;
          for (let j = 0; j < this.currentSessionMembers.length; j++) {
            if (
              this.currentSessionMembers[j].Key == sessionMembers[i].ParentKey
            ) {
              if (this.currentSessionMembers[j].IsActive == true) {
                isPresent = true;
                break;
              } else {
                isPresent = false;
                break;
              }
            }
          }
          if (!isPresent) {
            this.currentSessionMembers.push(sessionMembers[i]);
          }
        } else {
          this.currentSessionMembers.push(sessionMembers[i]);
        }
      }
    }
    this.numberOfPeopleToSend = this.currentSessionMembers.length;
    this.memberList = this.currentSessionMembers;
  }
  cancel() {
    this.navCtrl.pop();
  }

  focusOutMessage() {
    this.emailObj.Subject = this.notificationObj.Message.split(/\s+/)
      .slice(0, 4)
      .join(" ");
  }
  sendEmail() {
    if (this.emailObj.Subject != "" && this.emailObj.Subject != undefined) {
      this.loading = this.loadingCtrl.create({
        content: "Please wait...",
      });
      let message = this.emailObj.Message;
      if (message != "") {
        let confirm = this.alertCtrl.create({
          title: "Email Alert",
          message: "Are you sure you want to send the email?",
          buttons: [
            {
              text: "No",
              handler: () => {
                console.log("Disagree clicked");
              },
            },
            {
              text: "Yes",
              handler: () => {
                this.email();
              },
            },
          ],
        });
        confirm.present();
      } else {
        let m = "Please Enter message";
        this.showToast(m);
      }
    } else {
      this.showToast("Please Enter Email Subject");
    }
  }
  checkEmail() {}
  email() {
    try {
      let notificationDetailsObjForMember = {
        ParentClubKey: this.parentClubKey,
        ClubKey: this.selectedClub,
        ClubName: this.clubName,
        ClubShortName: this.clubShortName,
        Message: this.emailObj.Message,
        Subject: this.emailObj.Subject,
        // SendTo: "",
        SendBy: "ClubAdmin",
        ComposeOn: new Date().getTime(),
        Purpose: "Notification",
        MemberKey: "",
        MemberName: "",
        MemberEmailId: "",
        Status: "Unread",
        Type: "",
      };
      let notificationDetailsObjForAdmin = {
        ParentClubKey: this.parentClubKey,
        ClubKey: this.selectedClub,
        ClubName: this.clubName,
        ClubShortName: this.clubShortName,
        Message: this.emailObj.Message,
        Subject: this.emailObj.Subject,
        // SendTo: "",
        SendBy: "ClubAdmin",
        Type: "",
        ComposeOn: new Date().getTime(),
        Purpose: "Notification",
        Member: [],
      };
      let notificationDetailsObjForMemberInner = {
        MemberKey: "",
        MemberName: "",
        MemberEmailId: "",
        Status: "Unread",
      };
      let emailFormembers = {
        Members: [],
        ImagePath: this.parentClubDetails.ParentClubAppIconURL,
        // FromEmail: "activitypro17@gmail.com",
        FromEmail: "beactive@activitypro.co.uk",
        FromName: this.parentClubName,
        ToEmail: this.parentClubEmail,
        ToName: this.parentClubName,
        CCName: this.parentClubName,
        CCEmail: this.parentClubEmail,
        Subject: this.emailObj.Subject,
        Message: this.emailObj.Message,
      };

      emailFormembers.Members = this.filteredMember;
      for (
        let memberIndex = 0;
        memberIndex < this.memberList.length;
        memberIndex++
      ) {
        if (
          this.memberList[memberIndex].ParentKey == undefined ||
          this.memberList[memberIndex].ParentKey == ""
        ) {
          if (
            this.memberList[memberIndex].EmailID != "" &&
            this.memberList[memberIndex].EmailID != undefined &&
            this.memberList[memberIndex].IsActive
          ) {
            notificationDetailsObjForAdmin.Member[
              this.memberList[memberIndex].$key
            ] = {
              MemberKey: this.memberList[memberIndex].Key,
              MemberName:
                this.memberList[memberIndex].FirstName +
                " " +
                this.memberList[memberIndex].LastName,
              MemberEmail: this.memberList[memberIndex].EmailID,
            };
          }
        }
      }

      let firebs = this.fb;
      let members = [];
      members = this.memberList;
      let pc = this.parentClubKey;
      let url = this.sharedservice.getEmailUrl();
      $.ajax({
        // url: url + "umbraco/surface/ActivityProSurface/SendEmailNotification/",
        //https://activitypro-nest-261607.appspot.com

        data: emailFormembers,
        type: "POST",
        success: function (respnse) {
          let key = firebs.saveReturningKey(
            "/EmailNotification/ParentClub/" + pc,
            notificationDetailsObjForAdmin
          );
          for (
            let memberIndex = 0;
            memberIndex < members.length;
            memberIndex++
          ) {
            if (
              members[memberIndex].ParentKey == undefined ||
              members[memberIndex].ParentKey == ""
            ) {
              if (
                members[memberIndex].EmailID != "" ||
                members[memberIndex].EmailID != undefined
              ) {
                notificationDetailsObjForMember.MemberKey =
                  members[memberIndex].$key;
                notificationDetailsObjForMember.MemberName =
                  members[memberIndex].FirstName +
                  " " +
                  members[memberIndex].LastName;
                notificationDetailsObjForMember.MemberEmailId =
                  members[memberIndex].EmailID;

                firebs.update(
                  key.toString(),
                  "/EmailNotification/Member/" +
                    pc +
                    "/" +
                    members[memberIndex].$key +
                    "/",
                  notificationDetailsObjForMember
                );
              }
            }
          }
        },
        error: function (xhr, status) {
          let key = firebs.saveReturningKey(
            "/EmailNotification/ParentClub/" + pc,
            notificationDetailsObjForAdmin
          );
          for (
            let memberIndex = 0;
            memberIndex < members.length;
            memberIndex++
          ) {
            if (
              members[memberIndex].ParentKey == undefined ||
              members[memberIndex].ParentKey == ""
            ) {
              if (
                members[memberIndex].EmailID != "" ||
                members[memberIndex].EmailID != undefined
              ) {
                notificationDetailsObjForMember.MemberKey =
                  members[memberIndex].$key;
                notificationDetailsObjForMember.MemberName =
                  members[memberIndex].FirstName +
                  " " +
                  members[memberIndex].LastName;
                notificationDetailsObjForMember.MemberEmailId =
                  members[memberIndex].EmailID;

                firebs.update(
                  key.toString(),
                  "/EmailNotification/Member/" +
                    pc +
                    "/" +
                    members[memberIndex].$key +
                    "/",
                  notificationDetailsObjForMember
                );
              }
            }
          }
        },
      });
      this.showToast("Mail sent successfully");
      this.emailObj.Message =
        "Dear All,\n\n\n\nSincerely Yours,\n" +
        this.parentClubDetails.ParentClubName +
        "\n" +
        "Ph:" +
        this.parentClubDetails.ContactPhone +
        "\n" +
        this.parentClubDetails.ParentClubAdminEmailID;
      this.emailObj.Subject = "";
      this.navCtrl.setRoot("Dashboard");
    } catch (ex) {
      this.loading.dismiss().catch(() => {});
    }
  }

  showToast(m: string) {
    let toast = this.toastCtrl.create({
      message: m,
      duration: 5000,

      position: "bottom",
      showCloseButton: true,
      closeButtonText: "Undo",
    });

    toast.present();
  }

  validate() {
    if (
      this.selectedCoach == "" ||
      this.selectedCoach == undefined ||
      this.selectedCoach == null
    ) {
      let message = "Select Coach";
      this.showToast(message);
      return false;
    }
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

  showAlert(item) {
    this.navCtrl.push("NotificationDetails", { NotificationDetail: item });
  }

  preContext = "";
  showBlock(index, data) {
    this.blockIndex = this.blockIndex == index ? -1 : index;
    this.preContext = JSON.parse(JSON.stringify(data));
  }

  copy(data) {
    this.clipboard.copy(data);
    this.showToast("Content Copied");
    console.log(this.clipboard.paste());
  }
  favorite(item) {
    console.log(item);
  }
}

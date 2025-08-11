import { Component } from "@angular/core";
import { Http } from "@angular/http";
import {
  ActionSheetController,
  AlertController,
  IonicPage,
  LoadingController,
  NavController,
  NavParams,
  Platform,
  PopoverController,
  Slides,
  ToastController,
  ViewController,
} from "ionic-angular";
import { CommonService } from "../../../../services/common.service";
import { FirebaseService } from "../../../../services/firebase.service";
import { Storage } from "@ionic/storage";
import { SharedServices } from "../../../services/sharedservice";
import * as $ from "jquery";

/**
 * Generated class for the MatchcomposePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-matchcompose",
  templateUrl: "matchcompose.html",
})
export class Matchcompose {
  header: String = "Notification";
  headerType: number = 1;
  MemberListsForDeviceToken = [];
  parentClubKey: any;
  clubName: "";
  selectedClub: any;
  clubShortName: "";
  emailObj = { Message: "", Subject: "" };
  parentClubDetails: any;
  parentClubEmail: string;
  parentClubName: string;
  filteredMember: Array<any> = [];
  memberList = [];
  loading: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public slides: Slides,
    public actionSheetCtrl: ActionSheetController,
    public viewController: ViewController,
    public commonService: CommonService,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private http: Http,
    public fb: FirebaseService,
    private storage: Storage,
    public sharedservice: SharedServices,
    platform: Platform,
    public popoverCtrl: PopoverController
  ) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad MatchcomposePage");
    let startslide = this.navParams.get("slideIndex");
    setTimeout(() => {
      this.slides.slideTo(startslide);
    }, 500);
  }
  slideChanged() {
    let index = this.slides.getActiveIndex();
    console.log(index);
    switch (index) {
      case 0: {
        this.header = "Notification";
        this.headerType = 1;
        break;
      }
      case 1: {
        this.header = "Email";
        this.headerType = 2;
        break;
      }
    }
  }

  // getClubList() {
  //   this.fb
  //     .getAllWithQuery("/Club/Type2/" + this.parentClubKey, {
  //       orderByChild: "IsEnable",
  //       equalTo: true,
  //     })
  //     .subscribe((data) => {
  //       this.MemberListsForDeviceToken = [];
  //       this.clubs = data;
  //       if (this.clubs.length != 0) {
  //         this.selectedClub = this.clubs[0].$key;
  //         //    for (var index = 0; index < this.clubs.length; index++) {
  //         // if (this.clubs[index].$key == this.selectedClub) {
  //         this.clubName = this.clubs[0].ClubName;
  //         this.clubShortName = this.clubs[0].ClubShortName;
  //         //  }

  //         // }
  //         this.getMemberList();
  //         this.initialGetActivityList();
  //         for (let i = 0; i < data.length; i++) {
  //           this.fb
  //             .getAll(
  //               "/DeviceToken/Member/" +
  //                 this.parentClubKey +
  //                 "/" +
  //                 this.clubs[i].$key +
  //                 "/"
  //             )
  //             .subscribe((token) => {
  //               for (let j = 0; j < token.length; j++) {
  //                 //patch
  //                 //Due to insufficient time given to devloper
  //                 token[j].ClubKey = this.clubs[i].$key;
  //                 this.MemberListsForDeviceToken.push(token[j]);
  //               }
  //             });
  //         }
  //       }
  //     });
  // }
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
}

import { Component, ViewChildren,ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, ModalController, ToastController, AlertController, Platform,FabContainer, ActionSheetController } from 'ionic-angular';
// import * as moment from 'moment';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../../services/firebase.service';
// import { forEach } from '@firebase/util';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import moment, { Moment } from 'moment';
import { CallNumber } from '@ionic-native/call-number';

// import { IonicPage } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'page-tournamentdetails',
  templateUrl: 'tournamentdetails.html',
})
export class TournamentDetailsPage {
  @ViewChild('fab')fab : FabContainer;

  parentClubKey: string;
  tournamentKey: string;
  members = [];
  currencyDetails: any;
  noOfMembersPaid = 0;
  Tournament =
    {
      $key: "",
      AgeGroup: '',
      TournamentName: '',
      TournamentType: "", //Single day || Half day || multiple day codes
      ClubKey: '',
      ClubName: '',
      LocationKey: "",
      LocationName: "",
      LocationType: '',
      MatchType: "",
      CreationDate: new Date().getTime(),
      Description: '',
      EndDate: new Date(),
      FullAmountForMember: '0.00',
      FullAmountForNonMember: '0.00',
      Grade: "6",
      IsActive: true,
      IsMultiday: false,
      LastEnrolmentDate: "",
      LastWithdrawalDate: "",
      ParentClubKey: '',
      PayLater: false,
      PerDayAmountForMember: '0.00',
      PerDayAmountForNonMember: '0.00',
      RatingGroup: "",
      StartDate: "",
      Season: "",
      UpdatedDate: new Date().getTime(),
      Activity: {},
      Group: null,
      PrimaryEmail: "",
      PrimaryPhone: null,
      SecondaryEmail: "",
      SecondaryPhone: 0,
      UmpireName: "",
      UmpireKey: "",
      UmpireType: "coach",
      AssistantUmpireName: "",
      AssistantUmpireKey: "",
      AssistantUmpireType: "coach",
      StartTime: '',
      EndTime: '',
      EarlyArrival: '',
    }
  paidMembers = [];
  totalAmount: number = 0;
  amountRecived: number = 0;
  membersPaid: any[];
  locationName = "";
  withDrawMembers = [];
  constructor(private callNumber: CallNumber, public actionSheetCtrl: ActionSheetController, public platform: Platform, public alertCtrl: AlertController, public navParams: NavParams, public navCtrl: NavController, public modalCtrl: ModalController, public comonService: CommonService, storage: Storage, public fb: FirebaseService, private toastCtrl: ToastController, ) {
    this.tournamentKey = this.navParams.get("TournamentKey");
    // storage.get('userObj').then((val) => {
    //   val = JSON.parse(val);
    //   if (val.$key != "") {
    //     this.parentClubKey = val.UserInfo[0].ParentClubKey;
    //     // console.log("tournamentKey: ", this.tournamentKey, ",parentClubKey: ", this.parentClubKey)
    //     this.getTournametDetails(this.tournamentKey, this.parentClubKey);
    //   }
    // })
    storage.get('Currency').then((val) => {
      this.currencyDetails = JSON.parse(val);
    })
    
    
  }

  ionViewWillEnter() {
    this.tournamentKey = this.navParams.get("TournamentKey");
    this.parentClubKey = this.navParams.get("ParentClubKey");
    if (this.tournamentKey && this.parentClubKey) {
      // console.log("tournamentKey: ", this.tournamentKey, ",parentClubKey: ", this.parentClubKey)
      this.getTournametDetails(this.tournamentKey, this.parentClubKey)
    }
  }

  ionViewDidLeave(){
    this.fab.close();
  }
  // -----------methods
  async getTournametDetails(tournamentKey, parentClubKey) {
    this.members = [];
    this.paidMembers = [];
    this.withDrawMembers = [];
    this.totalAmount = 0;
    this.amountRecived = 0
    this.noOfMembersPaid = 0

    const tournmentDetsObs$ = this.fb.getAllWithQuery("Tournament/" + parentClubKey, { orderByKey: true, equalTo: tournamentKey })
      .subscribe(async data => {
        tournmentDetsObs$.unsubscribe();
        this.withDrawMembers = [];
        this.paidMembers = [];
        this.members = [];
        let temp = data[0]
        if (data[0].Location) {
          this.locationName = data[0].Location.LocationName;
        }
        this.comonService.convertFbObjectToArray(temp.Group)
          .forEach(eachGroup => {
            if (eachGroup.Member) {
              this.comonService.convertFbObjectToArray(eachGroup.Member)
                .forEach(async member => {
                  if (member.IsActive) {
                    if(member.IsChild){
                      member.ParentKey = await this.sendFirebaseResp(`/Member/${member.ParentClubKey}/${member.ClubKey}/${member.Key}/ParentKey`);
                    }
                    this.members.push(member);
                    this.totalAmount = this.totalAmount + member.TotalFeesAmount * 1;
                    if (member.AmountPayStatus != 'Due') {
                      this.paidMembers.push(member)
                      if (member.AmountPayStatus == 'Paid') {
                        this.amountRecived = this.amountRecived + member.TotalFeesAmount * 1
                        this.noOfMembersPaid = this.noOfMembersPaid + 1;
                      }
                    }
                  } else {
                    if (member.AmountPayStatus != 'Due') {
                      this.withDrawMembers.push(member)
                    }
                  }
                });
            }
          });
        // element['MemberCount'] = membercount;
        this.Tournament = data[0]
        this.Tournament.StartDate = moment(this.Tournament.StartDate).format("DD MMM YYYY");
        this.members = this.comonService.sortingObjects(this.members, "FirstName");
        this.withDrawMembers = this.comonService.sortingObjects(this.withDrawMembers, "FirstName");
        console.log("this.Tournament:", this.Tournament, "Member", this.members)
      });
  }

  sendFirebaseResp(firebasereq:any){
    return this.fb.getPropValue(firebasereq);
  }

  delete() {
    let delalert = this.alertCtrl.create({
      title: 'Delete Tournament',
      message: 'Are you sure you want to remove the tournment?',
      buttons: [
        {
          text: "Cancel",
          role: 'cancel'

        },
        {
          text: 'Delete',
          handler: data => {
            this.deleteTournament()
          }
        }
      ]
    });
    delalert.present();
  }
  deleteTournament() {
    const tournamentKey = this.Tournament.$key
    this.comonService.convertFbObjectToArray(this.Tournament.Group).forEach(eachGroup => {
      // element.Group
      if (eachGroup.Member)
        this.comonService.convertFbObjectToArray(eachGroup.Member)
          .forEach(member => {
            this.fb.update(tournamentKey, "Member/" + member.ParentClubKey + "/"
              + member.ClubKey + "/" + member.Key + "/Tournament", { IsActive: false });
          });
    });
    this.fb.update(tournamentKey, "Tournament/" + this.parentClubKey, { IsActive: false });
    this.presentToast(this.Tournament.TournamentName + ' successfully deleted');
    this.navCtrl.pop()
  }

  showOptions(member) {
    let actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Update Payment',
          icon: this.platform.is('ios') ? "" : 'create',
          handler: () => {
            this.navCtrl.push("Updatetournmentpayment", { SelectedMember: member, TournmentDetails: this.Tournament });
          }
        },
        {
          text: 'Call',
          icon: this.platform.is('ios') ? "" : 'call',
          handler: () => {
            this.callMember(member);
          }
        },
        {
          text: 'Send Mail',
          icon: this.platform.is('ios') ? "" : 'mail',
          handler: () => {
            this.sendMailToMemver(member)

          }
        },
        {
          text: 'Send Notification',
          icon: this.platform.is('ios') ? "" : 'notifications',
          handler: () => {
            this.sendNotificationToMember(member)

          }
        },
        {
          text: 'Remove Member',
          icon: this.platform.is('ios') ? "" : 'trash',
          handler: () => {
            this.removeMember(member);
          }
        },
        {
          text: 'Cancel',
          icon: this.platform.is('ios') ? "" : 'close',
          role: 'cancel',
          handler: () => {

          }
        }
      ]
    });
    actionSheet.present();
  }


  addMemberToTournament() {
    this.navCtrl.push("AddMemberTournament", { TournamentKey: this.tournamentKey, Tournament: this.Tournament, memberArr: this.members })
    console.log("addMemberToTournament")
  }
  editTournament() {
    this.navCtrl.push("CreateTournamentPage", { TournamentKey: this.tournamentKey })
    console.log("editTournament")
  }
  sendMail() {
    this.navCtrl.push("MailToMemberTournament", { TournamentKey: this.tournamentKey })
    console.log("MailToMemberTournament", { TournamentKey: this.tournamentKey })

  }
  sendNotification() {
    this.navCtrl.push("NotificationTournament", { TournamentKey: this.tournamentKey, Members: this.members, ParentClubKey: this.parentClubKey, tournamentName: this.Tournament.TournamentName })
    console.log("NotificationTournament", { TournamentKey: this.tournamentKey, Members: this.members, ParentClubKey: this.parentClubKey, tournamentName: this.Tournament.TournamentName })

  }
  printMemberSheet() {
    this.navCtrl.push("TournamentSheetPage", { TournamentKey: this.tournamentKey, Tournament: this.Tournament, memberArr: this.members })
    console.log("Tournament Sheet Page")
  }

  // // member Specific methods
  // markAsPaid(member) {
  //   let name = member.FirstName + " " + member.LastName;
  //   let paidalert = this.alertCtrl.create({
  //     title: 'Mark As Paid',
  //     message: ' Are you sure to mark ' + name + ' as paid for ' + this.Tournament.TournamentName + ' ?',
  //     buttons: [
  //       {
  //         text: "No",
  //         role: 'cancel'

  //       },
  //       {
  //         text: 'Yes',
  //         handler: data => {
  //           if (member.AmountPayStatus == "Pending Verification" || member.AmountPayStatus == "Pending Verification ") {
  //             this.fb.update(member.Key, "/Tournament/" + this.parentClubKey + "/" + this.tournamentKey +
  //               "/Group/" + member.ActiveGroupKey + "/Member/", { AmountPayStatus: 'Paid' });

  //             this.fb.update(this.tournamentKey, "Member/" + this.parentClubKey + "/" +
  //               member.ClubKey + "/" + member.Key + "/Tournament", { AmountPayStatus: 'Paid' });

  //             this.presentToast(name + " has been maked as paid")
  //           }
  //         }
  //       }
  //     ]
  //   });
  //   paidalert.present();

  // }
  removeMember(member) {
    let name = member.FirstName + " " + member.LastName;
    let removeMember = this.alertCtrl.create({
      title:'Remove Member',
      message: ' Are you sure to remove ' + name + ' from ' + this.Tournament.TournamentName + ' ?',
      buttons: [
        {
          text: "No",
          role: 'cancel'

        },
        {
          text: 'Yes',
          handler: data => {
            //if (member.AmountPayStatus != "Paid") {
              this.fb.update(member.Key, "/Tournament/" + this.parentClubKey + "/" + this.tournamentKey +
                "/Group/" + member.ActiveGroupKey + "/Member/", { IsActive: false });

              this.fb.update(this.tournamentKey,
                "Member/" + this.parentClubKey + "/" +
                member.ClubKey + "/" + member.Key + "/Tournament", { IsActive: false })

              this.presentToast(name + " has been removed.")
            }
          //}
        }
      ]
    });
    removeMember.present();

  }
  callMember(member) {
    this.comonService.showLoader("Please wait");
    if ((member.IsChild)) {
      this.fb.getPropValue(`Member/${member.ParentClubKey}/${member.ClubKey}/${member.ParentKey}/PhoneNumber`).then((phno: any) => {
        this.comonService.hideLoader();
        if (phno && phno != 'n/a' && phno != '') {
          if (this.callNumber.isCallSupported()) {
            this.callNumber.callNumber(phno, true)
              .then(() => console.log())
              .catch(() => console.log());
          } else {
            this.comonService.toastMessage("Your device is not supporting to launch call dialer.", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
          }
        } else {
          this.comonService.toastMessage("PhoneNo not available.", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
        }
      })
    } else {
      this.fb.getPropValue(`Member/${member.ParentClubKey}/${member.ClubKey}/${member.Key}/PhoneNumber`).then((phno: any) => {
        this.comonService.hideLoader();
        if (phno && phno != 'n/a' && phno != '') {
          if (this.callNumber.isCallSupported()) {
            this.callNumber.callNumber(phno, true)
              .then(() => console.log())
              .catch(() => console.log());
          } else {
            this.comonService.toastMessage("Your device is not supporting to launch call dialer.", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
          }
        } else {
          this.comonService.toastMessage("PhoneNo not available.", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
        }
      })

    }
  }
  sendNotificationToMember(member) {
    let temp = [];
    temp.push(member)
    this.navCtrl.push("NotificationTournament", { TournamentKey: this.tournamentKey, Members: temp, ParentClubKey: this.parentClubKey, tournamentName: this.Tournament.TournamentName })
  }
  sendMailToMemver(member) {
    this.navCtrl.push("MailToMemberTournament", { TournamentKey: this.tournamentKey, Member: member })

    console.log(member)
  }
  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }
}

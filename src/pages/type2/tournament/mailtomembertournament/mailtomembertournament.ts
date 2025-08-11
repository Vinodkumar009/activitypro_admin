import { Storage } from '@ionic/storage';
// import { Platform, NavParams, ViewController } from "ionic-angular";
import { IonicPage, ToastController, AlertController, NavController } from 'ionic-angular';
import { Component } from '@angular/core';
import { ModalController, ViewController, Platform, NavParams } from 'ionic-angular';
import * as $ from 'jquery';
import { FirebaseService } from '../../../../services/firebase.service';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { SharedServices } from '../../../services/sharedservice';
@IonicPage()
@Component({
  selector: 'mailtomembertournament-page',
  templateUrl: 'mailtomembertournament.html',
  providers: [FirebaseService, CommonService]
})
export class MailToMemberTournament {
  memberList = [];
  parentClubKey = "";
  sessionDetails: any;
  selectedClub = "";
  clubDetails: any;
  parentClubDetails: any;
  emailObj = {
    Message: "",
    Subject: ""
  }
  numberOfPeople = "0 People";
  navigateFrom = "";
  campDetails: any;
  tournamentKey: any;
  members = [];
  tournament: any;
  parentClubName: any;
  MemberSpecific: any;
  constructor(public navCtrl: NavController, public alertCtrl: AlertController,
    private toastCtrl: ToastController, public sharedservice: SharedServices,
    public storage: Storage, public commonService: CommonService,
    public fb: FirebaseService, public platform: Platform, public params: NavParams,
    public viewCtrl: ViewController) {
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      this.parentClubName = val.Name;
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        this.getParentclubDetails();
      }
    }).then(data => {
      this.tournamentKey = this.params.get("TournamentKey");
      this.MemberSpecific = this.params.get('Member')
      console.log(this.MemberSpecific)
      if (this.tournamentKey && this.parentClubKey) {
        this.getTournamentMembers(this.tournamentKey)
      }
    })
    
  }

  getParentclubDetails() {
    const parentclub$Obs = this.fb.getAllWithQuery("ParentClub/Type2/", { orderByKey: true, equalTo: this.parentClubKey }).subscribe((data) => {
      parentclub$Obs.unsubscribe();
      if (data.length > 0) {
        this.parentClubDetails = data[0];
      }
    });
  }

  getTournamentMembers(tournamentKey) {
    const tournment$Obs = this.fb.getAllWithQuery("Tournament/" + this.parentClubKey, { orderByKey: true, equalTo: tournamentKey })
      .subscribe(data => {
        tournment$Obs.unsubscribe();
        this.members = [];
        if (data.length > 0) {
          this.tournament = data[0];
          if (this.MemberSpecific) {
            this.emailObj.Message = "Dear " + this.MemberSpecific.FirstName + ",\n\n\n\nSincerely Yours,\n" + this.parentClubName +
              "\n" + "Ph:" + this.tournament.PrimaryPhone + "\n" + this.tournament.PrimaryEmail;
          } else {
            this.emailObj.Message = "Dear All,\n\n\n\nSincerely Yours,\n" + this.parentClubName +
              "\n" + "Ph:" + this.tournament.PrimaryPhone + "\n" + this.tournament.PrimaryEmail;
          }


          this.commonService.convertFbObjectToArray(data[0].Group)
            .forEach(eachGroup => {
              this.commonService.convertFbObjectToArray(eachGroup.Member)
                .forEach(async(eachMember) => {
                  // if (eachMember.IsActive && eachMember.IsEnable && !eachMember.IsChild) {
                  if (eachMember.IsActive) {
                    if (this.MemberSpecific) {
                      if (eachMember.Key == this.MemberSpecific.Key) {
                        if ((eachMember.IsChild!=undefined && eachMember.IsChild!=null) && (eachMember.IsChild || eachMember.IsChild == 'true')) {
                          let firebase_parentkey = await this.sendFirebaseResp(`/Member/${eachMember.ParentClubKey}/${eachMember.ClubKey}/${eachMember.Key}/ParentKey`);
                          const parent_email = await this.sendFirebaseResp(`/Member/${eachMember.ParentClubKey}/${eachMember.ClubKey}/${firebase_parentkey}/EmailID`);
                          if(parent_email && parent_email!='' && parent_email!='n/a'){
                            this.members.push({
                              MemberEmail: parent_email,
                              MemberName: eachMember.FirstName + " " + eachMember.LastName
                            })
                          }
                        } else {
                          if(eachMember.EmailID && eachMember.EmailID!='' && eachMember.EmailID!='n/a'){
                            this.members.push({
                              MemberEmail: eachMember.EmailID,
                              MemberName: eachMember.FirstName + " " + eachMember.LastName
                            })
                          }
                        }
                        this.numberOfPeople = this.members.length + " Recipients";
                      }
                    } else {
                      if ((eachMember.IsChild!=undefined && eachMember.IsChild!=null) && (eachMember.IsChild || eachMember.IsChild == 'true')) {
                        let firebase_parentkey = await this.sendFirebaseResp(`/Member/${eachMember.ParentClubKey}/${eachMember.ClubKey}/${eachMember.Key}/ParentKey`);
                        const parent_email = await this.sendFirebaseResp(`/Member/${eachMember.ParentClubKey}/${eachMember.ClubKey}/${firebase_parentkey}/EmailID`);
                        if(parent_email && parent_email!='' && parent_email!='n/a'){
                          this.members.push({
                            MemberEmail: parent_email,
                            MemberName: eachMember.FirstName + " " + eachMember.LastName
                          })
                        }
                        
                        
                      } else {
                        if(eachMember.EmailID && eachMember.EmailID!='' && eachMember.EmailID!='n/a'){
                          this.members.push({
                            MemberEmail: eachMember.EmailID,
                            MemberName: eachMember.FirstName + " " + eachMember.LastName
                          })
                        }
                      }
                      this.numberOfPeople = this.members.length + " Recipients";
                    }
                  }
                })
            });
        }
      })
  }

  sendFirebaseResp(firebasereq:any){
    return this.fb.getPropValue(firebasereq);
  }

  // getParentEmailId(member): any {
  //   this.fb.getAllWithQuery("Member/" + member.ParentClubKey + "/" + member.ClubKey, { orderByKey: true, equalTo: member.ParentKey })
  //     .subscribe(data => {
  //       if (data.length > 0) {
  //         this.members.push({
  //           MemberEmail: data[0].EmailID,
  //           MemberName: member.FirstName + " " + member.LastName
  //         })
  //         this.numberOfPeople = this.members.length + " Recipients"
  //       }
  //     })
  // }


  dismiss() {
    this.navCtrl.pop()
  }

  validateEmail(){
    if (this.emailObj.Subject.trim() == "") {
      this.commonService.toastMessage("Please enter subject",3000,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }
    return true;
  }

  sendEmailToMembers() {
    if (this.validateEmail()) {
      let alert = this.alertCtrl.create({
        subTitle: 'Send email',
        message: 'Are you sure want to send email ?',
        buttons: [
          {
            text: "Don't send",
            role: 'cancel',
            handler: () => {

            }
          },
          {
            text: 'Send',
            handler: () => {
              this.sendEmails();
            }
          }
        ]
      });
      alert.present();
    } 
  }
  sendEmails() {
    let emailObj = {
      CCEmail: this.tournament.PrimaryEmail,
      CCName: this.parentClubName,
      FromEmail: "activitypro17@gmail.com",
      FromName: this.parentClubName,
      ImagePath: this.parentClubDetails.ParentClubAppIconURL,
      Members: this.members,
      Message: this.emailObj.Message,
      Subject: this.emailObj.Subject,
      ToEmail: this.tournament.PrimaryEmail,
      ToName: this.parentClubName,
    }

    const thisRef = this;

    let url = this.sharedservice.getEmailUrl();
    $.ajax({
      url: `${this.sharedservice.getnestURL()}/messeging/notificationemail`,
      data: emailObj,
      type: "POST",
      success: function (respnse) {
        thisRef.commonService.toastMessage("Mail sent successfully", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        thisRef.navCtrl.pop();
      },
      error: function (xhr, status) {
        console.log(xhr, status);
        thisRef.commonService.toastMessage("Mail sent failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
    });
    

  }


}
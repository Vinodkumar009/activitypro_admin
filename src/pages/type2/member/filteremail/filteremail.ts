import { Component, Input } from '@angular/core';
import { LoadingController, AlertController, ModalController, ToastController, NavController, } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
// import { Dashboard } from './../../dashboard/dashboard';
import * as $ from 'jquery';
import { IonicPage } from 'ionic-angular';
import { SharedServices } from '../../../services/sharedservice';
import { FirebaseService } from '../../../../services/firebase.service';
import { CommonService,ToastPlacement, ToastMessageType } from '../../../../services/common.service';
import gql from 'graphql-tag';
import { UsersModel } from '../../../../shared/model/users_list.model';
import { GraphqlService } from '../../../../services/graphql.service';
import { Club, UsersListInput } from '../model/member';

/**
 * Generated class for the FilteremailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-filteremail',
  templateUrl: 'filteremail.html',
})
export class Filteremail {
  selectedEmailCategory: number = 0;
  EmailFilterCategory = [
      { CategoryText: "Member", CategoryVal: 0 },
      { CategoryText: "Non Member", CategoryVal: 1 },
      { CategoryText: "Custom", CategoryVal: 2 }
  ]
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
  activityObj = { $key: '', ActivityName: '', ActivityCode: '', AliasName: '', Coach: [], ActivityCategory: '', IsActive: true, IsEnable: false, IsExistActivityCategory: false };
  selectedCoachName: any;
  session = [];
  selectedSession: "";
  notificationObj = { CreatedTime: "", Message: '', SendTo: '', SendBy: '', ComposeOn: '', Purpose: '', sendByRole: "", Status: "Unread", SessionName: '' };
  notificationObjForSesion = { CreatedTime: "", Message: '', SendTo: '', SendBy: '', ComposeOn: '', Purpose: '', sendByRole: "", Status: "Unread", SessionName: '' };
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
  venus_user_input:UsersListInput = {
    parentclub_id:"",
    club_id:"",
    member_type:1
  }

  copiedText: any = "";
  constructor(public commonService: CommonService, 
    public modalCtrl: ModalController, public loadingCtrl: LoadingController, 
    public alertCtrl: AlertController,
    public fb: FirebaseService, private storage: Storage, 
    public navCtrl: NavController, 
    public sharedservice: SharedServices, 
    public popoverCtrl: PopoverController,
    private graphqlService:GraphqlService) {
      this.themeType = sharedservice.getThemeType();
      this.storage.get('userObj').then((val) => {
          val = JSON.parse(val);
          if (val.$key != "") {
              this.parentClubKey = val.UserInfo[0].ParentClubKey;
              this.venus_user_input.parentclub_id = this.sharedservice.getPostgreParentClubId();
              this.storage.get("postgre_parentclub").then((parentclub) => {  
                if (parentclub != null) {
                    this.parentClubDetails = parentclub;
                }
              })
            //   this.fb.getAllWithQuery("ParentClub/Type2/", { orderByKey: true, equalTo: this.parentClubKey }).subscribe((data) => {
            //       this.parentClubDetails = data[0];
            //       this.parentClubName = data[0].ParentClubName;
            //       this.parentClubEmail = data[0].ParentClubAdminEmailID;
            //       this.emailObj.Message = "Dear All,\n\n\n\nSincerely Yours,\n" + this.parentClubDetails.ParentClubName + "\n" + "Ph:" + this.parentClubDetails.ContactPhone + "\n" + this.parentClubDetails.ParentClubAdminEmailID;
            //   });
              this.selectedEmailCategory = 0;
              this.getClubList();
              //this.getParentClubUsers();
          }
      });
  }
  ionViewDidLoad() {

  }

  getClubList() {
    //   this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
    //       this.MemberListsForDeviceToken = [];
    //       this.clubs = data;
    //       if (this.clubs.length != 0) {
    //           this.selectedClub = this.clubs[0].$key;
    //           this.clubName = this.clubs[0].ClubName;
    //           this.clubShortName = this.clubs[0].ClubShortName;
    //           this.getParentClubUsers();//this is used before postgre user api
    //       }
    //   });
    try{
        const clubQuery = gql`
        query getParentClubVenues($firebase_parentclubId:String!) {
          getParentClubVenues(firebase_parentclubId:$firebase_parentclubId){
            Id
            City
            ClubContactName
            ClubName
            ClubShortName
            CountryName
            PostCode
            ContactPhone
            ClubDescription
            sequence
            FirebaseId
          }
        }
      `;
      this.graphqlService.query(clubQuery,{firebase_parentclubId:this.parentClubKey},0).subscribe(({data}) => {
          this.clubs = JSON.parse(JSON.stringify(data["getParentClubVenues"] as Club[]));
          console.table('clubs data' + data["getParentClubVenues"]);
          if(this.clubs.length > 0){
            this.selectedClub = this.clubs[0].Id;
            this.venus_user_input.club_id = this.selectedClub;
            this.getParentClubUsers();
          } 
        },(err)=>{
          this.commonService.toastMessage("Clubs fetch failed",3000,ToastMessageType.Error,ToastPlacement.Bottom);
        });
      }catch(err){
        this.commonService.toastMessage("Clubs fetch failed",3000,ToastMessageType.Error,ToastPlacement.Bottom);
      }
  }
  
  filteredMember: Array<any> = [];
  TempMemberList: Array<any> = [];
  notificationDetails: any = "";
  

async getParentClubUsers(){
    this.commonService.showLoader("Fetching users...")
    const userQuery = gql`
    query getAllMembersByParentClubNMemberType($list_input: UsersListInput!) {
      getAllMembersByParentClubNMemberType(userInput:$list_input){
            Id
            FirebaseKey
            FirstName
            LastName
            ClubKey
            IsChild
            DOB
            EmailID
            EmergencyContactName
            EmergencyNumber
            Gender
            MedicalCondition
            ParentClubKey
            ParentKey
            PhoneNumber
            IsEnable
            IsActive
            PromoEmailAllowed
      }
    }
  `;//this.parentClubKey,MemberType:null,clubkey:this.selectedClub
    this.graphqlService.query(userQuery,{list_input:this.venus_user_input},0)
    .subscribe(({data}) => {
        const totUsers = data["getAllMembersByParentClubNMemberType"] as UsersModel[];
        this.filteredMember = [];
        this.TempMemberList = [];
        if (totUsers.length > 0) {
            //  for (let i = 0; i < totUsers.length; i++) {
            //     if (totUsers[i].IsActive) {
            //         totUsers[i]["isSelect"] = false;
            //         totUsers[i]["DisplayName"] = totUsers[i].FirstName + " " + totUsers[i].LastName;
            //         let age = this.commonService.getAgeFromYYYY_MM(totUsers[i].DOB);
            //         if (isNaN(age)) {
            //             totUsers[i]["Age"] = "N.A";
            //         } else {
            //             totUsers[i]["Age"] = age;
            //         }          
            //         this.TempMemberList.push(totUsers[i]); 
                    
            //     }
            
            //  }


            //this.TempMemberList = totUsers.map((user:UsersModel)=>{})

            //this.memberList = JSON.parse(JSON.stringify(this.TempMemberList));
            this.memberList = JSON.parse(JSON.stringify(totUsers));
        }                
        this.commonService.hideLoader();
        // this.UnmutatedChallenges = JSON.parse(JSON.stringify(this.Challenges))
        this.onChangeEmailFilter();
    },(err)=>{
      this.commonService.hideLoader();
      this.commonService.toastMessage("Users fetch failed",3000,ToastMessageType.Error,ToastPlacement.Bottom);
    });  
       
  }


  getMemberParentKey(user:any){
    return this.fb.getPropValue(`Member/${user.ParentClubKey}/${user.ClubKey}/${user.FirebaseKey}/ParentKey`);        
  }

  getParentEmail(user:any,parentKey:string){
    return this.fb.getPropValue(`Member/${user.ParentClubKey}/${user.ClubKey}/${parentKey}/EmailID`); 
  }


  onChangeEmailFilter() {
    //this.commonService.showLoader("Please wait");
    this.filteredMember = [];
    switch (Number(this.selectedEmailCategory)) {
        case 0:
            for (let memberIndex = 0; memberIndex < this.memberList.length; memberIndex++) {
                if (!this.memberList[memberIndex].IsChild && this.memberList[memberIndex].IsEnable && this.memberList[memberIndex].EmailID!= "-" ) {
                    this.filteredMember.push({
                        IsChild:false,
                        ParentId:"",
                        MemberId:this.memberList[memberIndex].Id, 
                        MemberEmail: this.memberList[memberIndex].EmailID, 
                        MemberName: this.memberList[memberIndex].FirstName + " " + this.memberList[memberIndex].LastName 
                    });  
                }
            }
            this.numberOfPeopleToSend = this.filteredMember.length;
            break;
        case 1:
            for (let memberIndex = 0; memberIndex < this.memberList.length; memberIndex++) {
              if (!this.memberList[memberIndex].IsChild && !this.memberList[memberIndex].IsEnable && this.memberList[memberIndex].EmailID!= "-"  && this.memberList[memberIndex].EmailID!= 'n/a') {
                this.filteredMember.push({
                    IsChild:false,
                    ParentId:"",
                    MemberId:this.memberList[memberIndex].Id, 
                    MemberEmail: this.memberList[memberIndex].EmailID, 
                    MemberName: this.memberList[memberIndex].FirstName + " " + this.memberList[memberIndex].LastName 
                });  
              }
            }
            this.numberOfPeopleToSend = this.filteredMember.length;
            break;
        case 2:
          this.numberOfPeopleToSend = this.memberList.length;
          this.gotoFilterMemberModal();
          break;
    }
    //this.commonService.hideLoader();
    
    this.commonService.toastMessage(`${this.numberOfPeopleToSend} users found`,2500,ToastMessageType.Success,ToastPlacement.Bottom);
}

  gotoFilterMemberModal() {
    let memberModal = this.modalCtrl.create("FiltermemberPage",{memberList:this.memberList});
    memberModal.onDidDismiss(async (data) => {
        console.log(data);
        this.numberOfPeopleToSend = data.selectedMembers.length;
        if(data.selectedMembers.length > 0){
            this.commonService.showLoader("Please wait");
            for(let member of data.selectedMembers){
                this.filteredMember.push({
                    //$key:member.FirebaseKey, MemberEmail: member.EmailID, MemberName: member.FirstName + " " + member.LastName 
                    IsChild:member.IsChild ? true:false,
                    ParentId:member.IsChild ? member.ParentKey:"",
                    MemberId:member.Id, 
                    MemberEmail:member.EmailID, 
                    MemberName: member.FirstName + " " + member.LastName
                });  
            } 
            this.commonService.hideLoader();
        }
        
        console.log(this.filteredMember);
    });
    memberModal.present();
  }
  
  
  onChangeOfClub(club) {
      this.numberOfPeopleToSend = 0;
      this.venus_user_input.club_id = this.selectedClub;
      this.getParentClubUsers();
  }



  
  cancel() {
      this.navCtrl.pop();
  }

  focusOutMessage() {
      this.emailObj.Subject = this.notificationObj.Message.split(/\s+/).slice(0, 4).join(" ");
  }
  sendEmail() {
      if (this.emailObj.Subject != "" && this.emailObj.Subject != undefined) {
          let message = this.emailObj.Message;
          if (message != "") {
              let confirm = this.alertCtrl.create({
                  title: 'Email Alert',
                  message: 'Are you sure you want to send the email?',
                  buttons: [
                      {
                          text: 'No',
                          handler: () => {
                              console.log('Disagree clicked');
                          }
                      },
                      {
                          text: 'Yes',
                          handler: () => {
                              this.email();
                          }
                      }
                  ]
              });
              confirm.present();
          }
          else {
              let msg = "Please enter message";
              this.commonService.toastMessage(msg,2500,ToastMessageType.Error,ToastPlacement.Bottom);
          }
      } else {
          this.commonService.toastMessage("Please enter email subject",2500,ToastMessageType.Error,ToastPlacement.Bottom);
      }

  }
  checkEmail() {

  }
  email() {
      try {
          // let notificationDetailsObjForMember = {
          //     ParentClubKey: this.parentClubKey,
          //     ClubKey: this.selectedClub,
          //     ClubName: this.clubName,
          //     ClubShortName: this.clubShortName,
          //     Message: this.emailObj.Message,
          //     Subject: this.emailObj.Subject,
          //     // SendTo: "",
          //     SendBy: "ClubAdmin",
          //     ComposeOn: new Date().getTime(),
          //     Purpose: "Notification",
          //     MemberKey: "",
          //     MemberName: "",
          //     MemberEmailId: "",
          //     Status: "Unread",
          //     Type: ""
          // };
          // let notificationDetailsObjForAdmin = {
          //     ParentClubKey: this.parentClubKey,
          //     ClubKey: this.selectedClub,
          //     ClubName: this.clubName,
          //     ClubShortName: this.clubShortName,
          //     Message: this.emailObj.Message,
          //     Subject: this.emailObj.Subject,
          //     // SendTo: "",
          //     SendBy: "ClubAdmin",
          //     Type: "",
          //     ComposeOn: new Date().getTime(),
          //     Purpose: "Notification",
          //     Member: []

          // };
          // let notificationDetailsObjForMemberInner = {
          //     MemberKey: "",
          //     MemberName: "",
          //     MemberEmailId: "",
          //     Status: "Unread"
          // }
          
          let emailFormembers = {
              Members: [],
              ImagePath: this.parentClubDetails.ParentClubAppIconURL,
              FromEmail: "info@activitypro.app",
              //FromEmail:"beactive@activitypro.co.uk",
              FromName: this.parentClubDetails.ParentClubName,
              ToEmail: this.parentClubDetails.ParentClubAdminEmailID,
              ToName: this.parentClubDetails.ParentClubName,
              CCName: this.parentClubDetails.ParentClubName,
              CCEmail: this.parentClubDetails.ParentClubAdminEmailID,
              Subject: this.emailObj.Subject,
              Message: this.emailObj.Message,
          }

          emailFormembers.Members = this.filteredMember;
          //return false;
          try{
            this.commonService.showLoader("Please wait");
            
            const email_mutation = gql`
              mutation sendNotificationEmail($emailInput: EmailNotification!) {
                sendNotificationEmail(emailInput: $emailInput)
              }` 
              
              const email_variable = { emailInput: emailFormembers };
              this.graphqlService.mutate(email_mutation, email_variable,0).subscribe((response)=>{
                let firebs = this.fb;
                let members = [];
                members = this.filteredMember; //this.memberList;
                let pc = this.parentClubKey;
                let url = this.sharedservice.getEmailUrl();
                this.commonService.hideLoader();
                this.commonService.toastMessage("Mail sent successfully",2500,ToastMessageType.Success, ToastPlacement.Bottom);
                this.emailObj.Message = "Dear All,\n\n\n\nSincerely Yours,\n" + this.parentClubDetails.ParentClubName + "\n" + "Ph:" + this.parentClubDetails.ContactPhone + "\n" + this.parentClubDetails.ParentClubAdminEmailID;
                this.emailObj.Subject = "";
                //this.navCtrl.setRoot("Dashboard");
                this.navCtrl.pop();
              },(err)=>{
                this.commonService.hideLoader();
                this.commonService.toastMessage("Email sent failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
              });   
          }catch(err){
            console.log(`${JSON.stringify(err)}`);
            this.commonService.hideLoader();
          }
      } catch (ex) {
        this.commonService.toastMessage("Email sent failed",2500,ToastMessageType.Error, ToastPlacement.Bottom);
        this.commonService.hideLoader();
      }
  }




  goToDashboardMenuPage() {
      this.navCtrl.setRoot("Dashboard");
  }


  presentPopover(myEvent) {
      let popover = this.popoverCtrl.create("PopoverPage");
      popover.present({
          ev: myEvent
      });
  }



  showAlert(item) {
      this.navCtrl.push("NotificationDetails", { "NotificationDetail": item });
  }


  preContext = '';
  showBlock(index, data) {
      this.blockIndex = (this.blockIndex == index) ? -1 : index;
      this.preContext = JSON.parse(JSON.stringify(data));
  }

  favorite(item) {
      console.log(item);
  }

}

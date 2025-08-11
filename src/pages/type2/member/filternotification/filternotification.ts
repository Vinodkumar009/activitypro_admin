import { Component, Input } from '@angular/core';
import { LoadingController, AlertController, ModalController, ToastController, NavController, } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
// import { Dashboard } from './../../dashboard/dashboard';
import * as $ from 'jquery';
import { IonicPage } from 'ionic-angular';
import { SharedServices } from '../../../services/sharedservice';
import { FirebaseService } from '../../../../services/firebase.service';
import { CommonService, ToastPlacement, ToastMessageType } from '../../../../services/common.service';
import gql from "graphql-tag";
import { GraphqlService } from '../../../../services/graphql.service';
import { IClubDetails } from '../../../../shared/model/club.model';
import { UsersModel } from '../../../../shared/model/users_list.model';
import { UsersListInput } from '../model/member';
import { ModuleTypes } from '../../../../shared/constants/module.constants';
/**
 * Generated class for the FilternotificationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-filternotification',
  templateUrl: 'filternotification.html',
})
export class Filternotification {
  selectedEmailCategory: number = 0;
  EmailFilterCategory = [
    { CategoryText: "Member", CategoryVal: 0 },
    { CategoryText: "Non Member", CategoryVal: 1 },
    { CategoryText: "Custom", CategoryVal: 2 }
  ]
  venus_user_input:UsersListInput = {
    parentclub_id:"",
    club_id:"",
    member_type:1
  }
  themeType: number;
  isAndroid: boolean = false;
  parentClubKey: any;
  clubs: IClubDetails[] = [];
  selectedClub: any;
  memberList:UsersModel[] = [];
  notificationObj = { CreatedTime: "", Message: '', SendTo: '', SendBy: '', ComposeOn: '', Purpose: '', sendByRole: "", Status: "Unread", SessionName: '' };
  notificationObjForSesion = { CreatedTime: "", Message: '', SendTo: '', SendBy: '', ComposeOn: '', Purpose: '', sendByRole: "", Status: "Unread", SessionName: '' };
  emailObj = { Message: "", Subject: "" };
  isEmail = true;
  
  currentSessionMembers = [];
  numberOfPeopleToSend = 0;
  recentNotificationList = [];
  blockIndex = -1;
  notification = [];
  currentLastIndex = 30;
  notificationCountDevider = 0;
  notificationCountreminder = 0;
  notification_input = {
    parentClubId:"" ,
    userIds: [],
    heading: "",
    message: "",
    moduleId: ModuleTypes.MEMBER
  }

  copiedText: any = "";
  constructor(public commonService: CommonService,
     public modalCtrl: ModalController, 
      public alertCtrl: AlertController, 
      private graphqlService: GraphqlService, 
      public fb: FirebaseService, private storage: Storage,
      public navCtrl: NavController, public sharedservice: SharedServices, 
      public popoverCtrl: PopoverController) {

    this.themeType = sharedservice.getThemeType();
    this.parentClubKey = this.sharedservice.getParentclubKey();
    this.notification_input.parentClubId = this.sharedservice.getPostgreParentClubId();
    this.notification_input.heading = "Hey user!"
    this.venus_user_input.parentclub_id = this.sharedservice.getPostgreParentClubId();
    this.getClubList();
    this.selectedEmailCategory = 0;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FilternotificationPage');
  }

  getClubList() {
    const clubs_input = {
      parentclub_id:this.sharedservice.getPostgreParentClubId(),
      user_postgre_metadata:{
        UserMemberId:this.sharedservice.getLoggedInId()
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
              this.clubs = res.data.getVenuesByParentClub as IClubDetails[];
              //console.log("clubs lists:", JSON.stringify(this.clubs));
              if(this.clubs.length > 0){
                this.numberOfPeopleToSend
                this.selectedClub = this.clubs[0].Id;
                this.venus_user_input.club_id = this.selectedClub;
                this.getMemberList();
              }
            },
           (error) => {
            this.commonService.toastMessage("Clubs fetch failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
            console.error("Error in fetching:", error);
           })
  }

  

  onChangeOfClub(club) {
    this.numberOfPeopleToSend = 0;
    this.venus_user_input.club_id = this.selectedClub;
    this.getMemberList();
  }

  filteredMember: Array<any> = [];
  TempMemberList: Array<any> = [];
  notificationDetails: any = "";
  getMemberList() {
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
            this.memberList = JSON.parse(JSON.stringify(totUsers));
        }                
        this.commonService.hideLoader();
        this.onChangeEmailFilter();
    },(err)=>{
      this.commonService.hideLoader();
      this.commonService.toastMessage("Users fetch failed",3000,ToastMessageType.Error,ToastPlacement.Bottom);
    }); 

  }

  onChangeEmailFilter() {
    this.filteredMember = [];
    const members_map = new Map();
    switch (Number(this.selectedEmailCategory)) {
      case 0:
        this.memberList.filter((member)=>{
          const user_id = member.IsChild ? member.ParentKey:member.Id;
          if(!members_map.has(user_id) && member.IsEnable){
            members_map.set(user_id,member);
            this.notification_input.userIds.push(user_id);
          }
        });
        members_map.clear();
        break;
      case 1:
        this.memberList.filter((member)=>{
          const user_id = member.IsChild ? member.ParentKey:member.Id;
          if(!members_map.has(user_id) && !member.IsEnable){
            members_map.set(user_id,member);
            this.notification_input.userIds.push(user_id);
          }
        });
        members_map.clear()
        break;
      case 2:
        this.gotoFilterMemberModal();
    }

    this.numberOfPeopleToSend = this.notification_input.userIds.length;
  }

  gotoFilterMemberModal() {
    let filterDataObj = {};
    // filterDataObj["parentClubKey"] = this.parentClubKey;
    // filterDataObj["selectedClub"] = this.selectedClub;
    this.notification_input.userIds = [];
    let memberModal = this.modalCtrl.create("FiltermemberPage", { memberList: this.memberList});
    memberModal.onDidDismiss(data => {
      console.log(data);
      this.filteredMember = [];
      this.filteredMember = data.selectedMembers;
     
      if(data.selectedMembers.length > 0){
        const members_map = new Map();
        data.selectedMembers.forEach((member)=>{
          const user_id = member.IsChild ? member.ParentKey:member.Id;
          if(!members_map.has(user_id)){
            members_map.set(user_id,member);
            this.notification_input.userIds.push(user_id);
          }
        });
        this.numberOfPeopleToSend = this.notification_input.userIds.length;
        members_map.clear();
      }
    });
    memberModal.present();
  }

  

  focusOutMessage() {
    this.emailObj.Subject = this.notificationObj.Message.split(/\s+/).slice(0, 4).join(" ");
  }


  
  sendNotification() {
    if (this.notification_input.message == "") {
      let message = "Please enter notification message";
      this.commonService.toastMessage(message,2500,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }else{
      this.Send()
    }
  }


  Send() {
      let confirm = this.alertCtrl.create({
        title: 'Notification Alert',
        message: 'Are you sure you want to send the message?',
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
              this.notify();
            }
          }
        ]
      });
      confirm.present();
  }
  



  notify() {
    try {
      const notify_mutation = gql`
      mutation notifyGroupUsers($notifyInput: GroupUserNotify!) {
        notifyGroupUsers(input: $notifyInput)
      }` 

      const notifiy_variable = { notifyInput: this.notification_input };

      this.graphqlService.mutate(notify_mutation,notifiy_variable,0).subscribe((response)=>{
          const message = "Notification sent successfully.";
          this.commonService.toastMessage(message, 2500,ToastMessageType.Success,ToastPlacement.Bottom);
          this.navCtrl.pop();
      },(err)=>{
          this.commonService.toastMessage("Notification sent failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
      });
    }catch(err){
      this.commonService.toastMessage("Notification sent failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
    }
  }





  
}

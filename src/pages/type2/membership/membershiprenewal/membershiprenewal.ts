import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,ActionSheetController } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { Storage } from '@ionic/storage';
//import * as moment from 'moment';
import { HttpService } from '../../../../services/http.service';
import { SharedServices } from '../../../services/sharedservice';
import { AppType } from '../../../../shared/constants/module.constants';
import { API } from '../../../../shared/constants/api_constants';
import { GraphqlService } from '../../../../services/graphql.service';
import gql from "graphql-tag";
import { IClubDetails } from '../../../../shared/model/club.model';
import { CreateRenewalSetupDto, MembershipRenewalSetup } from '../dto/membershi.dto';
/**
 * Generated class for the MembershipModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-membershiprenewal',
  templateUrl: 'membershiprenewal.html',
  providers:[HttpService]
})
export default class MembershipRenewalPage {
  ParentClubKey: any;
  Venues = [];
  selectedClubKey:string = "";
  MembershipType;
  currencyDetails: any;
  renewal_setup:MembershipRenewalSetup;
  Renewal = {
    NoOfDays: 5,
    Email: {
      firstReminder: {is_avail:false,no_of_days:4},
      secondReminder: {is_avail:false,no_of_days:3},
      thirdReminder: {is_avail:false,no_of_days:2},
      fourthRemainder: {is_avail:false,no_of_days:1}
    },
    Notification: {
      notificationText: "",
      noOfDaysBefore: 7
    },
    Popup:true,
  };
  IsRenewalTypeSelected: any;
  IsAlreadyAdded: boolean = false;
  RenewalKey: string;
  //IsPopupActivated: boolean;
  postgre_parentclub_id:string = "";

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
     storage: Storage,
     public actionSheetCtrl: ActionSheetController,
     public comonService: CommonService, 
     private httpService:HttpService,
     public sharedservice: SharedServices,
     private graphqlService: GraphqlService,
      ) {

    // storage.get('userObj').then((val) => {
    //   val = JSON.parse(val);
    //   if (val.$key != "") {
    //     this.ParentClubKey = val.UserInfo[0].ParentClubKey;
    //   }
    //   this.selectedClubKey = this.navParams.get("ClubKey");
    //   console.log("ParentClubKey: ", this.ParentClubKey)
     
    //   this.getRenewalInfo()

    // }).catch(error => {
    // });
    // storage.get('Currency').then((val) => {
    //   this.currencyDetails = JSON.parse(val);
    // }).catch(error => {
    // });

    storage.get('postgre_parentclub').then((postgre_parentclub)=>{
      this.postgre_parentclub_id = postgre_parentclub.Id;
      this.getAllVenue();
    })
  }


  ionViewDidLoad() {

  }

  getAllVenue() {
    this.Venues = [];
    const clubs_input = {
    parentclub_id:this.postgre_parentclub_id,
      user_postgre_metadata:{
          UserMemberId:this.sharedservice.getLoggedInId()
      },
      user_device_metadata:{
          UserAppType:AppType.ADMIN_NEW,
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
        }`;
        this.graphqlService.query(clubs_query,{clubs_input: clubs_input},0)
        .subscribe((res: any) => {
        this.Venues = res.data.getVenuesByParentClub as IClubDetails[];
        console.log("clubs lists:", JSON.stringify(this.Venues));
        this.selectedClubKey = this.Venues[0].FirebaseId;
        console.log("selected club:", this.selectedClubKey);
        //this.getRenewalInfo();
    },
    (error) => {
            //this.commonService.hideLoader();
            console.error("Error in fetching:", error);
            this.comonService.toastMessage(error.message, 2500,ToastMessageType.Error, ToastPlacement.Bottom);
        // Handle the error here, you can display an error message or take appropriate action.
    }) 
}

  

  getRenewalInfo() {
    // this.fb.getAll("Membership/MembershipSetup/" + this.ParentClubKey + "/" + this.selectedClubKey +  "/MembershipRenewal").subscribe((data) => {
    //   if(data.length > 0){
    //     console.log(data)
    //     this.IsAlreadyAdded = true;
    //     this.Renewal.Email = data[0].Email
    //     this.Renewal.NoOfDays = data[0].NoOfDays
    //     this.Renewal.Notification = data[0].Notification
    //     this.RenewalKey = data[0].$key
    //     this.Renewal.Popup = data[0].Popup
    //   }
    // })
    const get_memberships_payload = {
      parentclubId:this.postgre_parentclub_id,
      clubId:this.Venues.find(venue => venue.FirebaseId === this.selectedClubKey).Id,
      device_id:this.sharedservice.getDeviceId(),
      action_type:0,
      device_type:this.sharedservice.getPlatform() == "android" ? 1:2,
      app_type:AppType.ADMIN_NEW,
      updated_by:this.sharedservice.getLoggedInId()
    }
    this.httpService.post(API.GET_MEMBERSHIP_RENEWEAL_SETUP,get_memberships_payload).subscribe((res: any) => {
      if(res.data && res.data.renewal_setup){
        this.renewal_setup = res.data.renewal_setup;
        this.IsAlreadyAdded = true;
        this.populateExistedRewal();
      }
     this.IsAlreadyAdded = true; 
    },
   (error) => {
        //this.commonService.hideLoader();
        console.error("Error in fetching:", error);
        this.comonService.toastMessage("No setups found", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
       // Handle the error here, you can display an error message or take appropriate action.
   })
  }

  populateExistedRewal() {
    this.Renewal.NoOfDays = this.renewal_setup.no_of_days;
    this.Renewal.Email.firstReminder.is_avail = this.renewal_setup.is_first_reminder_avail;
    this.Renewal.Email.firstReminder.no_of_days = this.renewal_setup.first_reminder;
    this.Renewal.Email.secondReminder.is_avail = this.renewal_setup.is_second_reminder_avail;
    this.Renewal.Email.secondReminder.no_of_days = this.renewal_setup.second_reminder;
    this.Renewal.Email.thirdReminder.is_avail = this.renewal_setup.is_third_reminder_avail;
    this.Renewal.Email.thirdReminder.no_of_days = this.renewal_setup.third_reminder;
    this.Renewal.Email.fourthRemainder.is_avail = this.renewal_setup.is_fourth_reminder_avail;
    this.Renewal.Email.fourthRemainder.no_of_days = this.renewal_setup.fourth_reminder;
    this.Renewal.Notification.notificationText = this.renewal_setup.notification_text;
    this.Renewal.Notification.noOfDaysBefore = this.renewal_setup.no_of_days_before;
  }


  addRenewalInfo() {
   // this.Renewal['IsPopupActivated'] = this.IsPopupActivated
    if (!this.IsAlreadyAdded && this.Renewal.NoOfDays && this.Renewal.Email.firstReminder  && this.Renewal.Email.secondReminder  
      && this.Renewal.Notification.noOfDaysBefore.toString() != '' && this.Renewal.Notification.notificationText ) {     
        console.log("Renewal", this.Renewal)
          this.createRenewalSetup();      
       }
      else if(this.IsAlreadyAdded && this.Renewal.NoOfDays && this.Renewal.Email.firstReminder  && this.Renewal.Email.secondReminder  
        && this.Renewal.Notification.noOfDaysBefore && this.Renewal.Notification.notificationText ) {
          console.log("Renewal", this.Renewal)
          this.updateRenewalSetup();
        } else if(!this.Renewal.NoOfDays || !this.Renewal.Email.firstReminder || !this.Renewal.Email.secondReminder  
          || !this.Renewal.Notification.noOfDaysBefore || !this.Renewal.Notification.notificationText ){
            this.comonService.toastMessage("Please enter all fields", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }   
  }

  
    createRenewalSetup() {
      try{
        this.comonService.commonAlert_V4("Confirmation", "Are you sure you want to add this setup?","Yes","No", (btn) => {
           let create_renewal_payload = new CreateRenewalSetupDto(this.Renewal);
            create_renewal_payload.updated_by = this.sharedservice.getLoggedInId();
            create_renewal_payload.parentclubId = this.postgre_parentclub_id,
            create_renewal_payload.clubId = this.Venues.find(venue => venue.FirebaseId === this.selectedClubKey).Id,
            create_renewal_payload.device_id = this.sharedservice.getDeviceId(),
            create_renewal_payload.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2,
            this.httpService.post(API.CREATE_MEMBERSHIP_RENEWEAL_SETUP,create_renewal_payload).subscribe((res: any) => {
              this.comonService.toastMessage("Renewal setup added successfully", 2500,ToastMessageType.Success,ToastPlacement.Bottom);
              this.navCtrl.pop();
            },
          (error) => {
                //this.commonService.hideLoader();
                console.error("Error in fetching:", error);
                this.comonService.toastMessage("Setup creation failed", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
          })
        })
      }catch(err){
        this.comonService.toastMessage("Setup creation failed", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
      }
      
    }

    updateRenewalSetup() {
      try{
        this.comonService.commonAlert_V4("Confirmation", "Are you sure you want to update this setup?","Yes","No", (btn) => {
          let update_renewal_payload = new CreateRenewalSetupDto(this.Renewal);
            update_renewal_payload.setup_id = this.renewal_setup.id;
            update_renewal_payload.updated_by = this.sharedservice.getLoggedInId();
            update_renewal_payload.parentclubId = this.postgre_parentclub_id,
            update_renewal_payload.clubId = this.Venues.find(venue => venue.FirebaseId === this.selectedClubKey).Id,
            update_renewal_payload.device_id = this.sharedservice.getDeviceId(),
            update_renewal_payload.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2,
          this.httpService.post(API.UPDATE_MEMBERSHIP_RENEWEAL_SETUP,update_renewal_payload).subscribe((res: any) => {
            this.comonService.toastMessage("Renewal information updated", 2500,ToastMessageType.Success,ToastPlacement.Bottom);
            this.navCtrl.pop();
          },
         (error) => {
              //this.commonService.hideLoader();
              console.error("Error in fetching:", error);
              this.comonService.toastMessage("Setup updation failed", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
         })
        })
      }catch(err){
        this.comonService.toastMessage("Setup updation failed", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
      }
    }

  }
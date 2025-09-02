import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController,ToastController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonService, ToastPlacement, ToastMessageType } from '../../../services/common.service';
import { DefaultMenus } from '../../services/defaultmenus';
import { Menu } from '../../services/sharedservice';
import gql from 'graphql-tag';
import {IonicPage } from 'ionic-angular';
import { Apollo } from 'apollo-angular';
import { HttpService } from '../../../services/http.service';
import { API } from '../../../shared/constants/api_constants';
import { AppType } from '../../../shared/constants/module.constants';
import { CheckParentclubEmailExistance } from './coach.model';
import { GraphqlService } from '../../../services/graphql.service';
@IonicPage()
@Component({
  selector: 'addcoach-page',
  templateUrl: 'addcoach.html',
  providers: [HttpService]
})

export class Type2AddCoach {
  themeType: number;
  selectedParentclubKey: string;
  loading: any;
  coachKey: any;
  userresponseDetails: any;
  language = [
    {LanguageName:'Danish',LanguageCode:'da'},
    {LanguageName:'Dutch (Belgium)',LanguageCode:'nl-be'},
    {LanguageName:'Dutch (Standard)',LanguageCode:'nl'},
    {LanguageName:'English (United Kingdom)',LanguageCode:'en-gb'},
    {LanguageName:'English (United States)',LanguageCode:'en-us'},
    {LanguageName:'French (Belgium)',LanguageCode:'fr-be'},
    {LanguageName:'French (Standard)',LanguageCode:'fr'},
    {LanguageName:'German (Standard)',LanguageCode:'de'},
    {LanguageName:'Hindi',LanguageCode:'hi'},
    {LanguageName:'Italian (Standard)',LanguageCode:'it'},
    {LanguageName:'Italian (Switzerland)',LanguageCode:'it-ch'},
    {LanguageName:'Portuguese (Portugal)',LanguageCode:'pt'},
    {LanguageName:'Russian',LanguageCode:'ru'},
    {LanguageName:'Spanish (Spain)',LanguageCode:'es'}, 
]
  userObj = {
    EmailID: "",
    Name: "",
    Password: "",
    RoleType: "",
    Type: "",
    UserType: "",
    CoachStatus: 1
  };
  userInfoObj = {
    ParentClubKey: "",
    ClubKey: "",
    CoachKey: ""
  }
  // coachDetailsObj = {
  //   ParentClubKey: "", FirstName: "", MiddleName: "", LastName: "", Gender: "", EmailID: "",
  //   Password: "", PhoneNumber: "", DOB: "", DBSNumber: "", RegistrationNumber: "",
  //   Recognition: "", ShortDescription: "", DetailDescription: "", IsActive: true,
  //   IsEnabled: true, IsVenueAssigned: false, Qualification: "", Title: "", CoachingExperience: "",
  //   PlayingExperience: "", Strengths: "", FavouriteShots: "", AliasName: "", IsAvailableOnline: false,CoachStatus: 1
  // }
  coachDetailsObj = {
    ParentClubKey: "", FirstName: "", MiddleName: "", LastName: "", Gender: "", EmailID: "",AllowLoyalty:false,
    Password: "", PhoneNumber: "", DOB: "", DBSNumber: "", RegistrationNumber: "", Language : '',
    Recognition: "", ShortDescription: "", DetailDescription: "", IsActive: true,
    IsEnabled: true, IsVenueAssigned: false, Qualification: "", Title: "", CoachingExperience: "",
    PlayingExperience: "", Strengths: "", FavouriteShots: "", AliasName: "", ProfileImageUrl:"", IsAvailableOnline: true,CoachStatus: 1
  }
  selectedLanguageCode: any;

  constructor(private apollo: Apollo,
    private httpService: HttpService,
    storage: Storage, public commonService: CommonService,
     public fb: FirebaseService, public navCtrl: NavController, 
     public sharedservice: SharedServices, 
     private graphqlService: GraphqlService,
     public popoverCtrl: PopoverController) {

    this.commonService.showLoader("Please wait...");
    this.selectedLanguageCode = 'en-gb'
  
    this.themeType = sharedservice.getThemeType();

    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      for (let user of val.UserInfo) {
        if (val.$key != "") {
          this.selectedParentclubKey = user.ParentClubKey;
        }
      }
      this.commonService.hideLoader();
    })
  }


  

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }
  coachObs$:any;


  //checking for the coach email across all the parentclubs
  checkCoachExistance = (emailid) => {
    const validate_email = new CheckParentclubEmailExistance();
    validate_email.parentclub_id = this.sharedservice.getPostgreParentClubId();
    validate_email.device_id = this.sharedservice.getDeviceId() || 'web';
      validate_email.updated_by = this.sharedservice.getLoggedInUserId() || 'system';
    validate_email.device_type = this.sharedservice.getPlatform() == "android" ? 1:2;
    validate_email.app_type = AppType.ADMIN_NEW;
    validate_email.email = emailid;
    return this.httpService.post(`${API.CHECK_PARENTCLUB_EMAIL_EXISTANCE}`, validate_email);
  }




  //check email validations
  async checkCoachCanSave(){
    if(this.coachDetailsObj.EmailID == ""){
      this.commonService.toastMessage("Please enter email id", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    }
    else if (this.validateEmail(this.coachDetailsObj.EmailID)) {
      //Check if email already existed in our db,if there don't allow to edit
        // this.coachObs$ = await this.fb.getAllWithQuery("Coach/Type2/" + this.selectedParentclubKey, { orderByChild: 'EmailID', equalTo: this.coachDetailsObj.EmailID }).subscribe((response:any)=>{
        //   console.log(response);
        //   this.coachObs$.unsubscribe();
        //   if (response.length > 0) {
        //     this.hideLoader();
        //     this.commonService.toastMessage("Email already in use", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        //     return false;
        //   } else {
        //     this.saveCoach();
        //   }
        // })
        this.checkCoachExistance(this.coachDetailsObj.EmailID).subscribe((res:any)=>{
            if(!res.data){ //not exists
              this.saveCoach();
            }else {
              this.commonService.toastMessage(`${res.message}`, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
            }
        })
    } else {
      this.commonService.toastMessage("Please enter valid email id", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    }
  }
  saveCoach() {
    try{
      if (this.coachDetailsObj.FirstName != "" && this.coachDetailsObj.LastName != "" && this.coachDetailsObj.Gender != "" && (String(this.coachDetailsObj.PhoneNumber).length >= 10 || String(this.coachDetailsObj.PhoneNumber).length < 11)) {
        this.coachDetailsObj.ParentClubKey = this.selectedParentclubKey;
        this.coachDetailsObj.Password = "tttttt";
        this.coachDetailsObj.CoachStatus = 1;
        this.coachDetailsObj.Language = this.selectedLanguageCode
    
        this.coachKey = this.fb.saveReturningKey("/Coach/Type2/" + this.selectedParentclubKey, this.coachDetailsObj);
    
        if (this.coachKey != undefined) {
          this.userObj.EmailID = this.coachDetailsObj.EmailID.toLowerCase();
          this.userObj.Name = this.coachDetailsObj.FirstName + " " +this.coachDetailsObj.LastName;
          this.userObj.Password = this.coachDetailsObj.Password;
          this.userObj.RoleType = "4";
          this.userObj.Type = "2";
          this.userObj.UserType = "2";
          this.userObj.CoachStatus = 1;
    
          this.userresponseDetails = this.fb.saveReturningKey("/User/Coach/", this.userObj);
    
          if (this.userresponseDetails != undefined) {
            this.userInfoObj.ParentClubKey = this.selectedParentclubKey;
            this.userInfoObj.ClubKey = "";
            this.userInfoObj.CoachKey = this.coachKey;
    
            this.fb.saveReturningKey("/User/Coach/" + this.userresponseDetails + "/UserInfo/", this.userInfoObj);
            const coachMenus = DefaultMenus.getCoachMenus();
            coachMenus.forEach((newmenu)=>{
              this.fb.saveReturningKey(`UserMenus/${this.userInfoObj.ParentClubKey}/${this.userresponseDetails}/Menu`, newmenu);
              console.log("subscribed in add coach");
            });
            
            this.saveInPostgres(this.coachKey)
          
            this.commonService.toastMessage("Saved successfully", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
            this.commonService.updateCategory("coach_list");
            this.navCtrl.pop();
          }
        }
      }else{
        
        this.commonService.toastMessage("Enter first 5 fields", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
    }catch(err){
      this.commonService.toastMessage("Something went wrong", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      console.log(err);
      
    }
    

  }

  saveInPostgres(coachfirebasekey){
    const data = {
      parentclub: this.coachDetailsObj.ParentClubKey,
      coach_firebase_id: coachfirebasekey,
      first_name: this.coachDetailsObj.FirstName,
      last_name: this.coachDetailsObj.LastName,
      middle_name: this.coachDetailsObj.MiddleName,
      gender: this.coachDetailsObj.Gender,
      email_id: this.coachDetailsObj.EmailID,
      password: this.coachDetailsObj.Password,
      dob: this.coachDetailsObj.DOB,
      phone_no: this.coachDetailsObj.PhoneNumber,
      profile_image: this.coachDetailsObj.ProfileImageUrl,
      qualification: this.coachDetailsObj.Qualification,
      recognition: this.coachDetailsObj.Recognition,
      alias_name: this.coachDetailsObj.AliasName,
      allow_loyalty: this.coachDetailsObj.AllowLoyalty,
      coach_status: this.coachDetailsObj.CoachStatus,
      coaching_experience: this.coachDetailsObj.CoachingExperience,
      playing_experience: this.coachDetailsObj.PlayingExperience,
      dbs_number: this.coachDetailsObj.DBSNumber,
      registration_no: this.coachDetailsObj.RegistrationNumber,
      strengths: this.coachDetailsObj.Strengths,
      title: this.coachDetailsObj.Title,
      short_description: this.coachDetailsObj.ShortDescription,
      detailed_description: this.coachDetailsObj.DetailDescription,
      favourite_shots: this.coachDetailsObj.FavouriteShots,
      is_available_online: this.coachDetailsObj.IsAvailableOnline,
      is_show_revenue: false,
      is_venue_assigned: false,
      language: this.coachDetailsObj.Language
    }
    
    const saveCoachMutation = gql`mutation saveCoachDeatils($coachCreateInput:CoachModel!){
      saveCoachDeatils(coachCreateInput:$coachCreateInput)
    }`;
    
    this.graphqlService.mutate(saveCoachMutation, {coachCreateInput:data}, 0).subscribe((res: any) => {
      
    }, (err) => {
      console.log(JSON.stringify(err));
    })
  }

  //checking email is valid
  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }



  cancelCoach() {
    this.navCtrl.pop();
  }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }

  
}



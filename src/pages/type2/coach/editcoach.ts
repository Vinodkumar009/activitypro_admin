import { Component } from '@angular/core';
import { NavController, AlertController, PopoverController, ToastController, Toast } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
// import { Dashboard } from './../../dashboard/dashboard';
import { IonicPage } from 'ionic-angular';
import { NavParams } from 'ionic-angular/navigation/nav-params';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonService, ToastPlacement, ToastMessageType } from '../../../services/common.service';
import { DefaultMenus } from '../../services/defaultmenus';
import { Menu } from '../../services/sharedservice';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { GraphqlService } from '../../../services/graphql.service';

@IonicPage()
@Component({
  selector: 'editcoach-page',
  templateUrl: 'editcoach.html'
})

export class Type2EditCoach {
  themeType: number;
  type: string = "";
  gender: string = "";
  coachInfo: any = "";
  isDisableEmail: boolean = true;
  coachLoginKey:string;
  current_email:string = "";
  coach_refresh_required:boolean = false;
  language = [
    { LanguageName: 'Danish', LanguageCode: 'da' },
    { LanguageName: 'Dutch (Belgium)', LanguageCode: 'nl-be' },
    { LanguageName: 'Dutch (Standard)', LanguageCode: 'nl' },
    { LanguageName: 'English (United Kingdom)', LanguageCode: 'en-gb' },
    { LanguageName: 'English (United States)', LanguageCode: 'en-us' },
    { LanguageName: 'French (Belgium)', LanguageCode: 'fr-be' },
    { LanguageName: 'French (Standard)', LanguageCode: 'fr' },
    { LanguageName: 'German (Standard)', LanguageCode: 'de' },
    { LanguageName: 'Hindi', LanguageCode: 'hi' },
    { LanguageName: 'Italian (Standard)', LanguageCode: 'it' },
    { LanguageName: 'Italian (Switzerland)', LanguageCode: 'it-ch' },
    { LanguageName: 'Portuguese (Portugal)', LanguageCode: 'pt' },
    { LanguageName: 'Russian', LanguageCode: 'ru' },
    { LanguageName: 'Spanish (Spain)', LanguageCode: 'es' },
  ]
  selectedLanguageCode: any = '';
  isMenusAvailable:boolean = false;
  constructor(public navCtrl: NavController, private apollo: Apollo,
    private alertCtrl: AlertController, 
    public commonService: CommonService,
    public sharedservice: SharedServices, 
    public popoverCtrl: PopoverController, 
    public navParams: NavParams, public fb: FirebaseService, 
    private graphqlService: GraphqlService) {
    this.themeType = sharedservice.getThemeType();
    this.coachInfo = this.navParams.get('coachInfo');
    this.current_email = this.coachInfo.EmailID;
    this.getCoachDetail(this.coachInfo.Id)
    console.log(this.coachInfo);
    this.getUserLoginData();
  }


  ionViewDidLoad() {
    
  }

  getCoachDetail(Id:string) {
    this.commonService.showLoader('Please wait...');
    const CoachFetchInput = {
      parentclub: this.sharedservice.getPostgreParentClubId(),
      id:this.coachInfo.Id
    };
          
    const coachQuery = gql`
      query fetchCoaches($coachFetchInput: CoachFetchInput!) {
            fetchCoaches(coachFetchInput: $coachFetchInput){
              middle_name,
              gender,
              allow_loyalty,
              phone_no,
              dob,
              dbs_number,
              registration_no,
              language,
              recognition,
              short_description,
              detailed_description,
              coach_firebase_id,
              is_venue_assigned,
              qualification,
              title,
              coaching_experience,
              playing_experience,
              strengths,
              favourite_shots,
              alias_name,
              is_available_online,
              coach_status,
              is_show_revenue
        }
      }
    `;                    
          
    return new Promise((resolve, reject) => {
      try{
            this.graphqlService.query(coachQuery, { coachFetchInput: CoachFetchInput }, 0).subscribe((res: any) => {
            this.commonService.hideLoader();
            if(res.data.fetchCoaches){
                  let coachDetail = res.data['fetchCoaches'][0]
                  this.coachInfo = {
                  ...this.coachInfo,
                  MiddleName: coachDetail.middle_name || '',
                  Gender: coachDetail.gender,
                  AllowLoyalty: coachDetail.allow_loyalty,
                  Password: coachDetail.password,
                  PhoneNumber: coachDetail.phone_no,
                  DOB: coachDetail.dob,
                  DBSNumber: coachDetail.dbs_number,
                  RegistrationNumber: coachDetail.registration_no,
                  Language : coachDetail.language,
                  Recognition: coachDetail.recognition,
                  ShortDescription: coachDetail.short_description,
                  DetailDescription: coachDetail.detailed_description,
                  IsVenueAssigned: coachDetail.is_venue_assigned,
                  Qualification: coachDetail.qualification,
                  Title: coachDetail.title,
                  CoachingExperience: coachDetail.coaching_experience,
                  PlayingExperience: coachDetail.playing_experience,
                  Strengths: coachDetail.strengths,
                  FavouriteShots: coachDetail.favourite_shots,
                  AliasName: coachDetail.alias_name,
                  IsAvailableOnline: coachDetail.is_available_online,
                  CoachStatus: coachDetail.coach_status,
                  IsShowRevenue: coachDetail.is_show_revenue
                  }
                  this.selectedLanguageCode = this.coachInfo.Language
                  this.coachInfo.IsShowRevenue = this.coachInfo.IsShowRevenue ? this.coachInfo.IsShowRevenue : false;
                  
                  this.coachInfo.IsAvailableOnline = this.coachInfo.IsAvailableOnline!=undefined ?  this.coachInfo.IsAvailableOnline:true;
                  if(!this.coachInfo.AllowLoyalty){
                    this.coachInfo.AllowLoyalty = false;
                  }                    
            }                
        },(error) => {
          this.commonService.hideLoader();
          reject(error);
        });
      }catch(error){
        this.commonService.hideLoader();
        console.log(error);
        reject(error);
      }            
    });
  }

  getUserLoginData(){
    this.fb.getAllWithQuery("User/Coach/", { orderByChild: 'EmailID', equalTo: this.coachInfo.EmailID }).subscribe((user) => {
      if(user.length > 0){
        this.coachLoginKey = user[0].$key;
        this.checkMenusAvailability(user[0]);
      }
    });
  }

  checkMenusAvailability(loginObj){
    const menuDataObs$ = this.fb.getAllWithQuery(`UserMenus/${this.coachInfo.ParentClubKey}`, { orderByKey: true, equalTo: loginObj.$key}).subscribe((menuData) =>{
      this.isMenusAvailable = menuData && menuData[0].Menu ? true:false;
      menuDataObs$.unsubscribe();
    });
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }
  cancelCoach() {
    this.navCtrl.pop();
  }

  update() {
    if (this.coachInfo.FirstName != "" && this.coachInfo.LastName != "" && this.coachInfo.Gender != "" && (String(this.coachInfo.PhoneNumber).length >= 10 || String(this.coachInfo.PhoneNumber).length < 11)) {
      this.fb.update(this.coachInfo.$key, "Coach/Type2/" + this.coachInfo.ParentClubKey, {
        FirstName: this.coachInfo.FirstName,
        LastName: this.coachInfo.LastName,
        Gender: this.coachInfo.Gender,
        EmailID: this.coachInfo.EmailID.trim().toLowerCase(),
        PhoneNumber: this.coachInfo.PhoneNumber,
        DOB: this.coachInfo.DOB,
        Language: this.selectedLanguageCode,
        DBSNumber: this.coachInfo.DBSNumber,
        RegistrationNumber: this.coachInfo.RegistrationNumber,
        Recognition: this.coachInfo.Recognition,
        SrtDescription: this.coachInfo.ShortDescription,
        Qualification: this.coachInfo.Qualification,
        Title: this.coachInfo.Title,
        CoachingExperience: this.coachInfo.CoachingExperience,
        PlayingExperience: this.coachInfo.PlayingExperience,
        Strengths: this.coachInfo.Strengths,
        FavouriteShots: this.coachInfo.FavouriteShots,
        AliasName: this.coachInfo.AliasName,
        AllowLoyalty:  this.coachInfo.AllowLoyalty,
        DetailDescription: this.coachInfo.DetailDescription,
        IsAvailableOnline: this.coachInfo.IsAvailableOnline,
        IsShowRevenue:this.coachInfo.IsShowRevenue
      });
      if(!this.isMenusAvailable){ // if the coach menus doesn't has Menu node then create with default coach menus
        const coachMenus = DefaultMenus.getCoachMenus();
        coachMenus.forEach((newmenu)=>{
          this.fb.saveReturningKey(`UserMenus/${this.coachInfo.ParentClubKey}/${this.coachLoginKey}/Menu`, newmenu);
          console.log("subscribed in edit caoch");
        });
      }
      this.updateInPostgres()
      this.commonService.toastMessage('Successfully updated',2500,ToastMessageType.Success,ToastPlacement.Bottom);
      this.coach_refresh_required = true;
      this.navCtrl.pop();
    } else {
      this.commonService.toastMessage('Enter first 5 fields',2500,ToastMessageType.Error,ToastPlacement.Bottom);
    }

  }

  updateInPostgres(){
    
    const data = {
      Id: this.coachInfo.Id,
      first_name: this.coachInfo.FirstName,
      last_name: this.coachInfo.LastName,
      gender: this.coachInfo.Gender,
      email_id: this.coachInfo.EmailID,
      dob: this.coachInfo.DOB,
      phone_no: this.coachInfo.PhoneNumber,
      qualification: this.coachInfo.Qualification,
      recognition: this.coachInfo.Recognition,
      alias_name: this.coachInfo.AliasName,
      allow_loyalty: this.coachInfo.AllowLoyalty,
      coach_status: this.coachInfo.CoachStatus,
      coaching_experience: this.coachInfo.CoachingExperience,
      playing_experience: this.coachInfo.PlayingExperience,
      dbs_number: this.coachInfo.DBSNumber,
      registration_no: this.coachInfo.RegistrationNumber,
      strengths: this.coachInfo.Strengths,
      title: this.coachInfo.Title,
      short_description: this.coachInfo.ShortDescription,
      detailed_description: this.coachInfo.DetailDescription,
      favourite_shots: this.coachInfo.FavouriteShots,
      is_available_online: this.coachInfo.IsAvailableOnline,
      is_show_revenue: this.coachInfo.IsShowRevenue,
      is_venue_assigned: false,
      language: this.selectedLanguageCode
    }
    const mutation = gql`mutation updateCoachDeatils($coachUpdateInput:CoachUpdateModel!){
      updateCoachDeatils(coachUpdateInput:$coachUpdateInput)
    }`;
    
    this.graphqlService.mutate(mutation, {coachUpdateInput:data}, 0)
      .subscribe(({ data }) => {
        this.sharedservice.setCanCoachSeeRevenue(this.coachInfo.IsShowRevenue);
      }, (err) => {
        console.log(JSON.stringify(err));
      })
  }
  coachData = [];
  coachObs$:any;
  async EditEmailPopUp() {
    this.isDisableEmail = false;
    let alert = this.alertCtrl.create({
      title: 'Update Email',
      inputs: [
        {
          name: 'email',
          placeholder: 'EmailID',
          type:'email'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
            this.isDisableEmail = true;
          }
        },
        {
          text: 'Update',
          handler: (data) => {
            if (this.validateEmail(data.email)) {
              // this.coachObs$ = this.fb.getAllWithQuery("Coach/Type2/" + this.coachInfo.ParentClubKey, { orderByChild: 'EmailID', equalTo: data.email.toLowerCase()}).subscribe((response:any)=>{
              //   console.log(response);
              //   this.coachObs$.unsubscribe();
              //   if (response.length > 0) {
              //     this.commonService.toastMessage("Email already in use", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
              //     return false;
              //   } else { 
              //     this.UpdateCoachEmail(data.email.toLowerCase());
              //   }
              // })
              this.checkCoachExistance(data.email.toLowerCase()).subscribe((res:any)=>{
                if(res.data && res.data.fetchCoaches.length > 0){
                  this.commonService.toastMessage("Email already in use", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
                }else {
                  this.UpdateCoachEmail(data.email.toLowerCase());
                }
              })
            } else {
              this.commonService.toastMessage("Please enter valid email id", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
              return false;
            }
          }
        }
      ]
    });
    alert.present();
  }


  //checking for the coach email across all the parentclubs
  checkCoachExistance = (emailid) => {
    //this.commonService.showLoader("Checking coach...");
    const coachQuery = gql`
    query fetchCoaches($coach:CoachFetchInput!) {
      fetchCoaches(coachFetchInput:$coach){
        Id
        first_name
        last_name
      }
    }
  `;
  return this.apollo
    .query({
      query: coachQuery,
      fetchPolicy: 'network-only',
      variables: {coach:{email_id:emailid}}
    })    
  }

  //checking email is valid
  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }


  UpdateCoachEmail(email: string) {
    let coachrefObs = this.fb.getAllWithQuery("User/Coach/", { orderByChild: 'EmailID', equalTo: this.current_email}).subscribe((res) => {
      coachrefObs.unsubscribe();
      if (res.length > 0) {
        this.fb.update(res[0].$key, "User/Coach/",{
          EmailID: email,
        })
        this.fb.update(this.coachInfo.$key, "Coach/Type2/" + this.coachInfo.ParentClubKey, {
          EmailID: email,
        })
        this.updateEmailInPostgres(email)
        this.commonService.toastMessage("Email updated successfully", 3000, ToastMessageType.Success, ToastPlacement.Bottom);
        this.coach_refresh_required = true;
        this.navCtrl.pop();
      }else{
        this.commonService.toastMessage("unable to update email", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
      }
    })

  }

  updateEmailInPostgres(email){
    const data = {
      Id: this.coachInfo.Id,
      email_id: email
    }
    const mutation = gql`mutation updateCoachDeatils($coachUpdateInput:CoachUpdateModel!){
      updateCoachDeatils(coachUpdateInput:$coachUpdateInput)
    }`;
    
    this.graphqlService.mutate(mutation, {coachUpdateInput:data}, 0)
      .subscribe(({ data }) => {
        
      }, (err) => {
        console.log(JSON.stringify(err));
      })
  }

  changeIsAvailableOnline(mode){
    console.log(mode)
  }

  ionViewWillLeave(){
    if(this.coach_refresh_required){
      this.commonService.updateCategory("coach_list");
    }
  }

 
}

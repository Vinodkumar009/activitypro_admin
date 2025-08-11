import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController, Platform } from 'ionic-angular';
import moment, { Moment } from 'moment';
import { FirebaseService } from '../../../../services/firebase.service';
import { SharedServices } from '../../../services/sharedservice';
import { CommonService, ToastPlacement, ToastMessageType } from '../../../../services/common.service';
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/operator/scan';
import { Observable } from 'rxjs';
import gql from "graphql-tag";
import { GraphqlService } from '../../../../services/graphql.service';
import { IMonthlySessionMainDets, MonthlySessionCreate } from './model/monthly_session_create.model';




/**
 * Generated class for the SessioninstallmentPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
// {SessionDetailsObject:this.sessionDetails,InstallmentSesionObject:this.installmentSessionObj}
@IonicPage()
@Component({
  selector: 'page-sessionmonthlycreationlist',
  templateUrl: 'sessionmonthlycreationlist.html',
})
export class SessionMonthlyCreationList {
  postgre_session_input:MonthlySessionCreate;
  installmentObj = {}; ///added by vinod
  ParentClubName:string = "";
  nestUrl:string = "";
  feesObject = {
    AmountForOneDayPerWeekForMember: '10.00',
    AmountForOneDayPerWeekForNonMember: '12.00',
    AmountForTwoDayPerWeekForMember: '',
    AmountForTwoDayPerWeekForNonMember: '',
    AmountForThreeDayPerWeekForMember: '',
    AmountForThreeDayPerWeekForNonMember: '',
    AmountForFourDayPerWeekForMember: '',
    AmountForFourDayPerWeekForNonMember: '',
    AmountForFiveDayPerWeekForMember: '',
    AmountForFiveDayPerWeekForNonMember: '',
    AmountForSixDayPerWeekForMember: '',
    AmountForSixDayPerWeekForNonMember: '',
    AmountForSevenDayPerWeekForMember: '',
    AmountForSevenDayPerWeekForNonMember: ''
  };

  sessionDetailsObject = {
    IsActive: true,
    SessionName: 'Session',
    StartDate: '',
    EndDate: '',
    StartTime: '16:00',
    Duration: '60',
    Days: '',
    GroupSize: '10',
    IsTerm: false,
    GroupCategory:"Monthly",
    Comments: '',
    CoachKey: '',
    ClubKey: '',
    ParentClubKey: '',
    PayByDate: "",
    GroupStatus:1,
    //Total fees for member
    CoachName: '',
    SessionType: '',
    ActivityKey: '',
    ActivityCategoryKey: '',
    FinancialYearKey: '',
    IsExistActivitySubCategory: false,
    ActivitySubCategoryKey: '',
    IsExistActivityCategory: false,
    NoOfWeeks: 0,
    PaymentOption: 101,
    IsAllMembertoEditAmendsFees: true,
    FreeSesionIntermsOfMonth: "3",
    NoOfMonthMustPay: "3",
    ImageUrl: "",
    Stripe_ProductId:"",
    Stripe_PlanId:"",
    SessionFee: '',
    ShowInAPKids:false,
    IsAllowGroupChat:false,
  };
  installments = [];
  term: any;

  currencyDetails: any;
  maxDate: string = "";
  days = [];

  DiscountArray = [
    {
      DiscountCode: "100",
      DiscountName: "3-Months Discount",
      IsActive: true,
      PercentageValue: "0",
      LevelType: "",
      AbsoluteValue: "0",
      IsAvailable:false
    },
    {
      DiscountCode: "101",
      DiscountName: "6-Months Discount",
      IsActive: true,
      PercentageValue: "0",
      LevelType: "",
      AbsoluteValue: "0",
      IsAvailable:false
    },
    {
      DiscountCode: "102",
      DiscountName: "12-Months Discount",
      IsActive: true,
      PercentageValue: "0",
      LevelType: "",
      AbsoluteValue: "0",
      IsAvailable:false
    }
  ];

  updated_by:string;
  constructor(storage: Storage, public fb: FirebaseService, 
    public sharedservice: SharedServices, 
    public commonService: CommonService, private toastCtrl: ToastController, 
    public navCtrl: NavController, public navParams: NavParams,
    public alertCtrl: AlertController,
    private graphqlService: GraphqlService,
    ) {
    const session_part1 = <IMonthlySessionMainDets>navParams.get('SessionDetailsObject');
    this.postgre_session_input = new MonthlySessionCreate(session_part1);
    this.postgre_session_input.session_postgre_fields.parentclub_id = this.sharedservice.getPostgreParentClubId();
    console.log(this.postgre_session_input);
    this.nestUrl = sharedservice.getnestURL();
    //this.days = this.postgre_session_input.days;
    console.log(this.sessionDetailsObject);
    this.sessionDetailsObject.PaymentOption = this.sessionDetailsObject.PaymentOption;
    
    storage.get('Currency').then((val) => {
      this.currencyDetails = JSON.parse(val);
    }).catch(error => {
    });
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.updated_by = val.$key;
        this.postgre_session_input.user_postgre_metadata = {
          UserMemberId:val.$key
        }
      }
    })
  }

  ionViewDidEnter() {
    
  }
  cancelSessionCreation() {
    this.navCtrl.pop();
  }

  showChatTermsAlert(){
    setTimeout(()=>{
      console.log(this.sessionDetailsObject.IsAllowGroupChat);
      if(this.sessionDetailsObject.IsAllowGroupChat){
        let alert = this.alertCtrl.create({
          title: 'Enable Chat',
          message: `${this.ParentClubName} is fully responsible for the content of the chat among the chat users. ActivityPro is not liable for any misuse of the chat facility as a platform provider`,
          buttons: [
            {
              text: "Agree: Enable Chat",
              handler: () => {}
            },
            {
              text: 'No: Disable Chat',
              role: 'cancel',
              handler: data => {
                this.sessionDetailsObject.IsAllowGroupChat = !this.sessionDetailsObject.IsAllowGroupChat;
              }
            }
          ]
        });
        alert.present();
      }
    },100)
  }

  validateInput() {
    let isValid: Boolean = true;;
    let message: string = "";
    switch (this.days.length) {
      case 1:
        {
          if (this.feesObject.AmountForOneDayPerWeekForMember == "" || this.feesObject.AmountForOneDayPerWeekForMember == undefined) {
            isValid = false;
            message = "Please enter one day session amount for member";
          }
          else if (this.feesObject.AmountForOneDayPerWeekForNonMember == "" || this.feesObject.AmountForOneDayPerWeekForMember == undefined) {
            isValid = false;
            message = "Please enter one day session amount for non member";
          }
          break;
        }
      case 2:
        {

          if (this.feesObject.AmountForOneDayPerWeekForMember == "" || this.feesObject.AmountForOneDayPerWeekForMember == undefined) {
            isValid = false;
            message = "Please enter one day session amount for member";
          }
          else if (this.feesObject.AmountForOneDayPerWeekForNonMember == "" || this.feesObject.AmountForOneDayPerWeekForMember == undefined) {
            isValid = false;
            message = "Please enter one day session amount for non member";
          }
          else if (this.feesObject.AmountForTwoDayPerWeekForMember == "" || this.feesObject.AmountForTwoDayPerWeekForMember == undefined) {
            isValid = false;
            message = "Please enter two day session amount for member";
          }
          else if (this.feesObject.AmountForTwoDayPerWeekForNonMember == "" || this.feesObject.AmountForTwoDayPerWeekForNonMember == undefined) {
            isValid = false;
            message = "Please enter two day session amount for non member";
          }
          break;
        }
      case 3:
        {
          if (this.feesObject.AmountForOneDayPerWeekForMember == "" || this.feesObject.AmountForOneDayPerWeekForMember == undefined) {
            isValid = false;
            message = "Please enter one day session amount for member";
          }
          else if (this.feesObject.AmountForOneDayPerWeekForNonMember == "" || this.feesObject.AmountForOneDayPerWeekForMember == undefined) {
            isValid = false;
            message = "Please enter one day session amount for non member";
          }
          else if (this.feesObject.AmountForTwoDayPerWeekForMember == "" || this.feesObject.AmountForTwoDayPerWeekForMember == undefined) {
            isValid = false;
            message = "Please enter two day session amount for member";
          }
          else if (this.feesObject.AmountForTwoDayPerWeekForNonMember == "" || this.feesObject.AmountForTwoDayPerWeekForNonMember == undefined) {
            isValid = false;
            message = "Please enter two day session amount for non member";
          }
          else if (this.feesObject.AmountForThreeDayPerWeekForMember == "" || this.feesObject.AmountForThreeDayPerWeekForMember == undefined) {
            isValid = false;
            message = "Please enter three day session amount for member";
          }
          else if (this.feesObject.AmountForThreeDayPerWeekForNonMember == "" || this.feesObject.AmountForThreeDayPerWeekForNonMember == undefined) {
            isValid = false;
            message = "Please enter three day session amount for non member";
          }
          break;
        }
      case 4:
        {
          if (this.feesObject.AmountForOneDayPerWeekForMember == "" || this.feesObject.AmountForOneDayPerWeekForMember == undefined) {
            isValid = false;
            message = "Please enter one day session amount for member";
          }
          else if (this.feesObject.AmountForOneDayPerWeekForNonMember == "" || this.feesObject.AmountForOneDayPerWeekForMember == undefined) {
            isValid = false;
            message = "Please enter one day session amount for non member";
          }
          else if (this.feesObject.AmountForTwoDayPerWeekForMember == "" || this.feesObject.AmountForTwoDayPerWeekForMember == undefined) {
            isValid = false;
            message = "Please enter two day session amount for member";
          }
          else if (this.feesObject.AmountForTwoDayPerWeekForNonMember == "" || this.feesObject.AmountForTwoDayPerWeekForNonMember == undefined) {
            isValid = false;
            message = "Please enter two day session amount for non member";
          }
          else if (this.feesObject.AmountForThreeDayPerWeekForMember == "" || this.feesObject.AmountForThreeDayPerWeekForMember == undefined) {
            isValid = false;
            message = "Please enter three day session amount for member";
          }
          else if (this.feesObject.AmountForThreeDayPerWeekForNonMember == "" || this.feesObject.AmountForThreeDayPerWeekForNonMember == undefined) {
            isValid = false;
            message = "Please enter three day session amount for non member";
          }
          else if (this.feesObject.AmountForFourDayPerWeekForMember == "" || this.feesObject.AmountForFourDayPerWeekForMember == undefined) {
            isValid = false;
            message = "Please enter four day session amount for member";
          }
          else if (this.feesObject.AmountForFourDayPerWeekForNonMember == "" || this.feesObject.AmountForFourDayPerWeekForNonMember == undefined) {
            isValid = false;
            message = "Please enter four day session amount for non member";
          }
          break;
        }
      case 5:
        {
          if (this.feesObject.AmountForOneDayPerWeekForMember == "" || this.feesObject.AmountForOneDayPerWeekForMember == undefined) {
            isValid = false;
            message = "Please enter one day session amount for member";
          }
          else if (this.feesObject.AmountForOneDayPerWeekForNonMember == "" || this.feesObject.AmountForOneDayPerWeekForMember == undefined) {
            isValid = false;
            message = "Please enter one day session amount for non member";
          }
          else if (this.feesObject.AmountForTwoDayPerWeekForMember == "" || this.feesObject.AmountForTwoDayPerWeekForMember == undefined) {
            isValid = false;
            message = "Please enter two day session amount for member";
          }
          else if (this.feesObject.AmountForTwoDayPerWeekForNonMember == "" || this.feesObject.AmountForTwoDayPerWeekForNonMember == undefined) {
            isValid = false;
            message = "Please enter two day session amount for non member";
          }
          else if (this.feesObject.AmountForThreeDayPerWeekForMember == "" || this.feesObject.AmountForThreeDayPerWeekForMember == undefined) {
            isValid = false;
            message = "Please enter three day session amount for member";
          }
          else if (this.feesObject.AmountForThreeDayPerWeekForNonMember == "" || this.feesObject.AmountForThreeDayPerWeekForNonMember == undefined) {
            isValid = false;
            message = "Please enter three day session amount for non member";
          }
          else if (this.feesObject.AmountForFourDayPerWeekForMember == "" || this.feesObject.AmountForFourDayPerWeekForMember == undefined) {
            isValid = false;
            message = "Please enter four day session amount for member";
          }
          else if (this.feesObject.AmountForFourDayPerWeekForNonMember == "" || this.feesObject.AmountForFourDayPerWeekForNonMember == undefined) {
            isValid = false;
            message = "Please enter four day session amount for non member";
          }else if (this.feesObject.AmountForFiveDayPerWeekForMember == "" || this.feesObject.AmountForFiveDayPerWeekForMember == undefined) {
            isValid = false;
            message = "Please enter five day session amount for member";
          }
          else if (this.feesObject.AmountForFiveDayPerWeekForNonMember == "" || this.feesObject.AmountForFiveDayPerWeekForNonMember == undefined) {
            isValid = false;
            message = "Please enter five day session amount for non member";
          }
          break
        }
      case 6:
        {
          if (this.feesObject.AmountForOneDayPerWeekForMember == "" || this.feesObject.AmountForOneDayPerWeekForMember == undefined) {
            isValid = false;
            message = "Please enter one day session amount for member";
          }
          else if (this.feesObject.AmountForOneDayPerWeekForNonMember == "" || this.feesObject.AmountForOneDayPerWeekForMember == undefined) {
            isValid = false;
            message = "Please enter one day session amount for non member";
          }
          else if (this.feesObject.AmountForTwoDayPerWeekForMember == "" || this.feesObject.AmountForTwoDayPerWeekForMember == undefined) {
            isValid = false;
            message = "Please enter two day session amount for member";
          }
          else if (this.feesObject.AmountForTwoDayPerWeekForNonMember == "" || this.feesObject.AmountForTwoDayPerWeekForNonMember == undefined) {
            isValid = false;
            message = "Please enter two day session amount for non member";
          }
          else if (this.feesObject.AmountForThreeDayPerWeekForMember == "" || this.feesObject.AmountForThreeDayPerWeekForMember == undefined) {
            isValid = false;
            message = "Please enter three day session amount for member";
          }
          else if (this.feesObject.AmountForThreeDayPerWeekForNonMember == "" || this.feesObject.AmountForThreeDayPerWeekForNonMember == undefined) {
            isValid = false;
            message = "Please enter three day session amount for non member";
          }
          else if (this.feesObject.AmountForFourDayPerWeekForMember == "" || this.feesObject.AmountForFourDayPerWeekForMember == undefined) {
            isValid = false;
            message = "Please enter four day session amount for member";
          }
          else if (this.feesObject.AmountForFourDayPerWeekForNonMember == "" || this.feesObject.AmountForFourDayPerWeekForNonMember == undefined) {
            isValid = false;
            message = "Please enter four day session amount for non member";
          }else if (this.feesObject.AmountForFiveDayPerWeekForMember == "" || this.feesObject.AmountForFiveDayPerWeekForMember == undefined) {
            isValid = false;
            message = "Please enter five day session amount for member";
          }
          else if (this.feesObject.AmountForFiveDayPerWeekForNonMember == "" || this.feesObject.AmountForFiveDayPerWeekForNonMember == undefined) {
            isValid = false;
            message = "Please enter five day session amount for non member";
          }else if (this.feesObject.AmountForSixDayPerWeekForMember == "" || this.feesObject.AmountForSixDayPerWeekForMember == undefined) {
            isValid = false;
            message = "Please enter six day session amount for member";
          }
          else if (this.feesObject.AmountForSixDayPerWeekForNonMember == "" || this.feesObject.AmountForSixDayPerWeekForNonMember == undefined) {
            isValid = false;
            message = "Please enter six day session amount for non member";
          }
          break
        }
      case 7:
        {
          if (this.feesObject.AmountForOneDayPerWeekForMember == "" || this.feesObject.AmountForOneDayPerWeekForMember == undefined) {
            isValid = false;
            message = "Please enter one day session amount for member";
          }
          else if (this.feesObject.AmountForOneDayPerWeekForNonMember == "" || this.feesObject.AmountForOneDayPerWeekForMember == undefined) {
            isValid = false;
            message = "Please enter one day session amount for non member";
          }
          else if (this.feesObject.AmountForTwoDayPerWeekForMember == "" || this.feesObject.AmountForTwoDayPerWeekForMember == undefined) {
            isValid = false;
            message = "Please enter two day session amount for member";
          }
          else if (this.feesObject.AmountForTwoDayPerWeekForNonMember == "" || this.feesObject.AmountForTwoDayPerWeekForNonMember == undefined) {
            isValid = false;
            message = "Please enter two day session amount for non member";
          }
          else if (this.feesObject.AmountForThreeDayPerWeekForMember == "" || this.feesObject.AmountForThreeDayPerWeekForMember == undefined) {
            isValid = false;
            message = "Please enter three day session amount for member";
          }
          else if (this.feesObject.AmountForThreeDayPerWeekForNonMember == "" || this.feesObject.AmountForThreeDayPerWeekForNonMember == undefined) {
            isValid = false;
            message = "Please enter three day session amount for non member";
          }
          else if (this.feesObject.AmountForFourDayPerWeekForMember == "" || this.feesObject.AmountForFourDayPerWeekForMember == undefined) {
            isValid = false;
            message = "Please enter four day session amount for member";
          }
          else if (this.feesObject.AmountForFourDayPerWeekForNonMember == "" || this.feesObject.AmountForFourDayPerWeekForNonMember == undefined) {
            isValid = false;
            message = "Please enter four day session amount for non member";
          }else if (this.feesObject.AmountForFiveDayPerWeekForMember == "" || this.feesObject.AmountForFiveDayPerWeekForMember == undefined) {
            isValid = false;
            message = "Please enter five day session amount for member";
          }
          else if (this.feesObject.AmountForFiveDayPerWeekForNonMember == "" || this.feesObject.AmountForFiveDayPerWeekForNonMember == undefined) {
            isValid = false;
            message = "Please enter five day session amount for non member";
          }else if (this.feesObject.AmountForSixDayPerWeekForMember == "" || this.feesObject.AmountForSixDayPerWeekForMember == undefined) {
            isValid = false;
            message = "Please enter six day session amount for member";
          }
          else if (this.feesObject.AmountForSixDayPerWeekForNonMember == "" || this.feesObject.AmountForSixDayPerWeekForNonMember == undefined) {
            isValid = false;
            message = "Please enter six day session amount for non member";
          }else if (this.feesObject.AmountForSevenDayPerWeekForMember == "" || this.feesObject.AmountForSevenDayPerWeekForMember == undefined) {
            isValid = false;
            message = "Please enter seven day session amount for member";
          }
          else if (this.feesObject.AmountForSevenDayPerWeekForNonMember == "" || this.feesObject.AmountForSevenDayPerWeekForNonMember == undefined) {
            isValid = false;
            message = "Please enter seven day session amount for non member";
          }
          break
        }
    }
    this.commonService.toastMessage(message,2500,ToastMessageType.Error);
    return isValid;
  }


  createSession() {

    if (this.validateInput()) {
      let confirm = this.alertCtrl.create({
        title: 'Create Monthly Group',
        message: 'Are you sure you want to create the session?',
        buttons: [
          {
            text: 'No',
            handler: () => {

            }
          },
          {
            text: 'Yes',
            handler: () => {
              this.createInstallmentSession();
            }
          }
        ]
      });
      confirm.present();
    }

  }

  createInstallmentSession() {
    this.installmentObj = {};
    const days_price_map = new Map()
    for (let key in this.feesObject) {
      
      if (this.feesObject.hasOwnProperty(key)) {
        let val = this.feesObject[key];

        switch (true) {
          case (key == "AmountForOneDayPerWeekForMember" && val != ""):
            {
               
              days_price_map.set(1, {mem_fee:val,non_mem_fee: this.feesObject["AmountForOneDayPerWeekForNonMember"]});
              break;
            }
          
          case (key == "AmountForTwoDayPerWeekForMember" && val != ""):
            {
              
              days_price_map.set(2, {mem_fee:val, non_mem_fee: this.feesObject["AmountForTwoDayPerWeekForNonMember"]});
              break;
            }
          case (key == "AmountForThreeDayPerWeekForMember" && val != ""):
            {
              
              days_price_map.set(3, {mem_fee:val,non_mem_fee:this.feesObject["AmountForThreeDayPerWeekForNonMember"]});
              break;
            }
          
          case (key == "AmountForFourDayPerWeekForMember" && val != ""):
            {
              days_price_map.set(4, {mem_fee:val,non_mem_fee:this.feesObject["AmountForFourDayPerWeekForNonMember"]});
              break;
            }
          case (key == "AmountForFiveDayPerWeekForMember" && val != ""):
            {
              days_price_map.set(5, {mem_fee:val,non_mem_fee:this.feesObject["AmountForFiveDayPerWeekForNonMember"]});
              break;
            }
          case (key == "AmountForSevenDayPerWeekForMember" && val != ""):
            {
              days_price_map.set(6, {mem_fee:val,non_mem_fee:this.feesObject["AmountForSixDayPerWeekForNonMember"]});
              break;
            }
          
          case (key == "AmountForSixDayPerWeekForMember" && val != ""):
            {
              days_price_map.set(7, {mem_fee:val,non_mem_fee:this.feesObject["AmountForSevenDayPerWeekForNonMember"]});
              break;
            }
        }
      }
    }
    this.postgre_session_input.pricing_plans = [];
    for (const [key, value] of days_price_map) {
      console.log(key, value);
      if(key == 1 && value.mem_fee && value.non_mem_fee){
        this.postgre_session_input.pricing_plans.push({
          noOfdays:1,
          member_price:value.mem_fee,
          non_member_price:value.non_mem_fee,
          //show_in_applus:this.sessionDetailsObject.ShowInAPKids
        })
      } 
      if(key == 2 && value.mem_fee && value.non_mem_fee){
        this.postgre_session_input.pricing_plans.push({
          noOfdays:2,
          member_price:value.mem_fee,
          non_member_price:value.non_mem_fee,
          //show_in_applus:this.sessionDetailsObject.ShowInAPKids
        })
      }
      if(key == 3 && value.mem_fee && value.non_mem_fee){
        this.postgre_session_input.pricing_plans.push({
          noOfdays:3,
          member_price:value.mem_fee,
          non_member_price:value.non_mem_fee,
          //show_in_applus:this.sessionDetailsObject.ShowInAPKids
        })
      }
      if(key == 4 && value.mem_fee && value.non_mem_fee){
        this.postgre_session_input.pricing_plans.push({
          noOfdays:4,
          member_price:value.mem_fee,
          non_member_price:value.non_mem_fee,
          //show_in_applus:this.sessionDetailsObject.ShowInAPKids
        })
      }
      if(key == 5 && value.mem_fee && value.non_mem_fee){
        this.postgre_session_input.pricing_plans.push({
          noOfdays:5,
          member_price:value.mem_fee,
          non_member_price:value.non_mem_fee,
          //show_in_applus:this.sessionDetailsObject.ShowInAPKids
        })
      }
      if(key == 6 && value.mem_fee && value.non_mem_fee){
        this.postgre_session_input.pricing_plans.push({
          noOfdays:6,
          member_price:value.mem_fee,
          non_member_price:value.non_mem_fee,
          //show_in_applus:this.sessionDetailsObject.ShowInAPKids
        })
      }
      if(key == 7 && value.mem_fee && value.non_mem_fee){
        this.postgre_session_input.pricing_plans.push({
          noOfdays:7,
          member_price:value.mem_fee,
          non_member_price:value.non_mem_fee,
          //show_in_applus:this.sessionDetailsObject.ShowInAPKids
        })
      }
    }
    
    
    this.createMonthlySession();

    
    //session create
    // let returnkey = this.fb.saveReturningKey("/Session/" + this.sessionDetailsObject.ParentClubKey + "/" + this.sessionDetailsObject.ClubKey + "/" + this.sessionDetailsObject.CoachKey + "/" + this.sessionDetailsObject.SessionType + "/", this.sessionDetailsObject);
    // this.fb.update((returnkey.toString()), "/Coach/Type2/" + this.sessionDetailsObject.ParentClubKey + "/" + this.sessionDetailsObject.CoachKey + "/Session/", this.sessionDetailsObject);
    // this.DiscountArray.forEach((discount) => {
    //   if(discount.IsAvailable){
    //     //delete discount["IsAvailable"]
    //     this.fb.saveReturningKey("/Session/" + this.sessionDetailsObject.ParentClubKey + "/" + this.sessionDetailsObject.ClubKey + "/" + this.sessionDetailsObject.CoachKey + "/" + this.sessionDetailsObject.SessionType + "/" + returnkey + "/" + "Discount" + "/", discount);
    //     this.fb.saveReturningKey("/Coach/Type2/" + this.sessionDetailsObject.ParentClubKey + "/" + this.sessionDetailsObject.CoachKey + "/Session/" + returnkey + "/" + "Discount/", discount);
    //   }
    // });
    // this.fb.update("Discount", "/Session/" + this.sessionDetailsObject.ParentClubKey + "/" + this.sessionDetailsObject.ClubKey + "/" + this.sessionDetailsObject.CoachKey + "/" + this.sessionDetailsObject.SessionType + "/" + returnkey + "/", this.DiscountArray);
    // this.fb.update("Discount", "/Coach/Type2/" + this.sessionDetailsObject.ParentClubKey + "/" + this.sessionDetailsObject.CoachKey + "/Session/" + returnkey + "/", this.DiscountArray);
    
    //this.createNupdateStripeDets(returnkey.toString());

  }



  createNupdateStripeDets(){}

  async createMonthlySession(){
    try{
      this.commonService.showLoader("Please wait");
      this.postgre_session_input.show_in_apkids = this.sessionDetailsObject.ShowInAPKids;
      this.postgre_session_input.group_chat_allowed = this.sessionDetailsObject.IsAllowGroupChat;
      this.postgre_session_input.capacity = Number(this.postgre_session_input.capacity);
      this.postgre_session_input.number_of_weeks = Number(this.postgre_session_input.number_of_weeks);
      this.postgre_session_input.group_status = Number(this.postgre_session_input.group_status)
      this.postgre_session_input.session_postgre_fields.coach_ids = [];
      this.postgre_session_input.session_postgre_fields.coach_ids.push(await this.getCoachIdsByFirebaseKeys([this.navParams.get('SessionDetailsObject').coach_id]));
      this.postgre_session_input.session_postgre_fields.activity_id = (await this.getActivityIdsByFirebaseKeys(this.navParams.get('SessionDetailsObject').activity_id));
      
      if(this.postgre_session_input.session_postgre_fields.activity_id == "" || this.postgre_session_input.session_postgre_fields.activity_id == undefined){
        this.commonService.hideLoader();
        this.commonService.toastMessage("Activities fetch failed",2500,ToastMessageType.Error);
        return false;
      }
      if(this.postgre_session_input.session_postgre_fields.coach_ids.length == 0){
        this.commonService.hideLoader();
        this.commonService.toastMessage("Coaches fetch failed",2500,ToastMessageType.Error);
        return false;
      }
      
      const school_ses_mutation = gql`
      mutation createMonthlySession($sessionInput: CreateMonthlySessionInput!) {
        createMonthlySession(createMonthlySessionInput: $sessionInput){
              id
              ClubDetails{
                Id
              }
              ActivityDetails{
                Id
              }
          }
      }` 
      
      const school_mutation_variable = { sessionInput: this.postgre_session_input };
        this.graphqlService.mutate(
          school_ses_mutation, 
          school_mutation_variable,
          0
        ).subscribe((response)=>{
          this.commonService.hideLoader();
          const message = "Session created successfully. Please add member(s) to the session.";
          this.commonService.toastMessage(message, 2500, ToastMessageType.Success,ToastPlacement.Bottom);
          this.navCtrl.remove(this.navCtrl.getActive().index - 1, 2);
          this.commonService.updateCategory("update_session_list");
          //this.reinitializeSession();
        },(err)=>{
          this.commonService.hideLoader();
          this.commonService.toastMessage("Session creation failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
        });
    }catch(err){
      this.commonService.hideLoader();
      this.commonService.toastMessage("Session creation failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
    }
     
  }


  getCoachIdsByFirebaseKeys(coach_ids):Promise<any>{
    return new Promise((res,rej)=>{
      const coach_query = gql`
      query getCoachesByFirebaseIds($coachIds: [String!]) {
        getCoachesByFirebaseIds(coachIds: $coachIds){
          Id
          first_name
          last_name
          coach_firebase_id
         }
      }`
      const coach_query_variables = {coachIds: coach_ids};
      this.graphqlService.query(
          coach_query, 
          coach_query_variables,
          0
      ).subscribe((response)=>{
          res(response.data["getCoachesByFirebaseIds"][0]["Id"]);
      },(err)=>{
          rej(err);
      }); 
    })
    
  }

  getActivityIdsByFirebaseKeys(activity_ids):Promise<any>{
    return new Promise((res,rej)=>{
      const activity_query =  gql`
      query getActivityByFirebaseIds($activityIds: [String!]) {
        getActivityByFirebaseIds(activityIds: $activityIds){
          Id
          FirebaseActivityKey
          ActivityCode
          ActivityName
        }  
      }`
      const activity_query_variables =  {activityIds: activity_ids};
      this.graphqlService.query(
        activity_query,
        activity_query_variables,
        0 
        ).subscribe((response)=>{
        res(response.data["getActivityByFirebaseIds"][0]["Id"]);
      },(err)=>{
         rej(err);
      }); 
    })           
  }

  

  
  onChangeOfMemberAmount(){
    return Observable.throw("fail");
  }

}

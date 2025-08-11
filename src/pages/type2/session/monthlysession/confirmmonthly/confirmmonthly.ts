import { Component, ViewChild } from '@angular/core';
import { AlertController, Content, IonicPage, LoadingController, NavController, NavParams, Navbar, Platform, PopoverController } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../../services/common.service';
import { GraphqlService } from '../../../../../services/graphql.service';
import { Storage } from '@ionic/storage';
import * as moment from 'moment';
import { MonthlySessionDets, MonthlySessionMember } from '../model/monthly_session.model';
import gql from 'graphql-tag';
import { MonthlySessionEnrolInput, MonthlySessionMoveMember } from '../model/monthly_session_enrol.model';
import { SharedServices } from '../../../../services/sharedservice';

/**
 * Generated class for the ConfirmmonthlyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-confirmmonthly',
  templateUrl: 'confirmmonthly.html',
})
export class ConfirmmonthlyPage {

  @ViewChild(Content) content: Content;
  
  @ViewChild(Navbar) navBar: Navbar;
  isBeginSlide: boolean = true;
  isEndSlide: boolean = false;
  //user: any = { FirstName: 'John', LastName: 'Doe' }; // Assuming user details are available
  effectiveDate: string = "25-May-2024"; // Defaulting to today's date
  confirmationText: string = '';
  move_frequency:number = 1|2;
  memberPrice: number = 0; // Initialize with default price
  maxDate:any;
  minDate:any;
  scheduled_date:any;

  confirm:string = "";
  user_subscription: MonthlySessionMember;
  new_session:MonthlySessionDets;
  old_session:MonthlySessionDets;
  selected_days:any = [];
  enrol_input:MonthlySessionMoveMember = {
    old_enrolment_id:"",
    session_postgre_fields: {
      monthly_session_id:""
    },
    user_device_metadata:{ UserActionType:1 }, //1
    enroll_users:[],
    updated_by:""
  };
  currencyDetails:any;
  constructor(public navCtrl: NavController, 
     public navParams: NavParams,
     public platform: Platform, 
     public loadingCtrl: LoadingController, 
     public alertCtrl: AlertController, 
     public commonService: CommonService, 
     public storage: Storage,
     public popoverCtrl: PopoverController, 
     private sharedService:SharedServices,
     private graphqlService: GraphqlService
  ) {
      this.new_session = this.navParams.get("new_session")
      this.old_session = this.navParams.get("old_session")
      this.user_subscription = this.navParams.get("existing_subscription_info")

      this.enrol_input.old_enrolment_id = this.user_subscription.enrolled_id;
      this.enrol_input.updated_by = this.sharedService.getLoggedInId();
      this.enrol_input.session_postgre_fields.monthly_session_id = this.new_session.id;
      this.move_frequency = this.user_subscription.is_paid ? 1:2;
      this.enrol_input.enroll_users = [];
      this.minDate = moment().add(1,'days').format("YYYY-MM-DD");
      this.scheduled_date = moment().add(1,'days').format("YYYY-MM-DD");
      // //let now = moment().add(10, 'year');
      this.maxDate = moment(0,"YYYY-MM-DD").subtract(2,'M').format("YYYY-MM-DD");
      storage.get('Currency').then((val) => {
        this.currencyDetails = JSON.parse(val);
        }).catch(error => {
        });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ConfirmmonthlyPage');
  }
  

  // Function to toggle selection of a day
  toggleDay(day:string) {
    console.log("toggleDay", day);
    if(this.selected_days.includes(day)){
      //if includes remove it 
      this.selected_days = this.selected_days.filter(d => d!== day);
    }else{
      this.selected_days.push(day);
    }

    if(this.selected_days.length > 0){
      const matched_plan = this.new_session.active_payplans.find(plan => plan.days_for == this.selected_days.length);
      this.memberPrice = this.user_subscription.user.IsEnable ? Number(matched_plan.plan_amount_member):Number(matched_plan.plan_amount_non_member);
    }else{
      this.memberPrice = 0;
    }
     
  }

  validateMove(){
    if(this.selected_days.length == 0){
      this.commonService.toastMessage("Please select at least one day", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    }
    return true;
  }

  confirmMove(){
    if(this.validateMove()){
      const title = 'Move Subscription';
      const message = 'Are you sure you want to move the subscription? '
      this.commonService.commonAlert_V4(title,message,"Yes:Move","No",()=>{
          this.moveSubsscriptionMember();
      })
    }
  }


  //monthly session member enrolment in postgre
  moveSubsscriptionMember(){
    //if (this.addMemberMonthlySessionValidation()) {
        this.commonService.showLoader("Please wait");
        // const selected_date = this.session_months[this.selectedMonthIndex].month
        this.enrol_input.enroll_users.push({
          member_id: this.user_subscription.user.Id,
          subscription_date:this.move_frequency == 1 ? moment().format("MMMM-YYYY"):moment().add(1,"M").format("MMMM-YYYY"),//"May-2024",
          subscription_status: 1,
          enrolled_days: this.selected_days.map(day => day).join(","),
          enrolled_date:moment().format("DD-MMM-YYYY"), //"04-Jun-2024"
          is_active: true
        })
        console.log(this.enrol_input);
        
        const enrol_ses_mutation = gql`
        mutation moveMemberToOtherSubscription($enrolInput: MonthlyMoveMember!) {
          moveMemberToOtherSubscription(move_input: $enrolInput){
                id
          }
        }` 
        
        const enrol_mutation_variable = { enrolInput: this.enrol_input };
          this.graphqlService.mutate(
            enrol_ses_mutation, 
            enrol_mutation_variable,
            0
          ).subscribe((response)=>{
            this.commonService.hideLoader();
            const message = "User moved successfully";
            this.commonService.toastMessage(message, 2500, ToastMessageType.Success,ToastPlacement.Bottom);
            this.navCtrl.pop().then(()=> this.navCtrl.pop());
            this.commonService.updateCategory("update_session_list");
          },(err)=>{
            this.commonService.hideLoader();
            this.commonService.toastMessage("User movement failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
          }); 
    }
  
    
  }

  


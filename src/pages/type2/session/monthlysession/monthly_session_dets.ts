import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ActionSheetController,Platform,Slides, FabContainer } from 'ionic-angular';
import moment, { Moment } from 'moment';
import { FirebaseService } from '../../../../services/firebase.service';
import { SharedServices } from '../../../services/sharedservice';
import { CommonService, ToastPlacement, ToastMessageType } from '../../../../services/common.service';
import { Storage } from '@ionic/storage';
import gql from "graphql-tag";
import { GraphqlService } from '../../../../services/graphql.service';
import { MonthlySessionDets, MonthlySessionMember } from './model/monthly_session.model';
import { MonthlySessionEnrolInput } from './model/monthly_session_enrol.model';
import { CallNumber } from '@ionic-native/call-number';
import { AppType, ModuleTypes } from '../../../../shared/constants/module.constants';
import { HttpService } from '../../../../services/http.service';
import { API } from '../../../../shared/constants/api_constants';
/**
 * Generated class for the SessioninstallmentPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
// {SessionDetailsObject:this.sessionDetails,InstallmentSesionObject:this.installmentSessionObj}
@IonicPage()
@Component({
  selector: 'page-monthly_session_dets',
  templateUrl: 'monthly_session_dets.html',
  providers: [HttpService]
})
export class MonthlySessionDetails {
  @ViewChild(Slides) slides: Slides;
  @ViewChild("fab") fab: FabContainer;
  monthly_session_id:string;
  monthly_ses_dets:MonthlySessionDets;
  session_users:MonthlySessionMember[] = [];
  selectedMonthIndex:number;
  inclusionList: Array<String> = ["", " ", "-", ".", "..", "...", "A", "adhd", "fit", "good", "great", "healthy",
    "n", "n/a", "N/a", "na", "Na", "NA", "nil", "no", "No", "no e", "nobe", "non", "not applicable", "none", "nope", "None", "None ", "Non", "None\n", "None\n\n", "Nope", "nothing", "Nothing", "ok", "Ok", "okay", "no problem",
    "Best", "best", "Good", 'good'
  ];
  inclusionSet: Set<String> = new Set<String>(this.inclusionList);
  sample_desination = {
    SessionName:"",
    StartDate:"",
    EndDate:"",
    StartTime:"",
    EndTime: "",
    days: "",
    group_size: "",
    comments: "",
    ProductId:"" 
  }
  postgre_parentclub_id: string = "";
  can_pause_subscription: boolean = false;
  enrol_input:MonthlySessionEnrolInput = {
    session_postgre_fields: {
      monthly_session_id:""
    },
    user_device_metadata:{ UserActionType:2 }, //2-cancel,3-cancel subscription
    enroll_users:[],
    updated_by:""
  };

  currencyDetails = {
    CurrencySymbol: "",
  };
  loggedin_type:number = 2;
  can_coach_see_revenue:boolean = true;
  pause_subscription_months:{id:string, month_text: string}[] = [];
  constructor(private storage: Storage,
      public callNumber: CallNumber,
      public fb: FirebaseService, 
      public sharedservice: SharedServices, 
      public commonService: CommonService, 
      public actionSheetCtrl: ActionSheetController,
      public navCtrl: NavController, public navParams: NavParams,
      public alertCtrl: AlertController,
      private graphqlService: GraphqlService,
      private platform: Platform,
      private httpService: HttpService,
    ) {
        this.storage.get('postgre_parentclub').then((postgre_parentclub) => {
            this.postgre_parentclub_id = postgre_parentclub.Id;
        }).catch(error => {
            console.error("Error getting postgre_parentclub_id", error);
        });
  }

  async ionViewWillEnter(){
    this.loggedin_type = this.sharedservice.getLoggedInType();
    if(this.loggedin_type == 4){
        this.can_coach_see_revenue = this.sharedservice.getCanCoachSeeRevenue();
    }
    this.monthly_session_id = this.navParams.get("session_id");
    this.enrol_input.session_postgre_fields.monthly_session_id = this.monthly_session_id;
    this.getMonthlySessionsDets();
    const [userobj,currency] = await Promise.all([
      this.storage.get("userObj"),
      this.storage.get('Currency')
    ])
    this.currencyDetails = JSON.parse(currency);
    this.enrol_input.updated_by = JSON.parse(userobj).$key;
    // this.storage.get("userObj").then((val) => {
    //     val = JSON.parse(val);
    //     if (val.$key != "") {}
    // });
    // this.storage.get('Currency').then((val) => {
    //     this.currencyDetails = JSON.parse(val);
    // }).catch(error => {});
  }

  getMonthlySessionsDets() {
    this.commonService.showLoader("Please wait");
    console.log("input giving for monthly dets api:");
    const monthly_session_query = gql`
    query getMonthlySessionDetails($input: MonthlySessionDetailsInput!) {
        getMonthlySessionDetails(monthlySessionInput: $input) {
            id
            session_name
            start_date
            end_date
            start_time
            end_time
            duration
            days
            group_size
            comments
            productid
            group_category
            session_type
            group_status
            is_allow_paylater
            no_of_weeks
            free_months
            payment_option
            allow_amend_fee
            waitinglist_capacity
            is_allow_groupchat
            allow_childcare
            show_in_apkids
            firebase_activity_categorykey
            firebase_activity_subcategorykey
            is_exist_activitycategory
            is_exist_activity_subcategory
            can_enroll
            can_delete
            must_pay_months
            image_url
            activity_category_name
            activity_subcategory_name
            coach_names
            coach_image
            paybydate
            can_enroll
            session_stats{
              capacity
              capacity_left
            }
            ParentClubDetails {
              Id
              FireBaseId
              ParentClubName
            }
            ActivityDetails {
              Id
              FirebaseActivityKey
              ActivityName
            }
        
            ClubDetails {
              Id
              FirebaseId
              ClubName
            }
            Months {
                monthId
                month
                status
                year
                monthName
            }
            Days {
                status
                day
            }
            coaches {
              Id
              coach_firebase_id
              first_name
              last_name
              profile_image
            }
            payplans{
              id_member
              id_non_member
              plan_id_member
              plan_id_non_member
              plan_amount_member
              plan_amount_non_member
              days_for
              status               
            }
            active_payplans{
              id_member
              id_non_member
              plan_id_member
              plan_id_non_member
              plan_amount_member
              plan_amount_non_member
              days_for
              status               
            }
      }
    }
  `;
    const session_dets_input = {
        SessionId:this.monthly_session_id,
        DeviceType:this.sharedservice.getPlatform() == "android" ? 1:2,
        AppType:0
    }
    this.graphqlService.query(
        monthly_session_query, { input: session_dets_input}, 0
    ).subscribe((res: any) => {
        this.commonService.hideLoader();
        this.monthly_ses_dets = res.data.getMonthlySessionDetails;

        if(this.monthly_ses_dets && this.monthly_ses_dets.Months.length > 0){
            //const present_month_index = this.monthly_ses_dets.Months.findIndex(month => month.status == 1);
            const currentMonthYear = moment().format('MMMM-YYYY');
            const present_month_index = this.monthly_ses_dets.Months.findIndex(session_month => {
              return moment(session_month.month, "MMMM-YYYY").isSame(moment(), 'month') && moment(session_month.month, "MMMM-YYYY").isSame(moment(), 'year');
            });
            if(present_month_index!=-1) {
              this.onMonthChange(present_month_index);
            }
            
            //this.getMemberDetails(this.monthly_ses_dets.Months[0].month)
        }
        //this.selectedMonthIndex = 0;
        //this.monthly_ses_dets.
        //console.log("monthly session data :", JSON.stringify(data));
      },
        (error) => {
          this.commonService.hideLoader();
          this.commonService.toastMessage("Failed to fetch list",2500,ToastMessageType.Error,ToastPlacement.Bottom);
          console.error("Error in fetching:", error);
          if (error.graphQLErrors) {
            console.error("GraphQL Errors:", error.graphQLErrors);
            for (const gqlError of error.graphQLErrors) {
              console.error("Error Message:", gqlError.message);
              console.error("Error Extensions:", gqlError.extensions);
            }
          }
          if (error.networkError) {
            console.error("Network Error:", error.networkError);
          }
        }
      )
  }


  getMemberDetails(selected_month:string){
    //this.commonService.showLoader("Please wait");
    //comments
    this.session_users = [];
    const monthly_session_query = gql`
    query getAllMonthlySessionMember($input: MonthlySessionMemberInput!) {
        getAllMonthlySessionMember(sessionMemberInput: $input) {
            id
            user {
                Id
                FirstName
                LastName
                IsEnable
                EmailID
                ParentEmailID
                PhoneNumber
                ParentPhoneNumber
                Gender
                DOB
                Age
                MedicalCondition
                IsChild  
                ParentId
            }
            comments
            plan_id
            plan_days
            enrolled_id
            is_paid
            is_cancelled
            cancellation_date
            payment_date
            scheduled_payment_date_text
            latest_payment_date_text
            amount_paid
            amount_due
            subscription_status
            pay_status
            subscription_status_name
            pay_status_name
            start_date
            end_date
            latest_payment_date     
      }
    }
  `;
  
    const member_input = {
        date:selected_month,
        user_device_metadata:{
            UserAppType:0,
            UserDeviceType:this.sharedservice.getPlatform() == "android" ? 1:2
        },
        session_postgre_fields:{
            monthly_session_id:this.monthly_session_id
        }
    }
    this.graphqlService.query(
        monthly_session_query, { input: member_input }, 0
      )
      .subscribe((res: any) => {
        //this.commonService.hideLoader();
        this.session_users = res.data.getAllMonthlySessionMember;
        if(this.session_users.length > 0){
          this.can_pause_subscription = this.session_users.some((member) => {
            return member.subscription_status === 1 || member.subscription_status === 3;
          });
          if(this.can_pause_subscription)this.getPauseSubscriptionMonths();
        }
      },
        (error) => {
          //this.commonService.hideLoader();
          this.commonService.toastMessage("Failed to fetch list",2500,ToastMessageType.Error,ToastPlacement.Bottom);
          console.error("Error in fetching:", error);
          if (error.graphQLErrors) {
            console.error("GraphQL Errors:", error.graphQLErrors);
            for (const gqlError of error.graphQLErrors) {
              console.error("Error Message:", gqlError.message);
              console.error("Error Extensions:", gqlError.extensions);
            }
          }
          if (error.networkError) {
            console.error("Network Error:", error.networkError);
          }
        }
      )
  }


  //fetching the pause subscription months
  getPauseSubscriptionMonths(){
      const getMonthsInput = {
          parentclubId: this.postgre_parentclub_id,
          device_type: this.sharedservice.getPlatform() == "android" ? 1 : 2,
          updated_by: this.sharedservice.getLoggedInId(),
          device_id: this.sharedservice.getDeviceId() || "",
          app_type: AppType.ADMIN_NEW
      }
        
    this.httpService.post<{status:string,message:string,data:{id:string,month_text:string}[]}>(`${API.GET_SUBSCRIPTION_PAUSE_MONTHS}`, getMonthsInput).subscribe({
          next: (res) => {
              console.log("pause subscription months", JSON.stringify(res));
              this.pause_subscription_months = res.data;
          },
          error: (err) => {
              if (err.error.message) {
                this.commonService.toastMessage(err.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
              } else {
                this.commonService.toastMessage('Failed to fetch months', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
              }
          }
      });                
  }

  showPauseMonths(enrol_id?:string){
    const alert = this.alertCtrl.create({
        title: 'Pause Subscription',
        message: 'Select the months to pause subscription',
        cssClass: 'custom-alert', // Add this line
        buttons: [{
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            }
          },{
            text: 'Pause',
            handler: (selected_months) => {
             console.log("selected month",selected_months);
             this.PauseSubscriptions(selected_months,enrol_id);
            }
        }]
    });
    this.pause_subscription_months.forEach(month => {
      alert.addInput({
        type: 'radio',
        label: month.month_text,
        value: month.id
      })
    });
    alert.present();
  }


  PauseSubscriptions(months_selected:number,enrolment_id?:string){
    try{
      this.commonService.showLoader("Please wait");
      const pauseSubscribeInput = {
          resume_for_months:months_selected,
          enrolments_ids:enrolment_id ? [enrolment_id] : this.session_users.filter(member=>member.subscription_status == 1).map(member => member.enrolled_id),
      }
        
    this.httpService.post(`${API.PAUSE_MONTHLY_SUBSCRIPTION}`, pauseSubscribeInput,null,3).subscribe({
         next: (res) => {
              this.commonService.hideLoader();
              console.log("pause request submitted", JSON.stringify(res));
              this.commonService.toastMessage("Pause request submitted successfully", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
          },
          error: (err) => {
             this.commonService.hideLoader();
              if (err.message) {
                this.commonService.toastMessage(err.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
              } else {
                this.commonService.toastMessage('Pause request failed', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
              }
          }
      });  
    }catch(err){
      this.commonService.hideLoader();
      this.commonService.toastMessage('Pause request failed', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    }
                    
  }

  
  onMonthChange(index:number){
    this.selectedMonthIndex = index;
    setTimeout(()=>{
        if(this.slides){
            this.slides.slideTo(this.selectedMonthIndex);
        }
    },500);
    this.getMemberDetails(this.monthly_ses_dets.Months[index].month);
  }

  presentActionSheet(subscription_info:MonthlySessionMember,ev:any) {
    console.log(ev);
    let alert_options:{title:string,message:string,buttons:any[]} = {
        title: '',
        message:'',
        buttons: []
    };
    if(ev.target.className == "medical_img"){
        alert_options.title = "Medical Condition"
        alert_options.message = subscription_info.user.MedicalCondition
        alert_options.buttons.push({
            text: "Ok",
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked')
            }
        })
        const alertController = this.alertCtrl.create(alert_options);
        alertController.present();
    }
    else if(ev.target.className == "moved_status"){
      alert_options.title = "Move Info"
      alert_options.message = `${subscription_info.comments}`
      alert_options.buttons.push({
          text: "Ok",
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked')
          }
      })
      const alertController = this.alertCtrl.create(alert_options);
      alertController.present();
    }
    else{
      if(subscription_info.subscription_status === 1 || subscription_info.subscription_status === 3 || subscription_info.subscription_status === 5){
            alert_options.title = "Subscription Update";
            alert_options.buttons.push(
              {
                    text: 'Pause Subscription',
                    icon: 'ios-pause',
                    cssClass:subscription_info.subscription_status === 1 ? "show_update_payment" : "hide_update_payment",
                    handler: () => {
                        //this.showPauseMonths(subscription_info.enrolled_id);
                        this.navCtrl.push("PauseMonthlySessionSubscriptionPage", { enrolled_id: subscription_info.enrolled_id, session_users: this.session_users });
                    }
                },
                {
                    text: 'Update Price',
                    icon: this.platform.is('ios') ? "" : 'create',
                    cssClass:subscription_info.subscription_status === 1 || subscription_info.subscription_status === 5 ? "show_update_payment" : "hide_update_payment",
                    handler: () => {
                        this.updateMonthlyPrice(subscription_info);
                    }
                },
                {
                    text: 'Cancel Subscription',
                    icon: this.platform.is('ios') ? "ios-refresh" : "md-refresh",
                    handler: () => {
                      this.enrol_input.user_device_metadata.UserActionType = 3;
                      this.navCtrl.push("CancelMonthlySesSubscription", { user_subscription: subscription_info, session:this.monthly_ses_dets})
                    }                        
                },
                {
                  text: 'Move',
                  icon: this.platform.is('ios') ? "ios-log-in" : 'md-log-in',
                  handler: () => {
                    this.navCtrl.push("MonthlyMemberMovePage", { memberInfo: subscription_info,session:this.monthly_ses_dets});
                  }
                }
            )
        }else if(subscription_info.subscription_status === 0){
          alert_options.buttons.push(
            {
              text: 'Remove',
              icon: this.platform.is('ios') ? "ios-trash" : "trash",
              handler: () => {
                this.enrol_input.user_device_metadata.UserActionType = 2;
                this.updateUserEnrolStatus(subscription_info)
              }                        
            },
          )
        }
        //coommon buttons
        alert_options.buttons.push(
          {
             text: 'Call',
              icon: this.platform.is('ios') ? "" : 'call',
              handler: () => {
                  this.call(subscription_info);
              }
          },{
              text: 'Add Notes',
              icon: this.platform.is('ios') ? "" : 'md-clipboard',
              handler: () => {
                  // this.navCtrl.push('CreatenotePage', {
                  //     memberInfo: mlist,
                  //     sessionDetails: this.sessionDetails
                  // });
              }
          },
          {
              text: 'Profile',
              icon: this.platform.is('ios') ? "" : 'ios-contact',
              handler: () => {
                  this.getProfile(subscription_info);
              }
          },{
              text: 'Close',
              icon: this.platform.is('ios') ? "" : 'close',
              role: 'cancel',
              handler: () => {

              }
          }
      )
        const actionSheet = this.actionSheetCtrl.create(alert_options);
        actionSheet.present();            
      }
  }

  async updateMonthlyPrice(subscription_info:MonthlySessionMember){
    try{
        //this.commonService.showLoader("Please wait");
        let new_plan:string = '';
        let new_price:string = '';
        //first check existing plainid available in the active payplans
        //if available then no change,
        //if not get new planid according to user days and stautus
        const payplan = subscription_info.user.IsEnable ? this.monthly_ses_dets.active_payplans.find(plan => plan.id_member === subscription_info.plan_id):this.monthly_ses_dets.active_payplans.find(plan => plan.id_non_member === subscription_info.plan_id);

        if(!payplan){ //plan changed
          const plan = this.monthly_ses_dets.active_payplans.find(active_plan => active_plan.days_for === subscription_info.plan_days);
          new_plan = subscription_info.user.IsEnable ? plan.id_member:plan.id_non_member;
          new_price = subscription_info.user.IsEnable ? plan.plan_amount_member:plan.plan_amount_non_member; 
        }else{
          new_plan = subscription_info.user.IsEnable ? payplan.id_member:payplan.id_non_member;
          new_price = subscription_info.user.IsEnable ? payplan.plan_amount_member:payplan.plan_amount_non_member; 
        }
        
        const session_info = {
            session_id:this.monthly_session_id,
            session_name:this.monthly_ses_dets.session_name,
            user_name:subscription_info.user.FirstName+" "+subscription_info.user.LastName,
            age:subscription_info.user.Age,
            user_type:subscription_info.user.IsEnable ? "Member":"Non-Member",
            enrollement_id:subscription_info.enrolled_id,
            new_plan_id:new_plan,
            old_plan:subscription_info.plan_id,
            new_price:new_price,
            //old_price:subscription_info.user.IsEnable ? this.monthly_ses_dets.payplans.find(plan => plan.id_member === subscription_info.plan_id).plan_amount_member:this.monthly_ses_dets.payplans.find(plan => plan.id_non_member === subscription_info.plan_id).plan_amount_non_member,
            old_price:subscription_info.is_paid ? subscription_info.amount_paid : subscription_info.amount_due,
            start_month:subscription_info.start_date,
            end_month:subscription_info.end_date,
            currency:this.currencyDetails.CurrencySymbol
        }
        //this.commonService.hideLoader();
        this.navCtrl.push("MonthlysesupdatepricePage",{user_subscription_info:session_info});
    }catch(err){
        this.commonService.hideLoader();
    }
  }

  async call(subscription_info:MonthlySessionMember) {
    try{
      const phone_no = subscription_info.user.IsChild ? subscription_info.user.ParentPhoneNumber : subscription_info.user.PhoneNumber;  
      if(phone_no && phone_no!='n/a'&& phone_no!=''){
          if (this.callNumber.isCallSupported()) {
              this.callNumber.callNumber(phone_no, true)
                  .then(() => console.log())
                  .catch(() => console.log());
          }else {
              this.commonService.toastMessage("Your device is not supporting to launch call dialer.", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
          }
      }else{
          this.commonService.toastMessage("Phoneno not available.", 3000,ToastMessageType.Error,ToastPlacement.Bottom);
      }  
    }catch(err){
          this.commonService.toastMessage("Something went wrong", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    }                            
  }

  memberPaidInfo: any = [];
  async getProfile(subscription_info:MonthlySessionMember) {
      try{
        let parent_id = "";
        if(subscription_info.user.IsChild){
            if(subscription_info.user.ParentId && subscription_info.user.ParentId!="" && subscription_info.user.ParentId!="-" && subscription_info.user.ParentId!="n/a"){
                parent_id = subscription_info.user.ParentId;
            }else{
                this.commonService.toastMessage("parentid not available",2500,ToastMessageType.Error);
                return false;
            }
        }else{
            parent_id = subscription_info.user.Id
        }

        this.navCtrl.push("MemberprofilePage", {
            member_id:parent_id,
            type: 'Member'
        })
        this.commonService.updateCategory("user_profile");
      }catch(err){
          this.commonService.toastMessage("Something went wrong", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      } 
  }

  async notifyGroupUsers(){
    if (this.session_users.length > 0) {
        const member_ids = this.session_users.map(session_member => session_member.user.IsChild ? session_member.user.ParentId:session_member.user.Id);
        this.navCtrl.push("Type2NotificationSession",{
            users:member_ids,
            type:ModuleTypes.MONTHLYSESSION,
            heading:`Enrolment:${this.monthly_ses_dets.session_name}`
        }); 
    } else {
        this.commonService.toastMessage("No member(s) found in current month",2500,ToastMessageType.Error);
    }  
  } 

  sendEmail(){
    //console.log(this.sessionDetails);         
    if (this.session_users.length > 0) {
      const member_list = this.session_users.map((enrol_member,index) => {
          return {
              IsChild:enrol_member.user.IsChild ? true:false,
              ParentId:enrol_member.user.IsChild ? enrol_member.user.ParentId:"",
              MemberId:enrol_member.user.Id, 
              MemberEmail:enrol_member.user.EmailID!="" && enrol_member.user.EmailID!="-" && enrol_member.user.EmailID!="n/a" ? enrol_member.user.EmailID:(enrol_member.user.IsChild ? enrol_member.user.ParentEmailID:""), 
              MemberName: enrol_member.user.FirstName + " " + enrol_member.user.LastName
          }
      })
      const session = {
          module_booking_club_id:this.monthly_ses_dets.ClubDetails.Id,
          module_booking_club_name:this.monthly_ses_dets.ClubDetails.ClubName,
          module_booking_coach_id:this.monthly_ses_dets.coaches[0].Id,
          module_booking_coach_name:this.monthly_ses_dets.coaches[0].first_name + " " + this.monthly_ses_dets.coaches[0].last_name,
          module_id:this.monthly_ses_dets.id,
          module_booking_name:this.monthly_ses_dets.session_name,
          module_booking_start_date:this.monthly_ses_dets.start_date,
          module_booking_end_date:this.monthly_ses_dets.end_date,
          module_booking_start_time:this.monthly_ses_dets.start_time,
          //module_booking_end_time:this.
          //module_booking_activity_id:this.monthly_ses_dets.ActivityDetails.Id,
          //module_booking_activity_name:this.monthly_ses_dets.ActivityDetails.ActivityName,
      }
      const email_modal = {
          module_info:session,
          email_users:member_list,
          type:101
      }
      this.navCtrl.push("MailToMemberByAdminPage", {email_modal});
    } else {
        this.commonService.toastMessage("No member(s) found in current session",2500,ToastMessageType.Error);
    }
  }

  //print member report
  gotoPrintMember() {
    if (this.session_users.length > 0) {
        const members = this.session_users.map((enrol_user)=>{
            return {
                StartDate: this.monthly_ses_dets.start_date,
                EndDate: this.monthly_ses_dets.end_date,
                FirstName: enrol_user.user.FirstName,
                LastName: enrol_user.user.LastName,
                MedicalCondition: enrol_user.user.MedicalCondition,
                Age: enrol_user.user.Age,
                Gender: enrol_user.user.Gender,
                PaymentStatus: enrol_user.pay_status_name,
                PhoneNumber: enrol_user.user.IsChild ? enrol_user.user.ParentPhoneNumber:enrol_user.user.PhoneNumber,
                EmailID: enrol_user.user.IsChild ? enrol_user.user.ParentEmailID:enrol_user.user.EmailID,
                // ExtraLine: true,
                // ExtraLineNumber: 10,
                MemberType:"1"
            }
        })
        const session_info = {
            session_name:`${this.monthly_ses_dets.session_name} (${this.monthly_ses_dets.Months[this.selectedMonthIndex].month})`,
            club_name:this.monthly_ses_dets.ClubDetails.ClubName,
            coach_name:this.monthly_ses_dets.coaches[0].first_name +" "+this.monthly_ses_dets.coaches[0].last_name 
        }
        this.navCtrl.push("SessionmembersheetPage", {session_info:session_info,repor_members:members,type:101});
    } else {
        this.commonService.toastMessage("No member(s) found in the current session",2500,ToastMessageType.Error);
    }        
  }

  //can be unenrol for unsubscribed user or cancelling for a subscribed user
  updateUserEnrolStatus(user_subscription:MonthlySessionMember){
    this.enrol_input.enroll_users.push({
      member_id:user_subscription.user.Id,
      subscription_date: "",
      subscription_status:user_subscription.subscription_status,
      enrolled_days: "",
      enrolled_date: "",//"DD-MMM-2024" not required for enrol
      is_active: true
    })
    //const selected_date = this.session_months[this.selectedMonthIndex].month
    
    const enrol_ses_mutation = gql`
    mutation updateMonthlyUserEnrolStatus($enrolInput: MonthlySessionMemberEnrollInput!) {
      updateMonthlyUserEnrolStatus(session_enrol_members: $enrolInput){
            id
      }
    }` 
    
    const enrol_mutation_variable = { enrolInput: this.enrol_input };
      this.graphqlService.mutate(
        enrol_ses_mutation, 
        enrol_mutation_variable,
        0
      ).subscribe((response)=>{
        this.getMemberDetails(this.monthly_ses_dets.Months[this.selectedMonthIndex].month);
        const message = "User status updated successfully";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Success,ToastPlacement.Bottom);
        this.commonService.updateCategory("update_session_list");
      },(err)=>{
        this.commonService.toastMessage("User status updation failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
      }); 
  }


  alertConfirmation(){
    this.commonService.commonAlert_V3("Remove Session","Are you sure you want to remove this session?","Yes, Delete","No", ()=>{
      this.removeSession()
    })
  }

  //deleting a session
  removeSession(){
    const remove_input = {
      user_postgre_metadata:{
        UserMemberId:this.enrol_input.updated_by
      },
      user_device_metadata:{
        UserAppType:0,
        UserDeviceType:this.sharedservice.getPlatform() == "android" ? 1:2
      },
      session_postgre_fields:{
          monthly_session_id:this.monthly_session_id
      }
    }
    
    
    const remove_ses_mutation = gql`
    mutation cancelMonthlySession($removeInput: MonthlySessionInput!) {
      cancelMonthlySession(monthlySessionInput: $removeInput){
            id
      }
    }` 
    
    const enrol_mutation_variable = { removeInput: remove_input };
      this.graphqlService.mutate(
        remove_ses_mutation, 
        enrol_mutation_variable,
        0
      ).subscribe((response) => {
        const message = "Session deleted successfully";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Success,ToastPlacement.Bottom);
        this.navCtrl.pop();
      },(err)=>{
        this.commonService.toastMessage("session deletion failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
      }); 
  }

  //goto enrol page
  addMemberToSession(){
    if(this.monthly_ses_dets.can_enroll){
      this.navCtrl.push("Type2EditMembershipSession",{
        session_id:this.monthly_session_id,
        type:101,
        session_months:this.monthly_ses_dets.Months,
        session_days:this.monthly_ses_dets.Days,
        capacity_left:this.monthly_ses_dets.session_stats.capacity_left
      });
    }else{
      this.commonService.toastMessage("Group size is full",2500,ToastMessageType.Error);
    }
  }

  //
  editSession(){
    this.navCtrl.push("Type2EditGroupSessionMonthly",{SessionDetails:this.monthly_ses_dets})
  }

  ////goto attendance page
  goToSessionAttendance(){
    this.navCtrl.push("Type2SessionDetails",{
      session:this.monthly_ses_dets,
      type:101
    });
  }

  ionViewWillLeave(){
    if(this.fab) {
        this.fab.close();
    }
  }
  

  

}

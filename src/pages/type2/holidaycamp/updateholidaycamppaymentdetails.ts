import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, AlertController, Content, Slides } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
import { Storage } from '@ionic/storage';
import { IonicPage } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import { GraphqlService } from '../../../services/graphql.service';
import gql from 'graphql-tag';
import { CampUsers, HolidayCamp } from './models/holiday_camp.model';
import moment from 'moment';
import { PaymentPaidStatusText } from '../../../shared/constants/payment.constants';

@IonicPage()
@Component({
  selector: 'updateholidaycamppaymentdetails-page',
  templateUrl: 'updateholidaycamppaymentdetails.html'
})

export class UpdateHolidayCampPaymentDetails {
  @ViewChild(Content) content: Content;
  @ViewChild('myslider') myslider: Slides;
  parentClubKey: any;
  themeType: number;
  selectedMemberDetails: any;
  selectedSessionDetails: any;
  can_show_update_btn:boolean = false;
  paymentDetails = {
    member_id:'',
    PaymentAmount: '',
    PaymentMode: null,
    PaymentStatus: 0,
    Comments: 'Payment Received! Thanks.'
  }

  enrolments:string[] = [];
  slide_index:number = 0;
  selected_user:CampUsers;
  enrolledUsersForCamp: CampUsers[] = [];
  user_pv_transactions = [];
  payment_update_input = {
      ActionType:1,
      user_payment: {
        enrollementIds: [],
        amount: "0.00",
        payment_mode: 0,
        payment_status: 0,
        comments: "",
        payment_date: moment().format('YYYY-MM-DD'),
      },
      transaction_id:""
  }
  holidayCampDetails: HolidayCamp;
  user_index:number;
  is_paid:boolean = false;
  payment_mode:number = 0;
  constructor(public commonService: CommonService, 
      public alertCtrl: AlertController, 
      public navParams: NavParams, 
      storage: Storage, 
      public navCtrl: NavController,
      public sharedservice: SharedServices, 
      public popoverCtrl: PopoverController,
      private graphqlService: GraphqlService
     ) {
      this.themeType = sharedservice.getThemeType();
      this.selectedMemberDetails = navParams.get('SelectedMember');
      this.selectedSessionDetails = navParams.get('CampDetails');
      // this.camp_id = navParams.get('camp_id');
      // this.camp_name = navParams.get('camp_name');
      this.holidayCampDetails = navParams.get('camp')
      this.getCampEnrols();
    // if (this.selectedSessionDetails.Activity != undefined) {
    //   const ac = Array.isArray(this.selectedSessionDetails.Activity) ? this.selectedSessionDetails.Activity: this.commonService.convertFbObjectToArray(this.selectedSessionDetails.Activity);
    //   this.activityKey = ac[0].ActivityKey;
    // }


    // if (this.selectedMemberDetails.AmountPayStatus == "Due") {
    //   this.selectedMemberDetails.TotalFeesAmount = this.selectedMemberDetails.AmountDue;
    // } else {
    //   this.selectedMemberDetails.TotalFeesAmount = this.selectedMemberDetails.AmountPaid;
    // }

    // if (this.selectedSessionDetails.$key == undefined) {
    //   this.selectedSessionDetails.$key = this.selectedSessionDetails.Key;
    // }
    // if (this.selectedMemberDetails.AmountPayStatus == "Due") {
    //   this.paymentDetails.PaymentAmount = this.selectedMemberDetails.AmountDue;
    // } else {
    //   this.paymentDetails.PaymentAmount = this.selectedMemberDetails.AmountPaid;
    // }
    // this.paymentDetails.PaymentMode = this.selectedMemberDetails.PaidBy;



    // if (this.selectedMemberDetails.AmountPayStatus == "Due") {
    //   this.paymentDetails.PaymentStatus = "";
    // }
    // else if (this.selectedMemberDetails.AmountPayStatus == "Pending Verification") {
    //   this.paymentDetails.PaymentStatus = "Pending Verification";
    // } else {
    //   this.paymentDetails.PaymentStatus = "Paid";
    // }



    // this.loading.present();
    this.themeType = sharedservice.getThemeType();
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
      }
      // this.loading.dismiss().catch(() => { });
    })
  }

  getCampEnrols() {
    this.commonService.showLoader("Please wait");
    const enrol_query = gql`
    query getEnrollmentsForHolidayCamp($input: GetHolidayCampEnrollmentDto!){
      getEnrollmentsForHolidayCamp(input:$input){
        Id
        FirstName
        LastName
        amount_due
        amount_paid
        invoice_amount
        txn_user_count
        IsEnable
        enrollments {
          id
          amount_pay_status
          amount_due
          amount_paid
          is_earlydrop_applied
          is_latepickup_applied
          is_lunch_opted
          is_snacks_opted
          transaction {
            is_active
            transaction_date
            id
            paidby
            amount_paid
          }
          session {
            is_active
            start_time
            session_id
            session_day
            session_name
            session_date
            duration
            amount_for_member
            amount_for_non_member
          }
        }
      }
    }
  `;
    const camp_enrols_dto = {
      holiday_camp_id: this.holidayCampDetails.id
    }
    
    this.graphqlService.query(enrol_query, { input: camp_enrols_dto}, 0)
      .subscribe((res: any) => {
        this.commonService.hideLoader();
        this.enrolledUsersForCamp = res.data.getEnrollmentsForHolidayCamp;
        console.log("ENROLLED Holiday camp  MEMBERS:", JSON.stringify(this.enrolledUsersForCamp));
        if (this.enrolledUsersForCamp.length > 0) {
         
        } else {
          this.commonService.toastMessage("No enrolled members found", 2500, ToastMessageType.Error)
        }
      },
      (error) => {
          this.commonService.hideLoader();
          console.error("Error in fetching:", error);
      })
    
  }

  

  presentActionSheet(index:number){
    this.enrolments = [];
    this.user_pv_transactions = [];
    this.paymentDetails.member_id = this.enrolledUsersForCamp[index].Id;
    this.selected_user = this.enrolledUsersForCamp[index]
    let payment_status:number = 0;//due
    this.user_index = index;
    if(this.enrolledUsersForCamp[index].enrollments && this.enrolledUsersForCamp[index].enrollments.length >0 ){
      const is_paid = this.enrolledUsersForCamp[index].enrollments.every(enrol => enrol.amount_pay_status.toLocaleLowerCase() == 'paid');

      if(is_paid){ //then no dues nothing but all paid
        this.can_show_update_btn = false;
        let paid_amount = '0.00'
        payment_status = 1;//then it's paid
          const user_txns = new Map();
          this.payment_mode = this.enrolledUsersForCamp[index].enrollments[0].transaction.paidby;
          this.enrolledUsersForCamp[index].enrollments.forEach(enrol => {
            if (enrol.transaction) {
              const transactionId = enrol.transaction.id;
              if (!user_txns.has(transactionId)) {
                  user_txns.set(transactionId, enrol.transaction);
              }
            }
          })
          // Reduce transactions to sum amount_paid
          paid_amount = Array.from(user_txns.values()).reduce((sum, transaction) => {
            return sum + Number(transaction.amount_paid || 0);
          }, 0);
          user_txns.clear();
          if(!this.myslider.isEnd()){
            this.myslider.slideNext();
          }

          this.paymentDetails.PaymentStatus = payment_status;
          this.paymentDetails.PaymentMode = this.payment_mode;
          this.paymentDetails.PaymentAmount = parseFloat(paid_amount).toFixed(2);
          this.is_paid = payment_status == 1 ? true:false;
          
      }else{ // due or pending verifications
        this.can_show_update_btn = true;
        const is_due = this.enrolledUsersForCamp[index].enrollments.some(enrol => enrol.amount_pay_status.toLowerCase() == 'due');
        const is_unverified = this.enrolledUsersForCamp[index].enrollments.some(enrol => enrol.amount_pay_status.toLowerCase() == 'pending verification');
        if(is_unverified){ //get pending verification payments
          payment_status = 3;//pending verification
          //this.payment_mode = this.enrolledUsersForCamp[index].enrollments[0].transaction.paidby;
          const unverified_obj = this.getPendingVerifyEnrols(index,this.enrolledUsersForCamp[index].enrollments.filter(enrol => enrol.amount_pay_status.toLowerCase() == 'pending verification'))
          if(unverified_obj && Object.keys(unverified_obj).length > 0){
            this.user_pv_transactions = Object.values(unverified_obj);
          }

          
          //this.user_pv_transactions = Object.values(groupedData);

          // Reduce transactions to sum amount_paid
          // paid_amount = Array.from(user_txns.values()).reduce((sum, transaction) => {
          //   return sum + Number(transaction.amount_paid || 0);
          // }, 0);
          // user_txns.clear();
        }

        //get due payments
        if(is_due){
          const due_obj = this.getDueEnrols(index,this.enrolledUsersForCamp[index].enrollments.filter(enrol => enrol.amount_pay_status.toLowerCase() == 'due'))
          if(due_obj && due_obj.enrollments.length > 0){
            this.user_pv_transactions.push(due_obj);
          }
        }
        
        console.table(this.user_pv_transactions);
      }
     
    }
   
    
  }


  getDueEnrols(user_index:number,due_enrolments){
    try{
      const due_enrolment = {
        is_select:false,
        payment_status:"due",
        transaction_date:"",
        transaction_id:"",
        amount_paid:0,
        amount_due:0.00,
        paid_by:null,
        paid_by_text:"",
        enrollments: []
      }
      let amount_due = 0.00;
      for(const enrollment of due_enrolments){
            if(enrollment.amount_pay_status.toLowerCase() == 'due'){
              due_enrolment.enrollments.push({
                enrolment_id: enrollment.id,
                // is_earlydrop_applied:enrollment.is_earlydrop_applied,
                // is_latepickup_applied:enrollment.is_latepickup_applied,
                // is_lunch_opted:enrollment.is_lunch_opted,
                // is_snacks_opted:enrollment.is_snacks_opted,
                ...enrollment.session
              })
              amount_due += Number(enrollment.amount_due);
            }
      }

  
      due_enrolment.amount_due = amount_due
      //parseFloat(this.getDueAmount(user_index, due_enrolment.enrollments)) + parseFloat(this.getAdditionalAmountForDue(user_index, due_enrolment.enrollments));
      return due_enrolment;
    }catch(err){
      console.error(err)
    }
    
  }

  getPendingVerifyEnrols(user_index:number,unverified_enrolments){
    try{
      const groupedData = {};
      for (const enrollment of unverified_enrolments) {
        if(enrollment.transaction){
          const transactionId = enrollment.transaction.id;
  
          if (!groupedData[transactionId]) {
            groupedData[transactionId] = {
              is_select:false,
              transaction_date:this.commonService.getDateFromISOSrtring(enrollment.transaction.transaction_date),
              payment_status:"pending_verification",
              transaction_id:transactionId,
              amount_due:0,
              amount_paid:enrollment.transaction.amount_paid,
              paid_by:enrollment.transaction.paidby,
              paid_by_text:PaymentPaidStatusText[enrollment.transaction.paidby],
              enrollments: [],
            };
          }
      
          enrollment.session.session_date = moment(enrollment.session.session_date,"YYYY-MM-DD").format("DD-MM-YY")
          groupedData[transactionId].enrollments.push({
            enrolment_id: enrollment.id,
            // is_earlydrop_applied:enrollment.is_earlydrop_applied,
            // is_latepickup_applied:enrollment.is_latepickup_applied,
            // is_lunch_opted:enrollment.is_lunch_opted,
            // is_snacks_opted:enrollment.is_snacks_opted,
            session_date:moment(enrollment.session.session_date,"YYYY-MM-DD").format("DD-MM-YY"),
            ...enrollment.session 
          })
        }
  
      }      
      return groupedData; 
    }catch(err){
      console.error(err)
    }
     
  }


  //here calculating all pending enrol amounts due amount based on diff criteria
    //i)when all sessions booked
    //ii)when perday sessions booked
    //iii)then each session due amount calculates
  getDueAmount(user_index:number,enrollments){
    try{
      let amount_due = 0.00;
      const session_config_count = this.holidayCampDetails.session_configs.length;
      if(enrollments.length === this.holidayCampDetails.sessions.length){
        amount_due = this.enrolledUsersForCamp[user_index].IsEnable ? Number(this.holidayCampDetails.full_amount_for_member) : Number(this.holidayCampDetails.full_amount_for_non_member);
      }else{
        const groupedByDate = enrollments.reduce((acc, obj) => {
          const date = obj.session_date;
          if (!acc.get(date)) {
            const sessions_array = [];
            sessions_array.push(obj);
            acc.set(date, sessions_array);
          } else {
            const sessions_array = acc.get(date);
            sessions_array.push(obj);
            acc.set(date, sessions_array);
          }
          //acc.set(date, (acc.get(date) || 0) + 1);
          return acc;
        }, new Map());
  
        if (groupedByDate.size >= 1) {
          //console.log(`groupsize:${groupedByDate.size}`)
          for (const [date, session_array] of groupedByDate) {
            if (session_array.length === session_config_count) { //then apply perday amount otherwise session amount according to the member status
              const sessionAmount = this.enrolledUsersForCamp[user_index].IsEnable ? parseFloat(this.holidayCampDetails.per_day_amount_for_member) : parseFloat(this.holidayCampDetails.per_day_amount_for_non_member);
              amount_due += Number(sessionAmount);
            } else {
              session_array.forEach((session) => {
                //console.log(user.IsEnable ? parseFloat(session.amount_for_member) : parseFloat(session.amount_for_non_member));
                const sessionAmount = this.enrolledUsersForCamp[user_index].IsEnable ? parseFloat(session.amount_for_member) : parseFloat(session.amount_for_non_member);
                amount_due += Number(sessionAmount);
              })
            }
          }
        }
      }
      return amount_due.toFixed(2);
    }catch(err){
      console.error(err)
    } 
  }
  
  

  getAdditionalAmountForDue(user_index:number,enrollments){
    let additional_amount = 0.00;
    for (const enrollment of enrollments) {
      if(enrollment.is_latepickup_applied){
        additional_amount += this.enrolledUsersForCamp[user_index].IsEnable ? Number(this.holidayCampDetails.late_pickup_fees_member) : Number(this.holidayCampDetails.late_pickup_fees_non_member);
      }
      if(enrollment.is_earlydrop_applied){
        additional_amount += this.enrolledUsersForCamp[user_index].IsEnable ? Number(this.holidayCampDetails.early_drop_fees_member) : Number(this.holidayCampDetails.early_drop_fees_non_member);
      }
      if(enrollment.is_lunch_opted){
        additional_amount += this.enrolledUsersForCamp[user_index].IsEnable ? Number(this.holidayCampDetails.lunch_price) : Number(this.holidayCampDetails.lunch_price_non_member);
      }
      if(enrollment.is_snacks_opted){
        additional_amount += this.enrolledUsersForCamp[user_index].IsEnable ? Number(this.holidayCampDetails.snack_price) : Number(this.holidayCampDetails.snack_price_non_member);
      }
    }
    
    return additional_amount.toFixed(2);

  }


  selectTransaction(index:number){
    this.user_pv_transactions.map((txn,i)=>{
      if(i == index){
        txn.is_select = !txn.is_select;
      }else{
        txn.is_select = false;
      }
    })
  }

  continuePayment(){
    const selected_txn = this.user_pv_transactions.find(txn => txn.is_select);
      if(selected_txn){
        this.payment_update_input.transaction_id = selected_txn.transaction_id;
        this.paymentDetails.PaymentStatus = selected_txn.payment_status == "pending_verification" ? 3 : 0;
        this.paymentDetails.PaymentMode = selected_txn.payment_status == "pending_verification" ? selected_txn.paid_by:null;
        this.paymentDetails.PaymentAmount = selected_txn.payment_status == "pending_verification" ? parseFloat(selected_txn.amount_paid).toFixed(2) : parseFloat(selected_txn.amount_due).toFixed(2);
        this.is_paid = false;
        this.enrolments = selected_txn.enrollments.map(enrol => enrol.enrolment_id);
        this.payment_update_input.ActionType = selected_txn.payment_status == "pending_verification" ? 3:0;
        this.myslider.slideNext();
        //this.updatePaymentInfo();
      }else{
        this.commonService.toastMessage("Please select sessions to update the payment", 2500, ToastMessageType.Error)
      }
         
  }


  //when slide changed
  slideChanged() {
    setTimeout(() => {
      this.content.scrollToTop(200);
    });
    // this.isBeginSlide = this.myslider.isBeginning();
    // this.isEndSlide = this.myslider.isEnd();
    // console.log(this.isEndSlide);
    const slideslen = this.myslider.length();
    this.slide_index = this.myslider.getActiveIndex();
    console.log(slideslen,this.myslider.getActiveIndex());
  }
  

  //going to next slide
  next() {
    if(!this.myslider.isEnd()){
      this.myslider.slideNext();
    }
  }
  //going to previous slide
  cancel(){
    if(!this.myslider.isBeginning()){
      this.myslider.slidePrev();
    }
  }

  updatePaymentInfo() {
    const confirm = this.alertCtrl.create({
      title: 'Update Payment',
      message: 'Are you sure you want to update the payment details?',
      buttons: [
        {
          text: 'No',
          handler: () => {},
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: () => {
            if(this.paymentStatus()){
              this.updatePaymentInPostgre();
            }
          }
        }
      ]
    });
    confirm.present();
  }

  updatePaymentInPostgre(){
    this.payment_update_input.user_payment.payment_mode = Number(this.paymentDetails.PaymentMode);
    this.payment_update_input.user_payment.payment_status = Number(this.paymentDetails.PaymentStatus);
    this.payment_update_input.user_payment.comments = this.paymentDetails.Comments;
    this.payment_update_input.user_payment.amount = this.paymentDetails.PaymentAmount.toString();
    this.payment_update_input.user_payment.enrollementIds = this.enrolments;
    console.log(this.payment_update_input);
    console.table(this.payment_update_input);
    
    //if(this.paymentStatus()){
      this.commonService.showLoader("Please wait");
      const payment_update_mutation = gql`
      mutation updateHolidaycampSessionPaymentAdmin($payment_update_input: HolidayCampPaymentInput_V3!) {
        updateHolidaycampSessionPaymentAdmin(sessionPaymentUpdateInput: $payment_update_input)
      }` 
      
      const variables = {payment_update_input:this.payment_update_input}
  
      this.graphqlService.mutate(payment_update_mutation,variables,0).subscribe(
        result => {
          this.commonService.hideLoader();
          // Handle the result
          this.commonService.toastMessage("Payment updated successfully", 2500,ToastMessageType.Success);
          this.commonService.updateCategory('update_camps_list') ;
          this.navCtrl.pop();                        
        },
        error => {
          // Handle errors
          this.commonService.hideLoader();
          console.error(error);
          this.commonService.toastMessage("Payment updation failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }
      );
    //}
  }


  paymentStatus() {
    if (this.paymentDetails.PaymentAmount == undefined || this.paymentDetails.PaymentAmount == "") {
      const message = "Please contact support, Unable to update.";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }
    if (this.paymentDetails.PaymentMode == null || this.paymentDetails.PaymentMode == undefined) {
      const message = "Please select payment mode";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }
    else if(this.paymentDetails.PaymentStatus == undefined) {
      const message = "Please select payment status.";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }
    // else if (this.paymentDetails.PaymentStatus == "Pending Verification") {
    //   const message = "Payment status should be paid.";
    //   this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
    //   return false;
    // }
    else if (this.paymentDetails.Comments == "") {
      let message = "Please enter comments.";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }
    else {
      return true;
    }

  }
  updatePaymentValidation() {
    this.paymentDetails.PaymentAmount = this.paymentDetails.PaymentAmount.trim();
    if (this.paymentDetails.PaymentAmount == undefined || this.paymentDetails.PaymentAmount == "") {
      let message = "Please contact support, Unable to update";
      this.commonService.toastMessage(message, 2500,ToastMessageType.Error);
      return false;
    }
   
    else if (this.paymentDetails.Comments == "") {
      let message = "Please enter comments";
      this.commonService.toastMessage(message, 2500,ToastMessageType.Error);
      return false;
    }
    else {
      return true;
    }

  }

  validateInput() {
    if (this.paymentDetails.Comments == "") {
      let message = "Please enter comments.";
      this.commonService.toastMessage(message, 3000,ToastMessageType.Error);
      return false;
    }
    else {
      return true;
    }
  }
  presentPopover(myEvent) {
    const popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }


}

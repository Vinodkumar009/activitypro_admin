import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../../services/common.service';
import { FirebaseService } from '../../../../../services/firebase.service';
import { SharedServices } from '../../../../services/sharedservice';
import * as moment from 'moment';
import { Storage } from '@ionic/storage';
import { GraphqlService } from '../../../../../services/graphql.service';
import gql from "graphql-tag";
/**
 * Generated class for the MonthlysesupdatepricePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-monthlysesupdateprice',
  templateUrl: 'monthlysesupdateprice.html',
})
export class MonthlysesupdatepricePage {
  user_subscription:UserSubscriptionInfo = {
    session_id:"",
    user_name:"",
    session_name:"",
    age:0,
    user_type:"",
    enrollement_id:"",
    new_plan_id:"",
    old_plan:"",
    new_price:"",
    old_price:"",
    start_month:"",
    end_month:"",
    currency:"", 
  }
  is_price_changed:boolean = true;
  maxDate:any;
  minDate:any;
  scheduled_date:any;
  price_confirm:string = "";
  price_update_obj:PriceUpdateModal = {
    session_id:"",
    change_date:"",
    enrollement_id:"",
    new_plan_id:"",
    user_postgre_metadata:{
      UserMemberId:this.sharedservice.getLoggedInId()
    },
    user_device_metadata:{
      UserAppType:0,
      //UserActionType
      UserDeviceType:this.sharedservice.getPlatform() == "android" ? 1:2,
    }  
  };
  constructor(public navCtrl: NavController, public navParams: NavParams,
    public commonService: CommonService, 
    public sharedservice: SharedServices,
    public fb: FirebaseService,
    private graphqlService: GraphqlService,
    ) {
    this.user_subscription = this.navParams.get("user_subscription_info");
    // console.log(this.member_session_info);
    this.minDate = moment().add(1,'days').format("YYYY-MM-DD");
    this.scheduled_date = moment().add(1,'days').format("YYYY-MM-DD");
    // //let now = moment().add(10, 'year');
    this.maxDate = moment(this.user_subscription.end_month,"YYYY-MM-DD").subtract(2,'M').format("YYYY-MM-DD");
    if(parseFloat(this.user_subscription.old_price) === parseFloat(this.user_subscription.new_price)){
      this.is_price_changed = false;
    }

    this.price_update_obj.change_date = this.scheduled_date;
    this.price_update_obj.session_id = this.user_subscription.session_id;
    this.price_update_obj.enrollement_id = this.user_subscription.enrollement_id;
    this.price_update_obj.new_plan_id = this.user_subscription.new_plan_id;

    
    //and present_month and session_endmonth same then also not allow to update price
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MonthlysesupdatepricePage');
  }

  updatePrice(){
  // session_id: "a3b786a9-0b38-4ba5-8320-1c3599a186b3"
  // change_date: "2024-03-21"
  // enrollement_id: "898bc7b8-7f05-4403-9c6d-3f46d28b5f07"
  // new_plan_id: ""
    if(this.validateUpdate()){
      console.log("update valid");
      this.commonService.showLoader("Please wait");
      
      const enrol_ses_mutation = gql`
      mutation updateMonthlySessionPrice($enrolInput: MonthlySessionPriceUpdateInput!) {
        updateMonthlySessionPrice(monthlyPriceUpgradeSessionInput: $enrolInput){
          id
          enrolled_date
        }
      }` 
    
    const enrol_mutation_variable = { enrolInput: this.price_update_obj };
      this.graphqlService.mutate(
        enrol_ses_mutation, 
        enrol_mutation_variable,
        0
      ).subscribe((response)=>{
        this.commonService.hideLoader();
        const message = "Price update req submitted successfully";
        this.commonService.toastMessage(message, 2500, ToastMessageType.Success,ToastPlacement.Bottom);
        this.navCtrl.pop();
      },(err)=>{
        this.commonService.hideLoader();
        this.commonService.toastMessage("Price update req failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
      }); 
    }
  }

  validateUpdate(){
    if(this.price_confirm === "" || this.price_confirm.toUpperCase()!= "CONFIRM"){
      this.commonService.toastMessage("Please type CONFIRM",2500,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }else{
      return true;
    }
  }


}

class PriceUpdateModal{
  session_id:string;
  change_date:string;
  enrollement_id:string;
  new_plan_id:string;
  user_postgre_metadata:{
    UserMemberId:string//this.sharedservice.getLoggedInId()
  };
  user_device_metadata:{
    UserAppType:number,
    //UserActionType
    UserDeviceType:number///this.sharedservice.getPlatform() == "android" ? 1:2, //Which app {1:Android,2:IOS,3:Web,4:API}
  }    
}

class UserSubscriptionInfo{
  session_id:string;
  session_name:string;
  user_name:string;
  age:number;
  user_type:string;
  enrollement_id:string;
  new_plan_id:string;
  old_plan:string;
  new_price:string;
  old_price:string;
  start_month:string;
  end_month:string;
  currency:string;           
}





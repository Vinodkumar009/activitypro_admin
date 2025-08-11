import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { SharedServices } from '../../../services/sharedservice';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import moment from 'moment';
import { MonthlySessionDets, MonthlySessionMember } from '../monthlysession/model/monthly_session.model';
import gql from "graphql-tag";
import { GraphqlService } from '../../../../services/graphql.service';
import { MonthlySessionEnrolInput } from '../monthlysession/model/monthly_session_enrol.model';
import { AppType } from '../../../../shared/constants/module.constants';
/**
 * Generated class for the FilterbookingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-cancelmonthlysessubscription',
  templateUrl: 'cancelmonthlysessubscription.html',
})
export class CancelMonthlySesSubscription {
  platformType: any;
  currencycode: any;
  member: any;
  memberDetails: any;
  SubscriptionDets: any;
  cancelText = '';
  loading: any;
  nodeUrl: string;
  nestUrl: string;
  expirationDate: any
  session_dets:MonthlySessionDets;
  user_subscription:MonthlySessionMember;
  enrol_input:MonthlySessionEnrolInput = {
    session_postgre_fields: {
      monthly_session_id:""
    },
    user_device_metadata:{ 
      UserActionType:3,
      UserAppType:1, 
      UserDeviceType:1 
     }, //2-cancel,3-cancel subscription
    enroll_users:[],
    updated_by:""
  };
  constructor(public navCtrl: NavController,
      public storage: Storage, public loadingCtrl: LoadingController, 
      public sharedservice: SharedServices, 
      public comonService: CommonService, 
      public navParam: NavParams,
      private graphqlService: GraphqlService,
    ) {
      this.nestUrl = sharedservice.getnestURL();
      this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        // this.memberDetails = this.navParam.get('SelectedMember')
        // this.SubscriptionDets = this.navParam.get('Subscription')
        // let subscribedMonths = Object.keys(this.SubscriptionDets.MonthlySession).map(date => moment(date, "MMM-YYYY"));
        // this.expirationDate = moment.max(subscribedMonths).format("DD-MMM-YY");
        // this.SubscriptionDets.LastPaymentDate = moment(this.SubscriptionDets.LastPaymentDate,"YYYY-MM-DD").format("DD-MMM-YY");
        // this.platformType = this.sharedservice.getPlatform();
          
      }
    })
    this.session_dets = this.navParam.get('session');
    this.enrol_input.session_postgre_fields.monthly_session_id = this.session_dets.id;
    this.enrol_input.updated_by = this.sharedservice.getLoggedInId();
    this.enrol_input.user_device_metadata.UserAppType = AppType.ADMIN_NEW;
    this.enrol_input.user_device_metadata.UserDeviceType = this.sharedservice.getPlatform() == 'ios' ? 2 : 1; //2-ios,1-android
    this.user_subscription = this.navParam.get('user_subscription');
  }



  cancel() {
    if (this.cancelText.toLowerCase() == 'cancel') {
        this.comonService.commonAlter('Cancel Subscription', 'Are you sure?', async () => {
          this.comonService.showLoader("Please wait");
          this.enrol_input.enroll_users.push({
            member_id:this.user_subscription.user.Id,
            subscription_date: "",
            subscription_status:2,
            enrolled_days: "",
            enrolled_date:"",//"DD-MMM-2024" not required for enrol
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
              this.comonService.hideLoader();
              const message = "User status updated successfully";
              this.comonService.toastMessage(message, 2500, ToastMessageType.Success,ToastPlacement.Bottom);
              this.navCtrl.pop();
            },(err)=>{
              this.comonService.hideLoader();
              this.comonService.toastMessage("User status updation failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
            });
          
        });
    } else {
      this.comonService.toastMessage("Please type 'CANCEL'...", 2000, ToastMessageType.Error)
    }

  }

  

  //monthly session member cancel subscription in postgre
  

}

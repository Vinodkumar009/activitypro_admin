import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, AlertController, LoadingController } from 'ionic-angular';
import moment from 'moment';
import { Storage } from '@ionic/storage';
import { SharedServices } from '../../../services/sharedservice';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { HttpClient } from '@angular/common/http';
import $ from 'jquery'
import { HttpService } from '../../../../services/http.service';
import { MemberShipInput } from '../../member/model/member';
import { API } from '../../../../shared/constants/api_constants';

/**
 * Generated class for the FilterbookingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-cancelmembership',
  templateUrl: 'cancelmembership.html',
  providers: [HttpService]
})
export class CancelMembershipPage {
  platformType: any;
  ClubKey: any;
  ParentClubKey: any;
  currencycode: any;
  membership: any;
  memberDetails: any;
  memberofSameMembership: any = [];
  subscriptionList: any[];
  lastPaymentDate: any = '';
  cancelText = '';
  loading: any;
  nodeUrl: string;
  nestUrl: string;
  cancel_input: MemberShipInput = {
    parentclubId: "",
    clubId: "",
    activityId: "",
    memberId: "",
    action_type: 0,
    device_type: 0,
    app_type: 0,
    device_id: "",
    updated_by: "",
    membership_id: ""
  }
  membership_info:ICancelMembership;
  
  constructor(public navCtrl: NavController,
    public storage: Storage, public http: HttpClient, 
    public sharedservice: SharedServices, 
    public comonService: CommonService, 
    public navParam: NavParams,
    public httpService: HttpService,
  ) {
    this.membership_info = this.navParam.get('cancellation_obj');
    this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      // if (val.$key != "") {
      //   this.ParentClubKey = val.UserInfo[0].ParentClubKey;
      //   this.currencycode = val.Currency;
      //   this.membership = this.navParam.get('membership')
      //   this.memberDetails = this.navParam.get('member')
      //   this.platformType = this.sharedservice.getPlatform();
      //   //this.getAllDetails()
      // }
    })
    this.storage.get('postgre_parentclub').then((postgre_parentclub) => {
      this.cancel_input.parentclubId = postgre_parentclub.Id;
      this.cancel_input.memberId = this.membership_info.member_id
      this.cancel_input.membership_id = this.membership_info.membership_id
      this.cancel_input.membership_package_id = this.membership_info.membership_package_id
    })
  }

  getAllDetails() {
    this.memberofSameMembership = this.membership.memberPresent.filter(eachMember => eachMember.primaryMembershipKey === this.memberDetails.primaryMembershipKey)
    if (this.memberDetails['Subscriptions']) {
      this.subscriptionList = []
      let subList = this.comonService.convertFbObjectToArray(this.memberDetails['Subscriptions'].SubscriptionDetails)
      subList.forEach(sub => {
        if (sub.IsPaid) {
          this.lastPaymentDate = moment(sub.TransactionDate).format('DD MMM YYYY')
        }
      });
    }
  }

  cancel() {
    if (this.cancelText.toLowerCase() == 'cancel') {
      // if (this.memberDetails.IsCancelled) {
      //   this.comonService.toastMessage("This membership is already cancelled...", 2500, ToastMessageType.Error)
      // } else if (!this.memberDetails.subId) {
      //   this.comonService.toastMessage("Monthly setup is not available...", 2500, ToastMessageType.Error)
      // } else {
        
      // }
      try {
        this.comonService.commonAlter('Cancel Membership', 'Are you sure want to cancel membership?', async () => {
          this.httpService.post(`${API.CANCEL_MEMBERSHIP}`, this.cancel_input)
            .subscribe(data => {
            //this.commonService.hideLoader();
              console.log(data)
              this.comonService.toastMessage('Membership cancelled', 2500, ToastMessageType.Success, ToastPlacement.Bottom)
              this.comonService.updateCategory("update_user_memberships_list");
              this.navCtrl.pop();
        },
        error => {
              if (error) {
                this.comonService.toastMessage(error.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom)
              }
          })
        })
      } catch (err) {
        this.loading.dismiss();
        this.comonService.toastMessage("Please try again / contact support team", 2500, ToastMessageType.Error)
      }

    } else {
      this.comonService.toastMessage("Please type 'CANCEL'...", 2500, ToastMessageType.Error)
    }

  }

  

}


export interface ICancelMembership{
  membership_name:string,
  expiry_date:string,
  last_payment_date:string,
  membership_id:string,
  member_id:string,
  membership_package_id:string
}

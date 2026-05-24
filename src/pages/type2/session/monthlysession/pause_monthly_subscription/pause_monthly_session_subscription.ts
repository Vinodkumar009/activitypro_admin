import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../../services/common.service';
import { FirebaseService } from '../../../../../services/firebase.service';
import { SharedServices } from '../../../../services/sharedservice';
import * as moment from 'moment';
import { Storage } from '@ionic/storage';
import { GraphqlService } from '../../../../../services/graphql.service';
import gql from "graphql-tag";
import { API } from '../../../../../shared/constants/api_constants';
import { HttpService } from '../../../../../services/http.service';
import { MonthlySessionMember } from '../model/monthly_session.model';

/**
 * Generated class for the PauseMonthlySessionSubscriptionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-pause_monthly_session_subscription',
  templateUrl: 'pause_monthly_session_subscription.html',
  providers: [HttpService]
})
export class PauseMonthlySessionSubscriptionPage {

  enroledId: string = "";
  sessionUsers: MonthlySessionMember[] = [];
  selectedMonths: string = "1"; // 📅 Default to 1 month

  // 📅 Array defining the pause duration options
  pause_subscription_months = [
    { id: '1', month_text: '1 month' },
    { id: '2', month_text: '2 months' },
    { id: '3', month_text: '3 months' },
  ];

  confirmText: string = '';

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public commonService: CommonService,
    public sharedservice: SharedServices,
    public fb: FirebaseService,
    private httpService: HttpService
  ) {
    this.enroledId = this.navParams.get("enrolled_id");
    console.log('🔍 Enrolled ID:', this.enroledId);
    this.sessionUsers = this.navParams.get("session_users");
    console.log('👥 Session Users:', this.sessionUsers);
  }

  ionViewDidLoad() {
    console.log('📱 ionViewDidLoad PauseMonthlySessionSubscriptionPage');
  }

  // ✅ Getter for button disabled state without side effects (case sensitive)
  get isFormValid(): boolean {
    return this.confirmText === "CONFIRM" && !!this.selectedMonths;
  }

  // 🎯 Handle pause button click with validation
  onPauseClick(enrol_id?: string): void {
    if (!this.validatePauseInput()) {
      return; // ❌ Stop execution if validation fails
    }
    // 🚀 Directly call pause with selected months
    this.pauseSubscriptions(this.selectedMonths, enrol_id);
  }

  // 🛑 Pause subscriptions with proper error handling
  async pauseSubscriptions(months_selected: string, enrolment_id?: string): Promise<void> {
    try {
      console.log('✅ Valid pause request');
      this.commonService.showLoader("Please wait");

      const pauseSubscribeInput = {
        resume_for_months: months_selected,
        enrolments_ids: enrolment_id ?
          [enrolment_id] :
          this.sessionUsers
            .filter(member => member.subscription_status == 1)
            .map(member => member.enrolled_id),
      };

      this.httpService.post(`${API.PAUSE_MONTHLY_SUBSCRIPTION}`, pauseSubscribeInput, null, 3)
        .subscribe({
          next: (res) => {
            this.commonService.hideLoader();
            this.commonService.toastMessage(
              "Pause subscription successfully",
              2500,
              ToastMessageType.Success,
              ToastPlacement.Bottom
            );
            this.navCtrl.pop();
          },
          error: (err) => {
            this.commonService.hideLoader();
            const errorMessage = err.message || 'Pause request failed';
            this.commonService.toastMessage(
              `❌ ${errorMessage}`,
              2500,
              ToastMessageType.Error,
              ToastPlacement.Bottom
            );
          }
        });

    } catch (err) {
      this.commonService.hideLoader();
      this.commonService.toastMessage(
        'Pause request failed',
        2500,
        ToastMessageType.Error,
        ToastPlacement.Bottom
      );
    }
  }

  // 🔍 Validate pause input and show toast only when needed (case sensitive)
  private validatePauseInput(): boolean {
    if (!this.confirmText || this.confirmText !== "CONFIRM") {
      this.commonService.toastMessage(
        "⚠️ Please type CONFIRM (exactly in uppercase)",
        2500,
        ToastMessageType.Error,
        ToastPlacement.Bottom
      );
      return false;
    }
    return true;
  }
}

// 📋 Interface for user subscription information
interface UserSubscriptionInfo {
  session_id: string;
  session_name: string;
  user_name: string;
  age: number;
  user_type: string;
  enrollement_id: string;
  new_plan_id: string;
  old_plan: string;
  new_price: string;
  old_price: string;
  start_month: string;
  end_month: string;
  currency: string;
}
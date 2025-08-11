import { Component } from '@angular/core';
import { ActionSheetController, IonicPage, NavController, NavParams } from 'ionic-angular';
import { SharedServices } from '../../../services/sharedservice';
import { Storage } from '@ionic/storage';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { HttpService } from '../../../../services/http.service';
import { API } from '../../../../shared/constants/api_constants';
import { AppType } from '../../../../shared/constants/module.constants';
import { PendingTermSessionResDto } from '../model/session.model';
import { GraphqlService } from "../../../../services/graphql.service";
import gql from "graphql-tag";
import { CommonIdFields, UserDeviceMetadata } from '../../../../shared/model/common.model';
/**
 * Generated class for the PendingTermSessionsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-pending-term-sessions',
  templateUrl: 'pending-term-sessions.html',
  providers: [HttpService]
})
export class PendingTermSessionsPage {
  loggedin_type:number = 2;
  can_coach_see_revenue:boolean = true;
  currencyDetails: any;
  postgre_parentclub_id:string = ""; 
  pending_payments:PendingTermSessionResDto[] = [];
  filtered_payments:PendingTermSessionResDto[] = [];
  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public storage: Storage,
    public commonService: CommonService,
    public sharedservice: SharedServices,
    private httpService: HttpService,
    public actionSheetCtrl: ActionSheetController,
    private graphqlService: GraphqlService,

  ) {
  }

  async ionViewDidLoad() {
    console.log('ionViewDidLoad PendingTermSessionsPage');
    this.loggedin_type = this.sharedservice.getLoggedInType();
    if(this.loggedin_type == 4){
        this.can_coach_see_revenue = this.sharedservice.getCanCoachSeeRevenue();
    }
    
    const [userobj,currency,postgre_parentclub] = await Promise.all([
      this.storage.get("userObj"),
      this.storage.get('Currency'),
      this.storage.get('postgre_parentclub')
    ])
    if (postgre_parentclub) {
      this.postgre_parentclub_id = postgre_parentclub.Id;
    }
    this.currencyDetails = JSON.parse(currency);
    //this.user_status_update.updated_by = JSON.parse(userobj).$key; 
    this.getPendingSessionUsers(); 
  }

  ionViewWillEnter(){
         
  }   

  getPendingSessionUsers() {
    try {
      const update_input = {
        parentclub_id: this.postgre_parentclub_id,
        device_type: this.sharedservice.getPlatform() == "android" ? 1 : 2,
        action_type:0,
        updated_by: this.sharedservice.getLoggedInId(),
        device_id: this.sharedservice.getDeviceId() || AppType.ADMIN_NEW.toString(),
        app_type: AppType.ADMIN_NEW,
      }

      //const bookingDetailsDTO = new UpdateEventTicketDto(update_input);
      console.log("input for bookinginfo", update_input)
      this.httpService.post<{ data: any }>(`${API.TERM_SESSION_PENDING_PAYMENTS}`, update_input)
        .subscribe({
          next: (res) => {
            this.pending_payments = res.data;
            this.filtered_payments = JSON.parse(JSON.stringify(this.pending_payments));
            console.log("updated event", JSON.stringify(res.data));
            const msg = this.pending_payments.length > 0 ? `${this.pending_payments.length} Pending payments found`:`No Pending payments found`
            this.commonService.toastMessage(msg, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
          },
          error: (err) => {
            console.error("Ticket info update:", err);
            if (err.error.message) {
              this.commonService.toastMessage(err.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
            } else {
              this.commonService.toastMessage('Pending payments fetch failed', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
            }
          }
        });
    } catch (err) {
      this.commonService.toastMessage('AddOn info update failed', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    }
  }

  getFilteredPlayer(ev: any) {
    //Reset items back to all of the items
    //this.resetItems();
    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim()!= '') {
      if(val.length < 2){
        return;
      }
      this.filtered_payments = this.pending_payments.filter((item) => {
        if (item.session_name != undefined) {
          //(item.campname.toLowerCase().indexOf(val.toLowerCase()) > -1)
          if(item.session_name.toLowerCase().indexOf(val.toLowerCase()) > -1){
            return true;
          }
        }
        if (item.user_first_name != undefined) {
          //return (item.username.toLowerCase().indexOf(val.toLowerCase()) > -1)
          if(item.user_first_name.toLowerCase().indexOf(val.toLowerCase()) > -1){
            return true;
          }
        }
        if (item.user_last_name != undefined) {
          //return (item.username.toLowerCase().indexOf(val.toLowerCase()) > -1)
          if(item.user_last_name.toLowerCase().indexOf(val.toLowerCase()) > -1){
            return true;
          }
        }
      })
    }else{
      this.resetItems();
    }

  }

  resetItems() {
    this.filtered_payments = this.pending_payments;
  }


  showPendingActionSheet(session_ind: number) {
    let actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'View Session',
          icon: 'ios-eye',
          handler: () => {
            this.navCtrl.push("GroupsessiondetailsPage", {
              session_id: this.filtered_payments[session_ind].session_id
            });
          }
        },
        {
          text: 'Remove Player',
          icon: 'ios-trash',
          handler: () => {
            this.unEnrolAlertConfirmation(this.filtered_payments[session_ind]);
          }
        }
      ]
    });
    actionSheet.present();
  }

  unEnrolAlertConfirmation(session_member:PendingTermSessionResDto){
      const title = "Remove Member";
      const message = "Are you sure you want to remove the member?";
      const agreeBtn = "Yes";
      const disAgreeBtn = "No"
      
      this.commonService.commonAlert_V3(title, message, agreeBtn,disAgreeBtn, (res)=>{
          this.unEnrolUser(session_member);
      })
  }
  
  //unenroling a user from session
  unEnrolUser(session_member:PendingTermSessionResDto){
      const unenrol_model = UserTermSessionEnrolmentModel.getPendingEnrolledUser(session_member);
      unenrol_model.user_postgre_metadata.UserParentClubId = this.postgre_parentclub_id;
      unenrol_model.user_postgre_metadata.UserMemberId = this.sharedservice.getLoggedInId();
      unenrol_model.updated_by = this.sharedservice.getLoggedInId();
      unenrol_model.user_device_metadata.UserDeviceType = this.sharedservice.getPlatform() == "android" ? 1:2;
      
      const enrol_ses_mutation = gql`
      mutation updateMembersEnrolStaus($enrolInput: TermSesEnrolDets!) {
          updateMembersEnrolStaus(session_enrol_members: $enrolInput){
              status
              enrolled_ids
        }
      }` 
      
      const enrol_mutation_variable = { enrolInput: unenrol_model };
        this.graphqlService.mutate(
          enrol_ses_mutation, 
          enrol_mutation_variable,
          0
        ).subscribe((response)=>{
          const message = "User removed from the session";
          this.commonService.toastMessage(message, 2500, ToastMessageType.Success,ToastPlacement.Bottom);
          this.filtered_payments.splice(this.filtered_payments.findIndex(pending_payment => pending_payment.enrol_id === session_member.enrol_id),1);
          this.pending_payments.splice(this.pending_payments.findIndex(pending_payment => pending_payment.enrol_id === session_member.enrol_id),1);
        },(err)=>{
          this.commonService.toastMessage("User status updation failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }); 
  }


}



export class TermEnrolUsers_V1 {
  member_id: string; //can be frebase until we completely migrate
  is_amended: boolean;
  amount_due: string
}


export class UserTermSessionEnrolmentModel extends UserDeviceMetadata{ //it might be enrol/unenrol
  session_id: string; //can be firebase until we completely migrate
  enrol_users: TermEnrolUsers_V1[];
  action_type: number; // 1 for enrol, 0 for unenrol
  updated_by: string;
  parent_fireabse_id: string;
  get_payments: boolean;
  constructor(){
    super();
  }


    static getPendingEnrolledUser(pending_payment_info:PendingTermSessionResDto){
      const term_session = new UserTermSessionEnrolmentModel();
      
      term_session.user_device_metadata = {
        UserActionType:0,
        UserAppType:AppType.ADMIN_NEW,
        UserDeviceType:1
      }
      term_session.user_postgre_metadata = {
        UserParentClubId: "", //ParentClub Key
        UserClubId: "", //ParentClub Key
        UserMemberId: "" //ParentClub Key
        ///UserActivityId?: string; 
      }
      
      term_session.enrol_users = [{
        member_id: pending_payment_info.user_id,
        is_amended: false,
        amount_due: pending_payment_info.amount_due.toString()
      }]

      term_session.session_id = pending_payment_info.session_id,
      term_session.updated_by = "";
      term_session.get_payments = false;
      
      return term_session;
  }
}
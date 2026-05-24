import { Component,ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController, ActionSheetController, Platform, Label, ModalController, ToastController, FabContainer, LoadingController } from 'ionic-angular';
// import * as moment from 'moment';
import { Storage } from '@ionic/storage';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { SharedServices } from '../../../services/sharedservice';
import moment from 'moment'
import { Membership, MembershipEnrolUsers } from '../../membership/dto/membershi.dto';
import { API } from '../../../../shared/constants/api_constants';
import { AppType } from '../../../../shared/constants/module.constants';
import { HttpService } from '../../../../services/http.service';
import { GraphqlService } from '../../../../services/graphql.service';
import gql from 'graphql-tag';

@IonicPage()
@Component({
    selector: 'page-membershipmemberlisting',
    templateUrl: 'membershipmemberlisting.html',
    providers:[HttpService]
})
export class membershipMemberListing {
    @ViewChild('fab') fab: FabContainer;
    enrol_count:number = 0;
    platformType: string = "";
    PaidMembers = [];
    PendingMembers = [];
    isSelected: boolean = false;
    ParentClubKey: any;
    currencyDetails: any;
    selectedClubKey: string = '';
    currencycode: any;
    membership: Membership;
    membership_users:MembershipEnrolUsers[] = [];
    ClubKey: any;
    ismonthlydetailsOn: boolean = false;
    subscriptionList: any = [];
    type: number = 1;
    postgre_parentclub_id:string = "";
    pending_member_count:number = 0;
    paid_member_count:number = 0;
    membership_type:number = 1;
    constructor(
        public alertCtrl: AlertController,
        public navCtrl: NavController,
        public navParam: NavParams,
        public modalController: ModalController,
        public actionSheetCtrl: ActionSheetController,
        public storage: Storage,
        public loadingCtrl: LoadingController,
        //public http: HttpClient,
        public sharedservice: SharedServices,
        public comonService: CommonService,
        private httpService:HttpService,
        private graphqlService:GraphqlService,
    ) {
        
    }

    ionViewWillEnter(){
        this.platformType = this.sharedservice.getPlatform();
        this.storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            if (val.$key != "") {
                this.ParentClubKey = val.UserInfo[0].ParentClubKey;
                this.currencycode = val.Currency;
            }
            console.log("ParentClubKey: ", this.ParentClubKey)
            
           
            // this.membership.memberPresent.forEach(mem => {
            //     mem["subsOn"] = false
            //     mem.ValidityDate = moment(new Date(mem.Validity)).format('DD MMM YYYY')
            //     if (mem.PaymentOptions === "Yearly") {
            //         if (mem.IsPaid) {
            //             this.PaidMembers.push(mem);
            //         } else {
            //             this.PendingMembers.push(mem);
            //         }
            //     }
            //     else if (mem.PaymentOptions === "Monthly") {
            //         if (mem['Subscriptions']) {
            //             let IsPaid = false;
            //             let presentMonYear = moment(new Date()).format("MMM-YYYY")
            //             this.comonService.convertFbObjectToArray(mem['Subscriptions'].SubscriptionDetails).forEach(sub => {
            //                 sub['Date'] = moment(new Date(+sub.Key)).format("MMM-YYYY")
            //                 if ((sub['Date'] === presentMonYear) && (sub.IsPaid)) {
            //                     mem["subsOn"] = true
            //                     this.PaidMembers.push(mem);
            //                     IsPaid = true;
            //                 }
            //             });
            //             if(!IsPaid){
            //                 this.PendingMembers.push(mem);
            //             }
            //         }
            //     }
            // });

            // if(this.PaidMembers.length > 0)this.PaidMembers = this.comonService.sortingObjects(this.PaidMembers,"DisplayName");
            // if(this.PendingMembers.length > 0)this.PendingMembers = this.comonService.sortingObjects(this.PendingMembers,"DisplayName");

        })
        this.storage.get('postgre_parentclub').then((postgre_parentclub)=>{
            this.postgre_parentclub_id = postgre_parentclub.Id;
            //this.enrol_count = this.navParam.get('membership').membership_member_count;
            this.membership_type = this.navParam.get('type');
            if(this.membership_type == 1){
                this.getMembershipRenewalEnrols();//membership renewals
            }else{
                this.membership = this.navParam.get('membership')
                this.getMembershipEnrols(1);//normal membership enrols
            }
        });
        
        this.storage.get('Currency').then((val) => {
            this.currencyDetails = JSON.parse(val);
        });
    }

    getMembershipEnrols(selected_type:number){
        this.comonService.showLoader("Please wait");
        this.membership_users = [];
        this.type = selected_type;
        const get_memberships_payload = {
            parentclubId:this.postgre_parentclub_id,
            membership_id:this.membership.id,
            //clubId:this.Venues.find(venue => venue.FirebaseId === this.selectedClubKey).Id,
            action_type:this.type,
            device_type:this.sharedservice.getPlatform() == "android" ? 1:2,
            app_type:AppType.ADMIN_NEW//new admin
          }
          this.httpService.post(API.MEMBERSHIP_ENROLS,get_memberships_payload).subscribe((res: any) => {
            console.table(`enrols:${res}`);
            this.comonService.hideLoader();
            if(res && res.data) {
                this.membership_users = res.data.enrols as MembershipEnrolUsers[];
                this.enrol_count = res.data.enrol_count;
                this.paid_member_count = res.data.paid_count;
                this.pending_member_count = res.data.pending_count;
            }
          },
         (error) => {
              this.comonService.hideLoader();
              console.error("Error in fetching:", error);
              this.comonService.toastMessage("No setups found", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
             // Handle the error here, you can display an error message or take appropriate action.
         })
    }

    getMembershipRenewalEnrols(){
        this.comonService.showLoader("Please wait");
        this.membership_users = [];
        const get_memberships_payload = {
            parentclubId:this.postgre_parentclub_id,
            action_type:this.type,
            device_type:this.sharedservice.getPlatform() == "android" ? 1:2,
            app_type:AppType.ADMIN_NEW//new admin
          }
          this.httpService.post(API.GET_NEXT_RENEWALS,get_memberships_payload).subscribe((res: any) => {
            console.table(`enrols:${res}`);
            this.comonService.hideLoader();
            if(res && res.data) {
                this.enrol_count = res.data.enrol_count;
                this.membership_users = res.data.enrols as MembershipEnrolUsers[];
                // this.paid_member_count = res.data.paid_count;
                // this.pending_member_count = res.data.pending_count;
            }
          },
         (error) => {
              this.comonService.hideLoader();
              console.error("Error in fetching:", error);
              this.comonService.toastMessage("No setups found", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
             // Handle the error here, you can display an error message or take appropriate action.
         }) 
    }

    openActionSheet(member:MembershipEnrolUsers) {
        let actionSheet = this.actionSheetCtrl.create({
            buttons : this.createButtons(member)
        });
        actionSheet.present();
    }

    createButtons(member:MembershipEnrolUsers) {
        let buttons = [];
        let button 
        let possibleButtons = [{text: 'Manage Membership',icon:'ios-create-outline',},
        {text: 'Membership Details',icon:'ios-clipboard-outline',},{text: 'Cancel Membership',icon:'ios-trash-outline',},
        //{text: 'Payment Update',icon:'ios-create-outline'},
        {text: 'Renew Membership',icon:'ios-create-outline',}]

        const today = moment().format("YYYY-MMM");
        const expired_day = moment(member.formatted_exp_date,"DD-MMM-YYYY").format("YYYY-MMM");

        if(member.subscription_status == 2 || member.subscription_status == 0){ //not monthly or is_cancelled
            //possibleButtons.splice(2, 1)
            const btnInd = possibleButtons.findIndex(btn => btn.text === "Cancel Membership");
            if(btnInd > -1)possibleButtons.splice(btnInd, 1);
        }   
        if(member.subscription_status == 0){ //not monthly or is_cancelled
            //possibleButtons.splice(2, 1)
            const btnInd = possibleButtons.findIndex(btn => btn.text === "Membership Details");
            if(btnInd > -1)possibleButtons.splice(btnInd, 1);
        } 
        // if(member.PaymentOptions == 'Monthly'){
        //     //possibleButtons.pop()
        //     const btnInd = possibleButtons.findIndex(btn => btn.text === "Payment Update");
        //     possibleButtons.splice(btnInd, 1);
        // } 
        // if(member.PaymentOptions == 'Yearly' && member.IsPaid){
        //     //possibleButtons.pop()
        //     const btnInd = possibleButtons.findIndex(btn => btn.text === "Payment Update");
        //     possibleButtons.splice(btnInd, 1);
        // } 
        if(moment(today).isBefore(moment(expired_day)) || member.membership_type == 2){
            const btnInd = possibleButtons.findIndex(btn => btn.text === "Renew Membership");
            if(btnInd > -1)possibleButtons.splice(btnInd, 1);
        }
        if(member.membership_type === 2){
            const btnInd = possibleButtons.findIndex(btn => btn.text === "Renew Membership");
            if(btnInd > -1)possibleButtons.splice(btnInd, 1);
        }
        for (var index in possibleButtons) {
            let handler
            if(possibleButtons[index].text == 'Manage Membership'){
                handler = ()=>{
                    const user_input = {
                        member_id:member.family_group_id,
                        user_postgre_metadata:{
                          UserMemberId:this.sharedservice.getLoggedInId()
                        },
                        user_device_metadata:{
                          UserAppType:0,
                          //UserActionType
                          UserDeviceType:this.sharedservice.getPlatform() == "android" ? 1:2, //Which app {1:Android,2:IOS,3:Web,4:API}
                        }
                      }
                      const userQuery = gql`
                      query getUserDetsForAdmin($user_input: userDetsAdminInput!) {
                        getUserDetsForAdmin(userInput:$user_input){
                            Id
                            parent_firstname
                            parent_lastname
                            DOB
                            clubkey
                            parentFirebaseKey
                            email
                            phone_number
                            childcount
                            is_enable
                            is_coach
                            handicap
                            is_gold_member
                            allow_court_booking
                            membership_Id
                            vehicleRegNo1
                            vehicleRegNo2
                            Gender
                            medical_condition
                            parent_status
                            media_consent
                        }
                      }
                    `;
                    this.graphqlService.query(userQuery,{user_input:user_input},0).subscribe(({data}) => {
                        
                        //const memberInfo = data["getUserDetsForAdmin"];
                        this.navCtrl.push("ShowmembershipPage", {MemberInfo:data["getUserDetsForAdmin"] });
                        this.comonService.updateCategory("update_user_memberships_list")
                    },(err)=>{
                        this.comonService.toastMessage("User det's fetch failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
                    });
                    
                }
               
            }else if(possibleButtons[index].text == 'Membership Details'){
                handler = ()=>{
                    this.navCtrl.push('MonthlyRecord', { enrol_info: member })
                }
            }
            else if(possibleButtons[index].text == 'Renew Membership'){
                handler = ()=>{
                    this.navCtrl.push('MonthlyRecord', { membership: this.membership, member: member,type:'renew' })
                }
            }
            else if(possibleButtons[index].text == 'Cancel Membership'){
                handler = () => {
                    const cancellation_obj =  {
                        membership_name:member.membership_name,
                        expiry_date:member.formatted_exp_date,
                        last_payment_date:member.formatted_latest_payment_date,
                        membership_id:member.membership_id,
                        member_id:member.user_id,
                        membership_package_id:member.membership_package_id
                    }
                    this.navCtrl.push('CancelMembershipPage', {cancellation_obj})
                }
            }
            // else if(possibleButtons[index].text == 'Payment Update'){
            //     handler = () => {
            //         this.navCtrl.push('UpdatePayment', { membership: this.membership, member: member })
            //     }
            // }
            button = {
                text: possibleButtons[index].text,
                icon: possibleButtons[index].icon,
                handler: handler
              }
          buttons.push(button);
        }
        return buttons;
      }
    
    

    
}




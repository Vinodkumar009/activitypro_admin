import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController, ActionSheetController, Platform } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { Storage } from '@ionic/storage';
import * as moment from 'moment';
import $ from "jquery";
import { HttpClient } from '@angular/common/http';
import { BookingDetails, BookingSummaryInput, MemberShipUser, ModifyMemberShipAdminFees } from '../model/member';
import { SharedServices } from '../../../services/sharedservice';
import { HttpService } from '../../../../services/http.service';
import { API } from '../../../../shared/constants/api_constants';
import { AppType } from '../../../../shared/constants/module.constants';

/**
 * Generated class for the MemberprofilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-editfeesmembership',
    templateUrl: 'editfeesmembership.html',
    providers: [HttpService]
})
export class EditFeesMembershipPage {
    selectedClubKey: any;
    ParentClubKey: any;

    currencyDetails: any;

    MemberKey: any;
    Key: any;
    IsThereAnyActiveSetup = false;

    selectedMember: any[];
    AllSetups: any[];
    eachSetup: MemberShipUser;

    paymentOptions = {
        Monthly: {
            Price: 0,
            DiscountPercentage: 0,
            DiscountAbsolute: 0,
            IsActive: false

        }, Quaterly: {
            Price: 0,
            DiscountPercentage: 0,
            DiscountAbsolute: 0,
            IsActive: false

        }, Yearly: {
            Price: 0,
            DiscountPercentage: 0,
            DiscountAbsolute: 0,
            IsActive: false

        },
    }
    clubKey: any;
    amount: string;
    type: any;
    isAdminfees = false;
    isfees = false;
    primaryMembershipGroup: any;
    showEditList = [];

    memberShipType: string;
    adminFee: string;
    subtotalAmount: number = 0;
    oneTimeDiscount: number = 0;
    totalAmount: number = 0;
    clubId: string;
    bookingDetails: BookingDetails;
    memberId: string;
    min = 0;
    membershipAmount: number = 0;
    membership_amt_with_currency: string = "";
    adminFees: number = 0;

    bookingSummaryInput: BookingSummaryInput = {
        parentclubId: '',
        clubId: '',
        activityId: '',
        memberId: '',
        action_type: 0,
        device_type: 0,
        app_type: 0,
        device_id: '',
        updated_by: '',
        membership_package_id: ''
    }


    constructor(
        public alertCtrl: AlertController,
        public comonService: CommonService,
        public navCtrl: NavController,
        public navParams: NavParams,
        public actionSheetCtrl: ActionSheetController,
        storage: Storage,
        public http: HttpClient,
        private sharedservice: SharedServices,
        private httpService: HttpService
    ) {
        storage.get('Currency').then((val) => {
            this.currencyDetails = JSON.parse(val);
            this.eachSetup = this.navParams.get("eachSetup")
            this.clubKey = this.navParams.get("clubKey")
            this.ParentClubKey = this.navParams.get('ParentClubKey')
            this.clubId = this.navParams.get("clubId");
            this.type = this.navParams.get("type")
            // this.amount = this.eachSetup.membership_package.amount;
            this.memberShipType = this.eachSetup.membership_package.membership_type_text;
          

            $('#text').attr('disabled', 'disabled')
            storage.get('postgre_parentclub').then((postgre_parentclub) => {
                this.bookingSummaryInput.parentclubId = this.sharedservice.getPostgreParentClubId();
                this.bookingSummaryInput.clubId = this.clubId;
                this.bookingSummaryInput.memberId = ''
                this.bookingSummaryInput.membership_package_id = this.eachSetup.membership_package.id;
                this.bookingSummaryInput.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2;
                this.memberId = this.navParams.get("memberId");
                this.getBookingSummary();
                // this.getDiscounts()
            })
         
        })

    }

    ionViewDidEnter() {
    }

    getBookingSummary() {
        this.httpService.post(`${API.GET_BOOKING_SUMMARY}`, this.bookingSummaryInput).subscribe((res: any) => {
            this.bookingDetails = res["data"];
            this.membershipAmount = parseFloat(this.bookingDetails.booking_payment_summary.total_membership_amount) || 0;
            this.membership_amt_with_currency = this.bookingDetails.booking_payment_summary.total_membership_amount_currency;
            this.adminFees = parseFloat(this.bookingDetails.booking_payment_summary.admin_fees) || 0;

            // Add other fields if necessary, following the same conversion pattern
            this.subtotalAmount = this.membershipAmount + this.adminFees;
            this.oneTimeDiscount = parseFloat(this.bookingDetails.booking_payment_summary.one_time_discount_fee);
            this.totalAmount = parseFloat(this.bookingDetails.booking_payment_summary.total_net_payment_amount);
        },
        (error) => {
                this.comonService.toastMessage("Booking summary fetch failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
                //this.comonService.hideLoader();
        })
    }

    getFormattedDate(date) {
        return moment(new Date(date)).format("MMM YYYY");
    }

    onAdminFeesChange(event: any) {
        // Extract the value from the event and convert it to a number
        const value = event.value;
        this.adminFees = Number(value);

        // Recalculate the subtotal
        this.updateSubtotal();
    }


    updateSubtotal() {
        // Convert adminFees to a number if it's a string
        const adminFeesNumeric = Number(this.adminFees);

        // Calculate subtotalAmount
        this.subtotalAmount = this.membershipAmount + adminFeesNumeric;

        // Call the next method
        this.updateTotalAmount();
    }

    onDiscountChange(event: any) {
        // Convert the value of oneTimeDiscount to a number
        const value = event.value;
        //this.oneTimeDiscount = parseFloat(value) + this.oneTimeDiscount;
        this.oneTimeDiscount = parseFloat(value) > 0 &&  value!='' ? parseFloat(value) : 0;
        // if(value == '' || value == 0){
        //     this.oneTimeDiscount = parseFloat(this.bookingDetails.booking_payment_summary.one_time_discount_fee)
        // }
        // Ensure the discount doesn't exceed the subtotal
        if (this.oneTimeDiscount > this.subtotalAmount) {
            this.oneTimeDiscount = this.subtotalAmount;
        }

        // Update the total amount
        this.updateTotalAmount();
    }

    updateTotalAmount() {
        // Ensure the discount is correctly applied
        const club_discounts = parseFloat(this.bookingDetails.booking_payment_summary.discount_amount);
        this.totalAmount = (this.subtotalAmount) - (this.oneTimeDiscount + club_discounts)  ;
    }

    // Method to update the total amount
    // updateTotalAmount() {
    //     this.totalAmount = this.subtotalAmount - this.oneTimeDiscount;
    // }

    checkTrue() {
        //if(this.type == 'fees' && this.isfees){
        $('#text').attr('disabled', false)
        //}

    }

    getDiscounts() {
        // try {
        //   this.http.get(`https://activitypro-nest-261607.appspot.com/membership/membershipinfo?memberKeys=${this.eachSetup.MemberKey}&clubKey=${this.clubKey}&parentClubKey=${this.ParentClubKey}`).subscribe((data: any) => {

        //     if (data.status == 200) {
        //         this.primaryMembershipGroup  =  data.data['primaryMemberShipDetails'][this.eachSetup.primaryMembershipKey]
        //     }
        //   }, (err) => {
        //     console.log(JSON.stringify(err));
        //   });
        // } catch (err) {

        // }
    }


    save() {
        //     if(this.type == 'fees' && this.eachSetup.PaymentOptions == 'Yearly'){         
        //         this.primaryMembershipGroup.forEach(mem => {
        //             this.fb.update(mem.membershipAssignKey, "Membership/MembershipAssigned/" + this.ParentClubKey + "/" + this.clubKey + "/" + mem.memberKey, {Amount:this.amount})
        //         });
        //     }else if(this.type == 'fees' && this.eachSetup.PaymentOptions == 'Monthly'){
        //         this.primaryMembershipGroup.forEach(mem => {
        //             this.showEditList.forEach(sub =>{
        //                 this.fb.update(sub.Key, "Membership/MembershipAssigned/" + this.ParentClubKey + "/" + this.clubKey + "/" + mem.memberKey + "/" + mem.membershipAssignKey +"/Subscriptions/SubscriptionDetails", {Amount:sub.Amount})
        //             })
        //         });

        //     }
        //     else if(this.type == 'adminfees'){

        //    this.primaryMembershipGroup.forEach(mem => {
        //     this.fb.update(mem.membershipAssignKey, "Membership/MembershipAssigned/" + this.ParentClubKey + "/" + this.clubKey + "/" +  mem.memberKey, { AdminFees:this.eachSetup.AdminFees})
        // });

        //     }
        try {
            this.comonService.commonAlert_V4('Edit Fee', 'Are you sure you want to update?', 'Yes', 'No',async()=>{
                const oldAdminFees = parseFloat(this.bookingDetails.booking_payment_summary.admin_fees)
                const oldOneTimeDiscount = parseFloat(this.bookingDetails.booking_payment_summary.one_time_discount_fee);
                const feeEditInput: ModifyMemberShipAdminFees = {
                    parentclubId: this.bookingSummaryInput.parentclubId,
                    clubId: this.bookingSummaryInput.clubId,
                    activityId: '',
                    memberId: this.memberId,
                    action_type: 0,
                    device_type:this.sharedservice.getPlatform() == "android" ? 1 : 2,
                    app_type: AppType.ADMIN_NEW,
                    device_id: this.sharedservice.getDeviceId(),
                    updated_by: this.sharedservice.getLoggedInId(),
                    membership_package_id: this.eachSetup.membership_package.id,
                    amount:this.membershipAmount.toString(),
                    admin_fees: this.adminFees.toString(),
                    start_date: '',
                    end_date: ''
                }
                if (this.adminFees !== oldAdminFees && this.oneTimeDiscount!==oldOneTimeDiscount) {
                    await Promise.all([this.modifyAdminFee(feeEditInput), this.modifyOneTimeDiscount(feeEditInput)]).then((res)=>{
                        this.getBookingSummary();
                        this.comonService.toastMessage("Fee updated", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
                    }).catch((err)=>{
                        console.log(err);
                        this.comonService.toastMessage(err.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom)
                    })
                }else if(this.adminFees !== oldAdminFees && this.oneTimeDiscount == oldOneTimeDiscount){
                    await this.modifyAdminFee(feeEditInput).then((res)=>{
                        this.getBookingSummary();
                        this.comonService.toastMessage("Fee updated", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
                    }).catch((err)=>{
                        console.log(err);
                        this.comonService.toastMessage(err.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom)
                    })
                }else if(this.oneTimeDiscount !== oldOneTimeDiscount && this.adminFees == oldAdminFees){
                    await this.modifyOneTimeDiscount(feeEditInput).then((res)=>{
                        this.getBookingSummary();
                        this.comonService.toastMessage("Discount updated", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
                    }).catch((err)=>{
                        console.log(err);
                        this.comonService.toastMessage(err.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom)
                    })
                }
            })                
        } catch (error) {
            this.comonService.toastMessage(error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom)
        }
    }

    async modifyAdminFee(feeEditInput: ModifyMemberShipAdminFees){
        return new Promise((resolve, reject) => {
            this.httpService.post(`${API.MODIFY_ADMIN_FEES}`, feeEditInput)
            .subscribe(data => {
                resolve(data);
            }, error => {
                reject(error)
            }) 
        }) 
    }

    async modifyOneTimeDiscount(feeEditInput: ModifyMemberShipAdminFees) {
        return new Promise((resolve, reject) => {
            feeEditInput.amount = this.oneTimeDiscount.toString();
            this.httpService.post(`${API.MODIFY_ONE_TIME_DISCOUNT}`, feeEditInput)
                .subscribe(data => {
                    resolve(data)
                }, error => {
                    reject(error)
            }); 
        })   
    }

    


}

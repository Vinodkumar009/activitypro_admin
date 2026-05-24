import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, AlertController, ActionSheetController, Platform, Label, ModalController, ToastController, FabContainer, LoadingController } from 'ionic-angular';
// import * as moment from 'moment';
import { Storage } from '@ionic/storage';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { SharedServices } from '../../../services/sharedservice';
import { HttpClient } from '@angular/common/http';
//import moment from 'moment'
import { Membership, MembershipEnrolUsers, UserMembershipMonths } from '../../membership/dto/membershi.dto';
import { HttpService } from '../../../../services/http.service';
import { AppType } from '../../../../shared/constants/module.constants';
import { API } from '../../../../shared/constants/api_constants';

@IonicPage()
@Component({
    selector: 'page-monthlyrecord',
    templateUrl: 'monthlyrecord.html',
    providers:[HttpService]
})
export class MonthlyRecord {
    @ViewChild('fab')fab : FabContainer;

    ParentClubKey: any;
    Setups = [];
    Options: any[];
    temp;
    Venues;
    currencyDetails: any;
    selectedClubKey: any;
    ClubNameData: any;
    filterSetup = [];
    SetupDisplay = [];
    
    nodeUrl: string;
    currencycode: any;
    
    ClubKey: any;
    ismonthlydetailsOn: boolean = false;
    subscriptionList: any = [];
    member: any;
    memberofSameMembership=[];
    platformType: string = "";
    type: any;
    isRenewal:boolean = false;
    allPaymentMethod: Array<any> = [];
    MonthlyAssignmentObj = { //assign monthly 
        parentClubKey: "",
        clubKey: "",
        memberKeys: [],
        membershipSetupKey: "",
        startMonth: {},
        email: "",
        paymentOptionKey: ""
    }
    paymentObj = {
        amount: 0,
        description: "",
        currency: "",
        parentclubKey: "",
        clubKey: "",
        activityKey: "",
        setupKey: "", //payment seyupkey
        memberKeys: [],
        membershipSetupKey: "",
        membershipAssignedKeys: []
    }

    membership: Membership;
    membership_user:MembershipEnrolUsers;
    postgre_parentclub_id:string = "";
    membershipMonths:UserMembershipMonths[] = [];
    constructor(
        public alertCtrl: AlertController,
        public navCtrl: NavController,
        public navParam: NavParams,
        public modalController: ModalController,
        public actionSheetCtrl: ActionSheetController,
        public storage: Storage,
        public loadingCtrl : LoadingController,
        public http:  HttpClient,
        public sharedservice: SharedServices,
         public comonService: CommonService,
         private httpService:HttpService,
    ) {
        this.platformType = this.sharedservice.getPlatform();
        this.membership_user = this.navParam.get('enrol_info') 
        //this.ClubKey = this.navParam.get('ClubKey')
        storage.get('userObj').then((val) => {
            val = JSON.parse(val);     
            // if (val.$key != "") {
            //     this.ParentClubKey = val.UserInfo[0].ParentClubKey;
            //     this.currencycode = val.Currency;
            // }
        
             
            // this.isRenewal = this.navParam.get('type') ? true:false; 
            // this.member = this.navParam.get('member')
            // this.type = this.navParam.get('type')
            // if(this.isRenewal)this.getAllPaymentGateWays();
            // this.MonthlyAssignmentObj.parentClubKey = this.ParentClubKey;
            // this.MonthlyAssignmentObj.clubKey = this.membership.ClubKey;
            // this.MonthlyAssignmentObj.membershipSetupKey = this.membership.SetupKey;
            // this.MonthlyAssignmentObj.paymentOptionKey = 'Monthly';
            // this.MonthlyAssignmentObj.memberKeys.push(this.member.MemberKey);
            // this.MonthlyAssignmentObj.email = this.member.EmailID;
            // this.MonthlyAssignmentObj.startMonth = {
            //     label:moment().add(1,"M").format("MMM"),
            //     monthWithYear:moment().add(1,"M").format("MMM-YYYY"),
            //     isSelect: true
            //     // label:"Jul",
            //     // monthWithYear:"Jul-2022",
            //     // isSelect: true
            // }
            
            // this.paymentObj.description = 'Membership:Monthly:' + this.member.DisplayName
            // this.paymentObj.memberKeys.push(this.member.MemberKey);
            // this.paymentObj.parentclubKey = this.ParentClubKey;
            // this.paymentObj.membershipSetupKey = this.membership.SetupKey;
            // this.paymentObj.clubKey = this.membership.ClubKey// has to confirm here memberclubkey or membershipclubkey
            // this.paymentObj.activityKey = "";
            // this.paymentObj.currency = "";
            // this.paymentObj.setupKey = "";
            // this.paymentObj.amount = 0;
            this.getStorageDetails();
        })

       
    }

    async getStorageDetails(){
        const [currency,parentclub] = await Promise.all([
            this.storage.get('Currency'),
            this.storage.get('postgre_parentclub')
        ]);
        this.currencyDetails = JSON.parse(currency);
        this.postgre_parentclub_id = parentclub.Id;
        // if(this.membership_user.membership_type == 1){ //if monthly only get months history otherwise no need
        //     this.getMonthDetails();
        // } 
        this.getMonthDetails(); 
    }

    getMonthDetails(){    
        const get_memberships_payload = {
            parentclubId:this.postgre_parentclub_id,
            membership_id:this.membership_user.membership_id,
            //clubId:this.Venues.find(venue => venue.FirebaseId === this.selectedClubKey).Id,
            membership_package_id:this.membership_user.membership_package_id,
            //action_type:1,
            device_type:this.sharedservice.getPlatform() == "android" ? 1:2,
            app_type:AppType.ADMIN_NEW//new admin
          }
          this.httpService.post(API.GET_MEMBERSHIP_ENROL_MONTHS,get_memberships_payload).subscribe((res: any) => {
            console.table(`enrols:${res}`);
            if(res && res.data) this.membershipMonths = res.data ;
          },
         (error) => {
              //this.commonService.hideLoader();
              console.error("Error in fetching:", error);
              this.comonService.toastMessage("No setups found", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
             // Handle the error here, you can display an error message or take appropriate action.
         })
    }

    getAllPaymentGateWays() {
        // try {
        //     this.comonService.showLoader("Please wait");
        //     let params = new HttpParams()
        //     params = params.append('activityCode', this.membership.ActivityCode )
        //     params = params.append('clubKey', this.membership.ClubKey)
        //     params = params.append('parentClubKey', this.ParentClubKey);
          
        //     this.http.get(`${this.sharedservice.getnestURL()}/membership/paymentgateway`, { params: params }).subscribe((res: any) => {
        //       if (res.status == 200) {
        //         res.data.forEach((eachPayOption) => {
        //           eachPayOption['ImagePath'] = "assets/logo/" + eachPayOption.PaymentGatewayName + "1.png";
        //           eachPayOption['isSelect'] = false;
        //           this.allPaymentMethod.push(eachPayOption)
        //         })
        //         if (this.allPaymentMethod.length > 0) {
        //           console.log(this.allPaymentMethod)
        //           this.paymentObj.activityKey = this.allPaymentMethod[0].ActivityKey;
        //           this.paymentObj.currency = this.comonService.convertFbObjectToArray(this.allPaymentMethod[0].Properties)[0].Currency;
        //           this.paymentObj.setupKey = this.allPaymentMethod[0].SetupKey;
        //           this.allPaymentMethod[0]["isSelect"] = true;
                 
        //         }
        //       }
    
        //     })
            
        //     this.comonService.hideLoader();
        // } catch (err) {
        //     this.comonService.hideLoader();
        // }
    }

    
    renewMembership() {
        try{
            this.comonService.showLoader("Please wait");
            this.assignMembership().then((mem_assignedkey:any)=>{
                this.paymentObj.membershipAssignedKeys.push(mem_assignedkey);
                this.renew();
            }).catch((err)=>{
                this.comonService.hideLoader();
                this.comonService.toastMessage("renewal failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
            }) 
        }catch(err){
            this.comonService.hideLoader();
            this.comonService.toastMessage("renewal failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }
    }

    assignMembership(){ //it's like enrol
        return new Promise((resolve, reject) => {
            this.http.post(`${this.sharedservice.getnestURL()}/membership/assignmonthlymembership`, this.MonthlyAssignmentObj).subscribe((res:any) => {
                resolve(res.data);
            },  
            err => {
                this.comonService.hideLoader();
                reject(err)
                this.comonService.toastMessage("renewal failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
            }) 
        })        
    }

    renew(){ //it's renewal
        this.http.post(`${this.sharedservice.getnestURL()}/membership/renewmonthlymembership`, this.paymentObj).subscribe((res) => {
            this.cancelMembership(); 
        },  
        err => {
            this.comonService.hideLoader();
            this.comonService.toastMessage("renewal failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
        })                  
    }

    cancelMembership() {
        //${this.sharedservice.getnestURL()}
            this.http.put(`${this.sharedservice.getnestURL()}/membership/cancelmembership?subSchedId=${this.member.subId}`, null).subscribe((res) => {
            this.comonService.hideLoader();
            this.comonService.toastMessage('Membership renewed successfully', 2500, ToastMessageType.Success, ToastPlacement.Bottom, true);
            this.navCtrl.pop();
        },  
        err => {
            this.comonService.hideLoader();
            this.comonService.toastMessage("renewel failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
        })
    }

    

    
}

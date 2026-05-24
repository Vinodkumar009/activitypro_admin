import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, Platform, AlertController, ToastController } from 'ionic-angular';
//import { FirebaseService } from '../../../../../services/firebase.service';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../../services/common.service';
import { Storage } from '@ionic/storage';
import moment, { Moment } from 'moment';
import { HttpService } from '../../../../../services/http.service';
import { CreateMembershipDiscountMasterDto, MembershipMasterDiscounts, UpdateMembershipDiscountMasterDto } from '../../dto/membershi.dto';
import { SharedServices } from '../../../../services/sharedservice';
import { API } from '../../../../../shared/constants/api_constants';
import { AppType } from '../../../../../shared/constants/module.constants';

/**
 * Generated class for the MembershipModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-adddiscount',
  templateUrl: 'adddiscount.html',
  providers:[HttpService]
})
export default class AddDiscountPage {
  parentClubKey:string = "";
  dataexists:boolean = false;
  selected_club_id:string = "";
  today = moment().format('YYYY-MM-DD');
  discountObj = {
    DiscountName: "",
    Discount: '',
    DiscountPercent: '',
    Type: '',
    IsActive: true,
    StartDate: moment().format('YYYY-MM-DD'),
    EndDate: ''
  }
  discount_types: string[] = [];
  discountKey: any;
  postgre_parentclub_id:string = "";
  discount:MembershipMasterDiscounts;
  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public sharedservice: SharedServices,
    public storage: Storage, 
    public comonService: CommonService, 
    private httpService:HttpService,
   ) {

    // storage.get('userObj').then((val) => {
    //   val = JSON.parse(val);
    //   if (val.$key != "") {
    //     this.parentClubKey = val.UserInfo[0].ParentClubKey;
    //   }
    //   this.selectedClubKey = this.navParams.get("ClubKey")
    //   if (this.discountKey = this.navParams.get("DiscountKey")) {
    //     this.dataexists = true
    //     this.getDiscountData(this.discountKey) //to check already existed discounts ,if already there just update, otherwise create a new record
    //   }
    // }).catch(error => {});
    this.selected_club_id = this.navParams.get("ClubKey")
    this.getStorageData();
  }

  async getStorageData(){
    const [login_obj,postgre_parentclub] = await Promise.all([
      this.storage.get('userObj'),
      this.storage.get('postgre_parentclub'),
      //this.storage.get('Currency'),
    ])

    if (login_obj) {
      this.parentClubKey = JSON.parse(login_obj).UserInfo[0].ParentClubKey;
    }
    if(postgre_parentclub){
      this.postgre_parentclub_id = postgre_parentclub.Id;
      // if ((this.selectedClubKey = this.navParams.get("ClubKey")) &&
      //   (this.selectedSetupKey = this.navParams.get("SetupKey"))
      //
      this.getDiscountTypes();
      if(this.navParams.get("DiscountKey")){
        this.getDiscountData();
      }
      
    }
  }

  getDiscountTypes() {
    const get_discounts_payload = {
      parentclubId:this.postgre_parentclub_id,
      clubId:this.selected_club_id,
      action_type:1,
      device_type:this.sharedservice.getPlatform() == "android" ? 1:2,
      app_type:AppType.ADMIN_NEW
    }
    this.httpService.post(API.MEMBERSHIP_MASTER_DISCOUNTS_TYPES,get_discounts_payload).subscribe((res: any) => {
      if(res.data && res.data.membership_discounts.length > 0)
      this.discount_types = res.data.membership_discounts;
    },
   (error) => {
        //this.commonService.hideLoader();
        console.error("Error in fetching:", error);
        this.comonService.toastMessage("Discount types fetch failed", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
       // Handle the error here, you can display an error message or take appropriate action.
   })
  }

  getDiscountData() {
    const get_discounts_payload = {
      discount_id:this.navParams.get("DiscountKey"),
      parentclubId:this.postgre_parentclub_id,
      clubId:this.selected_club_id,
      action_type:1,
      device_type:this.sharedservice.getPlatform() == "android" ? 1:2,
      app_type:AppType.ADMIN_NEW
    }
    this.httpService.post(API.MEMBERSHIP_MASTER_DISCOUNTS_DETAILS,get_discounts_payload).subscribe((res: any) => {
      if(res.data && res.data.discount){
        this.discount = res.data.discount;
        this.discountObj.DiscountName = this.discount.discount_name;
        this.discountObj.Discount = this.discount.absolute;
        this.discountObj.DiscountPercent = this.discount.percentage;
        this.discountObj.Type = this.discount.type.toString();
        this.discountObj.StartDate = moment(this.discount.start_date,"DD-MMM-YYYY").format("YYYY-MM-DD");
        this.discountObj.EndDate = moment(this.discount.end_date,"DD-MMM-YYYY").format("YYYY-MM-DD");
        this.dataexists = true;
      }
    },
   (error) => {
        //this.commonService.hideLoader();
        console.error("Error in fetching:", error);
        this.comonService.toastMessage("Discounts fetch failed", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
       // Handle the error here, you can display an error message or take appropriate action.
   })
  }

  //alert confirmation for create or update discount
  getUpdateConfirmation(){
    const msg = this.dataexists ? "Are you sure you want to update the discount?" : "Are you sure you want to create the discount ?"
    const action_btn = this.dataexists ? "Update" : "Create";
    const alert_txt = this.dataexists ? "Update Discount" : "Create Discount";
    this.comonService.commonAlert_V4(alert_txt,msg,action_btn,"Cancel",() => this.updateDiscount());
  }

  updateDiscount() {
    if (this.validate()) { 
      if(!this.dataexists){//create 
          //let discountKey = this.fb.saveReturningKey("Membership/MembershipSetup/" + this.parentClubKey + "/" + this.selectedClubKey + "/Discount", this.discountObj)
          // console.log(this.discountObj, this.selectedClubKey, this.parentClubKey, discountKey)
          const discount_payload = new CreateMembershipDiscountMasterDto(this.discountObj);
          discount_payload.parentclubId = this.postgre_parentclub_id;
          discount_payload.clubId = this.selected_club_id;
          discount_payload.device_type = this.sharedservice.getPlatform() == "android" ? 1:2;
          discount_payload.device_id = this.sharedservice.getDeviceId();
          this.httpService.post(API.MEMBERSHIP_CREATE_MASTER_DISCOUNTS,discount_payload).subscribe((res: any) => {
            this.comonService.toastMessage("Discount added", 2500,ToastMessageType.Success);
            this.comonService.updateCategory("update_membership_discounts_list")
            this.navCtrl.pop();
          },
        (error) => {
              //this.commonService.hideLoader();
              console.error("Error in fetching:", error);
              this.comonService.toastMessage("Failed to add discount", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
            // Handle the error here, you can display an error message or take appropriate action.
        })
      }else { //update, as already there
        // this.fb.update(this.discountKey, "Membership/MembershipSetup/" + this.parentClubKey + "/" + this.selectedClubKey + "/Discount", this.discountObj);
        const discount_payload = new UpdateMembershipDiscountMasterDto(this.discountObj);
        discount_payload.discount_id = this.navParams.get("DiscountKey");
        this.httpService.post(API.MEMBERSHIP_UPDATE_MASTER_DISCOUNTS,discount_payload).subscribe((res: any) => {
          this.comonService.toastMessage("Discount updated", 2500,ToastMessageType.Success);
          this.comonService.updateCategory("update_membership_discounts_list")
          this.navCtrl.pop()
        },
       (error) => {
            //this.commonService.hideLoader();
            console.error("Error in fetching:", error);
            this.comonService.toastMessage("Failed to add discount", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
           // Handle the error here, you can display an error message or take appropriate action.
       })
      }
    } 
  }

  validate() {
    if (this.discountObj.DiscountName == "") {
      this.comonService.toastMessage("Please enter a Name", 2500,ToastMessageType.Error);
      return false;
    } else if (this.discountObj.Type == "") {
      this.comonService.toastMessage("Please enter Valid Type", 2500,ToastMessageType.Error);
      return false;
    } else if (!((this.discountObj.Discount != "" && this.discountObj.Discount != "0") || (this.discountObj.DiscountPercent != '' && this.discountObj.DiscountPercent != '0'))) {
      this.comonService.toastMessage("Please enter Valid Discount", 2500,ToastMessageType.Error);
      return false;
    } else if (this.discountObj.StartDate == "") {
      this.comonService.toastMessage("Please enter Valid Start Date", 2500,ToastMessageType.Error);
      return false;
    } else if (this.discountObj.EndDate == "") {
      this.comonService.toastMessage("Please enter Valid End Date", 2500,ToastMessageType.Error);
      return false;
    } else {
      return true;
    }
  }

}




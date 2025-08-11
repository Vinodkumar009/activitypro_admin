import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ActionSheetController } from 'ionic-angular';
//import { FirebaseService } from '../../../../services/firebase.service';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { Storage } from '@ionic/storage';
import * as moment from 'moment';
import { GraphqlService } from '../../../../services/graphql.service';
import gql from "graphql-tag";
import { SharedServices } from '../../../services/sharedservice';
import { HttpService } from '../../../../services/http.service';
import { AppType } from '../../../../shared/constants/module.constants';
import { IClubDetails } from '../../../../shared/model/club.model';
import { API } from '../../../../shared/constants/api_constants';
import { MembershipMasterDiscounts } from '../dto/membershi.dto';
import { first } from 'rxjs/operators';
/**
 * Generated class for the MembershipModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-membershipdiscount',
  templateUrl: 'membershipdiscount.html',
  providers:[HttpService]
})
export default class MembershipDiscountPage {
  ParentClubKey: string = "";
  Venues:IClubDetails[] = [];
  discountObj = {
    DiscountName: "",
    Discount: 0,
    DiscountPercent: 0,
    Type: '',
    isActive: true,
    StartDate: '',
    EndDate: ''
  }
  discountArr:MembershipMasterDiscounts[] = [];
  currencyDetails: any;
  postgre_parentclub_id:string = "";
  selectedClubKey:string;
  constructor(public navCtrl: NavController,
     public navParams: NavParams,
     //private fb: FirebaseService,
    public storage: Storage, 
    public comonService: CommonService,
     private alertCtrl: AlertController,
    public actionSheetCtrl: ActionSheetController, 
    public sharedservice: SharedServices,
    private httpService:HttpService,
    private graphqlService: GraphqlService,) {

  
  }

  ionViewWillEnter(){
    this.comonService.category.pipe(first()).subscribe((data) => {
      if (data == "update_membership_discounts_list") {
        this.comonService.updateCategory("");
        this.getStorageData();
      }
    })
  }

  async getStorageData(){
    const [login_obj,postgre_parentclub,currencyDetails] = await Promise.all([
      this.storage.get('userObj'),
      this.storage.get('postgre_parentclub'),
      this.storage.get('Currency'),
    ])

    if (login_obj) {
      this.ParentClubKey = JSON.parse(login_obj).UserInfo[0].ParentClubKey;
    }
    if(postgre_parentclub){
      this.postgre_parentclub_id = postgre_parentclub.Id;
      this.getAllVenue();
      //this.getEndYear(this.ParentClubKey, this.selectedClubKey);
    }
    if(currencyDetails){
      this.currencyDetails = JSON.parse(currencyDetails);
    }
  }

  getAllVenue() {
    this.Venues = [];
    const clubs_input = {
      parentclub_id:this.postgre_parentclub_id,
      user_postgre_metadata:{
        UserMemberId:this.sharedservice.getLoggedInId()
      },
      user_device_metadata:{
        UserAppType:AppType.ADMIN_NEW,
        UserDeviceType:this.sharedservice.getPlatform() == "android" ? 1:2
      }
    }
    const clubs_query = gql`
        query getVenuesByParentClub($clubs_input: ParentClubVenuesInput!){
          getVenuesByParentClub(clubInput:$clubs_input){
                Id
                ClubName
                FirebaseId
                MapUrl
                sequence
            }
        }
        `;
        this.graphqlService.query(clubs_query,{clubs_input: clubs_input},0)
        .subscribe((res: any) => {
          this.Venues = res.data.getVenuesByParentClub as IClubDetails[];
          //console.log("clubs lists:", JSON.stringify(this.clubs));
          this.selectedClubKey = this.Venues[0].FirebaseId;
          //this.checkPaymentSetup();
          this.getAllDiscounts();
        },
       (error) => {
            //this.commonService.hideLoader();
            console.error("Error in fetching:", error);
            this.comonService.toastMessage(error.message, 2500,ToastMessageType.Error, ToastPlacement.Bottom);
           // Handle the error here, you can display an error message or take appropriate action.
       })      
  }

  
  ionViewDidLoad() { }

  getAllDiscounts() {
    this.discountArr = []
    // this.fb.getAllWithQuery("Membership/MembershipSetup/" + this.ParentClubKey + "/" + ClubKey + "/Discount/", { orderByChild: "IsActive", equalTo: true })
    //   .subscribe((data) => {
    //     for (let i = data.length - 1; i >= 0; i--) {
    //       if (data[i].IsActive == true) {
    //         data[i].startDate = moment(data[i].StartDate).format('DD MMM YY')
    //         data[i].endDate = moment(data[i].EndDate).format('DD MMM YY')

    //         this.discountArr.push(data[i]);
    //       }
    //     }
    //   })
    // console.log(this.discountArr)
    const get_discounts_payload = {
      parentclubId:this.postgre_parentclub_id,
      clubId:this.Venues.find(venue => venue.FirebaseId === this.selectedClubKey).Id,
      action_type:1,
      device_type:this.sharedservice.getPlatform() == "android" ? 1:2,
      app_type:AppType.ADMIN_NEW
    }
    this.httpService.post(API.MEMBERSHIP_MASTER_DISCOUNTS,get_discounts_payload).subscribe((res: any) => {
      if(res.data && res.data.membership_discounts.length > 0)
        this.discountArr = res.data.membership_discounts;
      },
   (error) => {
        //this.commonService.hideLoader();
        console.error("Error in fetching:", error);
        this.comonService.toastMessage("Failed to add discount", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
       // Handle the error here, you can display an error message or take appropriate action.
   })
  }

  showOptions(discount:MembershipMasterDiscounts) {
    let actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: "Edit Discount",
          icon: this.sharedservice.getPlatform() == 'android' ? 'ios-create-outline' : '',
          handler: () => {
            this.navCtrl.push('AddDiscountPage', { ClubKey: this.Venues.find(venue => venue.FirebaseId === this.selectedClubKey).Id, DiscountKey: discount.id })
          }
        }, {
          text: 'Delete Discount',
          cssClass: 'dangerRed',
          icon: this.sharedservice.getPlatform() == 'android' ? 'trash' : '',
          handler: () => {
            this.deleteDiscount(discount.id)
            console.log("Delete", discount)
          }
        }
      ]
    });

    actionSheet.present();
  }

  //navigating to the add discount page
  addDiscount() {
    this.navCtrl.push('AddDiscountPage', { ClubKey: this.Venues.find(venue => venue.FirebaseId === this.selectedClubKey).Id })
  }

  deleteDiscount(discount_id:string) {
    const title = "Delete Discount";
    const message = ' Are you sure you want to delete this Discount ?';
    this.comonService.commonAlert_V4(title,message,"Delete","Cancel",() => {
      const get_discounts_payload = {
        discount_id,
        parentclubId:this.postgre_parentclub_id,
        clubId:this.Venues.find(venue => venue.FirebaseId === this.selectedClubKey).Id,
        action_type:1,
        device_type:this.sharedservice.getPlatform() == "android" ? 1:2,
        app_type:AppType.ADMIN_NEW
      }
      this.httpService.post(API.MEMBERSHIP_REMOVE_MASTER_DISCOUNTS,get_discounts_payload).subscribe((res: any) => {
        this.comonService.toastMessage("Discount deleted", 2500,ToastMessageType.Success);
        this.getAllDiscounts();
      },
     (error) => {
          //this.commonService.hideLoader();
          console.error("Error in fetching:", error);
          this.comonService.toastMessage("Failed to add discount", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
         // Handle the error here, you can display an error message or take appropriate action.
     })
    });
  }

  ionViewWillLeave(){
    this.comonService.updateCategory("");
  }
 
}
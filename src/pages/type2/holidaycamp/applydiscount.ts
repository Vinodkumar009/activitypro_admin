import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController, AlertController,Toggle } from "ionic-angular";
import { SharedServices } from '../../services/sharedservice';
//import { FirebaseService } from '../../../services/firebase.service';
import { IonicPage } from 'ionic-angular';
import { NavParams, ViewController, ActionSheetController } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import gql from 'graphql-tag';
import { GraphqlService } from '../../../services/graphql.service';
import { CampDiscounts } from './models/camp_discounts.dto';
@IonicPage()
@Component({
  selector: 'applydiscount-page',
  templateUrl: 'applydiscount.html'
})


export class Type2DiscountDetails {
  themeType: any;
  parentClubKey = "";
  campDetails: any;
  holidayCampDiscounts:CampDiscounts[] = [];
  discounts = [];
  selectedIndex = -1;
  defaultDiscountList: ReadonlyArray<IDiscounts> = [
    {
      AbsoluteValue: "0",
      CreationTime: 0,
      DiscountCode: '3000',
      DiscountName: "One Off",
      IsActive: false,
      IsEnable: true,
      PercentageValue: "0"
    }, {
      AbsoluteValue: "0",
      CreationTime: 0,
      DiscountCode: '3001',
      DiscountName: "Early Payment",
      IsActive: false,
      IsEnable: true,
      PercentageValue: "0"
    },
    {
      AbsoluteValue: "0",
      CreationTime: 0,
      DiscountCode: '3002',
      DiscountName: "Sibling",
      IsActive: false,
      IsEnable: true,
      PercentageValue: "0",
      IsApplyToAll: false,
    },
    {
      AbsoluteValue: "0",
      CreationTime: 0,
      DiscountCode: '3003',
      DiscountName: "Full Course",
      IsActive: false,
      IsEnable: true,
      PercentageValue: "0"
    },
    {
      AbsoluteValue: "0",
      CreationTime: 0,
      DiscountCode: '3004',
      DiscountName: "Member",
      IsActive: false,
      IsEnable: true,
      PercentageValue: "0"
    },
    {
      AbsoluteValue: "0",
      CreationTime: 0,
      DiscountCode: '3005',
      DiscountName: "No of Sessions",
      IsActive: false,
      IsEnable: true,
      PercentageValue: "0",
      NoofSessions: 0,
    },
    {
      AbsoluteValue: "0",
      CreationTime: 0,
      DiscountCode: '3006',
      DiscountName: "No of Sessions",
      IsActive: false,
      IsEnable: true,
      PercentageValue: "0",
      NoofSessions: 0,
    }
  ]
  camp_id:string = "";
  constructor(
      public actionSheetCtrl: ActionSheetController,
      public comonService: CommonService, 
      public viewCtrl: ViewController, 
      //public fb: FirebaseService, 
      public loadingCtrl: LoadingController, 
      public alertCtrl: AlertController,
      private navParams: NavParams, 
      public navCtrl: NavController, 
      public sharedservice: SharedServices, 
      public popoverCtrl: PopoverController,
      private graphqlService: GraphqlService,) {
      try {
        this.themeType = this.sharedservice.getThemeType();
        this.camp_id = this.navParams.get('camp_id');
        //this.discounts = this.comonService.convertFbObjectToArray(this.campDetails.Discounts);
        console.log(this.campDetails);
        //this.parentClubKey = this.campDetails.ParentClubKey;
        this.getAllDiscounts();
      } catch (ex) {
        this.comonService.toastMessage(ex.message, 2500,ToastMessageType.Error);
      }
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }

  getAllDiscounts() {
    const camp_discount_input = {
      parentclub_id:this.sharedservice.getPostgreParentClubId(),
      camp_id:this.camp_id,
      user_postgre_metadata:{
        UserMemberId:this.sharedservice.getLoggedInId()
      },
      user_device_metadata:{
        UserDeviceType:this.sharedservice.getPlatform() == "android" ? 1:2, // 1 for android, 2 for ios
        UserAppType:0// 0 admin
      }
    }
    const query = gql`
    query getCampDiscounts($holidayCampListingInput: GetCampDiscountsInputDTO!){
      getCampDiscounts(getCampDiscountsInput:$holidayCampListingInput){
        id
        discount_firebasekey
        is_active
        absolute_value
        discount_code
        discount_name
        percentage_value
        is_apply_to_all
        no_of_sessions
        pre_order_type
        threshold_days
      }
    }
    `;
    this.graphqlService.query(query, { holidayCampListingInput: camp_discount_input }, 0)
      .subscribe((res: any) => {
        // this.commonService.hideLoader();
        this.holidayCampDiscounts = res.data.getCampDiscounts;
        console.log("discounts data:", JSON.stringify(this.holidayCampDiscounts))
      },
      (error) => {
          //this.commonService.hideLoader();
          console.error("Error in fetching:", error);
      })
  }


  showPrompt(discount) {
    this.navCtrl.push("Type2EditHolidayDiscounts", { DiscountDetails: discount, CampDetails: this.campDetails });
  }
  // updateDiscountDetials(discount, data) {
  //   this.fb.update(discount.$key, "HolidayCamp/" + this.parentClubKey + "/" + this.campDetails.$key + "/Discounts/", {
  //     AbsoluteValue: parseFloat(data.absoluteValue).toFixed(2),
  //     PercentageValue: data.percentageValue,
  //   });
  //   this.comonService.toastMessage("Updated successfully", 2500,ToastMessageType.Success);
  //   this.navCtrl.pop();
  // }

  applyDiscounts(discount:CampDiscounts,toggle:Toggle) {
    if(discount.is_active){
      if(this.validation(discount)){
        this.updateDiscountStatus(discount.id,discount.is_active)
      }
    }else{
      this.updateDiscountStatus(discount.id,discount.is_active)
    }
  }


  updateDiscountStatus(descount_id:string,discount_status:boolean){
    try{
      const discount_update_variable = {
        discount_id:descount_id,
        discount_status:discount_status,
        user_postgre_metadata:{
          UserMemberId:this.sharedservice.getLoggedInId()
        },
        user_device_metadata:{
          UserDeviceType:this.sharedservice.getPlatform() == "android" ? 1:2, // 1 for android, 2 for ios
          UserAppType:0,// 0 admin
          UserActionType:0
        }
      }

      const discount_update_mutation = gql`
      mutation updateCampDiscounts($discount_update_input: CampUpdateDiscountInput!) {
        updateCampDiscounts(holidayCampDiscountsInput: $discount_update_input)
      }` 
      
      const variables = {discount_update_input:discount_update_variable}
  
      this.graphqlService.mutate(discount_update_mutation,variables,0).subscribe(
        result => {
          // Handle the result
          this.comonService.toastMessage("Discount updated successfully", 2500,ToastMessageType.Success);
          //this.navCtrl.pop();                        
        },
        error => {
          // Handle errors
          console.error(error);
          this.comonService.toastMessage("Discount updation failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }
      );
    }catch(err){
      this.comonService.toastMessage("Discount updation failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
    }
  }

  validation(discount:CampDiscounts): boolean {
    if (discount.discount_name == "" || discount.discount_name == undefined) {
      this.comonService.toastMessage("Enter discount name", 2500,ToastMessageType.Error);
      return false;
    }
    // else if (this.holidayCampDiscounts.DiscountCode == "" || this.holidayCampDiscounts.DiscountCode == undefined) {
    //   this.comonService.toastMessage("Enter discount code", 2500);
    //   return false;
    // }
    else if (discount.percentage_value == "" || discount.percentage_value == undefined) {
      this.comonService.toastMessage("Enter percentage value", 2500,ToastMessageType.Error);
      return false;
    }
    else if (discount.absolute_value == "" || discount.absolute_value == undefined) {
      this.comonService.toastMessage("Enter absolute value", 2500,ToastMessageType.Error);
      return false;
    }
    return true;
  }


  saveDiscounts() {
    let confirm = this.alertCtrl.create({
      title: 'Give Discounts',
      message: 'Are you sure you want to add discounts to the camp?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            try {
              let loading;
              loading = this.loadingCtrl.create({
                content: 'Please wait...'
              });
              loading.present();

              // for (let i = 0; i < this.selectedactivityDiscounts.length; i++) {
              //   this.fb.update(this.selectedactivityDiscounts[i].$key, "HolidayCamp/" + this.parentClubKey + "/" + this.campDetails.$key + "/ActivityDiscount/", this.selectedactivityDiscounts[i]);
              // }
              // for (let i = 0; i < this.selectedClubDiscounts.length; i++) {
              //   this.fb.update(this.selectedClubDiscounts[i].$key, "HolidayCamp/" + this.parentClubKey + "/" + this.campDetails.$key + "/ClubDiscount/", this.selectedClubDiscounts[i]);
              // }
              loading.dismiss();
              this.navCtrl.pop();
              this.comonService.toastMessage("Activity and club discount added to the camp successfully.", 3000);

            } catch (ex) {
              this.comonService.toastMessage(ex.message, 2500);
            }
          }
        }
      ]
    });
    confirm.present();


  }
  cancel() {
    this.navCtrl.pop();
  }




  presentActionSheetTapOnCamp(discount) {
    // let actionSheet
    // actionSheet = this.actionSheetCtrl.create({
    //   //title: 'Modify your album',
    //   buttons: [
    //     {
    //       text: 'Edit Camp',
    //       icon: 'ios-create-outline',
    //       handler: () => {
    //         this.editHolidayDiscount(discount);
    //       }
    //     }, {
    //       text: 'Cancel',
    //       icon: 'close',
    //       role: 'cancel',
    //       handler: () => {

    //       }
    //     }
    //   ]
    // });

    // actionSheet.present();

  }



  editHolidayDiscount(discount) {
    discount.ShowTextBox = !discount.ShowTextBox;
  }

  // applyDiscount() {
  //   for (let i = 0; i < this.holidayCampDiscounts.length; i++) {
  //     if (this.holidayCampDiscounts[i].IsSelect) {
  //       this.fb.update(this.holidayCampDiscounts[i].$key, "HolidayCamp/" + this.parentClubKey + "/" + this.campDetails.$key + "/Discounts/", {
  //         DiscountName: this.holidayCampDiscounts[i].DiscountName,
  //         AbsoluteValue: parseFloat(this.holidayCampDiscounts[i].NewAbsoluteValue).toFixed(2),
  //         PercentageValue: parseFloat(this.holidayCampDiscounts[i].NewPercentageValue).toFixed(2),
  //         DiscountCode: this.holidayCampDiscounts[i].DiscountCode,
  //         CreationTime: new Date().getTime(),
  //         IsActive: true,
  //         IsEnable: true,
  //       });
  //     }
  //   }

  //   this.comonService.toastMessage("Discount applied successfully.", 2500);
  //   this.navCtrl.pop();
  // }
  // showOrHide(index) {
  //   if (this.holidayCampDiscounts[index].IsSelect == false) {
  //     this.selectedIndex = -1;
  //   } else {
  //     this.selectedIndex = index;
  //   }
  // }

}

interface IDiscounts {
  AbsoluteValue: string;
  CreationTime: number;
  DiscountCode: string;
  DiscountName: string;
  IsActive: boolean;
  IsEnable: boolean;
  PercentageValue: string;
  NoofSessions?: number;
  IsApplyToAll?: boolean;
}


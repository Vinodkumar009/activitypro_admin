import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController, AlertController } from "ionic-angular";
import { SharedServices } from '../../services/sharedservice';
import { Storage } from '@ionic/storage';
import { IonicPage } from 'ionic-angular';
import { NavParams, ViewController } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import { CampDiscounts } from './models/camp_discounts.dto';
import { GraphqlService } from '../../../services/graphql.service';
import gql from 'graphql-tag';

@IonicPage()
@Component({
  selector: 'editdiscounts-page',
  templateUrl: 'editdiscounts.html'
})

export class Type2EditHolidayDiscounts {
  themeType: any;
  parentClubKey = "";

  disocuntDetails: CampDiscounts;
  campDetails:any;
  constructor(public comonService: CommonService, 
      public viewCtrl: ViewController, 
      public loadingCtrl: LoadingController, 
      public alertCtrl: AlertController, 
      private navParams: NavParams, 
      public navCtrl: NavController,
      storage: Storage, 
      public sharedservice: SharedServices,public popoverCtrl: PopoverController,
      private graphqlService: GraphqlService
  ) {

    this.disocuntDetails = navParams.get('DiscountDetails');
    this.campDetails = this.navParams.get('CampDetails');
    console.clear();
    console.log(this.disocuntDetails);
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
      }
    });
    this.themeType = sharedservice.getThemeType();

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

  cancel() {
    this.navCtrl.pop();
  }

  updateDiscounts() {
    if (this.validation()) {
      try{
        const discount_update_variable = {
          discount_id:this.disocuntDetails.id,
          discount: {
            absolute_value: this.disocuntDetails.absolute_value,
            discount_code: this.disocuntDetails.discount_code,
            discount_name: this.disocuntDetails.discount_name,
            percentage_value: this.disocuntDetails.percentage_value,
            no_of_sessions: Number(this.disocuntDetails.no_of_sessions),
            is_apply_to_all: this.disocuntDetails.is_apply_to_all,
            pre_order_type: Number(this.disocuntDetails.discount_code == 3001) ? 1:0,
            threshold_days: Number(this.disocuntDetails.threshold_days)
          },
          user_postgre_metadata:{
            UserMemberId:this.sharedservice.getLoggedInId()
          },
          user_device_metadata:{
            UserDeviceType:this.sharedservice.getPlatform() == "android" ? 1:2, // 1 for android, 2 for ios
            UserAppType:0,// 0 admin
            UserActionType:1,
          }
        }
  
        const payment_update_mutation = gql`
        mutation updateCampDiscounts($payment_update_input: CampUpdateDiscountInput!) {
          updateCampDiscounts(holidayCampDiscountsInput: $payment_update_input)
        }` 
        
        const variables = {payment_update_input:discount_update_variable}
    
        this.graphqlService.mutate(payment_update_mutation,variables,0).subscribe(
          result => {
            // Handle the result
            this.comonService.toastMessage("Discount updated successfully", 2500,ToastMessageType.Success);
            this.comonService.updateCategory('update_camps_list') ;
            this.navCtrl.pop();                        
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
  }


  validation(): boolean {
    if (this.disocuntDetails.discount_name == "" || this.disocuntDetails.discount_name == undefined) {
      this.comonService.toastMessage("Enter discount name", 2500,ToastMessageType.Error);
      return false;
    }
    // else if (this.holidayCampDiscounts.DiscountCode == "" || this.holidayCampDiscounts.DiscountCode == undefined) {
    //   this.comonService.toastMessage("Enter discount code", 2500);
    //   return false;
    // }
    else if (this.disocuntDetails.percentage_value == "" || this.disocuntDetails.percentage_value == undefined) {
      this.comonService.toastMessage("Enter percentage value", 2500,ToastMessageType.Error);
      return false;
    }
    else if (this.disocuntDetails.absolute_value == "" || this.disocuntDetails.absolute_value == undefined) {
      this.comonService.toastMessage("Enter absolute value", 2500,ToastMessageType.Error);
      return false;
    }
    return true;
  }















  // moveToTrashClubDiscount(discount) {

  //   let confirm = this.alertCtrl.create({
  //     title: 'Discount Alert',
  //     message: 'Are you sure you want to remove the discount?',
  //     buttons: [
  //       {
  //         text: 'No',
  //         handler: () => {
  //           console.log('Disagree clicked');
  //         }
  //       },
  //       {
  //         text: 'Yes',
  //         handler: () => {
  //           console.log();
  //           this.fb.update(discount.Key, "HolidayCamp/" + this.parentClubKey + "/" + this.campDetails.$key + "/ClubDiscount/", { IsActive: false });
  //           this.fb.getAllWithQuery("HolidayCamp/" + this.parentClubKey + "/", { orderByKey: true, equalTo: this.campDetails.$key }).subscribe((data) => {
  //             this.campDetails = data[0];
  //             this.clubDiscountList = [];
  //             if (this.campDetails.ClubDiscount != undefined) {
  //               let clubDisc = this.comonService.convertFbObjectToArray(this.campDetails.ClubDiscount);
  //               clubDisc.forEach(element => {
  //                 if (element.IsActive) {
  //                   this.clubDiscountList.push(element);
  //                 }
  //               });
  //             }
  //           });

  //         }
  //       }
  //     ]
  //   });
  //   confirm.present();
  // }

  // moveToTrashActivityDiscount(discount) {

  //   let confirm = this.alertCtrl.create({
  //     title: 'Discount Alert',
  //     message: 'Are you sure you want to remove the discount?',
  //     buttons: [
  //       {
  //         text: 'No',
  //         handler: () => {
  //           console.log('Disagree clicked');
  //         }
  //       },
  //       {
  //         text: 'Yes',
  //         handler: () => {
  //           console.log();
  //           this.fb.update(discount.Key, "HolidayCamp/" + this.parentClubKey + "/" + this.campDetails.$key + "/ActivityDiscount/", { IsActive: false });
  //           this.fb.getAllWithQuery("HolidayCamp/" + this.parentClubKey + "/", { orderByKey: true, equalTo: this.campDetails.$key }).subscribe((data) => {
  //             this.campDetails = data[0];
  //             this.clubDiscountList = [];
  //             this.activityDiscountList = [];
  //             if (this.campDetails.ClubDiscount != undefined) {
  //               let clubDisc = this.comonService.convertFbObjectToArray(this.campDetails.ClubDiscount);
  //               clubDisc.forEach(element => {
  //                 if (element.IsActive) {
  //                   this.clubDiscountList.push(element);
  //                 }
  //               });
  //             }

  //             if (this.campDetails.ActivityDiscount != undefined) {
  //               let activitydisc = this.comonService.convertFbObjectToArray(this.campDetails.ActivityDiscount);
  //               activitydisc.forEach(element => {
  //                 if (element.IsActive) {
  //                   this.activityDiscountList.push(element);
  //                 }
  //               });
  //             }


  //           });

  //         }
  //       }
  //     ]
  //   });
  //   confirm.present();
  // }
}


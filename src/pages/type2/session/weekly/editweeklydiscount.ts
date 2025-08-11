import { Component } from '@angular/core';
import { NavController, PopoverController, ModalController, LoadingController, ToastController, AlertController } from "ionic-angular";
import { Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { IonicPage } from 'ionic-angular';
import { NavParams, ViewController } from 'ionic-angular';
import { FirebaseService } from '../../../../services/firebase.service';
import { SharedServices } from '../../../services/sharedservice';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';


/**
 * Generated class for the EditweeklydiscountPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-editweeklydiscount',
  templateUrl: 'editweeklydiscount.html',
  providers:[SharedServices,FirebaseService]
})
export class EditweeklydiscountPage {
  themeType: any;
  parentClubKey = "";
  discountDetails: any;
  campDetails:any;
  constructor(public viewCtrl: ViewController, 
    public fb: FirebaseService, 
    public loadingCtrl: LoadingController, 
    public alertCtrl: AlertController,
    private navParams: NavParams,
    public navCtrl: NavController,
    storage: Storage, public sharedservice: SharedServices, 
    platform: Platform, public popoverCtrl: PopoverController,
    public commonService: CommonService, ) {

    this.discountDetails = navParams.get('discountObj');
    //this.campDetails = this.navParams.get('CampDetails');
    console.clear();
    console.log(this.discountDetails);
    

  }

  dismiss() {
      this.viewCtrl.dismiss(this.discountDetails);
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
    this.dismiss();
  }
  updateDiscounts() {
    if (this.validation()) {
      this.discountDetails.discount_amount = parseFloat(this.discountDetails.discount_amount).toFixed(2);
      // this.fb.update(key, "HolidayCamp/" + this.parentClubKey + "/" + this.campDetails.$key + "/Discounts/",this.disocuntDetails );
      // this.showToast("Updated successfully", 5000);
        this.dismiss();
    }
  }


  validation(): boolean {
    if (this.discountDetails.discount_name == "" || this.discountDetails.discount_name == undefined) {
      this.commonService.toastMessage("Enter discount name.", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }
    if (this.discountDetails.no_of_session == "" || this.discountDetails.no_of_session == undefined) {
      this.commonService.toastMessage("Enter no of sessions.", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }
    // else if (this.disocuntDetails.PercentageValue == "" || this.disocuntDetails.PercentageValue == undefined) {
    //   this.showToast("Enter percentage value.", 2000);
    //   return false;
    // }
    else if (this.discountDetails.discount_amount == "" || this.discountDetails.discount_amount == undefined) {
      this.commonService.toastMessage("Enter discount amount.", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }
    return true;
  }

}

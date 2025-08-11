import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
import { ActionSheetController } from 'ionic-angular'
import { CommonService } from '../../../services/common.service';
/**
 * Generated class for the PricebandPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-priceband',
  templateUrl: 'priceband.html',
})
export class PricebandPage {
  pricebandList = [];
  allActivityArr = [];
  allClub = [];
  parentClubKey = "";
  selectedClubKey = "";
  selectedActivity = "";
  Nocourtavailable="No Price available";
  isFirstTime:boolean = false;
  bookingDuration: any;
  constructor(public actionSheetCtrl: ActionSheetController, public comonService: CommonService, public navCtrl: NavController, public navParams: NavParams, public fb: FirebaseService, public storage: Storage) {
    this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);

      for (let user of val.UserInfo) {
        if (val.$key != "") {
          this.parentClubKey = user.ParentClubKey;
          this.getAllClub();
          //this.getpriceBand();
        }
      }
    }).catch(error => {

    });
  }

  ionViewDidLoad() {
    
  }
  goToCreatePriceband(){
    this.navCtrl.push('NewcreatepricebandPage');
  }
  
  getAllActivity() {
    this.fb.getAll("/Activity/" + this.parentClubKey + "/" + this.selectedClubKey + "/").subscribe((data) => {
        this.allActivityArr = [];
        if (data.length > 0) {
            this.allActivityArr = data;
            this.selectedActivity = data[0].$key;
            this.getpriceBand();
            this.getBookingSetup();
        }
    })
}

getAllClub() {
this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data4) => {
  if (data4.length > 0) {
    this.allClub = data4;
    this.selectedClubKey = this.allClub[0].$key;
    this.getAllActivity();
  }
})
}

getBookingSetup() {
  this.fb.getAllWithQuery("StandardCode/BookingSetup/" + this.parentClubKey + "/" + this.selectedActivity, { orderByChild: 'ClubKey', equalTo: this.selectedClubKey }).subscribe((data) => {
    this.bookingDuration = data[0]['CourtDuration'];
  })
}

onClubChange() {
  this.getAllActivity();
}

getpriceBand(){
  this.fb.getAllWithQuery("StandardCode/PriceBand/"+this.parentClubKey+"/"+this.selectedActivity,{orderByChild:'ClubKey',equalTo:this.selectedClubKey}).subscribe((data)=>{
    this.pricebandList = data;
    this.pricebandList = this.pricebandList.filter(priceband=> priceband.IsActive == 'True');
  })
}
presentActionSheet(pricebandDetails) {
  let actionSheet = this.actionSheetCtrl.create({
    title: 'Modify Price Band',
    buttons: [
      {
        text: 'Edit',
        handler: () => {
          console.log('Archive clicked');
        //  this.navCtrl.push('EditpricebandPage',{pricebandDetails:pricebandDetails})
          this.navCtrl.push('NewcreatepricebandPage',{pricebandDetails:pricebandDetails})
        }
      },
      {
        text: 'Delete',
        handler: () => {
          this.comonService.commonAlter('Delete', 'Are you sure?', ()=>{
            console.log('Archive clicked');
            //  this.navCtrl.push('EditpricebandPage',{pricebandDetails:pricebandDetails})
            this.fb.update(pricebandDetails.$key,"StandardCode/PriceBand/"+this.parentClubKey+"/"+pricebandDetails.ActivityKey, {IsActive:'False'} );
          })
         
        }
      },
      {
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }
    ]
  });

  actionSheet.present();
}
}

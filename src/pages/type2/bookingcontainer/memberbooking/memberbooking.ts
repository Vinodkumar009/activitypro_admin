import { Component, ViewChildren } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController, Slides } from 'ionic-angular';
import { FirebaseService } from '../../../../services/firebase.service';
import { Storage } from '@ionic/storage';
/**
 * Generated class for the MemberbookingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-memberbooking',
  templateUrl: 'memberbooking.html',
})
export class MemberbookingPage {

  @ViewChildren(Slides) slides: Slides;
  imgUrl = "https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815/o/ActivityPro%2FBookingPhotos%2FCourt_Booking_Tennis.jpg?alt=media&token=af0390b3-9dc1-425c-afd8-a8ec2b3beddf";
  activityList: any = [];
  selectedActivity: any = "";
  parentClubKey: any = "";
  AddaCourt="Add a Court..."

  clubDetails: any = [];
  selectedClub: any = "";
  selActivityname:"";
  courtDetails: any = [];
  loading: any = "";
  constructor(public navCtrl: NavController, public navParams: NavParams, storage: Storage
    , public toastCtrl: ToastController, public fb: FirebaseService, public loadingCtrl: LoadingController) {
    // this.loading = this.loadingCtrl.create({
    //   content: 'Please wait...'
    // });
    // this.loading.present().then(() => {
    //   storage.get('userObj').then((val) => {
    //     val = JSON.parse(val);
    //     for (let club of val.UserInfo) {
    //       if (val.$key != "") {
    //         this.parentClubKey = club.ParentClubKey;
    //         this.getClubList();
    //       }
    //     }
    //   })
    //   this.loading.dismiss().catch(() => { });
    // });
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      for (let club of val.UserInfo) {
        if (val.$key != "") {
          this.parentClubKey = club.ParentClubKey;
          this.getClubList();
        }
      }
    })

  }
 
  getClubList() {

    this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
      //alert();
      if (data.length > 0) {
        this.clubDetails = data;
        this.clubDetails.forEach(club => {
          club.isSelect = false
        });
        this.selectedClub = data[0].$key;
        this.selectVenue(this.clubDetails[0])
       
      }
    })
  }
  selectVenue(club){
    this.selectedClub = club.$key
    this.clubDetails.forEach(eachclub => {
      if(eachclub.isSelect){
        eachclub.isSelect = false
      }
      if (eachclub.$key == club.$key) {
        eachclub.isSelect = true
      }
    });
    this.getAllActivity();
  }
  getAllActivity() {
    this.fb.getAll("/Activity/" + this.parentClubKey + "/" + this.selectedClub + "/").subscribe((data) => {
      this.activityList = [];
      if (data.length > 0) {
        this.selectedActivity = data[0].$key;
        this.selActivityname = data[0].ActivityName;
       
        this.activityList = data;
        this.activityList.forEach(activity => {
          activity.isSelect = false
        });
        this.selectactivity(this.activityList[0])
       
      }
    });
  }
  selectactivity(activity){
    this.selectedActivity = activity.$key
    this.activityList.forEach(eachactivity => {
      if(eachactivity.isSelect){
        eachactivity.isSelect = false
      }
      if (eachactivity.$key == activity.$key) {
        eachactivity.isSelect = true
      }
    });
    this.getCourtDetails();
  }
  getCourtDetails() {
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    this.loading.present().then(() => {
      this.fb.getAllWithQuery("/Court/" + this.parentClubKey + "/" + this.selectedClub + "/" + this.selectedActivity, { orderByChild: 'IsActive', equalTo: true }).subscribe((data) => {
        this.courtDetails = data;
        
      });
      this.loading.dismiss().catch(() => { });
    });

  }
  changeClub() {
    this.selectedClub = this.clubDetails[this.slides["first"].getActiveIndex()].$key;
    this.getCourtDetails();
  }
  changeActivity() {
    this.selectedActivity = this.activityList[this.slides["last"].getActiveIndex()].$key;
    this.selActivityname = this.activityList[this.slides["last"].getActiveIndex()].ActivityName;
    this.getCourtDetails();

  }
  goToCourt(courtInfo, index) {
    this.navCtrl.push('ViewcourtPage', {
      courtInfo: courtInfo,
      allCourts: this.courtDetails,
      index: index
    });
  }

}

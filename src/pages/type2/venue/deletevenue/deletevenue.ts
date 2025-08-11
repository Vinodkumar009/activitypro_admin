import { CommonService, ToastMessageType } from '../../../../services/common.service';
import { Component } from '@angular/core';
import { NavController, PopoverController, AlertController, ActionSheetController, NavParams } from 'ionic-angular';
import { SharedServices } from '../../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../../services/firebase.service';
import { Storage } from '@ionic/storage';
// import { Type2AddVenue } from '../venue/addvenue';
// import { Dashboard } from './../../dashboard/dashboard';


import { IonicPage } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
@IonicPage()
@Component({
  selector: 'deletevenue-page',
  templateUrl: 'deletevenue.html'
})

export class DeleteVenue {
 nestUrl: any;
  venue: any;
  DeleteChecked = false
  deleteText = ''
  parentclub: any;
  totalMember = 0
  constructor(public alertCtrl: AlertController, public navParam: NavParams, public http: HttpClient, private commonService:CommonService, public storage: Storage, public actionSheetCtrl: ActionSheetController, public navCtrl: NavController, public sharedservice: SharedServices, public fb: FirebaseService, public popoverCtrl: PopoverController) {
    this.venue = this.navParam.get('venue')
    this.parentclub = this.navParam.get('parentclub')
    this.storage.get('memberDetails').then((details) => {
      let countArray = details.club.filter(club => club.club == this.venue.clubid)
      if (countArray.length > 0){
        this.totalMember = countArray[0].member_count
      }else{
        this.totalMember = 0
      }
      
    });
  }

  ionViewWillEnter() {
    this.nestUrl = this.sharedservice.getnestURL()
  }

  delete(){
    if (this.deleteText != 'DELETE'){
      this.commonService.toastMessage("Type 'DELETE' in input field", 3000, ToastMessageType.Error)
    }else {
      if (this.venue.$key){
        this.fb.update(this.venue.$key, "/Club/Type2/" + this.parentclub, {IsEnable: false, IsActive: false})
      }
      this.deleteFromPostgres()
    }
  }
  deleteFromPostgres() {
    this.http.post(`${this.nestUrl}/club/deletevenue`,{firebase_club_key: this.venue.$key}).subscribe((res) => {
   
      if (res['data']){
        this.commonService.toastMessage('Deletion Successful', 2000, ToastMessageType.Success)
        this.navCtrl.pop()
      }
    },
      err => {
        this.commonService.toastMessage('Deletion Failed', 2000, ToastMessageType.Error)
      })
  }

}

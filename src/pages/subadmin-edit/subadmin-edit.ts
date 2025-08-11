import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FirebaseService } from '../../services/firebase.service';
import { CommonService } from '../../services/common.service';
import { Storage } from '@ionic/storage';
import { ToastController } from 'ionic-angular';
/**
 * Generated class for the SubadminEditPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-subadmin-edit',
  templateUrl: 'subadmin-edit.html',
})
export class SubadminEditPage {
  userObj:any = {};
  parentClubKey:string = "";
  constructor(public toastCtrl: ToastController,public navCtrl: NavController, public navParams: NavParams,public fb:FirebaseService,public commonService:CommonService,private storage:Storage) {
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      for (let club of val.UserInfo)
        if (val.$key != "") {
          this.parentClubKey = club.ParentClubKey;



        }
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SubadminEditPage');
    this.userObj = this.navParams.get('userObj');

  }
  async save(){
    if(this.userObj.EmailID != "" && this.userObj.Name != ""){
     await this.fb.update(this.userObj.$key,"User/SubAdmin",{
        EmailID:this.userObj.EmailID,
        Name: this.userObj.Name
      })
      this.presentToast('successfully save.')
      this.back();
    }else{
      this.presentToast('enter all details.')
    }
  
  }
  back(){
    this.navCtrl.pop();
  }
  presentToast(msg) {
    const toast = this.toastCtrl.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }
}

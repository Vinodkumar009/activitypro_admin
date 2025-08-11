import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { e } from '@angular/core/src/render3';
import { FirebaseService } from '../../../../services/firebase.service';
import { Storage } from '@ionic/storage';
import { CommonService } from '../../../../services/common.service';
/**
 * Generated class for the AddtabPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-addtab',
  templateUrl: 'addtab.html',
})
export class AddtabPage {
saveObj = {
  DisplayText:'',
  DefaultText:'',
  Component:'',
  IsVisible:true,
  Icon: "laptop",
  IsApplicableVisibleFlag: false,
  Level:1,
  Role:2,
  SuperMenuSequence: 0,
  TabSequenceNo: 2,
  Type: 2
}
selectedParentClubKey:any;
allTabs:any = [];
  constructor(public commonmService:CommonService,public storage: Storage,public fb:FirebaseService,public toastCtrl:ToastController,public navCtrl: NavController, public navParams: NavParams) {
  
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      for (let user of val.UserInfo) {
          this.selectedParentClubKey = user.ParentClubKey;
          this.getAllSetup();
          break;
      }

  }).catch(error => {


  });

  }
  getAllSetup(){
    this.fb.getAllWithQuery('TabConfig/Member',{orderByKey:true,equalTo:this.selectedParentClubKey}).subscribe((data)=>{
      delete data[0].$key;

      this.allTabs = this.commonmService.convertFbObjectToArray(data[0]);
      this.saveObj.TabSequenceNo = ++this.allTabs.length;
    })
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad AddtabPage');
  }
  addTab(){
    if(this.saveObj.DefaultText && this.saveObj.DisplayText){
      this.fb.save(this.saveObj,`TabConfig/Member/${this.selectedParentClubKey}`);
      this.presentToast("Tabs successfully added.",3000);
      this.navCtrl.pop();
    }else{ 
      this.presentToast("Please enter all details",3000)
    }
  }
  presentToast(msg,dur) {
    const toast = this.toastCtrl.create({
      message: msg,
      duration: dur
    });
    toast.present();
  }
}

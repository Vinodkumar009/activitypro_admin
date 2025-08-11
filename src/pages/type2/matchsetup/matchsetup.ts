import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
import { ActionSheetController } from 'ionic-angular'
import { CommonService, ToastMessageType } from '../../../services/common.service';
/**
 * Generated class for the PricebandPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-matchsetup',
  templateUrl: 'matchsetup.html',
})
export class MatchSetup {
    parentClubKey: any;

    matchSetup = [
      {
        IsActive: true,
        IsEnable: true,
        DisplayName: "Match",
        Name: "Match",
        CreateDate:0,
        Member: false,
        NonMember: false,
        Code: 100
      },
      {
        IsActive: true,
        IsEnable: true,
        DisplayName: "Ladder",
        Name: "Ladder",
        CreateDate:0,
        Code: 101
      },
      {
        IsActive: true,
        IsEnable: true,
        DisplayName: "Result",
        Name: "Result",
        CreateDate:0,
        Code: 102
      },
      {
        IsActive: true,
        IsEnable: false,
        DisplayName: "League",
        Name: "League",
        CreateDate:0,
        Code: 103
      }
    ]
    isUpdate= false
    matchDetail = {}
 
  constructor(public actionSheetCtrl: ActionSheetController, public comonService: CommonService, public navCtrl: NavController, public navParams: NavParams, public fb: FirebaseService, public storage: Storage) {
    this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      this.matchDetail = this.matchSetup.filter((match) => match.Name == 'Match')[0]
      for (let user of val.UserInfo) {
        if (val.$key != "") {
          this.parentClubKey = user.ParentClubKey;
         this.getmatch()
        }
      }
    }).catch(error => {

    });
  }

  getmatch(){
      let x = this.fb.getAllWithQuery(`APSetup/${this.parentClubKey}/MatchSetup`, {orderByChild: "IsActive", equalTo: true }).subscribe((data)=>{
        console.log(data)
        if (data.length > 0){
          this.isUpdate = true
          this.matchSetup = data
          this.matchDetail = this.matchSetup.filter((match) => match.Name == 'Match')[0]
        } 
        x.unsubscribe()

      })

  }

  save(){
    this.matchSetup.forEach(match =>{
      if (match.Member){
        match.Member = this.matchDetail['Member']
        match.NonMember = this.matchDetail['NonMember']
      }
      this.fb.saveReturningKey(`APSetup/${this.parentClubKey}/MatchSetup/`,match)
    })
    this.comonService.toastMessage('Saved Successfully...', 2000, ToastMessageType.Success)
    this.navCtrl.pop()
  }

  update(){
    this.matchSetup.forEach(match =>{
      if (match.Member){
        match.Member = this.matchDetail['Member']
        match.NonMember = this.matchDetail['NonMember']
      }
      let key = match['$key']
      delete  match['$key']
      this.fb.update(key, `APSetup/${this.parentClubKey}/MatchSetup/`,match)
    })
    this.comonService.toastMessage('Saved Successfully...', 2000, ToastMessageType.Success)
    this.navCtrl.pop()
  }
  gotoAgeCategory(){
    this.navCtrl.push('AgecategoryPage')
  }
}



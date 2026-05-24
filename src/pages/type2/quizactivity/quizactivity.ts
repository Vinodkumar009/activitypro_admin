import { Component } from '@angular/core';
import { AlertController, IonicPage, NavController, NavParams } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
import { FirebaseService } from '../../../services/firebase.service';
import { SharedServices } from '../../services/sharedservice';
import { Storage } from '@ionic/storage';
/**
 * Generated class for the QuizactivityPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-quizactivity',
  templateUrl: 'quizactivity.html',
})
export class QuizactivityPage {
  parentClubKey: any;
  allClub =  [];
  selectedActivity: string;
  activity = [];
  originalactivity = []
  activityPresent = false
  constructor(public alertCtrl: AlertController, storage: Storage,public commonService:CommonService, public fb: FirebaseService, public navCtrl: NavController, public sharedservice: SharedServices) {
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        this.getActivity()
        
      }

    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad QuizactivityPage');
  }

  getAllClub() {
    let x = this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data4) => {
      if (data4.length > 0) {
        this.allClub = []
        this.allClub = data4;
        // this.allClub.forEach(club => {  
        //   this.getAllActivity(club.$key);
        // })
       // this.getActivity()
        x.unsubscribe()
      }
    })
  }

  getAllActivity(selectedClubKey) {
    let x = this.fb.getAll("/Activity/" + this.parentClubKey + "/" + selectedClubKey + "/").subscribe((data) => {

      this.selectedActivity = "";
      if (data.length > 0) {
        data.forEach(activity => {

           
          if (activity.IsActive) {
            let obj = {
              ActivityName: activity.ActivityName,
              ActivityCode: activity.ActivityCode,
              ActivityKey: activity.$key,
              IsEnable: false,
              IsExistActivityCategory: activity.IsExistActivityCategory,
              ActivityImageURL: activity.ActivityImageURL
            }
            let activityarr: any = this.originalactivity
            const isalreadypresent = activityarr.some(act => act.ActivityName == obj.ActivityName)
            if (!isalreadypresent) {
              this.originalactivity.push(obj)
            }
          }
        })
    
        x.unsubscribe()
      }
      this.getQuizActiviy()
    });
  }

  getActivity() {
    this.fb.getAll("/StandardCode/Activity/Default/").subscribe((data) => {
        if(data.length > 0){
            this.originalactivity = data;
            if (this.originalactivity.length != undefined) {
               this.originalactivity.forEach(act => {
                act['ActivityName']= act.ActivityName
                act['ActivityCode']= act.ActivityCode
                act['ActivityKey']= act.$key
                act['IsEnable'] = false
                if(act.$key == '-KhXV3cvTWxz5SSZdIxU' || act.$key == '-KuFUu6J8WZtitsp8uT6' || act.$key == '-M4KZgPZQ5egShzFJV2j'){
                  act['IsEnable'] = true
                }
                act['IsExistActivityCategory'] = act.IsExistActivityCategory
                act['ActivityImageURL']= act.ActivityImageURL
               })
            }
        }
       this.getQuizActiviy()
    })
 }

  getQuizActiviy(){
    this.fb.getAllWithQuery(`ApKids/Quiz/Activity/${this.parentClubKey}`,{orderByChild:"IsActive", equalTo:true}).subscribe(data => {
      this.activity = []
      if(data.length > 0){
        this.activity = data
        this.activityPresent = true

        this.originalactivity.forEach(act => {
          if (this.activity.some(eachactivity => eachactivity.ActivityKey == act.ActivityKey && eachactivity.IsActive && eachactivity.IsEnable  )){
              act.IsEnable = true
              act['IsDisable'] = true
              act['secondKey'] = this.activity.filter(acti =>  acti.ActivityKey == act.ActivityKey)[0].$key
          } else{
            act.IsEnable = false
          }
          // this.activity.forEach(oriAct => {
          //   if(oriAct.ActivityKey == act.ActivityKey && oriAct.IsActive && oriAct.IsEnable ){
          //     act.IsEnable = true
          //     act['IsDisable'] = true
          //     act['secondKey'] = oriAct.$key
          //   }
          // })
        })
      }
    })
  }

  save(){
    this.originalactivity.forEach(act => {
      if(act.IsEnable){
        this.fb.saveReturningKey(`ApKids/Quiz/Activity/${this.parentClubKey}`, {
          ActivityName: act.ActivityName,
          ActivityCode: act.ActivityCode,
          IsActive: true,
          IsEnable: true,
          ActivityKey: act.ActivityKey,
          ActivityImageURL: act.ActivityImageURL
        })

      }
    })
    this.commonService.toastMessage('Updated!!!', 2000)
  }

  update(){
    this.originalactivity.forEach(act => {
      if(act.IsEnable && !act.IsDisable){
        this.fb.saveReturningKey(`ApKids/Quiz/Activity/${this.parentClubKey}`, {
          ActivityName: act.ActivityName,
          ActivityCode: act.ActivityCode,
          IsActive: true,
          IsEnable: true,
          ActivityKey: act.ActivityKey,
          ActivityImageURL: act.ActivityImageURL
        })
      }
      if(!act.IsEnable && act.IsDisable){
        this.fb.update(act.secondKey,`ApKids/Quiz/Activity/${this.parentClubKey}`, {IsEnable:false})
      }
    })
    this.commonService.toastMessage('Updated!!!', 2000)
  }

}

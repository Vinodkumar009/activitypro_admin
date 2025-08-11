import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';

import * as $ from 'jquery';
import { InAppBrowser, InAppBrowserEvent } from '@ionic-native/in-app-browser';
import { Platform } from 'ionic-angular';
import { LoadingController } from 'ionic-angular/components/loading/loading-controller';
import { CommonService } from '../../../../services/common.service';
import { Mandates } from '../../../Model/mandateFormat';

import { DirectDebitController } from '../../../../controller/directdebit.controller';
import { FirebaseService } from '../../../../services/firebase.service';
/**
 * Generated class for the CreatemandatesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */ 

@IonicPage()
@Component({
  selector: 'page-createmandates',
  templateUrl: 'createmandates.html',
}) 
export class CreatemandatesPage {
  memberInfo:any = {};
  mandatesObj:any = "";
  checkBrowser:number = 1;
  mandateRes:any = {};
  resume:any = {};
  loading:any = {};
  acttivityList:Array<any> = [];
  selectedActivity:any = "";
  selectedActivityName:any = '';
  constructor(public navCtrl: NavController, public navParams: NavParams,private iab: InAppBrowser,public platform:Platform,public loadingCtrl:LoadingController,public fb: FirebaseService,public commonService: CommonService,public alertCtrl: AlertController) {
  this.platform.ready().then(() => {
    this.resume = this.platform.resume.subscribe(() => {      
        alert("hiiiiiii")
    });
  });
   this.memberInfo  = this.navParams.get('memberIno');
  
     
  }
  ionViewWillUnload() {
    this.resume.unsubscribe();
  }
  async ionViewDidLoad() {
    console.log('ionViewDidLoad CreatemandatesPage');
    let x = await this.getActivityList();
    this.mandatesObj = new Mandates(this.memberInfo);
    
  }
  async create(){
    try{
      this.loading = this.loadingCtrl.create({
        content: 'Getting Details...'
      });
      let responce = await this.makeRequest();
      this.checkBrowser = 2;
      console.log(responce);
      this.mandateRes = responce
      let x = this.iab.create(responce["URL"])
      this.loading.dismiss().catch(() => { });
      x.on("exit").subscribe(async(event: InAppBrowserEvent) => {
       
       try{ 
        this.loading = this.loadingCtrl.create({
          content: 'Saving Mandates...'
        });
        let y = await this.completeRequest();
        this.navCtrl.pop()
        this.loading.dismiss().catch(() => { });
       }catch(err2){
        this.navCtrl.pop()
        this.loading.dismiss().catch(() => { });
       }
       
      });
    }catch(err){
      console.log(err)
    }
  }
  makeRequest(){
    
    return new Promise((resolve,reject)=>{
      let additionalInfo = {
        parentClubKey:this.memberInfo.ParentClubKey,
        clubKey:this.memberInfo.ClubKey,
        memberKey:this.memberInfo.$key,
        description:'testing',
        sucessfulURL:"https://developer.gocardless.com/example-redirect-uri/"
       }
       this.mandatesObj.ActivityKey = this.selectedActivity;
       this.mandatesObj.ActivityName = this.selectedActivityName;
      this.mandatesObj.CreatedDate = new Date().getTime();
      this.mandatesObj.UpdatedDate = this.mandatesObj.CreatedDate
      this.mandatesObj.SessionToken = this.memberInfo.$key+"-"+this.mandatesObj.CreatedDate;
      console.log(JSON.stringify(this.mandatesObj))
      let reqObj = {
        mandatesObj:JSON.stringify(this.mandatesObj),
        additionalInfo:JSON.stringify(additionalInfo)
       }
      $.ajax({
        url: new DirectDebitController().getApi('initiateMandate'),
        type: "POST", 
        data:reqObj,
        success: function(res){
          if(res.status){
            resolve(res)
          }else{
            reject(res)
          }
        },
        error:function(err){
          console.log(err);
          reject(err);
        }
      });
    })
  }
  async confimMandate(){
    try{
      let x = await this.completeRequest();
      alert(JSON.stringify(x))
    }catch(err){
      alert(JSON.stringify(err))
    }
  }
  completeRequest(){
    return new Promise((resolve,reject)=>{
      let additionalInfo = {
        parentClubKey:this.memberInfo.ParentClubKey,
        clubKey:this.memberInfo.ClubKey,
        memberKey:this.memberInfo.$key,
        referKey:this.mandateRes["referKey"],
        intermidiateId:this.mandateRes["intermidiateId"],
        sessiontoken:this.mandateRes["sessiontoken"]
       }
      $.ajax({
        url:new DirectDebitController().getApi('completeFlow'),
        type: "POST", 
        data:additionalInfo,
        success: function(res){
          if(res.status){
            resolve(res)
          }else{
            reject(res)
          }
        },
        error:function(err){
          console.log(err);
          reject(err);
        }
      });
    })
  }
  getActivityList(){
    this.fb.getAllWithQuery("Activity/"+this.memberInfo.ParentClubKey+"/"+this.memberInfo.ClubKey,{orderByKey:true}).subscribe((data)=>{
      this.acttivityList = data;
      if(data.length > 0){
        this.selectedActivity = data[0].$key;
        this.selectActivityname = data[0].ActivityName;
        this.memberInfo["ActivityKey"] = this.selectedActivity;
        this.memberInfo["ActivityName"] = this.selectActivityname;
      }
    })
  }
  selectActivityname(activityObj){
    this.selectActivityname = activityObj.ActivityName;
    this.memberInfo["ActivityName"] = activityObj.ActivityName;
  }
  changeActivity(){
    this.memberInfo["ActivityKey"] = this.selectedActivity;
    
  }
}

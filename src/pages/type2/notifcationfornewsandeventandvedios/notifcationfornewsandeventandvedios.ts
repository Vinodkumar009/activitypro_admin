import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonService } from '../../../services/common.service';

import { Http, Headers, RequestOptions } from '@angular/http';
import { SharedServices } from '../../services/sharedservice';
/**
 * Generated class for the NotifcationfornewsandeventandvediosPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-notifcationfornewsandeventandvedios',
  templateUrl: 'notifcationfornewsandeventandvedios.html',
})
export class NotifcationfornewsandeventandvediosPage {
  imgInfo:any;

  clubKeys: any = [];
  mlist: any = [];
  tokenList: any = [];
  deviceTokens: any = [];
  shareInfo: any = "";
  parentClubKey: any = "";
  description:string=""
  constructor(
    private http: Http,public commonService: CommonService
    ,public fb: FirebaseService,public navCtrl: NavController,
     public navParams: NavParams,
     private toastCtrl: ToastController,
     public sharedservice:SharedServices) {
   

  }

  ionViewDidLoad() {
   // console.log('ionViewDidLoad NotifcationfornewsandeventandvediosPage');
   this.imgInfo=this.navParams.get("ImageInfo"); 
   this.shareInfo= this.navParams.get("ShareInfo");
   this.description="Check out the latest Events - " + this.shareInfo.ImageTitle;
   this.fb.getAllWithQuery("Member/" + this.imgInfo.ParentClubKey, { orderByKey: true }).subscribe((data) => {
     this.mlist = [];
     this.tokenList = [];
     this.clubKeys = [];
     this.deviceTokens = [];
     this.getKeys(data)
   });
  }


  
  getKeys(data2){
    this.clubKeys = [];
    for(let i = 0; i < data2.length ;i++){
     // this.clubKeys.push(data[i].$key);
     
     data2[i] = this.commonService.convertFbObjectToArray(data2[i]);

     for(let j = 0 ; j <  data2[i].length ;j ++){
       if(data2[i][j].IsActive == true &&  data2[i][j].IsChild == false){
        this.mlist.push(data2[i][j]);
       }
     }
    
    }
   
   let x =  this.fb.getAllWithQuery("DeviceToken/Member/"+this.shareInfo.ParentClubKey,{orderByKey:true}).subscribe((data) =>{
     // console.log(data);
      for(let i = 0; i< data.length ;i++){
        data[i] = this.commonService.convertFbObjectToArray(data[i]);
       for(let j = 0 ; j < data[i].length ; j++){
         if(data[i][j].Key == "Token"){
          data[i][j] = this.commonService.convertFbObjectToArray1(data[i][j])
          for(let l = 0;  l <  data[i][j].length-1 ; l++){
            // this.deviceTokens.push(data[i][j][l].DeviceToken);
            this.deviceTokens.push({ MobileDeviceId:data[i][j][l].DeviceToken, ConsumerID: "", PlatformArn: "" });
          }
         }else{
           data[i][j].Token = this.commonService.convertFbObjectToArray( data[i][j].Token);
           for( let k = 0 ; k <  data[i][j].Token.length ; k++){
            // this.deviceTokens.push(data[i][j].Token[k].DeviceToken);
            this.deviceTokens.push({ MobileDeviceId: data[i][j].Token[k].DeviceToken, ConsumerID: "", PlatformArn: "" });
           }
        }
       }
       }
      
       x.unsubscribe();
    });
  }

  sendNotification() {
    // let notificationDetailsObj = this.notificationObj;
    this.parentClubKey = this.shareInfo.ParentClubKey;

    let pc = {
      CreatedTime: "", Message: '', SendBy: '', ComposeOn: '', Purpose: '', sendByRole: "", Status: "Unread", SessionName: '',
      Member: []
    };
    pc.SendBy = "Admin";
    pc.sendByRole = "Admin";
    pc.Purpose = "Info";
    pc.Message = this.description;
    pc.SessionName = "";
    pc.CreatedTime = new Date().toString();
    pc.ComposeOn = new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate();



    let memberObject = {
      CreatedTime: new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate(),
      Message: this.description,
      SendBy: 'Admin',
      ComposeOn: new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate(),
      Purpose: 'Info',
      SessionName: "",
      sendByRole: "Admin",
      Status: "Unread",
      Admin: []
    };

    for (let i = 0; i < this.mlist.length; i++) {
      pc.Member.push({
        Name: this.mlist[i].FirstName + " " + this.mlist[i].LastName,
        Key: this.mlist[i].Key,
        ClubKey: this.mlist[i].ClubKey,
        SignedUpType: 1
      });
    }



    this.fb.saveReturningKey("Notification/ParentClub/" + this.parentClubKey + "/Session/ComposeNotification/", pc);

    for (let i = 0; i < this.mlist.length; i++) {
      memberObject.SendBy = "Admin";
      memberObject.sendByRole = "Admin";
      memberObject.Purpose = "";
      memberObject.CreatedTime = new Date().toString();
      memberObject.ComposeOn = new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate();
      memberObject.Status = "Unread";

      memberObject.Admin[0] = { Key: this.parentClubKey };
      this.fb.saveReturningKey("Notification/Member/" + this.parentClubKey + "/" + this.mlist[i].ClubKey + "/" + this.mlist[i].Key + "/Session/Notification/", memberObject);
    }


    let url = this.sharedservice.getEmailUrl();
    let pKey = this.sharedservice.getParentclubKey();
    let message = this.description;
    this.fb.CallToApiForNotification({ URL: url, DeviceTokens: this.deviceTokens, Message: message, Subject: "Notification", ParentclubKey: pKey });



    // for (let innerIndex = 0; innerIndex < this.deviceTokens.length; innerIndex++) {
    //   let data = {
    //     to: '',
    //     priority: "high",
    //     notification: {
    //       body: '',
    //       title: '',
    //       sound: "default",
    //     },
    //     data: {
    //       param: this.description,
    //     },
    //   };
    //   data.to = this.deviceTokens[innerIndex];
    //   data.notification = { body: '', title: '', sound: "default", };
    //   data.notification.title = "";
    //   data.notification.body = this.description;
    //   let headers = new Headers({
    //     'Authorization': "key=AIzaSyAOnMFZfP6NIBoUaZJR_I5t9HEItpVQLQE",
    //     'Content-Type': 'application/json'
    //   });
    //   let options = new RequestOptions({ headers: headers });
    //   this.http.post('https://fcm.googleapis.com/fcm/send', data, options).map(res => res.json()).subscribe(data => {
    //     // this.notificationObj.Message = "";
    //   }, err => {
    //     console.log("ERROR!: ", err);
    //   }
    //   );

    // }

    this.navCtrl.pop();
    this.showToast("Notify successfully");

  }
  showToast(m: string) {
    let toast = this.toastCtrl.create({
      message: m,
      duration: 5000,
      position: 'bottom'
    });
    toast.present();
  }


  cancelSessionCreation(){
    this.navCtrl.pop();
  }

}

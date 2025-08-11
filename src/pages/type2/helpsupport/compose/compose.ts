import { Component, ViewChild } from '@angular/core';
import { IonicPage, Content, NavController, NavParams , AlertController, ToastController} from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { SharedServices } from '../../../services/sharedservice';
import { CommonService } from "../../../../services/common.service";
import { Storage } from '@ionic/storage';

/**
 * Generated class for the ComposePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-compose',
  templateUrl: 'compose.html',
  providers: [CommonService,SharedServices,]
})
export class ComposePage {
  messages:Array<any> = [];
  ChatObj:any = {SuperAdminKey:"",ParentClubKey:"",Userkey:"",Username:"",chatKey:"",};
  reqObj:any= {ReqMsg:"",CreatedAt:undefined}
  isStopConversation:boolean = false;
  newMsg = '';
  user:string="";
  recChatObj:any;
  parentClubKey :string;
  parentClubName:string;
  nodeUrl: string = "";
  @ViewChild(Content) content: Content;
  studentkey:string = "";
  userData: any;
  constructor(public navCtrl: NavController, public navParams: NavParams, public alertController:AlertController,public toastController: ToastController, public commonService: CommonService, public sharedservice: SharedServices, private storage: Storage,public http: HttpClient) {
    let data = this.navParams.get("chatObj");
    this.recChatObj = data;
    console.log(this.recChatObj);
    this.user = data.Username;
    this.ChatObj.chatKey = data.Key;
    this.ChatObj.Userkey = data.Userkey;
    this.ChatObj.Username = data.Username;
    this.ChatObj.SuperAdminKey = data.SuperAdminKey;
    this.ChatObj.ParentClubKey = data.ParentClubKey;
    this.nodeUrl = SharedServices.getTempNodeUrl();
    this.isStopConversation = data.Chat_Status == "completed" ? true : false;
    console.log(this.recChatObj["Request"]);
    this.recChatObj["Request"].forEach((chat) => {
      if(chat.Response){
        chat.Response = this.commonService.convertFbObjectToArray(chat.Response);
      }
    });
    //console.log(this.recChatObj);
    
    this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
          this.parentClubKey = val.UserInfo[0].ParentClubKey;
          this.parentClubName = val.Name;
         // this.getdata();
      }
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ComposePage');
    this.userData = this.sharedservice.getUserData();
    setTimeout(() => {
      this.content.scrollToBottom(200);
    });
  }

  

  sendMessage() {
    let chatInfoObj={};
    chatInfoObj["OtherInfo"] = this.ChatObj;
    this.reqObj.ReqMsg = this.newMsg;
    this.reqObj.CreatedAt = new Date().getTime();
    chatInfoObj["ChatObj"] = this.reqObj;

    this.http.post(`${this.nodeUrl}/messege/chat/sendstudmsg`,chatInfoObj).subscribe((result) => {
     setTimeout(() => {
        this.recChatObj.Request.push(this.reqObj);
        this.newMsg = "";
        this.content.scrollToBottom(200);
      });
    },(err)=>{
      console.log("err", err);
    });
  }

  //closing a conversation
   closeConversation(){
    const alert =  this.alertController.create({
      title: 'Close Conversation',
      message: 'You want to close the conversation ?',
      cssClass:"alertCustom",
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Yes',
          handler: () => {
            console.log('Confirm Okay');
            this.changeStatus();
          }
        }
      ]
    });
    alert.present();
  }

  //closing conversation
  changeStatus(){
    this.ChatObj["chatstatus"] = "completed";
    this.http.post(`${this.nodeUrl}/messege/chat/statuschange`,this.ChatObj).subscribe((result) => {
      this.toastMessage("Your conversation has been closed",1);
      this.navCtrl.pop();
      this.isStopConversation = true;
    },(err)=>{
        console.log("err", err);
    });
  }

  
// toast controller show & dismiss
 toastMessage(msg: string, value: number) {
  let toast =  this.toastController.create({
      message: msg,
      duration: 1700,
      cssClass: value ? "Success" : "Error",
      //showCloseButton: true
  });
  toast.present();
}



}

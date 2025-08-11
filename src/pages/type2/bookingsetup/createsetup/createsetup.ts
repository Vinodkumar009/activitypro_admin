import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { FirebaseService } from '../../../../services/firebase.service';
import { Storage } from '@ionic/storage';
import moment from 'moment'
import { ToastController } from 'ionic-angular';
/**
 * Generated class for the CreatesetupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-createsetup',
  templateUrl: 'createsetup.html',
})
export class CreatesetupPage {
  selectedClubKey = '';
  selectedActivity ='';
  parentClubKey="";
  allActivityArr = [];
  allClub = [];

  BookingSetup = {
    CourtDuration:'30',
    AdvanceBookingAllowed:15,
    MaxBookinginaDay:2,
    MaximumNumberofHoursInAdvance:5,
    MemberFreeHoursInDay:1,
    NonmemberFreeHoursInDay:0,
    CoachAdvanceBookingInDays:30,
    MemberCancellationAllowedHours:24,
    DefaultCalenderDate:0,
    CreatedDate:'',
    UpdatedDate:'',
    IsActive:'true',
    IsEnable:'true',
    ClubName:'',
    ClubKey:'',
    ActivityKey:'',
    ActivityName:'',
    parentClubKey:'',
    IsAllowNonMember:false,
    AllowCashPayment:false,
    AllowBacsPayment:false,
    AllowSplit:false ,
    GateCode:false,
    ShowMemberSearch:false,
    IsAllowGuest:false,
    PaymentOptionForFloodLight: 'Offline',
    FloodLightMemberFees:0,
    FloodLightNonMemberFees:0,
    FreeCourtText:'Book',
    AdvanceBookingGold:14,
    AdvanceBookingCoach:14,
  }
  disclaimer={
    Header:'',
    Description:'',
    CreateDate:0,
    IsActive:true
  }
  tableImage = {
    Type:1,
    URL:'',
    ImageName:''
  }

  codeList= [
    {date: moment().format("YYYY-MM-DD"), code:'1234'},
    {date: moment().add(1, 'M').format("YYYY-MM-DD"), code:'1234'},
    {date: moment().add(2, 'M').format("YYYY-MM-DD"), code:'1234'},
    {date: moment().add(3, 'M').format("YYYY-MM-DD"), code:'1234'},
  ]
  isFirstTime:boolean = true;
  maxDate: string;
  IsTable: boolean = false;
  constructor(public navCtrl: NavController,public alertCtrl: AlertController,  public navParams: NavParams ,public fb: FirebaseService, public storage: Storage,public toastCtrl: ToastController) {
    let selectedSetup = this.navParams.get("setupDetails");
    this.BookingSetup.ClubKey = selectedSetup.selectedClubKey;
    this.BookingSetup.ActivityKey = selectedSetup.selectedActivity;
    this.maxDate = moment().add(20, 'y').format("YYYY-MM-DD")
  }

  ionViewDidLoad() {
    this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);

      for (let user of val.UserInfo) {
        if (val.$key != "") {
          this.parentClubKey = user.ParentClubKey;
          this.getAllClub();
        }
      }
    }).catch(error => {

    });
  }
  onClubChange() {
    this.getAllActivity();
}

popCode(item, i){
  this.codeList.splice(i, 1)
}

getAllActivity() {
  this.fb.getAll("/Activity/" + this.parentClubKey + "/" + this.selectedClubKey + "/").subscribe((data) => {
      this.allActivityArr = [];
      if (data.length > 0) {
          this.allActivityArr = data;
          if(this.isFirstTime){
            this.selectedActivity = this.BookingSetup.ActivityKey;
            this.isFirstTime = false;
          }else{
            this.selectedActivity = data[0].$key;
          }
          if(this.selectedActivity == '-MCMaUe_FtFh1RZuIqtG'){
            this.IsTable = true
          }
      }
  })
}

onActChange(){
  if(this.selectedActivity == '-MCMaUe_FtFh1RZuIqtG'){
    this.IsTable = true
  }
}


getAllClub() {
this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data4) => {
if (data4.length > 0) {
  this.allClub = data4;
  //this.selectedClubKey = this.allClub[0].$key;
  this.selectedClubKey = this.BookingSetup.ClubKey;
  this.getAllActivity();
}
})
}
saveCaurt(){
  this.BookingSetup.ActivityKey = this.selectedActivity;
  this.BookingSetup.ClubKey = this.selectedClubKey;
  for(let i = 0; i < this.allActivityArr.length;i++){
    if(this.allActivityArr[i].$key == this.BookingSetup.ActivityKey){
      this.BookingSetup.ActivityName = this.allActivityArr[i].ActivityName;
    }
  }
  for(let i = 0; i < this.allClub.length;i++){
    if(this.allClub[i].$key == this.BookingSetup.ClubKey){
      this.BookingSetup.ClubName = this.allClub[i].ClubName;
    }
  }
  this.BookingSetup.parentClubKey = this.parentClubKey;
  this.BookingSetup.CreatedDate = <string>new Date().getTime().toString();
  this.BookingSetup.UpdatedDate = <string>new Date().getTime().toString();
  if(this.disclaimer.Header && this.disclaimer.Description && this.disclaimer.IsActive){
    this.disclaimer.CreateDate = new Date().getTime()
    this.BookingSetup['disclaimer'] = this.disclaimer
  }
  if(this.BookingSetup.AdvanceBookingAllowed != undefined && String(this.BookingSetup.CoachAdvanceBookingInDays) != "" && this.BookingSetup.CourtDuration != "" && this.BookingSetup.MaxBookinginaDay != undefined && this.BookingSetup.MaximumNumberofHoursInAdvance != undefined){
   let key =  this.fb.saveReturningKey("StandardCode/BookingSetup/"+this.parentClubKey+"/"+this.selectedActivity, this.BookingSetup);
    if(this.BookingSetup.GateCode){
      this.codeList.forEach(eachCode  =>{
        this.fb.saveReturningKey("StandardCode/BookingSetup/"+this.BookingSetup.parentClubKey+"/"+this.selectedActivity+"/"+key +"/CodeList", eachCode);
      })
    }
    if(this.selectedActivity == '-MCMaUe_FtFh1RZuIqtG'){
      for(let i=0 ; i<4; i++){
        this.fb.saveReturningKey("StandardCode/BookingSetup/"+this.BookingSetup.parentClubKey+"/"+this.selectedActivity+"/"+key +"/Image", this.tableImage);
      }
      for(let i=0 ; i<4; i++){
        this.tableImage.Type = 2
        this.fb.saveReturningKey("StandardCode/BookingSetup/"+this.BookingSetup.parentClubKey+"/"+this.selectedActivity+"/"+key +"/Image", this.tableImage);
      }
      for(let i=0 ; i<4; i++){
        this.tableImage.Type = 3
        this.fb.saveReturningKey("StandardCode/BookingSetup/"+this.BookingSetup.parentClubKey+"/"+this.selectedActivity+"/"+key +"/Image", this.tableImage);
      }
    }
    this.presentToast('successfully created');
    this.navCtrl.pop();
  }else{
    this
  }
}
presentToast(msg) {
  const toast = this.toastCtrl.create({
    message:msg,
    duration: 3000
  });
  toast.present();
}
changeCashState(){
  this.BookingSetup.AllowCashPayment = !this.BookingSetup.AllowCashPayment ;
}

changeBacsState(){
  this.BookingSetup.AllowBacsPayment = !this.BookingSetup.AllowBacsPayment ;
}
showtoaster(){
    
  let toast = this.toastCtrl.create({
      message: 'Remember to pickup date in ascending order.',
      duration: 5000,
      position: "bottom",
      cssClass: 'info',
      showCloseButton: true
  });
  toast.present();

}

addCode() {
this.showtoaster()
let alert = this.alertCtrl.create({
  title: "Enter Index",
  message: "At which position you to insert?",
  inputs: [{ name: "Index", type: "text", value: "" }],
  buttons: [
    { text: "Cancel", role: "cancel" },
    {text : 'Ok', handler : (data)=>{
      //this.addGateCode(data.Index)
    }}
  ],
})
alert.present()  }

addGateCode(){
this.codeList.splice(this.codeList.length - 1, 0, {date:'',code:''})
}
showToast(m: string, howLongShow: number) {
  let toast = this.toastCtrl.create({
      message: m,
      duration: howLongShow,
      position: 'bottom'
  });
  toast.present();
}
}

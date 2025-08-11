import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController } from 'ionic-angular';
import { FirebaseService } from '../../../../services/firebase.service';
//import { Type2AssignMembershipSubCategory } from '../../assignmembership/assignmembershipsubcategory';
import moment from 'moment'
import { CommonService } from '../../../../services/common.service';


@IonicPage()
@Component({
  selector: 'page-editbooking',
  templateUrl: 'editbooking.html',
})
export class EditbookingPage {
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
    AllowSplit:false,
    GateCode:false,
    ShowMemberSearch:false,
    IsAllowGuest:false,
    ParentClubKey:'',
    PaymentOptionForFloodLight: '',
    FloodLightMemberFees:0,
    FloodLightNonMemberFees:0,
    FreeCourtText:'Book',
    AdvanceBookingGold:14,
    AdvanceBookingCoach:14,
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
  allClub:any = [];
  allActivityArr:any = [];
  selectedClubKey:any = "";
  selectedActivity:any = '';
  maxDate: string;
  codeIndex = 0;
  IsTable: boolean = false;

  disclaimer={
    Header:'',
    Description:'',
    CreateDate:0,
    IsActive:true
  }

  deletedCodeList = []
  constructor(public navCtrl: NavController,public alertCtrl: AlertController, public toastCtrl : ToastController, public navParams: NavParams,public commonservices: CommonService ,public fb:FirebaseService) {
    this.BookingSetup = this.navParams.get('setupDetails');
    if(this.BookingSetup.AllowCashPayment == undefined){
      this.BookingSetup["AllowCashPayment"] = false;
    }
    if(this.BookingSetup.IsAllowNonMember == undefined){
      this.BookingSetup["IsAllowNonMember"] = false;
    }
    if(this.BookingSetup.AllowBacsPayment == undefined){
      this.BookingSetup["AllowBacsPayment"] = false;
    }
    if(this.BookingSetup.IsAllowGuest == undefined){
      this.BookingSetup["IsAllowGuest"] = false;
    }
    if(this.BookingSetup.DefaultCalenderDate == undefined){
      this.BookingSetup["DefaultCalenderDate"] = 0;
    }
    if(this.BookingSetup.ShowMemberSearch == undefined){
      this.BookingSetup["ShowMemberSearch"] = false;
    }
    if(this.BookingSetup.AdvanceBookingGold == undefined){
      this.BookingSetup['AdvanceBookingGold'] = 14
    }
    if(this.BookingSetup.AdvanceBookingCoach == undefined){
      this.BookingSetup['AdvanceBookingCoach'] = 14
    }

    if(this.BookingSetup.GateCode == undefined){
      this.BookingSetup["GateCode"] = false;
    }else if(this.BookingSetup.GateCode){
      this.codeList = []
      this.codeList = this.commonservices.convertFbObjectToArray(this.BookingSetup['CodeList'])
    }
    if(this.BookingSetup['disclaimer'] == undefined){
      this.BookingSetup['disclaimer'] = this.disclaimer     
    }

    this.maxDate = moment().add(20, 'y').format("YYYY-MM-DD")
    this.selectedClubKey = this.BookingSetup.ClubKey;
    this.selectedActivity = this.BookingSetup.ActivityKey
    if(this.selectedActivity == '-MCMaUe_FtFh1RZuIqtG'){
      this.IsTable = true
    }
    this.getAllClub();
  }

  getAllClub() {
    this.fb.getAllWithQuery("/Club/Type2/" + this.BookingSetup.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data4) => {
    if (data4.length > 0) {
      this.allClub = data4;
      this.selectedClubKey  = this.BookingSetup.ClubKey;
      this.getAllActivity();
    }
    })
  }
  getAllActivity() {
      this.fb.getAll("/Activity/" + this.BookingSetup.parentClubKey + "/" + this.selectedClubKey + "/").subscribe((data) => {
          this.allActivityArr = [];
          if (data.length > 0) {
              this.allActivityArr = data;
              this.selectedActivity = this.BookingSetup.ActivityKey;
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

  changeCashState(){
    this.BookingSetup.AllowCashPayment = !this.BookingSetup.AllowCashPayment ;
  }
  changeBacsState(){
    this.BookingSetup.AllowBacsPayment = !this.BookingSetup.AllowBacsPayment ;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditbookingPage');
  }

  popCode(item, i){
    this.codeList.splice(i, 1)
    this.deletedCodeList.push(item)
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
    this.codeList.push({date:'',code:''})
  }
  update(){
    this.BookingSetup.ParentClubKey = this.BookingSetup.parentClubKey;
    console.log(this.BookingSetup)
    let key =  this.BookingSetup["$key"];
    if(key){
      delete this.BookingSetup["$key"];
      if(!this.BookingSetup["disclaimer"] && this.disclaimer.Header && this.disclaimer.Description && this.disclaimer.IsActive){
        this.disclaimer.CreateDate = new Date().getTime()
        this.BookingSetup['disclaimer'] = this.disclaimer
      }


      this.fb.update(key,"StandardCode/BookingSetup/"+this.BookingSetup.parentClubKey+"/"+this.selectedActivity,this.BookingSetup);
      if(this.BookingSetup.GateCode){
        this.codeList.forEach(eachCode  =>{
          if(eachCode['Key']){
            let codekey = eachCode['Key']
            delete eachCode['Key']
            this.fb.update(codekey,"StandardCode/BookingSetup/"+this.BookingSetup.parentClubKey+"/"+this.selectedActivity+"/"+key +"/CodeList", eachCode )
          }else{
            this.fb.saveReturningKey("StandardCode/BookingSetup/"+this.BookingSetup.parentClubKey+"/"+this.selectedActivity+"/"+key +"/CodeList", eachCode);
          }
        })
        this.deletedCodeList.forEach(code => {
          let dbCode = this.commonservices.convertFbObjectToArray(this.BookingSetup['CodeList'])
          if(dbCode.filter(codes => codes.Key == code.Key).length > 0){
            console.log("oky")
            this.fb.deleteFromFb("StandardCode/BookingSetup/"+this.BookingSetup.parentClubKey+"/"+this.selectedActivity+"/"+key +"/CodeList/"+ code.Key)
          } 
        })
      }
      if( this.BookingSetup['Image'] == undefined && this.selectedActivity == '-MCMaUe_FtFh1RZuIqtG'){
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
      this.commonservices.toastMessage('Updated successful...', 2000)
      this.navCtrl.pop();
    }
  }
  cancelCourtSetup(){
    this.navCtrl.pop();
  }
}

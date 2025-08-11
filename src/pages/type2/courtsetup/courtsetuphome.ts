import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController, NavParams } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
// import { Dashboard } from './../../dashboard/dashboard';
import { ToastController } from 'ionic-angular';
import { IonicPage } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'courtsetuphome-page',
  templateUrl: 'courtsetuphome.html'
})

export class Type2CourtSetupHome {
  themeType: number;
  parentClubKey: string;
  menus: Array<{ DisplayTitle: string; 
    OriginalTitle:string;
    MobComponent: string;
    WebComponent: string; 
    MobIcon:string;
    MobLocalImage: string;
    MobCloudImage: string; 
    WebIcon:string;
    WebLocalImage: string;
    WebCloudImage:string;
    MobileAccess:boolean;
    WebAccess:boolean;
    Role: number;
    Type: number;
    Level: number }>;
  responseDetails: any;
  responseDetails1: any;
  selectedClub: any;
  allClub: any;
  allActivityArr = [];
  courtDetails = {
    CourtName: '',
    Surface: '',
    FloodLight: '',
    CourtType: 'Outdoor',
    Shared: '',
    Status: true,
    //PaymentOptionForFloodLight: '',
    Comments: '',
    IsActive: true,
    IsEnable: true,
    CreatedDate: '',
    UpdatedDate: '',
    ParentClubkey: '',
    ClubKey: '',
    ClubName: '',
    ActivityKey: '',
    ActivityName: '',
    FloodLightCostForMember: '',
    FloodLightCostForNonMember: '',
    FloodLightKey:'',
    Days: '',
    Capcity: '',
    SurfaceCode:0,
    Floor : '',
    BookedTime: '',
    BookingInFo: ''
  };


  surfaceList = [
    {name:'Artificial Grass', code:0},
    {name:'Clay', code:1},
    {name:'Grass', code:2},
    {name:'Hardcourt', code:3},
    {name:'Astroturf', code:4},
    {name:'Polymeric', code:5},
    {name:'SyntheticTurf', code:6},
    {name:'Carpet', code:7},
    {name:'Acrylic', code:9},
    {name:'Poraflex', code:10},
    {name:'Tarmac', code:11},
    {name:"Chosen Sport",code:12},
    {name:'Others', code:8},
  

  ]

  floorList = [
    {name:'Inside', code:0},
    {name:'Outside', code:1},
    {name:'Garden', code:2},
    {name:'Beer Garden', code:3},
    {name:'Basement', code:4},
    {name:'First Floor', code:5},
    {name:'Mezzanine Floor', code:6},
    {name:'Bar Area', code:7},
    {name:'Family Area', code:8},
  ]

  isActivityCategoryExist = false;
  isSelectMon = false;
  isSelectTue = false;
  isSelectWed = false;
  isSelectThu = false;
  isSelectFri = false;
  isSelectSat = false;
  isSelectSun = false;
  isExistActivitySubCategory: boolean;
  activitySubCategoryList = [];
  acType: any;
  days = [];
  showTime = false;
  selday = "";
  alldays=["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  startTime = ['06:00', '06:00', '06:00', '06:00', '06:00', '06:00', '06:00'];
  endTime = ['22:00', '22:00', '22:00', '22:00', '22:00', '22:00', '22:00'];
  isShowTime = [false, false, false, false, false, false, false];
  dayIndex: number = 0;
  selectedActivity: any;
  Isupdatecome: boolean = false;
  minValues = [];
  IsTable: boolean =false;
  url = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80' 
  flooddata: any[];
  constructor(public toastCtrl: ToastController, public loadingCtrl: LoadingController, storage: Storage,
    public navCtrl: NavController, public sharedservice: SharedServices,
    public fb: FirebaseService, public popoverCtrl: PopoverController, public navParams: NavParams) {
    let min = 0
    while(min < 60){
      this.minValues.push(min)
      min+= 5;
     
    }
    this.themeType = sharedservice.getThemeType();
    this.menus = sharedservice.getMenuList();
    this.courtDetails = this.navParams.get('Details');

    // if(this.courtDetails.SurfaceCode == undefined){
    //   this.courtDetails.SurfaceCode = this.surfaceList.filter(surf => surf.name == this.courtDetails.Surface)[0].code
    // }
   
    console.log(this.navParams.get('Details'));
    
    if (this.courtDetails != undefined) {
      if(this.courtDetails.Floor){
        let floor = this.floorList.filter(floor => this.courtDetails.Floor.toLowerCase() ==  floor.name.toLowerCase())
        if(floor.length < 0){
          this.floorList.push({name:this.courtDetails.Floor, code:this.floorList.length+1},)
        }
      }
      this.Isupdatecome = true; 
    let endTimeindex = 0;
      this.courtDetails['Days'].split(',').forEach(day =>{
        let index = this.alldays.indexOf(day)
        //let lengthofendTime = this.courtDetails['EndTime']
        this.endTime.splice(index, 1, this.courtDetails['EndTime'].split(',')[endTimeindex])
        this.startTime.splice(index, 1, this.courtDetails['StartTime'].split(',')[endTimeindex])
        endTimeindex++
      })
      // this.courtDetails['EndTime'].split(',').forEach(end => {
      //   this.endTime.push(end)
      // });
      // this.courtDetails['StartTime'].split(',').forEach(start => {
      //   this.startTime.push(start)  
      // });
      let dayList = this.courtDetails.Days.split(',')
      for(var i=0; i<dayList.length ; i++){
  
        this.selectDays(dayList[i], this.alldays.indexOf(dayList[i])) 
      }


      console.log(this.courtDetails)
    } else {
      
        this.courtDetails = {
          SurfaceCode:0,Floor : '',
          CourtName: '', Surface: 'Hardcourt', FloodLightKey:'', Capcity:'', FloodLight: 'No', CourtType: 'Outdoor', Shared: 'No', Status: true, Comments: '', IsActive: true, IsEnable: true, CreatedDate: '', UpdatedDate: '', ParentClubkey: '', ClubKey: '', ClubName: '', ActivityKey: '', ActivityName: '', FloodLightCostForMember: '', FloodLightCostForNonMember: '', Days: '', BookedTime: '', BookingInFo: ''
        };
      
      
    }
    

    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      for (let club of val.UserInfo)
        if (val.$key != "") {
          this.parentClubKey = club.ParentClubKey;
          this.getClubList();

        }
    })
  }



  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }


  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }

  onActChange(){
    if(this.selectedActivity == '-MCMaUe_FtFh1RZuIqtG'){
      this.IsTable = true
        this.courtDetails = {
          SurfaceCode:0,Floor : '',
          CourtName: '', Surface: 'Others',  Capcity:'', FloodLightKey:'', FloodLight: 'No', CourtType: 'Outdoor', Shared: 'No', Status: true, Comments: '', IsActive: true, IsEnable: true, CreatedDate: '', UpdatedDate: '', ParentClubkey: '', ClubKey: '', ClubName: '', ActivityKey: '', ActivityName: '', FloodLightCostForMember: '', FloodLightCostForNonMember: '', Days: '', BookedTime: '', BookingInFo: ''
        };
      
    }
  }

  getClubList() {

    this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
      //alert();
      if (data.length > 0) {
        this.allClub = data;
        let key = data[0].$key;
        if(this.Isupdatecome){
          this.selectedClub = this.courtDetails.ClubKey
        }else{
          this.selectedClub = key;
        }
   
        this.getAllActivity();
        //this.getAllMemberCategory();
      }
    })
  }


  showToast(m: string, howLongShow: number) {
    let toast = this.toastCtrl.create({
      message: m,
      duration: howLongShow,
      position: 'bottom'
    });
    toast.present();
  }




  onClubChange() {
    this.getAllActivity();
  }

  getAllActivity() {
    this.fb.getAll("/Activity/" + this.parentClubKey + "/" + this.selectedClub + "/").subscribe((data) => {
      this.allActivityArr = [];
      if (data.length > 0) {
        if(this.Isupdatecome){
          this.selectedActivity = this.courtDetails.ActivityKey;
         
        }else{
          this.selectedActivity = data[0].$key;
        }
        if(this.selectedActivity == '-MCMaUe_FtFh1RZuIqtG'){
          this.IsTable = true
        }
        this.allActivityArr = data;
        this.getFloodLight()
      }
    });
  }

  getFloodLight(){
    this.fb.getAllWithQuery("StandardCode/FloodLight/"+this.parentClubKey+"/"+this.selectedClub+"/"+this.selectedActivity,  { orderByChild: "IsActive", equalTo: true }).subscribe(data =>{
      this.flooddata = []
      if(data.length > 0){

        this.flooddata = data
      }
    })
  }


  saveCourtSetup() {
    this.courtDetails.Days = "";
    this.days.sort();
    for (let daysIndex = 0; daysIndex < this.days.length; daysIndex++) {

      switch (this.days[daysIndex]) {
        case 0:
          this.selectedDayDetails("Mon");
          break;
        case 1:
          this.selectedDayDetails("Tue");
          break;
        case 2:
          this.selectedDayDetails("Wed");
          break;
        case 3:
          this.selectedDayDetails("Thu");
          break;
        case 4:
          this.selectedDayDetails("Fri");
          break;
        case 5:
          this.selectedDayDetails("Sat");
          break;
        case 6:
          this.selectedDayDetails("Sun");
          break;
      }
    }
    let startDays = "";
    let endDays = "";
    for (let i = 0; i < this.startTime.length; i++) {
      if (this.isShowTime[i] == true) {
        startDays = startDays + this.startTime[i] + ",";
        endDays = endDays + this.endTime[i] + ",";
      }
    }
    this.courtDetails['SurfaceCode'] = this.surfaceList.filter(surf => surf.name == this.courtDetails.Surface)[0].code
    this.courtDetails["StartTime"] = startDays;
    this.courtDetails["EndTime"] = endDays;
    this.courtDetails.ParentClubkey = this.parentClubKey;
    this.courtDetails.CreatedDate = <string>new Date().getTime().toString();
    this.courtDetails.UpdatedDate = <string>new Date().getTime().toString();
    this.courtDetails.ActivityKey = this.selectedActivity;
    this.courtDetails.ClubKey = this.selectedClub;
    for (let i = 0; i < this.allActivityArr.length; i++) {
      if (this.allActivityArr[i].$key == this.courtDetails.ActivityKey) {
        this.courtDetails.ActivityName = this.allActivityArr[i].ActivityName;
      }
    }
    for (let i = 0; i < this.allClub.length; i++) {
      if (this.allClub[i].$key == this.courtDetails.ClubKey) {
        this.courtDetails.ClubName = this.allClub[i].ClubName;
      }
    }

    if (this.validate()) {
      if (this.courtDetails.Days.split(",").length > 0) {
        this.responseDetails = this.fb.saveReturningKey("/Court/" + this.parentClubKey + "/" + this.selectedClub + "/" + this.selectedActivity + "/", this.courtDetails);
        if (this.responseDetails != undefined) {
          let message = "Successfully saved";
          this.showToast(message, 2000);
          this.navCtrl.pop();
        }
      } else {
        this.showToast("Invalid Details", 3000);
      }
    } else {
      this.showToast("Invalid Details", 3000);
    }
    console.log(this.courtDetails);
  }

  cancelCourtSetup() {
    this.navCtrl.pop();
  }

  selectedDayDetails(day) {

    if (this.courtDetails.Days == "") {
      this.courtDetails.Days += day;
    }
    else {
      this.courtDetails.Days += "," + day;
    }
  }


  selectDays(day, index) {
    let isPresent = false;
    this.dayIndex = index;
    this.selday = day;
    if (this.isShowTime[index] == true) {
     // this.showTime = false;
      this.isShowTime[index] = false;

    } else if (this.isShowTime[index] == false) {
    //  this.showTime = true;
      this.isShowTime[index] = true;

    }
    if(  this.Isupdatecome ){
      switch (day) {
          case "Mon":
            this.isSelectMon = !this.isSelectMon;
            break;
          case "Tue":    
            this.isSelectTue = !this.isSelectTue;
            break;
          case "Wed":
            this.isSelectWed = !this.isSelectWed;
            break;
          case "Thu":
            this.isSelectThu = !this.isSelectThu;
            break;
          case "Fri":  
            this.isSelectFri = !this.isSelectFri;
            break;
          case "Sat":
            this.isSelectSat = !this.isSelectSat;
            break;
          case "Sun":
            this.isSelectSun = !this.isSelectSun;
            break;
        }

    }
  
    for (let i = 0; i < this.days.length; i++) {
      if (this.days[i] == index) {
        this.days.splice(i, 1);
        isPresent = true;
      }
    }
    if (!isPresent) {
      this.days.push(index);
    }

  }
  validate() {
    let x = false;
    if (this.courtDetails.ActivityKey == undefined || this.courtDetails.ActivityKey == "") {
      x = false;
    } else if (this.courtDetails.ActivityName == undefined || this.courtDetails.ActivityName == "") {
      x = false;
    } else if (this.courtDetails.Surface == undefined || this.courtDetails.Surface == "") {
      x = false;
    } else if (this.courtDetails.Shared == undefined || this.courtDetails.Shared == "") {
      x = false;
    } else if (this.courtDetails.CourtName == undefined || this.courtDetails.CourtName == "") {
      x = false;
    } else if (this.IsTable && (this.courtDetails.Capcity == undefined || this.courtDetails.Capcity == "") ) {
      x = false;
    } 
    else {
      x = true;
    }
    return x;
  }

  updateCourtSetup(){
    
    this.courtDetails.Days = "";
    this.days.sort(); 
    for (let daysIndex = 0; daysIndex < this.days.length; daysIndex++) {

      switch (this.days[daysIndex]) {
        case 0:
          this.selectedDayDetails("Mon");
          break;
        case 1:
          this.selectedDayDetails("Tue");
          break;
        case 2:
          this.selectedDayDetails("Wed");
          break;
        case 3:
          this.selectedDayDetails("Thu");
          break;
        case 4:
          this.selectedDayDetails("Fri");
          break;
        case 5:
          this.selectedDayDetails("Sat");
          break;
        case 6:
          this.selectedDayDetails("Sun");
          break;
      }
    }
    let startDays = "";
    let endDays = "";
    for (let i = 0; i < this.startTime.length; i++) {
      if (this.isShowTime[i] == true) {
        startDays = startDays + this.startTime[i] + ",";
        endDays = endDays + this.endTime[i] + ",";
      }
    }
    this.courtDetails['SurfaceCode'] = this.surfaceList.filter(surf => surf.name == this.courtDetails.Surface)[0].code
    this.courtDetails["StartTime"] = startDays;
    this.courtDetails["EndTime"] = endDays;
    this.courtDetails.ParentClubkey = this.parentClubKey;
    this.courtDetails.UpdatedDate = <string>new Date().getTime().toString();
    this.courtDetails.ActivityKey = this.selectedActivity;
    this.courtDetails.ClubKey = this.selectedClub;
    for (let i = 0; i < this.allActivityArr.length; i++) {
      if (this.allActivityArr[i].$key == this.courtDetails.ActivityKey) {
        this.courtDetails.ActivityName = this.allActivityArr[i].ActivityName;
      }
    }
    for (let i = 0; i < this.allClub.length; i++) {
      if (this.allClub[i].$key == this.courtDetails.ClubKey) {
        this.courtDetails.ClubName = this.allClub[i].ClubName;
      }
    }

    if (this.validate()) {
      if (this.courtDetails.Days.split(",").length > 0) {
        let key = this.courtDetails['$key']
        delete this.courtDetails['$key']
        console.log(this.courtDetails)
        this.responseDetails = this.fb.update(key,"/Court/" + this.parentClubKey + "/" + this.selectedClub + "/" + this.selectedActivity + "/", this.courtDetails);
        if (this.responseDetails != undefined) {
          let message = "Successfully updated";
          this.showToast(message, 2000);
          this.navCtrl.pop();
        }
      } else {
        this.showToast("Invalid Details", 3000);
      }
    } else {
      this.showToast("Invalid Details", 3000);
    }
   // console.log(this.courtDetails);
  }

}

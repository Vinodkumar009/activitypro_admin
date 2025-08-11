import { SharedServices } from './../../../services/sharedservice';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, AlertController, LoadingController} from 'ionic-angular';
import moment from 'moment';
import { Storage } from '@ionic/storage';
import * as $ from 'jquery';
import { HttpClient } from '@angular/common/http';
import { FirebaseService } from '../../../../services/firebase.service';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';

/**
 * Generated class for the FilterbookingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-filterbookings',
  templateUrl: 'filterbookings.html',
})
export class FilterbookingsPage {
  @ViewChild('slides') slides: Slides;
  showCurrentDate: string;
  numbers = [0,1,2];
  sevenDaysAvailability: any = [];
  currentmonth: string;
  showCalender = false;
  loading: any;
  nestUrl: any;
  selectedParentClubKey: any;
  selectedClubKey: any;
  clubs: any[];
  ActivityList: any[];
  selectedActivity: string;
  allCourtSlots: any;
  courts: any[];
  slotListing = [];
  Isgotosession: boolean = false;
  currencyDetails: any;
  constructor(public navCtrl: NavController, 
    public storage: Storage, public sharedService: SharedServices, public http: HttpClient, public fb: FirebaseService, public commonService: CommonService,  public loadingCtrl: LoadingController,  public navParams: NavParams) {
    
    this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      for (let user of val.UserInfo) {
        this.selectedParentClubKey = user.ParentClubKey;
        this.nestUrl = this.sharedService.getnestURL()
      
       
       
        this.getClubDetails() 
        //this.getSevenDaysAvailability(new Date())
        
        this.currentmonth = moment(new Date()).format("MMM YYYY")

        break;
      }
    }).catch(error => {

    });

    this.storage.get('Currency').then((val) => {
      this.currencyDetails = JSON.parse(val);
    }).catch(error => {
    });
  }

  ionViewDidLoad() {
   
  }

  getAllCourts() {
    this.fb.getAllWithQuery("Court/" + this.selectedParentClubKey + "/" + this.selectedClubKey + "/" + this.selectedActivity, { orderByChild: 'IsActive', equalTo: true }).subscribe((data) => {
      this.courts = [];
    
      if (data.length > 0) {
        this.courts = data;
        var d = moment().startOf('week').format("DD MMM YYYY")
        console.log(d)
        this.currentmonth = moment().format("MMM YYYY")
        let date = moment().format('YYYY-MM-DD')
        this.calculateweek(d, date)
      }else{
        this.slotListing = []
      }
     
    });
  }
    

  getClubDetails() {

    this.fb.getAllWithQuery("/Club/Type2/" + this.selectedParentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
      this.clubs = data;
      if (data.length != 0) {
        this.selectedClubKey = this.clubs[0].$key;
        this.getAllActivity();
        try {


          // this.getClubMmebers(this.selectedClubKey);
        }
        catch (ex) {

        } finally {
          //this.loading.dismiss().catch(() => { });
        }
      }
    });
  }
  getAllActivity() {
    this.fb.getAll("/Activity/" + this.selectedParentClubKey + "/" + this.selectedClubKey + "/").subscribe((data) => {
      this.ActivityList = [];
      this.selectedActivity = "";
      if (data.length > 0) {
        this.ActivityList = data;
        this.selectedActivity = this.ActivityList[0].$key;
        this. getAllCourts() 
      }
     
    });
  } 
    calculateweek(firstdayofweek, date){
      this.showCalender = false   
      this.sevenDaysAvailability = [];
      this.sevenDaysAvailability.push({
        day:moment(firstdayofweek).format('ddd'),
        month:moment(firstdayofweek).format('MMM'),
        date:moment(firstdayofweek).format('DD'),
        currentDate:moment(firstdayofweek).format('YYYY-MM-DD'),
        isSelect:false
      })
      for(let i=1; i<7; i++){
        let Temp_Date = moment(firstdayofweek).add('days', i).format('DD-MMM-YYYY');
        this.sevenDaysAvailability.push({
          day:moment(Temp_Date).format('ddd'),
          month:moment(Temp_Date).format('MMM'),
          date:moment(Temp_Date).format('DD'),
          currentDate:moment(Temp_Date).format('YYYY-MM-DD'),
          isSelect:false
        })
      }
      this.sevenDaysAvailability.forEach(day => {
        if(day.currentDate == date)
       
        this.changeday(day)
      });


      
    //  this.showCalender = false
    }


    
    onDaySelect(event){
      console.log(event)
      this.calculateweek( moment(event).startOf('week').format("DD MMM YYYY"), moment(event).format('YYYY-MM-DD'))
      this.currentmonth = moment(event).format("MMM YYYY")
    }
    
   async changeday(day){
      this.sevenDaysAvailability.forEach(dayofweek => {
        if(dayofweek.isSelect) {
          dayofweek.isSelect = false
        }
      });
      day.isSelect = true

      this.loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });
      this.loading.present();
      if( this.selectedActivity && this.selectedClubKey){
        this.allCourtSlots = []
        const history = await this.getNewSlots(day)
        this.loading.dismiss()
      }else{
        this.loading.dismiss()
        this.commonService.toastMessage('Please select club and activity',3000, ToastMessageType.Success, ToastPlacement.Bottom)
      }
      
    }


    async getBookingHistory(day){       
      return new Promise((res, rej)=>{
        try{
          let startDate =  new Date(new Date(day.currentDate).setHours(0, 0, 0, 0)).getTime();
          let lasttDate = new Date(new Date(day.currentDate).setHours(23, 59, 59)).getTime();
          
        

          let courtkey= "all";
          this.http.get(`${this.nestUrl}/courtbooking/bookingHistory?parentClubKey=${this.selectedParentClubKey}&courtkey=${courtkey}&activitykey=${this.selectedActivity}&clubKey=${this.selectedClubKey}&startDate=${startDate}&endDate=${lasttDate}`)
          .subscribe((data: any) => {
            
            //this.Discounts = discountObj.data;
            res('success')
            if(data.data){
              this.allCourtSlots = []
              this.courts.forEach(async(eachCourt:any)=>{
                let slot :any = data.data.allCourtSlots[eachCourt.$key]
                slot.forEach(eachSlot => {
                  eachSlot['MemberName']  = eachSlot['Member'].find(member => member.IsPrimaryMember)
                  if(!eachSlot['MemberName']){  
                    eachSlot['MemberName'] = eachSlot['Member'][0]
                  }
                  this.allCourtSlots.push(eachSlot)
                });
               
              })
          
              this.slotListing = this.allCourtSlots
  
            }
           
          }, (err) => {
            console.log(JSON.stringify(err));
            this.loading.dismiss()
            rej('fail')
          });
        }catch(err){
          this.loading.dismiss()
        }
        
      })
    }
    getTime(date) {
      return moment(date, 'DD MM YYYY').format('D-MMM');
    }

    async getNewSlots(day){
      return new Promise((res, rej)=>{
        try{       
      
      
          this.http.get(`${this.nestUrl}/courtbooking/activebookinginrangebycourt/${this.selectedParentClubKey}/${this.selectedClubKey}/${this.selectedActivity}/${day.currentDate}/${day.currentDate}/nil`)
          .subscribe((data: any) => {
            
            //this.Discounts = discountObj.data;
            res('success')
            this.allCourtSlots = data['data']
            this.allCourtSlots.forEach(slot => {
              slot.slot_start_time = moment(slot.slot_start_time, 'HH:mm:ss').format('HH:mm')
              slot.slot_end_time = moment(slot.slot_end_time, 'HH:mm:ss').format('HH:mm')
              slot.booking_transaction_time = moment.utc(slot.booking_transaction_time).local().format('DD-MMM-YYYY')
              slot.booking_date = moment.utc(slot.booking_date).local().format('DD MM YYYY')
            });
            this.slotListing = this.allCourtSlots
          }, (err) => {
            console.log(JSON.stringify(err));
            this.loading.dismiss()
            rej('fail')
          });
        }catch(err){
          this.loading.dismiss()
        }
        
      })
    }

   
      
    openSearch(){
      let searchrow = document.getElementById('row1');
      if(searchrow.style.display == "none"){
          $(".searchrow").css("display", "block");
         // $("#row1").css("display", "block");
          document.getElementById('fab').classList.add('searchbtn')
      }else{
         $(".searchrow").css("display", "none");
          document.getElementById('fab').classList.remove('searchbtn')
      }
  }

    getFilterItems(ev: any) {

      // Reset items back to all of the items
      this.initializeItems();

      // set val to the value of the searchbar
      let val = ev.target.value;

      // if the value is an empty string don't filter the items
      if (val && val.trim() != '') {
        this.slotListing = this.slotListing.filter((item) => {
          if (item.name != undefined ) {
            if (item.name.toLowerCase().indexOf(val.toLowerCase()) > -1)
              return true
          }
          if(this.getTime(item.booking_date) != undefined){
            if (this.getTime(item.booking_date).toLowerCase().indexOf(val.toLowerCase()) > -1)
              return true
          }
          if(item.slot_start_time != undefined){
            if (item.slot_start_time.toLowerCase().indexOf(val.toLowerCase()) > -1)
              return true
        }
          if(item.courtname != undefined){
            if (item.courtname.toLowerCase().indexOf(val.toLowerCase()) > -1)
              return true
          }
        
        })
      }

  }       
  initializeItems() {
    this.slotListing = this.allCourtSlots
  
  }
 
//   getSevenDaysAvailability(currentDate) {
//     let response=[];
//     response.push({ Available: true, Date: currentDate, Day: moment(currentDate).format("DD"),
//     currentMonth:moment(currentDate).format("MMM"),
//     currentDate:moment(currentDate).format("DD"), currentYear:moment(currentDate).format("YYYY"),
//     currentDay:moment().isoWeekday(moment(currentDate).day()).format("ddd") });
    
//     for(let i=1;i<7;i++){
//       let Temp_Date = moment(currentDate).add('days', i).format('DD-MMM-YYYY');
//       response.push({ Available: true, Date: Temp_Date, Day: moment(Temp_Date).format("DD"), currentMonth:moment(Temp_Date).format("MMM"),
//       currentDate:moment(Temp_Date).format("DD"), currentYear:moment(Temp_Date).format("YYYY"),
//       currentDay:moment().isoWeekday(moment(Temp_Date).day()).format("ddd")
//      });
//     }
//     this.sevenDaysAvailability =  response;
//     console.log(this.sevenDaysAvailability);
// }

// //Slidenext
// loadNext() {
// this.slides.lockSwipeToPrev(false); 
//  console.log(this.slides.getActiveIndex());
//  let newIndex = this.slides.getActiveIndex();

//  newIndex--;
//  this.numbers.push(this.numbers[this.numbers.length - 1] + 1);
//  this.numbers.shift();
//  // Workaround to make it work: breaks the animation
//  this.slides.slideTo(newIndex, 0, false);
//  this.showCurrentDate = moment(this.sevenDaysAvailability[6].Date).format('DD-MMM-YYYY');//this.showSelectedDate;
//  this.getSevenDaysAvailability(this.showCurrentDate);
//  console.log(`New status: ${this.numbers}`);
// }

// //Slideback
// loadPrev() {
//   console.log('Prev');
//   let newIndex = this.slides.getActiveIndex();
  
//   newIndex++;
//   this.numbers.unshift(this.numbers[0] - 1);
//   this.numbers.pop();
  
//   // Workaround to make it work: breaks the animation
//   this.slides.slideTo(newIndex, 0, false);

//   console.log(`New status: ${this.numbers}`);
//     this.showCurrentDate = moment(this.sevenDaysAvailability[0].Date).subtract(6,'days').format('DD-MMM-YYYY');//this.showSelectedDate;
    
//      this.getSevenDaysAvailability(this.showCurrentDate);
//      console.log(`New status: ${this.numbers}`);
//     //  if(moment(this.showSelectedDate).isSameOrBefore(moment(new Date()).format("DD-MMM-YYYY"))){
//     //   this.slides.lockSwipeToPrev(true);
//     //   console.log(moment(this.showSelectedDate).isSameOrAfter(this.showCurrentDate));
//     // }else{
//     //   this.slides.lockSwipeToPrev(false);
//     // }  
//   }

}

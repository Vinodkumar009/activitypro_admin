import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController, Navbar } from 'ionic-angular';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonService, ToastMessageType } from '../../../services/common.service';
import { Storage } from '@ionic/storage';
import { ActionSheetController } from 'ionic-angular'
import moment from 'moment';
import { validateLocaleAndSetLanguage } from 'typescript';
import { m } from '@angular/core/src/render3';
/**
 * Generated class for the BookingsetupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-floodlight',
  templateUrl: 'floodlight.html',
})
export class FloodLightPage {
  @ViewChild(Navbar) navBar: Navbar;
  CourtType = "Outdoor";
  floodlight = {
    Title: '',
    IsActive: true,
    IsEnable: true,
    CreationDate: 0,
    FirstSixtyMemberFloodLightFess: 12,
    FirstSixtyNonMemberFloodLightFess: 15,
    AfterSixtyMemberFloodLightFess: 8,
    AfterSixtyNonMemberFloodLightFess: 10,
    floodlightConfigurations: []
  }
  floodconfig = {
    IsActive: true,
    CreationDate: 0,
    StartDate: '',
    EndDate: '',
    MornStartTime: '',
    MornEndTime: '',
    EvenStartTime: '',
    EvenEndTime: '',
    have_to_save: false
  }
  floodLightList = []
  parentClubKey: any;

  selectedActivity: string;
  allClub: any[];
  selectedClubKey: any;
  allActivityArr: any[];
  currencyDetails: any;
  bookingDuration: any[];
  floodlightkey;
  minDate;
  isupdate = false;
  maxDate;
  originalfloodlight: any;
  is_any_unsaved:boolean = false;
  clubKey: any;
  activity: any;
  constructor(public actionSheetCtrl: ActionSheetController, public toastCtrl: ToastController, public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, public fb: FirebaseService, public commonService: CommonService, public storage: Storage) {
    this.storage.get('Currency').then((val) => {
      this.currencyDetails = JSON.parse(val);
      this.minDate = moment().startOf('year').format('YYYY-MM-DD');
      this.maxDate = moment().add(10, 'years').endOf('year').format('YYYY-MM-DD')
    }).catch(error => {
    });
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      for (let club of val.UserInfo)
        if (val.$key != "") {
          this.parentClubKey = club.ParentClubKey;
          
          
          this.clubKey = this.navParams.get('clubkey');
          this.activity = this.navParams.get('activity');

          this.floodconfig.StartDate = moment().format("YYYY-MM-DD");
          this.floodconfig.EndDate = moment().add(4, 'month').format("YYYY-MM-DD");
          this.floodconfig.MornStartTime = '05:00';
          this.floodconfig.MornEndTime = '08:30'
          this.floodconfig.EvenStartTime = '17:00'
          this.floodconfig.EvenEndTime = '22:00'
          let floodlight = this.navParams.get('floodLight');
        
          
          if (floodlight) {
            this.isupdate = true
            this.floodlight = JSON.parse(JSON.stringify(floodlight))
            if (!this.floodlight.floodlightConfigurations) {
              this.floodlight.floodlightConfigurations = []
              //this.floodlight.floodlightConfigurations.push(this.floodconfig)
            } else {
              let configs = this.commonService.convertFbObjectToArray(this.floodlight.floodlightConfigurations)
              this.floodlight.floodlightConfigurations = []
              configs.forEach(config => {
                if (config.IsActive) {
                  config['$key'] = config.Key
                  this.floodlight.floodlightConfigurations.push(config)
                }

              })
            }
          } else {
            this.floodlight.floodlightConfigurations = []
            // this.floodlight.floodlightConfigurations.push(this.floodconfig)
          }
          this.originalfloodlight = JSON.parse(JSON.stringify(this.floodlight))

          //this.floodLightList.push(this.floodlight)   
        
          this.getAllClub();
          
         
        }
    })


  }

  ionViewWillEnter() {

  }

  updateEndDate(date, flood, type) {
    flood.have_to_save = true
    if (this.isDateOverlapping(date, flood)) {
      this.commonService.toastMessage('Date should not fall in between other date range.', 3000, ToastMessageType.Info);
    }
    if (type == 'start') {
      flood.EndDate = moment(date).add(1, 'month').format("YYYY-MM-DD");
      this.updateEndDate(flood.EndDate, flood, '')
    }
  }

  isDateOverlapping(date, flood) {
    if(this.floodlight.floodlightConfigurations.length > 0){
      let floodsetuparray = this.floodlight.floodlightConfigurations.filter(arr => { return !Object.is(arr, flood) })
      return floodsetuparray.some(eachSetup => moment(eachSetup.StartDate, 'YYYY-MM-DD') <= moment(date, "YYYY-MM-DD") && moment(date, "YYYY-MM-DD") <= moment(eachSetup.EndDate, 'YYYY-MM-DD'))
    }else{
      return false
    }
  }


  getAllClub() {
    this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data4) => {
      this.allClub = []
      if (data4.length > 0) {
        this.allClub = data4;
        if(this.clubKey != undefined){
          this.selectedClubKey = this.clubKey
        }else{
          this.selectedClubKey = this.allClub[0].$key;

        }
       
        this.getAllActivity();
      }
    })
  }

  getAllActivity() {
    this.fb.getAll("/Activity/" + this.parentClubKey + "/" + this.selectedClubKey + "/").subscribe((data) => {
      this.allActivityArr = [];
      if (data.length > 0) {
        this.allActivityArr = data;
        if(this.activity != undefined){

          this.selectedActivity = this.activity
         
        }else{
          this.selectedActivity = data[0].$key;
        }
        
        this.getBookingSetup()

      }
    })
  }

  getBookingSetup() {
    this.fb.getAllWithQuery("StandardCode/BookingSetup/" + this.parentClubKey + "/" + this.selectedActivity, { orderByChild: 'ClubKey', equalTo: this.selectedClubKey }).subscribe((data) => {
      this.bookingDuration = data[0]['CourtDuration'];
    })
  }
  ionViewDidLoad() {
    this.navBar.backButtonClick = (e: UIEvent) => {
      console.log("todo something");
      this.checkIsFormFilled();
    }
  }

  async checkIsFormFilled() {
  
    for await (const flood of this.floodlight.floodlightConfigurations) {
      if(flood.have_to_save){
        this.is_any_unsaved = true
        break
      }  
    }
    if (JSON.stringify(this.floodlight) !== JSON.stringify(this.originalfloodlight) && this.is_any_unsaved){
      this.promptAlert();
    } else {
      this.navCtrl.pop();
    }
  }

  promptAlert() {
    let alert = this.alertCtrl.create({
      title: 'Discard Session',
      message: "Do you want to discard the changes ?",
      buttons: [
        {
          text: "Yes:Discard",
          handler: () => {
            this.navCtrl.pop();
          }
        },
        {
          text: 'Continue',
          role: 'cancel',
          handler: data => {

          }
        }
      ]
    });
    alert.present();
  }


  save(flood, index) {

    if (!this.isDateOverlapping(flood.StartDate, flood) && !this.isDateOverlapping(flood.EndDate, flood)) {
      let mgs = ''
      if (this.validate(flood) && !flood.$key) {
        mgs = 'Saved'
        flood.CreationDate = new Date().getTime();
        delete flood.have_to_save
        let key = this.fb.saveReturningKey("StandardCode/FloodLight/" + this.parentClubKey + "/" + this.selectedClubKey + "/" + this.selectedActivity + "/" + this.floodlight['$key'] + "/floodlightConfigurations", flood);

        this.commonService.toastMessage(`${mgs} successfully`, 2000, ToastMessageType.Success);
      }
      else if (this.validate(flood) && flood.$key) {
        mgs = 'Updated'
        let key = flood.$key
        delete flood.$key
        delete flood.Key
        delete flood.have_to_save
        this.fb.update(key, "StandardCode/FloodLight/" + this.parentClubKey + "/" + this.selectedClubKey + "/" + this.selectedActivity + "/" + this.floodlight['$key'] + "/floodlightConfigurations", flood);
        flood['$key'] = key
        this.commonService.toastMessage(`${mgs} successfully`, 2000, ToastMessageType.Success);
      }
    } else {
      this.commonService.toastMessage('Date should not fall in between other date range.', 3000, ToastMessageType.Info);
    }

  }


  validate(flood) {
    if (!flood.StartDate) {
      this.commonService.toastMessage('Start Date cannot be blank', 3000, ToastMessageType.Error);
      return false;
    } else if (!flood.EndDate) {
      this.commonService.toastMessage('End Date cannot be blank', 3000, ToastMessageType.Error);
      return false;
    } else if (!flood.MornStartTime) {
      this.commonService.toastMessage('Morning Start Time cannot be blank', 3000, ToastMessageType.Error);
      return false;
    } else if (!flood.EvenStartTime) {
      this.commonService.toastMessage('Evening Start Time cannot be blank', 3000, ToastMessageType.Error);
      return false;
    } else if (!flood.EvenEndTime) {
      this.commonService.toastMessage('Evening End Time cannot be blank', 3000, ToastMessageType.Error);
      return false;
    }
    return true;
  }

  validatefloodlight(flood) {
    if (!flood.Title) {
      this.commonService.toastMessage('Title cannot be blank', 3000, ToastMessageType.Error);
      return false;
    } else if (!flood.FirstSixtyMemberFloodLightFess) {
      this.commonService.toastMessage('End Date cannot be blank', 3000, ToastMessageType.Error);
      return false;
    } else if (!flood.FirstSixtyNonMemberFloodLightFess) {
      this.commonService.toastMessage('End Date cannot be blank', 3000, ToastMessageType.Error);
      return false;
    } else if (!flood.AfterSixtyMemberFloodLightFess) {
      this.commonService.toastMessage('End Date cannot be blank', 3000, ToastMessageType.Error);
      return false;
    } else if (!flood.AfterSixtyNonMemberFloodLightFess) {
      this.commonService.toastMessage('End Date cannot be blank', 3000, ToastMessageType.Error);
      return false;
    }
    return true;
  }

  convertTofloat(e) {
    this.is_any_unsaved = true
    return parseFloat(e).toFixed(2);
  }
  addFloodLightSetup() {
    if (this.floodlight['$key']) {
      let len = this.floodlight.floodlightConfigurations.length
      let stDate, EndDate
      stDate = moment().format("YYYY-MM-DD");
      EndDate = moment().add(4, 'month').format("YYYY-MM-DD");
      if (len > 0) {

        stDate = moment(this.floodlight.floodlightConfigurations[len - 1].EndDate).add(1, 'day').format("YYYY-MM-DD");
        EndDate = moment(stDate).add(1, 'month').format("YYYY-MM-DD");
      }
      
      this.floodlight.floodlightConfigurations.push({
        IsActive: true,
        CreationDate: 0,
        StartDate: stDate,
        EndDate: EndDate,
        MornStartTime: '05:00',
        MornEndTime: '08:30',
        EvenStartTime: '17:00',
        EvenEndTime: '22:00',
      })
    } else {
      this.commonService.toastMessage('First Create Floodlight Setup', 3000)
    }
  }

  //first save flood light e.g SETUP A
  saveFloodLight() {

    let mgs = ''
    if (this.validatefloodlight(this.floodlight) && !this.floodlight['$key']) {
      mgs = 'Saved'
      this.floodlight.CreationDate = new Date().getTime();
      this.floodlightkey = this.fb.saveReturningKey("StandardCode/FloodLight/" + this.parentClubKey + "/" + this.selectedClubKey + "/" + this.selectedActivity, this.floodlight);
      this.floodlight['$key'] = this.floodlightkey
      this.commonService.toastMessage(`${mgs} successfully`, 2000, ToastMessageType.Success);
    } else if (this.validatefloodlight(this.floodlight) && this.floodlight['$key']) {
      mgs = 'Updated'
      let key = this.floodlight['$key']
      delete this.floodlight['$key']
      let floodconfiguration = this.floodlight.floodlightConfigurations
      delete this.floodlight.floodlightConfigurations
      this.fb.update(key, "StandardCode/FloodLight/" + this.parentClubKey + "/" + this.selectedClubKey + "/" + this.selectedActivity, this.floodlight);
      this.floodlight['$key'] = key
      this.floodlight['floodlightConfigurations'] = floodconfiguration
      this.commonService.toastMessage(`${mgs} successfully`, 2000, ToastMessageType.Success);
    }

  }


  delete(flood, index) {
    this.commonService.commonAlter('Delete', 'Are you sure?', () => {
      if (flood.$key) {
        this.fb.update(flood.$key, "StandardCode/FloodLight/" + this.parentClubKey + "/" + this.selectedClubKey + "/" + this.selectedActivity + "/" + this.floodlight['$key'] + "/floodlightConfigurations", { IsActive: false });
      }
      this.floodlight.floodlightConfigurations.splice(index, 1);
      this.commonService.toastMessage('Deletion successful', 3000, ToastMessageType.Success);
    })
  }
}

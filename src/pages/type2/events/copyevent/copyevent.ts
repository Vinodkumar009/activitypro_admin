import { Component, ViewChild } from '@angular/core';
import { IonicPage, Platform, Content, NavController, NavParams, Navbar, AlertController, ModalController, ToastController, LoadingController, ActionSheetController, Slides } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { CommonService, ToastPlacement, ToastMessageType } from "../../../../services/common.service";
import { SharedServices } from '../../../services/sharedservice';
import { FirebaseService } from '../../../../services/firebase.service';
import { ImageFormat, UploadImage } from '../../../Model/ImageSection';
import { Camera, PictureSourceType, CameraOptions } from '@ionic-native/camera';
import { File, FileEntry } from '@ionic-native/file';
import { Chooser } from '@ionic-native/chooser';
import { FileOpener } from '@ionic-native/file-opener';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import * as moment from 'moment';

/**
 * Generated class for the CopyeventPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-copyevent',
  templateUrl: 'copyevent.html',
})
export class CopyeventPage {
  @ViewChild(Navbar) navBar: Navbar;
  isBeginSlide: boolean = true;
  isEndSlide: boolean = false;
  format: any = new ImageFormat();
  PaymentActivities: Array<any> = [];
  nestUrl: string = "";
  clubs = [];
  selectedLocation: any;
  locations = [];
  selectedClub: any;

  loading: any;
  ParentClubKey: any;
  TitleUrl: any;
  Venues: Array<any> = [];

  EventTypes: Array<any> = [];
  TicketTypes: Array<any> = [];
  lunchOrdinnertype: Array<any> = [
    { type: "Free", value: "free" },
    { type: "Paid", value: "paid" }
  ]
  snackstype: Array<any> = [
    { type: "Free", value: "free" },
    { type: "Paid", value: "paid" }
  ]
  clubLocation: any[];
  cooldrinktype: Array<any> = [
    { type: "Free", value: "free" },
    { type: "Paid", value: "paid" }
  ]
  parkingtype: Array<any> = [
    { type: "Free", value: "free" },
    { type: "Paid", value: "paid" }
  ]
  Sponsors: Array<any> = [];
  min: any;
  max: any;
  eventDets: any;
  parentClubKey: string = "";
  Policies = {
    PolicyTitle: "",
    Description:"",
    PolicyDocs: []
  };
  eventObj = {
    ParentClubKey: "", UserKey: "", UserName: "", EventName: "", EventType: "", EventStartDate: "", EventEndDate: "", StartTime: "16:00", EndTime: '20:00', LocationKey: "", Location: "", EventSummary: "",
    TitleImageUrl: "", VenueKey: "", VenueName: "", ResponsibleVenue: "'", TicketLabel:"", SpeakerOrTrainer: true, SpeakerName: "", EventDesc: "", SpeakerOrTrainerImgUrl: "",
    BookingUntil: "", Capacity: 200, MinimumBooking:1, CapacityLeft: 0, Paid: false, Amount: null, LunchOrDinner: false, LunchOrDinnerType: "free", LunchOrDinnerAmt: 0, Snacks: false,
    SnacksType: "free", SnacksAmt: 0, SoftDrink: false, SoftDrinkType: "free", SoftDrinkAmt: 0, ParkingAvailable: false, ParkingType: "free", ParkingAmt: 0,
    ContactName: "", ContactNo: undefined, Email: "", EventTag: "", OtherInfo: "", RefundPolicy: "",BookingInstruction:"", IsWebsiteAvail: false, Website: "", Facebook: "", IsFacebookAvail: false,
    IsInstagramAvail: false, Instagram: "", IsTwitterAvail: false, Twitter: "", DiscountName: "", CurrencySymbol: "",
    DiscountAvail: false, DiscountAmt: 0, DiscountPercentage: 0, DiscountValidUntil: "", IsCouponCodeAvail: false, CouponName: "Corporate", CouponCode: "", CouponCodePercen: 0, CouponCodeVal: 0, CouponTimesAllowed: 20,
    CouponValidUntil: "", AllowCouponDiscount: false, PaymentKey: "", PaymentActivityKey: "", PaymentName: "", PaymentGateway: "",
    Member: "", IsActive: true, IsEnable: true,IsTitleEvent:false, IsPublish: false, CreatedDate: new Date().getTime(), UpdatedDate: new Date().getTime()
  }
  //this.eventObj.IsPublish = this.eventDets.IsPublish; this.eventObj.IsTitleEvent = this.eventDets.IsTitleEvent;
  @ViewChild(Content) content: Content;
  @ViewChild(Slides) slides: Slides;

  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController, public modalCtrl: ModalController, public toastCtrl: ToastController, public commonService: CommonService, public fb: FirebaseService, public storage: Storage, public sharedService: SharedServices, public actionSheetCtrl: ActionSheetController, private camera: Camera, public loadingCtrl: LoadingController,
    private platform: Platform, private fileTransfer: FileTransfer, private fileOpener: FileOpener, private file: File, private chooser: Chooser, public http: HttpClient, ) {
    this.eventDets = this.navParams.get("eventDets");
    console.log(this.eventDets);
    this.nestUrl = this.sharedService.getnestURL();
    this.min = new Date().toISOString();
    this.max = "2049-12-31";

      this.eventObj.ParentClubKey = this.eventDets.ParentClubKey,
      this.eventObj.UserKey = this.eventDets.UserKey,
      this.eventObj.UserName = this.eventDets.UserName,
      this.eventObj.EventName = this.eventDets.EventName,
      this.eventObj.EventType = this.eventDets.EventType,
      this.eventObj.EventStartDate = this.eventDets.EventStartDate,
      this.eventObj.EventEndDate = this.eventDets.EventEndDate,
      this.eventObj.StartTime = moment(this.eventDets.StartTime, 'hh:mm A').format('HH:mm'),
      this.eventObj.EndTime = moment(this.eventDets.EndTime, 'hh:mm A').format('HH:mm'),
      this.eventObj.LocationKey = this.eventDets.LocationKey,
      this.eventObj.Location = this.eventDets.Location,
      this.eventObj.EventSummary = this.eventDets.EventSummary,
      this.eventObj.TitleImageUrl = this.eventDets.TitleImageUrl,
      this.eventObj.VenueKey = this.eventDets.VenueKey,
      this.eventObj.VenueName = this.eventDets.VenueName,
      this.eventObj.ResponsibleVenue = this.eventDets.ResponsibleVenue,
      this.eventObj.SpeakerOrTrainer = this.eventDets.SpeakerOrTrainer,
      this.eventObj.SpeakerName = this.eventDets.SpeakerName,
      this.eventObj.EventDesc = this.eventDets.EventDesc,
      this.eventObj.TicketLabel = this.eventDets.TicketLabel || "Book",
      this.eventObj.BookingInstruction = this.eventDets.BookingInstruction || "",
      this.eventObj.SpeakerOrTrainerImgUrl = this.eventDets.SpeakerOrTrainerImgUrl,
      this.eventObj.BookingUntil = this.eventDets.BookingUntil,
      this.eventObj.Capacity = this.eventDets.Capacity,
      this.eventObj.MinimumBooking = this.eventDets.MinimumBooking,
      //this.eventObj.CapacityLeft = this.eventDets.CapacityLeft,
      this.eventObj.Paid = this.eventDets.Paid,
      this.eventObj.Amount = this.eventDets.Amount ? this.eventDets.Amount : 0,
      this.eventObj.LunchOrDinner = this.eventDets.LunchOrDinner,
      this.eventObj.LunchOrDinnerType = this.eventDets.LunchOrDinnerType,
      this.eventObj.LunchOrDinnerAmt = this.eventDets.LunchOrDinnerAmt,
      this.eventObj.Snacks = this.eventDets.Snacks,
      this.eventObj.SnacksType = this.eventDets.SnacksType,
      this.eventObj.SnacksAmt = this.eventDets.SnacksAmt,
      this.eventObj.SoftDrink = this.eventDets.SoftDrink,
      this.eventObj.SoftDrinkType = this.eventDets.SoftDrinkType,
      this.eventObj.SoftDrinkAmt = this.eventDets.SoftDrinkAmt,
      this.eventObj.ParkingAvailable = this.eventDets.ParkingAvailable;
      this.eventObj.ContactName = this.eventDets.ContactName, 
      this.eventObj.ContactNo = this.eventDets.ContactNo ? this.eventDets.ContactNo : 0,
      this.eventObj.Email = this.eventDets.Email, this.eventObj.EventTag = this.eventDets.EventTag,
      this.eventObj.OtherInfo = this.eventDets.OtherInfo, this.eventObj.RefundPolicy = this.eventDets.RefundPolicy, this.eventObj.IsWebsiteAvail = this.eventDets.IsWebsiteAvail,
      this.eventObj.Website = this.eventDets.Website, this.eventObj.IsFacebookAvail = this.eventDets.IsFacebookAvail, this.eventObj.Facebook = this.eventDets.Facebook,
      this.eventObj.IsInstagramAvail = this.eventDets.IsInstagramAvail, this.eventObj.Instagram = this.eventDets.Instagram, this.eventObj.IsTwitterAvail = this.eventDets.IsTwitterAvail, this.eventObj.Twitter = this.eventDets.Twitter,
      this.eventObj.DiscountName = this.eventDets.DiscountName, this.eventObj.CurrencySymbol = this.eventDets.CurrencySymbol,
      this.eventObj.ParkingType = this.eventDets.ParkingType, this.eventObj.ParkingAmt = this.eventDets.ParkingAmt,
      this.eventObj.DiscountAvail = this.eventDets.DiscountAvail, this.eventObj.DiscountAmt = this.eventDets.DiscountAmt,
      this.eventObj.DiscountPercentage = this.eventDets.DiscountPercentage, this.eventObj.DiscountValidUntil = this.eventDets.DiscountValidUntil,
      this.eventObj.IsCouponCodeAvail = this.eventDets.IsCouponCodeAvail, this.eventObj.CouponName = this.eventDets.CouponName,
      this.eventObj.CouponCode = this.eventDets.CouponCode, this.eventObj.CouponCodePercen = this.eventDets.CouponCodePercen, this.eventObj.CouponCodeVal = this.eventDets.CouponCodeVal,
      this.eventObj.CouponTimesAllowed = this.eventDets.CouponTimesAllowed,
      this.eventObj.PaymentKey = this.eventDets.PaymentKey;
      this.eventObj.PaymentActivityKey = this.eventDets.PaymentActivityKey;
      this.eventObj.PaymentName = this.eventDets.PaymentName;
      this.eventObj.PaymentGateway = this.eventDets.PaymentGateway;
    
    this.eventObj.CouponValidUntil = this.eventDets.CouponValidUntil, this.eventObj.AllowCouponDiscount = this.eventDets.AllowCouponDiscount;
    this.Sponsors = this.eventDets.Sponsor;
    console.log(this.Sponsors);

    for(let key in this.eventDets.Policy){
      this.Policies.PolicyTitle = this.eventDets.Policy[key]["PolicyTitle"];
      this.Policies.Description = this.eventDets.Policy[key]["Description"];
      for(let doc in this.eventDets.Policy[key]){
        if(this.eventDets.Policy[key][doc]!='' && this.eventDets.Policy[key][doc]!=undefined){
          this.Policies.PolicyDocs.push(this.eventDets.Policy[key][doc]);
        }
      }
    }

    // Member: "", IsActive: true, IsEnable: true, IsTitleEvent: false, IsPublish: false, CreatedDate: new Date().getTime(), UpdatedDate: new Date().getTime()
    if (this.eventObj.Paid) {
      this.eventObj.Paid = false;
      this.CheckIsPaid("fromEdit");
    }else {
      this.eventObj.PaymentKey = "";
      this.eventObj.PaymentActivityKey = "";
      this.eventObj.PaymentName = "";
      this.eventObj.PaymentGateway = "";
    }

    storage.get('Currency').then((currency) => {
      let currencydets = JSON.parse(currency);
      console.log(currencydets);
      this.eventObj.CurrencySymbol = currencydets.CurrencySymbol;
      console.log(this.eventObj.CurrencySymbol);
    });
    // 
    this.getClubList();
    this.getEventTypes();
    this.getCategaries();
    this.getParentclubInfo();
  }

  validateAmount(ev:any){
    return this.commonService.validateNumber(ev.target.value);
  }
  
  ChangeCatLabel(i: number, j: number) {
    console.log(this.TicketTypes[i].categories[j].Category);
    let alert = this.alertCtrl.create({
      title: 'Category Name',
      inputs: [
        {
          name: 'labelname',
          placeholder: 'Ticket Category Name'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Change',
          handler: data => {
            if ((data.labelname != "")) {
              this.TicketTypes[i].categories[j].Category = data.labelname;
            } else {
              this.showToast("Please enter category name", 2500);
              return false;
            }
          }
        }
      ]
    });
    alert.present()
  }

  //Change TicketType LabelName
  ChangeTktLabel(ev: any, i: number) {
    if (ev.target.id === "tkttype_edit") {
      let alert = this.alertCtrl.create({
        title: 'Ticket Name',
        inputs: [
          {
            name: 'labelname',
            placeholder: 'Ticket Title Name'
          },
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: data => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Change',
            handler: data => {
              if ((data.labelname != "")) {
                this.TicketTypes[i].TicketType = data.labelname;
              } else {
                this.showToast("Please enter ticket name", 2500);
                return false;
              }
            }
          }
        ]
      });
      alert.present()
    }
  }

  ionViewWillEnter() {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EventsPage');
    this.slides.lockSwipes(true);
    //Handling backbuton manually
    // this.navBar.backButtonClick = (e: UIEvent) => {
    //   console.log("todo something");
    //   this.checkIsFormFilled(); 
    // }
  }

  checkIsFormFilled() {
    if (this.eventObj.EventName != "" || this.eventObj.Location != "") {
      this.promptAlert();
    } else {
      this.navCtrl.pop();
    }
  }

  promptAlert() {
    let alert = this.alertCtrl.create({
      title: 'Discard Event',
      message: "Do you want to discard the changes and close?",
      buttons: [
        {
          text: "Yes-Discard",
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

  fileUri = "";
    async ChoosePolicies() {
      this.chooser.getFile('application/pdf,image/jpeg')
        .then(async (file) => {
          console.log(file);
          let type = file.name;
          let fileExtType = type.split('.').pop();
          const MimeType = file.mediaType;
          this.commonService.showLoader();
          this.fileUri = file.dataURI;
          this.file.resolveLocalFilesystemUrl(file.uri).then((newUrl) => {
            
            let imgObj = {};
            imgObj["url"] = file.dataURI;
            imgObj["upload_type"] = "eventpolicy";
            // imgObj["coach_name"] = item.FirstName;
            imgObj["club_name"] = this.eventObj.ParentClubKey;
            this.fb.uploadPhoto(imgObj).then((firebaseUrl) => {
              this.commonService.toastMessage("file uploaded", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
              this.Policies.PolicyDocs.push({
                FileName: file.name,
                MimeType: MimeType,
                FileType: fileExtType.toLowerCase(),
                CreatedAt: new Date().getTime(),
                UpdatedAt: new Date().getTime(),
                DownloadUrl: firebaseUrl,
              });
              this.commonService.hideLoader();
              // this.updateProgImg(text, url);
            }).catch((err) => {
              this.commonService.hideLoader();
              this.commonService.toastMessage(err.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
            })
  
          }).catch((err) => {
            this.commonService.hideLoader();
            this.commonService.toastMessage(err.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          })
  
        }).catch((error: any) => console.error(error));
  
    }
  
    getMimeType(fileExt) {
      if (fileExt == 'pdf') return { type: 'application/pdf' };
      else if (fileExt == 'jpg') return { type: 'image/jpg' };
      else if (fileExt == 'jpeg') return { type: 'image/jpeg' };
    }
  
    
    async PolicyDocActions(index: number) {
      const actionSheet = await this.actionSheetCtrl.create({
        //header: 'Choose File',
        buttons: [
          {
            text: 'View',
            icon: 'ios-eye',
            handler: () => {
              let path = null;
              const transfer = this.fileTransfer.create();
              if(this.platform.is('ios')){
                path = this.file.documentsDirectory;
              }else{
                path = this.file.dataDirectory;
              }

              transfer.download(this.Policies.PolicyDocs[index].DownloadUrl,`${path}${new Date().getTime()}.pdf`).then((entry)=>{
                let url = entry.toURL();
          
                this.fileOpener.open(url, this.Policies.PolicyDocs[index].MimeType)
                .then(() => this.commonService.toastMessage("File Opened", 2500, ToastMessageType.Success, ToastPlacement.Bottom))
                .catch(e => this.commonService.toastMessage("File Opened Failed", 2500, ToastMessageType.Success, ToastPlacement.Bottom));
              })
            
            }
          },
          {
            text: 'Delete',
            icon: 'ios-trash',
            handler: () => {
              this.commonService.showLoader();
              let imgObj = {};
              imgObj["url"] = this.Policies.PolicyDocs[index].DownloadUrl;
              imgObj["upload_type"] = "eventpolicy";
              // imgObj["coach_name"] = item.FirstName;
              imgObj["club_name"] = this.eventObj.ParentClubKey;
              this.fb.DeleteFileByRefUrl(imgObj).then((res) => {
                this.commonService.hideLoader();
                this.commonService.toastMessage("File removed", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
                this.Policies.PolicyDocs.splice(index,1);
              }).catch((error)=>{
                this.commonService.hideLoader();
                this.commonService.toastMessage(error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
              })
            }
          }, {
            text: 'Cancel',
            icon: 'close',
            role: 'cancel',
            handler: () => {
              //console.log('Cancel clicked');
            }
          }
        ]
      });
      await actionSheet.present();
    }
  
  

  ActiveSlideIndex: number;
  slideChanged() {
    setTimeout(() => {
      this.content.scrollToTop(200);
    });
    this.isBeginSlide = this.slides.isBeginning();
    this.isEndSlide = this.slides.isEnd();
    this.ActiveSlideIndex = this.slides.getActiveIndex();
  }
  onChangeEventType() {
    //this.eventObj.EventType = 
  }
  CheckCouponCode() {
    if (!this.eventObj.IsCouponCodeAvail) {
      this.eventObj.CouponCode = this.randomString(8, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    }
  }

  //payment activity details
  CheckIsPaid(text?: any) {
    console.log(this.eventObj.Paid);//,
    if (!this.eventObj.Paid) {
      if (text == "fromEdit") {
        this.eventObj.Paid = true;
      }

      this.fb.getAllWithQuery(`Activity/${this.eventObj.ParentClubKey}/${this.eventObj.VenueKey}`, { orderByChild: "IsActive", equalTo: true }).subscribe((res) => {
        this.PaymentActivities = [];
        // console.log(res);

        res.filter((payment: any, index: number) => {
          payment.PaymentSetup = this.commonService.convertFbObjectToArray(payment.PaymentSetup);
          payment.PaymentSetup.filter((activity: any) => {
            //console.log(activity);
            if (activity.IsActive && activity.PaymentGatewayName == "StripeConnect" && activity.SetupType == "Events") {
              activity["activitykey"] = res[index].$key;
              activity["IsSelected"] = false;
              this.PaymentActivities.push(activity);
            }
          })
        });
        this.PaymentActivities.forEach((activity: any) => {
          if (this.eventObj.PaymentKey == activity.Key) {
            activity["IsSelected"] = true;
          }
        });
        console.log(this.PaymentActivities);
      }, (err) => {
        console.log(err);
      })
    } 
  }

  //Getting a random string
  randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
  }

  //Adding Sponsors
  AddSponsor() {
    this.Sponsors.push({ SponsorName: "", SponsorImageUrl: "" });
  }
  removeSponsor(index: number) {
    this.Sponsors.splice(index, 1);
  }

  CheckCategoryCapcity(ticketInd,catInd){
    if(this.eventObj.Capacity <= 0 || this.eventObj.Capacity == null){
      this.commonService.toastMessage("Please enter capacity",2500,ToastMessageType.Error,ToastPlacement.Bottom);
    }else{
      let usedCacity:number = 0;

      for(const tickeType of this.TicketTypes){
        for(const category of tickeType.categories){
          if(category.Capacity!=null && category.Capacity!=undefined){
            usedCacity += parseInt(category.Capacity);
          }
        }
      }
    
      if(Number(usedCacity) > Number(this.eventObj.Capacity)){
        this.TicketTypes[ticketInd].categories[catInd].Capacity = "";
        this.TicketTypes[ticketInd].categories[catInd].Capacity = 0;
        this.commonService.toastMessage("Capacity exceeded",2500,ToastMessageType.Error,ToastPlacement.Bottom);
        return false;
      }
      
    }
  }



  //------------------- get data for clubs ,school , location and activity ------------------------------------
  getClubList() {
    this.clubLocation = []
    this.fb.getAllWithQuery("/Club/Type2/" + this.eventObj.ParentClubKey, { orderByChild: "IsActive", equalTo: true }).subscribe((data) => {
      this.clubLocation = data;
      this.Venues = data;

      console.log(this.Venues);
      data.forEach(element => {
        this.clubs.push({
          "ClubName": element.ClubName,
          "ClubKey": element.$key
        })
      });
      // if (data.length != 0) {
      //   this.selectedClub = this.clubs[0].ClubKey;
      // }
      console.log("club", this.clubs)
    });
    this.getSchools();
  }
  getSchools() {
    this.fb.getAllWithQuery("/School/Type2/" + this.eventObj.ParentClubKey, { orderByChild: "IsActive", equalTo: true }).subscribe((data) => {
      this.locations = [];
      let schools = data;
      for (let i = 0; i < schools.length; i++) {
        this.locations.push({
          LocationType: "School",
          LocationName: schools[i].SchoolName,
          LocationKey: schools[i].$key,
          City: schools[i].City,
          PostCode: schools[i].PostCode,
          Address: schools[i].FirstLineAddress,
          Url: schools[i].MapUrl,
        });

      }
      for (let j = 0; j < this.clubLocation.length; j++) {
        this.locations.push({
          LocationType: "Club",
          LocationName: this.clubLocation[j].ClubName,
          LocationKey: this.clubLocation[j].$key,
          City: this.clubLocation[j].City,
          PostCode: this.clubLocation[j].PostCode,
          Address: this.clubLocation[j].FirstLineAddress,
          Url: this.clubLocation[j].MapURL,
          MapLatitude: this.clubLocation[j].MapLatitude,
          MapLongitude: this.clubLocation[j].MapLongitude,
        });
      }

    });
    this.getLocations();
  }
  getLocations() {
    this.fb.getAllWithQuery("/Location/" + this.eventObj.ParentClubKey, { orderByChild: "IsActive", equalTo: true }).subscribe((data) => {
      // this.locations = this.comonService.convertFbObjectToArray(data)
      data.forEach(locationData => {

        this.locations.push({
          LocationType: "Locations",
          LocationName: locationData.Name,
          LocationKey: locationData.$key,
          City: locationData.City,
          PostCode: locationData.PostCode,
          Address: locationData.Address1,
          Url: locationData.MapURL,
          MapLatitude: locationData.MapLatitude,
          MapLongitude: locationData.MapLongitude,
        });
      });

      if (this.locations.length != 0) {
        this.selectedLocation = this.locations[0].$key;
      }
      // console.log(this.locations)
    });
  }

  //on change of venues(oraganizers))
  onChangeVenue() {
    let index = this.Venues.findIndex(venue => venue.$key === this.eventObj.VenueKey);
    this.eventObj.VenueName = this.Venues[index].ClubName;
    console.log(`${this.eventObj.VenueKey}:${this.eventObj.VenueName}`);
    console.log(this.eventObj.Paid);
    if (this.eventObj.Paid) {
      this.eventObj.Paid = false;
      this.eventObj.PaymentKey = "";
      this.eventObj.PaymentActivityKey = "";
      this.eventObj.PaymentName = "";
      this.eventObj.PaymentGateway = "";
      this.CheckIsPaid("fromEdit");
    }
  }
  //Getting EventTypes
  getEventTypes() {
    this.fb.getAllWithQuery("/EventUtilities/EventTypes", { orderByChild: "IsActive", equalTo: true }).subscribe((res) => {
      this.EventTypes = res;
      //this.eventObj.EventType = this.EventTypes[0].$key;
      console.log(this.EventTypes);
    }, (err) => {
      console.log('err', +err);
    });
  }

  TicketCtgs: Array<any> = [];
  getCategaries() {
    this.fb.getAll("/EventUtilities/TicketCategaries").subscribe((res) => {
      this.TicketCtgs = res;
      console.log(this.TicketCtgs);
      this.TicketCtgs.forEach((catg) => {
        catg.Cost = null;
        catg.Fee = null;
      })
      console.log(this.TicketCtgs);
      this.getTicketTypes();
    }, (err) => {
      console.log(err);
    })
  }

  //Getting TicketTypes
  getTicketTypes() {
    this.fb.getAllWithQuery("/EventUtilities/TicketType", { orderByChild: "IsActive", equalTo: true }).subscribe((res) => {
      this.TicketTypes = res;
      if (this.TicketTypes.length > 0) {
        this.TicketTypes.forEach((ticket: any) => {
          ticket["categories"] = JSON.parse(JSON.stringify(this.TicketCtgs));
          ticket["IsSelected"] = false;
          ticket["IsAvailable"] = false;
          this.eventDets.TicketType.forEach((edit_tkt) => {
            if (ticket.$key == edit_tkt.TicketKey) {
              ticket.TicketType = edit_tkt.TicketType;
              ticket["IsSelected"] = true;
              ticket["IsAvailable"] = true;
              ticket["categories"].forEach((catg: any) => {
                edit_tkt.Categories.forEach((editCatg) => {
                  if (catg.$key == editCatg.CategoryKey) {
                    catg["Category"] = editCatg.Category,
                      catg["Cost"] = editCatg.Cost,
                      catg["Fee"] = editCatg.Fee,
                      catg["Capacity"] = editCatg.Capacity
                  }
                })
              })
            }
          });
        });
        console.log(this.TicketTypes);
      }
    }, (err) => {
      console.log('err', +err);
    });

  }

  //getting parentclub info
  getParentclubInfo() {
    this.fb.getAllWithQuery(`ParentClub/Type2/`, { orderByKey: true, equalTo: this.eventObj.ParentClubKey }).subscribe((data) => {
      console.log(data);
      if (data.length > 0) {
        if (data[0].Website != undefined && data[0].Website != "") {
          this.eventObj.IsWebsiteAvail = true;
          this.eventObj.Website = data[0].Website;
        }
        if (data[0].Facebook != undefined && data[0].Facebook != "") {
          this.eventObj.IsFacebookAvail = true;
          this.eventObj.Facebook = data[0].Facebook;
        }
        if (data[0].Instagram != undefined && data[0].Instagram != "") {
          this.eventObj.IsInstagramAvail = true;
          this.eventObj.Instagram = data[0].Instagram;
        }
        if (data[0].Twitter != undefined && data[0].Twitter != "") {
          this.eventObj.IsTwitterAvail = true;
          this.eventObj.Twitter = data[0].Twitter;
        }
      }
    }, (err) => {

    })
  }

  //AddOn details expanding card
  ExpandCard(ev: any, item): void {
    //item.IsAvailable = !item.IsAvailable;
    if (ev.target.id === "card_head") {
      if (item.IsSelected) {
        item.IsSelected = false;
      } else {
        this.TicketTypes.map(listItem => {
          if (item == listItem) {
            listItem.IsSelected = !listItem.IsSelected;
            if (listItem.IsSelected) {
              listItem.IsAvailable = true;
            }
          } else {
            listItem.IsSelected = false;
          }
          return listItem;
        });
      }
    }
  }

  checkPaymentActivity(item): void {
    this.eventObj.PaymentKey = "";
    this.eventObj.PaymentActivityKey = "";
    this.eventObj.PaymentName = "";
    this.eventObj.PaymentGateway = "";
    if (item.IsSelected) {
      item.IsSelected = false;
    } else {
      this.PaymentActivities.map(listItem => {
        if (item == listItem) {
          listItem.IsSelected = !listItem.IsSelected;
          if (listItem.IsSelected) {
            this.eventObj.PaymentKey = item.Key;
            this.eventObj.PaymentActivityKey = item.activitykey;
            this.eventObj.PaymentName = item.Name;
            this.eventObj.PaymentGateway = item.PaymentGatewayName;
          }
        } else {
          listItem.IsSelected = false;
        }
        return listItem;
      });
    }
    console.log(this.eventObj.PaymentKey);
  }

  sponsorIndex: any;
  async SelectProfImg(text: string, index?: number) {
    this.sponsorIndex = index;
    const actionSheet = await this.actionSheetCtrl.create({
      //header: 'Choose File',
      buttons: [{
        text: 'Camera',
        role: 'destructive',
        icon: 'ios-camera',
        handler: () => {
          console.log('clicked');
          this.CaptureImage(this.camera.PictureSourceType.CAMERA, text);
        }
      }, {
        text: 'Gallery',
        icon: 'ios-image',
        handler: () => {
          console.log('Share clicked');
          this.CaptureImage(this.camera.PictureSourceType.PHOTOLIBRARY, text);
        }
      }, {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }
      ]
    });
    await actionSheet.present();
  }
  async CaptureImage(sourceType: PictureSourceType, text: any) {
    const options: CameraOptions = {
      quality: 70,
      sourceType: sourceType,
      targetWidth: 900,
      targetHeight: 600,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }
    try {
      this.camera.getPicture(options).then((data) => {
        this.loading = this.loadingCtrl.create({
          content: 'Image uploading...'
        });
        this.loading.present();
        let url = "data:image/jpeg;base64," + data;
        let imgObj = {};
        imgObj["url"] = url;
        imgObj["upload_type"] = "events";
        // imgObj["coach_name"] = item.FirstName;
        imgObj["club_name"] = this.eventObj.ParentClubKey;
        this.fb.uploadPhoto(imgObj).then((url) => {
          // console.log(photo url:${url});
          this.loading.dismiss();
          this.updateProgImg(text, url);
        }).catch((err) => {
          this.loading.dismiss();
          let message = "upload failed";
          this.showToast(message, 2000);
        })
      });
    } catch (e) {
      console.log(e.message);
      let message = "upload failed";
      this.showToast(message, 2000);
    }
  }


  // updating prof image
  updateProgImg(text: string, url: any) {
    // this.fb.update(item.$key, "Coach/Type2/" + item.ParentClubKey, { ProfileImageUrl: url })
    // item.ProfileImageUrl = url;
    if (text == "event_img") {
      this.eventObj.TitleImageUrl = url;
    } else if (text == "speaker_img") {
      this.eventObj.SpeakerOrTrainerImgUrl = url;
    } else if (text == "sponsor_img") {
      this.Sponsors[this.sponsorIndex].SponsorImageUrl = url;
    }
    let message = "Image uploaded successfully";
    this.showToast(message, 2500);
  }

  //Goto Event DescriptionPage
  GetDescription() {
    let modal = this.modalCtrl.create("EventdescPage", { callback: this.getData1, Description: this.eventObj.EventDesc });
    modal.present();
  }

  getData1 = data => {
    return new Promise((resolve, reject) => {
      resolve("");
      this.eventObj.EventDesc = data;
    });
  };

  // location select and add options ----(Alert box)
  onChangeLocation() {
    let alert = this.alertCtrl.create({
      title: 'Location',
      buttons: [
        {
          text: "+Add Location",
          // role: 'cancel',
          handler: () => {
            this.addLocation();
          }
        },
        {
          text: 'Done',
          handler: data => {
            this.eventObj.Location = data.LocationName;
            this.eventObj.LocationKey = data.LocationKey;
            if (data.Url == undefined) {
              data.Url = ''
            }
            //this.Tournament.Location = data;
            console.log(data)
          }
        }
      ]
    });
    this.locations.forEach(location => {
      alert.addInput({
        type: 'radio',
        label: location.LocationName,
        value: location,
      })
    });
    alert.present();
  }

  //Adding new location
  addLocation() {
    console.log("add Loaction", this.parentClubKey);
    this.navCtrl.push("AddlocationPage");
  }
  startDateChange() {
    this.eventObj.BookingUntil = moment(this.eventObj.EventStartDate).subtract(1, 'day').format("YYYY-MM-DD");
    this.eventObj.EventEndDate = this.eventObj.EventStartDate;
    //this.eventObj.BookingUntil = "";
  }

  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }
  //Click on next button for previusslide
  GotoPrevious() {
    this.isBeginSlide = this.slides.isBeginning();
    if (!this.isBeginSlide) {
      this.slides.lockSwipes(false);
      this.slides.slidePrev();
      this.slides.lockSwipes(true);
    }
  }

  //Click on next button for nextslide and validations
  GotoNext() {
    // this.slides.lockSwipes(false);
    // this.slides.slideNext();
    if (this.validateSlides()) {
      this.slides.lockSwipes(false);
      let isSlideEnd = this.slides.isEnd();
      if (!isSlideEnd) {
        this.slides.slideNext();
        this.slides.lockSwipes(true);
      }
    }
  }

  //Slides data validations
  validateSlides() {
    if (this.slides.getActiveIndex() == 0) {
      if (this.eventObj.EventName == "") {
        this.showToast("Please enter event name", 2500);
        return false;
      }
      if (this.eventObj.Location == "") {
        this.showToast("Please choose event location", 2500);
        return false;
      }
      if (this.eventObj.EventStartDate == "") {
        this.showToast("Please select event start date", 2500);
        return false;
      }
      if (this.eventObj.EventEndDate == "") {
        this.showToast("Please select event end date", 2500);
        return false;
      }
      if (this.eventObj.EventSummary == "") {
        this.showToast("Please enter event summary", 2500);
        return false;
      }
      // if (this.eventObj.TitleImageUrl == "") {
      //   this.showToast("Please upload title image", 2500);
      //   return false;
      // }
      if (this.eventObj.VenueName == "") {
        this.showToast("Please select organizer", 2500);
        return false;
      }
      if (this.eventObj.EventDesc == "") {
        this.showToast("Please enter event description", 2500);
        return false;
      } else {
        return true;
      }
    }
    if (this.slides.getActiveIndex() === 1) {
      if (this.eventObj.Capacity == 0 || this.eventObj.Capacity == undefined) {
        this.showToast("Please enter event capacity", 2500);
        return false;
      }
      //if (this.eventObj.Paid == true) {
      if (this.eventObj.Paid == true ) {
        if(this.eventObj.PaymentActivityKey == ""){
          this.showToast("Please select payment", 2500);
          return false; //need to make it false when prod payment is ready
        }else {
          let isTicketTypeSelected = false;
          let isTicketCatgSelected = false;
          let isTicketCatgCapacityAvail = false;
          this.TicketTypes.forEach((ticket: any) => {
            if (ticket.IsAvailable) {
              isTicketTypeSelected = true;        
              if (this.eventObj.Paid) {
                let isCacityAvailable = ticket.categories.find(catg => catg.Capacity != "" && catg.Capacity != null && catg.Capacity != undefined);
                if(!isCacityAvailable){
                  isTicketCatgCapacityAvail = false;
                }else{
                  isTicketCatgCapacityAvail = true
                }
                // ticket.categories.forEach((catg: any) => {
                //   if (catg.Capacity != "" && catg.Capacity != null && catg.Capacity != undefined) {
                //     //isTicketCatgSelected = true;
                //     isTicketCatgCapacityAvail = true
                //   } else {
                //     // catg.Cost = 0;
                //     // catg.Fee = 0;
                //     // catg.Capacity = 0;
                //     isTicketCatgCapacityAvail = false;
                //   }
                // });
              }
            }
          });
          if (!isTicketTypeSelected) {
            this.showToast("Please choose ticket type", 2500);
            return false;
          }
  
          // if (!isTicketCatgSelected) {
          //   this.showToast("Please enter ticket price", 2500);
          //   return false;
          // } else {
          //   return true;
          // }
          if(!isTicketCatgCapacityAvail){
            this.showToast("Please make sure you have given the capcity or price for selected ticket types", 2500);
          }else {
            return true;
          }
        }
        
      }else{
        return true;
      } 
    } 
    else if (this.slides.getActiveIndex() === 2) {
      // if (this.eventObj.LunchOrDinner && this.eventObj.LunchOrDinnerType == "paid") {
      //   if (this.eventObj.LunchOrDinnerAmt == 0) {
      //     this.showToast("Please enter dinner cost", 2500);
      //     return false;
      //   }
      // }
      // if (this.eventObj.Snacks && this.eventObj.SnacksType == "paid") {
      //   if (this.eventObj.SnacksAmt == 0) {
      //     this.showToast("Please enter snacks cost", 2500);
      //     return false;
      //   }
      // }
      // if (this.eventObj.SoftDrink && this.eventObj.SoftDrinkType == "paid") {
      //   if (this.eventObj.SoftDrinkAmt == null) {
      //     this.showToast("Please enter softdrink amount", 2500);
      //     return false;
      //   }
      // } else {
      //   return true;
      // }
      return true;
    } 
    else if (this.slides.getActiveIndex() === 3) {
      if (this.eventObj.ContactName == "" && this.eventObj.Email == "" && this.eventObj.ContactNo == undefined) {
        this.showToast("Please enter contact details", 2500);
        return false;
      }
      if (this.eventObj.Email != "" && (!this.validateEmail(this.eventObj.Email))) {
        let message = "Please enter correct email id";
        this.showToast(message, 2500);
        return false;
      } else {
        return true;
      }
    }
  }

  CreateEvent() {
    //console.log(this.eventObj);
    if (this.slides.getActiveIndex() === 4) {
      if (this.eventObj.TitleImageUrl == "") {
        this.showToast("Please upload title image", 2500);
        return false;
      }
      if (this.eventObj.DiscountAvail && this.eventObj.Paid) {
        if (this.eventObj.DiscountAmt == 0 && this.eventObj.DiscountPercentage == 0) {
          this.showToast("Please enter discount amount or percentage", 2500);
          return false;
        }
        if (this.eventObj.DiscountValidUntil == "") {
          this.showToast("Please choose discount validity until", 2500);
          return false;
        }
      }
      if (this.eventObj.IsCouponCodeAvail && this.eventObj.Paid) {
        if (this.eventObj.CouponCodeVal == 0 && this.eventObj.CouponCodePercen == 0) {
          this.showToast("Please enter coupon amount or percentage", 2500);
          return false;
        } else {
          this.UpdateConfirmation();
        }
      } else {
        this.UpdateConfirmation();
      }
    }
  }

  UpdateConfirmation() {
    let alert = this.alertCtrl.create({
      title: 'Event',
      message: 'Do you want to create the event?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Yes, Create',
          handler: () => {
            console.log('Buy clicked');
            this.Create();
          }
        }
      ]
    });
    alert.present();
  }


  //Creating Event
  Create() {
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();
    let event = {};
    //this.eventObj.CapacityLeft = this.eventObj.Capacity;
    this.TicketTypes.forEach((ticket: any) => {
      if (ticket.IsAvailable) {
          ticket.categories.forEach((catg: any) => {
            if (catg.Cost == "" || catg.Cost == null) {
              catg.Cost = 0;
            } 
            if(catg.Fee == "" || catg.Fee == null){
              catg.Fee = 0;
            }
            if(catg.Capacity == "" || catg.Capacity == null){
              catg.Capacity = 0;
            }
          });
      }
    });
    event["EventKey"] = this.eventDets.Key;
    event["eventObj"] = this.eventObj;
    event["Sponsors"] = this.Sponsors;
    event["TicketTypes"] = this.TicketTypes;
    event["Policy"] = this.Policies;
    console.log(event["TicketTypes"]);
    console.log(event["Sponsors"]);
    this.eventObj.Capacity = Number(this.eventObj.Capacity);
    this.eventObj.CapacityLeft = this.eventObj.Capacity;
    this.fb.$post(`${this.nestUrl}/events/create`, event).subscribe((result) => {
      loading.dismiss();
      this.commonService.toastMessage("Event Created Successfully", 2500,ToastMessageType.Success,ToastPlacement.Bottom);
      this.commonService.updateCategory("events");
      this.storage.remove('events').then((res) => this.navCtrl.remove(this.navCtrl.getActive().index - 1, 2));
    }, (err) => {
      loading.dismiss();
      console.log("err", err);
      this.showToast("There is some problem, Please try again", 2500);
    });
  }


  showToast(m: string, howLongShow: number, value?: number) {
    let toast = this.toastCtrl.create({
      message: m,
      duration: howLongShow,
      cssClass: !value ? "error" : "success",
      position: 'bottom'
    });
    toast.present();
  }

}

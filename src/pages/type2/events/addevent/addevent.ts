import { Component, ViewChild } from '@angular/core';
import { IonicPage, Platform, Content, NavController, NavParams, Navbar, AlertController, ModalController, ToastController, LoadingController, ActionSheetController, Slides } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { CommonService, ToastPlacement, ToastMessageType } from "../../../../services/common.service";
import { SharedServices } from '../../../services/sharedservice';
import { FirebaseService } from '../../../../services/firebase.service';
import { ImageFormat, UploadImage } from '../../../Model/ImageSection';
import { Camera, PictureSourceType, CameraOptions } from '@ionic-native/camera';
import * as moment from 'moment';
import { File, FileEntry } from '@ionic-native/file';
import { Chooser } from '@ionic-native/chooser';
import { FileOpener } from '@ionic-native/file-opener';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { HttpService } from '../../../../services/http.service';
//import { CommonEventInputType, CreateEventInputDto, EventLocation, EventTypes } from '../events.model';
import { AppType } from '../../../../shared/constants/module.constants';
import { GraphqlService } from '../../../../services/graphql.service';
import { IClubDetails } from '../../session/sessions_club.model';
import gql from 'graphql-tag';
import { EventImageUploadService } from '../imageupload/eventimageupload.service';
import { CreateEventInputDto, EventLocation, EventTypes } from '../model/event.model';
import { API } from '../../../../shared/constants/api_constants';


/**
 * Generated class for the AddeventPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-addevent',
  templateUrl: 'addevent.html',
  providers: [HttpService,EventImageUploadService]
})
export class AddeventPage {
  full_view_img:string = '';
  showFullImage:boolean = false;
  @ViewChild(Navbar) navBar: Navbar;
  isBeginSlide: boolean = true;
  isEndSlide: boolean = false;
  format: any = new ImageFormat();
  PaymentActivities: Array<any> = [];
  nestUrl: string = "";
  clubs: IClubDetails[];
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
  Sponsors: Array<any> = [
    { SponsorName: "", SponsorImageUrl: "" }
  ];
  Policies = {
    PolicyTitle: "",
    Description: "",
    PolicyDocs: []
  };

  min: any;
  max: any;
  parentClubKey: string = "";
  eventObj = {
    ParentClubKey: "", UserKey: "", City: "", PostCode: "", MapLatitude: "", MapLongitude: "", UserName: "", EventName: "", EventType: "", EventStartDate: "", EventEndDate: "", StartTime: "16:00", EndTime: '20:00', LocationKey: "", Location: "", EventSummary: "",
    TitleImageUrl: "", VenueKey: "", VenueName: "", ResponsibleVenue: "'", SpeakerOrTrainer: true, SpeakerName: "", EventDesc: "", TicketLabel: "Book", SpeakerOrTrainerImgUrl: "",
    BookingUntil: "", Capacity: 200, MinimumBooking: 1, CapacityLeft: 200, Paid: false, Amount: null, LunchOrDinner: false, LunchOrDinnerType: "free", LunchOrDinnerAmt: 0, Snacks: false,
    SnacksType: "free", SnacksAmt: 0, SoftDrink: false, SoftDrinkType: "free", SoftDrinkAmt: 0, ParkingAvailable: false, ParkingType: "free", ParkingAmt: 0,
    ContactName: "", ContactNo: undefined, Email: "", EventTag: "", OtherInfo: "", RefundPolicy: "", BookingInstruction: "", IsWebsiteAvail: false, Website: "", Facebook: "", IsFacebookAvail: false,
    IsInstagramAvail: false, Instagram: "", IsTwitterAvail: false, Twitter: "", DiscountName: "Early Bird", CurrencySymbol: "",
    DiscountAvail: false, DiscountAmt: 0, DiscountPercentage: 0, DiscountValidUntil: "", IsCouponCodeAvail: false, CouponName: "Corporate", CouponCode: "", CouponCodePercen: 0, CouponCodeVal: 0, CouponTimesAllowed: 20,
    CouponValidUntil: "", AllowCouponDiscount: false, PaymentKey: "", PaymentActivityKey: "", PaymentName: "", PaymentGateway: "",
    Member: "", IsActive: true, IsEnable: true, IsTitleEvent: false, IsPublish: false, CreatedDate: new Date().getTime(), UpdatedDate: new Date().getTime()
  }

  @ViewChild(Content) content: Content;
  @ViewChild(Slides) slides: Slides;

  eventsDto: CreateEventInputDto = {
    created_by: '',
    name: '',
    event_type_id: '',
    location_type: 0,
    location_id: '',
    location: '',
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    title_name: '',
    capacity: 200,
    parentclubId: '',
    clubId: '',
    activityId: '',
    memberId: '',
    action_type: 0,
    device_type: 0,
    app_type: 0,
    device_id: '',
    updated_by: '',
    title_img: '',
    location_map_url: '',
    summary: '',
    description:'',
    contact_name: '',
    contact_no: '',
    contact_email: '',
    speaker_avail:true,
    speaker_trainer_url:"",
    speaker_trainer_name:"",
    event_images:[]
  }

  title_url: string;
  postgre_parentclub: string;
  eventTypes: EventTypes[] = [];
  eventLocation: EventLocation[] = []

  constructor(public navCtrl: NavController, private chooser: Chooser, 
    private fileTransfer: FileTransfer, private fileOpener: FileOpener,
     private file: File, public navParams: NavParams, 
     public alertCtrl: AlertController, public modalCtrl: ModalController,
      public toastCtrl: ToastController, 
      public commonService: CommonService, public fb: FirebaseService, 
      public storage: Storage, public sharedService: SharedServices, 
      public actionSheetCtrl: ActionSheetController, 
      private camera: Camera, public loadingCtrl: LoadingController,
    private platform: Platform, public http: HttpClient, 
    private httpService: HttpService,
    private graphqlService: GraphqlService, 
    private imageUploadService: EventImageUploadService,
  ) {

    this.nestUrl = this.sharedService.getnestURL();
    this.min = new Date().toISOString();
    this.max = "2049-12-31";
    //this.eventObj.EventStartDate = moment().add(1, 'M').format("YYYY-MM-DD");
    //this.eventObj.EventEndDate = moment().add(1, 'M').format("YYYY-MM-DD");
    this.eventsDto.start_date = moment().add(1, 'M').format("YYYY-MM-DD");
    this.eventsDto.end_date = moment().add(1, 'M').format("YYYY-MM-DD");

    //this.eventObj.EventEndDate = moment(this.eventObj.EventStartDate).add(1, 'd').format("YYYY-MM-DD");
    // this.eventObj.BookingUntil = moment(this.eventObj.EventStartDate).subtract(1, 'd').format("YYYY-MM-DD");
    // this.eventObj.CouponValidUntil = moment(this.eventObj.EventStartDate).subtract(14, 'd').format("YYYY-MM-DD");
    // this.eventObj.DiscountValidUntil = moment(this.eventObj.EventStartDate).subtract(14, 'd').format("YYYY-MM-DD");
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.eventObj.ParentClubKey = val.UserInfo[0].ParentClubKey;
        //if(val.RoleType == 4 || val.RoleType == 6 || val.RoleType == 7 || val.RoleType == 8){}
        this.eventsDto.contact_email = val.EmailID;
        this.eventsDto.contact_name = val.Name;
        this.eventObj.UserKey = val.$key;
        storage.get('Currency').then((currency) => {
          let currencydets = JSON.parse(currency);
          console.log(currencydets);
          this.eventObj.CurrencySymbol = currencydets.CurrencySymbol;
          console.log(this.eventObj.CurrencySymbol);
        });

        this.eventsDto.app_type = AppType.ADMIN_NEW;
        this.eventsDto.parentclubId = this.sharedService.getPostgreParentClubId();
        this.eventsDto.created_by = this.sharedService.getLoggedInId();
        this.postgre_parentclub = this.sharedService.getPostgreParentClubId();

        if(this.slides){
          this.slides.lockSwipes(true);
        }
        
        //this.getClubList();
        this.getListOfClub();
        this.getParentclubInfo();
        this.getEventLocation();
        this.getEventType();
      }
    });
  }

  validateAmount(ev: any) {
    return this.commonService.validateNumber(ev.target.value);
  }

  fileUri = "";
  async ChoosePolicies() {
    this.chooser.getFile('application/pdf,image/jpeg')
      .then(async (file) => {
        console.log(file);
        let type = file.name;
        let fileExtType = type.split('.').pop();
        const MimeType = file.mediaType;
        
        this.fileUri = file.dataURI;
        this.file.resolveLocalFilesystemUrl(file.uri).then((newUrl) => {
          // let dirPath = newUrl.nativeURL;
          // console.log(`dirpath${dirPath}`);
          // let dirPathSegemmnts = dirPath.split('/');
          // dirPathSegemmnts.pop();
          // dirPath = dirPathSegemmnts.join('/');
          // this.file.readAsArrayBuffer(dirPath, file.name).then((buffer) => {
          // console.log(`inside buffer${buffer}`)
          // let blob = new Blob([buffer], { type: file.mediaType });
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
            
            // this.updateProgImg(text, url);
          }).catch((err) => {
            this.commonService.toastMessage(err.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          })

        }).catch((err) => {
          this.commonService.toastMessage(err.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        })
        //console.log(JSON.stringify(this.Policies.PolicyDocs));
      })
      .catch((error: any) => console.error(error));

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
            if (this.platform.is('ios')) {
              path = this.file.documentsDirectory;
            } else {
              path = this.file.dataDirectory;
            }

            transfer.download(this.Policies.PolicyDocs[index].DownloadUrl, `${path}${new Date().getTime()}.pdf`).then((entry) => {
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
            
            let imgObj = {};
            imgObj["url"] = this.Policies.PolicyDocs[index].DownloadUrl;
            imgObj["upload_type"] = "eventpolicy";
            // imgObj["coach_name"] = item.FirstName;
            imgObj["club_name"] = this.eventObj.ParentClubKey;
            this.fb.DeleteFileByRefUrl(imgObj).then((res) => {
              
              this.commonService.toastMessage("File removed", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
              this.Policies.PolicyDocs.splice(index, 1);
            }).catch((error) => {
              
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


  ionViewWillEnter() {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EventsPage')
    //Handling backbuton manually
    this.navBar.backButtonClick = (e: UIEvent) => {
      console.log("todo something");
      this.checkIsFormFilled();
    }
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

  slideChanged() {
    setTimeout(() => {
      this.content.scrollToTop(200);
    });
    this.isBeginSlide = this.slides.isBeginning();
    this.isEndSlide = this.slides.isEnd();
  }

  CheckCouponCode() {
    if (!this.eventObj.IsCouponCodeAvail) {
      this.eventObj.CouponCode = this.randomString(8, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    }
  }

  //payment activity details
  CheckIsPaid() {
    this.eventObj.PaymentKey = "";
    this.eventObj.PaymentActivityKey = "";
    this.eventObj.PaymentName = "";
    this.eventObj.PaymentGateway = "";
    // if (!this.eventObj.Paid) {
    //   this.fb.getAllWithQuery(`Activity/${this.eventObj.ParentClubKey}/${this.eventObj.VenueKey}`, { orderByChild: "IsActive", equalTo: true }).subscribe((res) => {
    //     this.PaymentActivities = [];
    //     // console.log(res);
    //     res.filter((payment: any, index: number) => {
    //       payment.PaymentSetup = this.commonService.convertFbObjectToArray(payment.PaymentSetup);
    //       payment.PaymentSetup.filter((activity: any) => {
    //         //console.log(activity);
    //         if (activity.IsActive && activity.PaymentGatewayName == "StripeConnect" && activity.SetupType == "Events") {
    //           activity["activitykey"] = res[index].$key;
    //           activity["IsSelected"] = false;
    //           this.PaymentActivities.push(activity);
    //         }
    //       })
    //     });
    //     console.log(this.PaymentActivities);
    //   }, (err) => {
    //     console.log(err);
    //   })
    // }
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

  CheckCategoryCapcity(ticketInd, catInd) {
    if (this.eventObj.Capacity <= 0 || this.eventObj.Capacity == null) {
      this.commonService.toastMessage("Please enter capacity", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    } else {
      let usedCacity: number = 0;

      for (const tickeType of this.TicketTypes) {
        for (const category of tickeType.categories) {
          if (category.Capacity != null && category.Capacity != undefined) {
            usedCacity += parseInt(category.Capacity);
          }
        }
      }

      if (Number(usedCacity) > Number(this.eventObj.Capacity)) {
        this.TicketTypes[ticketInd].categories[catInd].Capacity = "";
        this.TicketTypes[ticketInd].categories[catInd].Capacity = 0;
        this.commonService.toastMessage("Capacity exceeded", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        return false;
      }

    }
  }



  //on change of venues(oraganizers))
  onChangeVenue() {
    // let index = this.Venues.findIndex(venue => venue.$key === this.eventObj.VenueKey);
    // this.eventObj.VenueName = this.Venues[index].ClubName;
    // console.log(`${this.eventObj.VenueKey}:${this.eventObj.VenueName}`);
    this.CheckIsPaid();
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
  async SelectProfImg(imageType: number) {
    // this.sponsorIndex = index;
    const actionSheet = await this.actionSheetCtrl.create({
      //header: 'Choose File',
      buttons: [{
        text: 'Camera',
        role: 'destructive',
        icon: 'ios-camera',
        handler: () => {
          console.log('clicked');
          this.CaptureImage(this.camera.PictureSourceType.CAMERA, imageType);
        }
      }, {
        text: 'Gallery',
        icon: 'ios-image',
        handler: () => {
          //console.log('Share clicked');
          this.CaptureImage(this.camera.PictureSourceType.PHOTOLIBRARY, imageType);
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

  async CaptureImage(sourceType: PictureSourceType, imageType: number) {
    
    // Check if we're running in a browser (using TypeScript type assertion)
    //const isBrowser = !(window as any).cordova;

    // if (isBrowser) {
    //   // Use the static base64 image for testing
    //   this.title_url = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/...";
    //   console.log("Using static base64 image for browser testing.");
    //   await this.prepareAndUpload(imageType);
    // } else {
    //   const options: CameraOptions = {
    //     quality: 70,
    //     sourceType,
    //     destinationType: this.camera.DestinationType.DATA_URL,
    //     encodingType: this.camera.EncodingType.JPEG
    //   };

    //   try {
    //     const imageData = await this.camera.getPicture(options);
    //     this.title_url = "data:image/jpeg;base64," + imageData;
    //     await this.prepareAndUpload(imageType);
    //   } catch (error) {
    //     this.commonService.toastMessage("Error capturing image", 2500, ToastMessageType.Error);
    //   }
    // }
    const options: CameraOptions = {
      quality: 70,
      sourceType,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      //mediaType: this.camera.MediaType.PICTURE
    };

    try {
      const imageData = await this.camera.getPicture(options);
      //const mimeType = sourceType === this.camera.EncodingType.JPEG ? 'image/jpeg' : 'image/png';
      this.title_url = imageData.startsWith('data:image/jpeg;base64,') ? imageData: `data:image/jpeg;base64,${imageData}`;
      this.prepareAndUpload(imageType);
    } catch (error) {
      console.log(`err:${JSON.stringify(error)}`);
      this.commonService.toastMessage("Error capturing image", 2500, ToastMessageType.Error);
    }
  }

  async prepareAndUpload(imageType: number) {
    try {
      this.commonService.showLoader("Uploading image...");
      //const imageData = this.title_url.split(",")[1]; // Extract base64 data
      //const imageData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wQACfsD/QGTFgAAAABJRU5ErkJggg==";
      const uniqueFileName = `${this.postgre_parentclub}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.jpeg`;
      // Step 1: Get presigned URL from server
      const presignedUrl = await this.imageUploadService.getPresignedUrl(uniqueFileName,'events','ap-dev-events');

      // console.log(`presignedurl:${presignedUrl[0].url}`)
      // console.log(`cloudfront:${this.sharedService.getCloudfrontURL()}`)
      // console.log(`imagedate:${this.title_url}`)

      // Step 2: Upload the image to S3 using presigned URL
      this.imageUploadService.uploadImage(presignedUrl[0].url, this.title_url).then(()=>{
        this.commonService.hideLoader();
        const imageUrl = `${this.sharedService.getCloudfrontURL()}/events/${uniqueFileName}`;
        console.log(`uploadedurl:${this.sharedService.getCloudfrontURL()}/events/${uniqueFileName}`);
        this.updateProgImg(imageType, imageUrl);
      }).catch((err)=>{
        console.log(`err:${JSON.stringify(err)}`);
        this.commonService.hideLoader();
        this.commonService.toastMessage("Error uploading image", 2500, ToastMessageType.Error);
      })
      
    } catch (error) {
      this.commonService.hideLoader();
      console.log(`err1:${error}`);
      this.commonService.toastMessage("Error uploading image", 2500, ToastMessageType.Error);
    } 
  }


  // updating prof image
  updateProgImg(imageType: number, imageUrl: string) {
    if (imageType === 1) {
      this.eventsDto.title_img = imageUrl;
    } else if (imageType === 2) {
      this.eventsDto.speaker_trainer_url = imageUrl;
    }else{
      this.eventsDto.event_images.push(imageUrl)
    }
    this.commonService.toastMessage("Image(s) uploaded successfully", 2500, ToastMessageType.Success);
  }

  showImageActions(index:number){
    //this.selected_img_index = index;
    const actionSheet = this.actionSheetCtrl.create({
      //title: `Modify ${this.gallery_item.variant_shortname}`,
      buttons: [
        {
          text: 'View',
          icon: 'ios-eye',
          handler: () => {
            this.full_view_img = `${this.eventsDto.event_images[index]}`;
            this.showFullImage = true;
          }
        },
        // {
        //   text: 'Edit',
        //   icon: 'ios-create',
        //   handler: () => {
        //     //this.chooseGalleryImages(false); //false nothing but editing existing image
        //   }
        // },
        {
          text: 'Delete',
          icon: 'ios-trash',
          handler: () => {
            this.eventsDto.event_images.splice(index,1);
          }
        }
      ]
    });
    actionSheet.present();
  }

  //Goto Event DescriptionPage
  modifyDescription(data:string,type:number) {
    type popup_res ={
      description:string,
      can_update:boolean
    }

    let modal = this.modalCtrl.create("EventdescPage", { Description: type == 1 ? this.eventsDto.summary:this.eventsDto.description, type });
    modal.onDidDismiss((data:popup_res) => {
      console.log(data);
      if(data && data.can_update){
        if(type === 1){
          this.eventsDto.summary = data.description;
        }else{
          this.eventsDto.description = data.description;
        }
      }
    });
    modal.present();
  }

  getData1 = data => {
    return new Promise((resolve, reject) => {
      resolve("");
      this.eventsDto.description = data;
    });
  };

  // location select and add options ----(Alert box)
  onChangeLocation() {
    // let alert = this.alertCtrl.create({
    //   title: 'Location',
    //   buttons: [
    //     {
    //       text: "+Add Location",
    //       // role: 'cancel',
    //       handler: () => {
    //         this.addLocation();
    //       }
    //     },
    //     {
    //       text: 'Done',
    //       handler: data => {
    //         this.eventObj.Location = data.LocationName;
    //         this.eventObj.LocationKey = data.LocationKey;
    //         this.eventObj.City = data.City;
    //         this.eventObj.PostCode = data.PostCode;
    //         this.eventObj.MapLatitude = data.MapLatitude;
    //         this.eventObj.MapLongitude = data.MapLongitude;
    //         if (data.Url == undefined) {
    //           data.Url = ''
    //         }
    //         //this.Tournament.Location = data;
    //         console.log(data)
    //       }
    //     }
    //   ]
    // });
    // this.locations.forEach(location => {
    //   alert.addInput({
    //     type: 'radio',
    //     label: location.LocationName,
    //     value: location,
    //   })
    // });
    // alert.present();
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
    // if (this.validateSlides()) {
    //   this.slides.lockSwipes(false);
    //   let isSlideEnd = this.slides.isEnd();
    //   if (!isSlideEnd) {
    //     this.slides.slideNext();
    //     this.slides.lockSwipes(true);
    //   }
    // }
  }

  onChangeEventType() {
    //this.eventObj.EventType = 
  }

  CancelEvent() {}

  getListOfClub() {
    const clubs_input = {
      parentclub_id: this.sharedService.getPostgreParentClubId(),
      user_postgre_metadata: {
        UserMemberId: this.sharedService.getLoggedInId()
      },
      user_device_metadata: {
        UserAppType: 0,
        UserDeviceType: this.sharedService.getPlatform() == "android" ? 1 : 2
      }
    }
    const clubs_query = gql`
        query getVenuesByParentClub($clubs_input: ParentClubVenuesInput!){
          getVenuesByParentClub(clubInput:$clubs_input){
                Id
                ClubName
                FirebaseId
                MapUrl
                sequence
            }
        }
        `;
    this.graphqlService.query(clubs_query, { clubs_input: clubs_input }, 0)
      .subscribe((res: any) => {
        this.clubs = res.data.getVenuesByParentClub as IClubDetails[];
        this.selectedClub = this.clubs[0].Id;
        this.eventsDto.clubId = this.clubs[0].Id;
      },
      (error) => {
          this.commonService.toastMessage("No venues found", 2500, ToastMessageType.Error)
          console.error("Error in fetching:", error);
      })
  }

  getEventType() {
    console.log("input for events", this.eventsDto)
    this.httpService.post(`${API.GET_EVENTS_TYPES}`, this.eventsDto).subscribe((res: any) => {
      if (res) {
        this.eventTypes = res.data;
        if(this.eventTypes.length > 0) this.eventsDto.event_type_id = this.eventTypes[0].id;
        console.log("res for event type", JSON.stringify(res.data));
      } else {
        console.log("error in fetching",)
      }
    })
  }

  getEventLocation() {
    console.log("event location api called");
    this.httpService.post(`${API.GET_EVENT_LOCATIONS}`, this.eventsDto).subscribe((res: any) => {
      if (res) {
        this.eventLocation = res.data;
        if(this.eventLocation.length > 0) this.eventsDto.location_id = this.eventLocation[0].id;
        console.log("res for event location", JSON.stringify(res.data));
      } else {
        console.log("error in fetching",)
      }
    })
  }

  //Slides data validations
  validateSlides() {
    //if (this.slides.getActiveIndex() == 0) {
      if (this.eventsDto.name == "") {
        this.commonService.toastMessage("Please enter event name", 2500);
        return false;
      }
      else if (this.eventsDto.location_id == "") {
         this.commonService.toastMessage("Please choose event location", 2500,ToastMessageType.Error);
        return false;
      }
      else if(this.eventsDto.event_type_id == "" || this.eventsDto.event_type_id == undefined){
        this.commonService.toastMessage("Please choose event type", 2500,ToastMessageType.Error);
        return false;
      }
      
      else if (!this.commonService.validateStartAndEndDate(this.eventsDto.start_date,this.eventsDto.end_date)) {
        return false;
      }

      else if (!this.commonService.validateTime(this.eventsDto.start_time,this.eventsDto.end_time)) {
        return false;
      }
      // else if (this.eventsDto.start_time == "") {
      //   this.commonService.toastMessage("Please select event start time", 2500,ToastMessageType.Error);
      //  return false;
      // }
      // else if (this.eventsDto.end_time == "") {
      //   this.commonService.toastMessage("Please select event end time", 2500,ToastMessageType.Error);
      //   return false;
      // }
      
      else if(this.eventsDto.title_img == ""){
        this.commonService.toastMessage("Please upload title image", 2500,ToastMessageType.Error);
        return false;
      }
      else if (this.eventsDto.summary == "") {
         this.commonService.toastMessage("Please enter event summary", 2500,ToastMessageType.Error);
        return false;
      }
      else if (this.eventsDto.clubId == "") {
         this.commonService.toastMessage("Please select organizer", 2500,ToastMessageType.Error);
         return false;
      }
      else if(this.eventsDto.capacity == 0 || this.eventsDto.capacity == undefined){
        this.commonService.toastMessage("Please enter event capacity", 2500,ToastMessageType.Error);
        return false;
      }
      else if (this.eventsDto.contact_name == "" && this.eventsDto.contact_email=='' && this.eventsDto.contact_no == "") {
        this.commonService.toastMessage("Please enter contact details", 2500,ToastMessageType.Error);
       return false;
      }
      else if (this.eventsDto.description == "") {
         this.commonService.toastMessage("Please enter event description", 2500,ToastMessageType.Error);
        return false;
      } 
      
      return true;
    //}
   
  }


  createEvent() {
    if(this.validateSlides()){
      try{
        this.commonService.showLoader("Please wait..");
        const location = this.eventLocation.find(loc => loc.id === this.eventsDto.location_id);
        this.eventsDto.location = location.name;
        this.eventsDto.location_type = +location.type;
        this.eventsDto.capacity = +this.eventsDto.capacity;
        this.eventsDto.start_date = new Date(this.eventsDto.start_date).toISOString();
        this.eventsDto.end_date = new Date(this.eventsDto.end_date).toISOString();
        //this.eventsDto.title_img = "https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815.appspot.com/o/ActivityPro%2FAllNewsAndEventPhotos%2F-LoPau5Bzar9uNR15C1b1570989291438?alt=media&token=87c00f60-2a07-4cf0-b356-a4014dc57b86"
        //this.eventsDto.speaker_trainer_url = "https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815.appspot.com/o/ActivityPro%2FAllNewsAndEventPhotos%2F-LoPau5Bzar9uNR15C1b1570989291438?alt=media&token=87c00f60-2a07-4cf0-b356-a4014dc57b86"
        //this.eventsDto.title_name = "demo event"
        
        console.log("input giving for create event", JSON.stringify(this.eventsDto));
        this.httpService.post(`${API.CREATE_EVENT}`, this.eventsDto).subscribe(
          (response) => {
            this.commonService.hideLoader();
            console.log("Event created successfully:", response);
            const message = "Event created in ‘DRAFT’ mode. Please add ticket information along with the pricing and change the status to LIVE mode.";
            this.commonService.alertWithText('',message, "Okay, got it!")
            this.navCtrl.pop();
          },
          (err) => {
            this.commonService.hideLoader();
            if(err.error.message){
              this.commonService.toastMessage(err.error.message, 2500,ToastMessageType.Error,ToastPlacement.Bottom);
            }else{
              this.commonService.toastMessage('Event creation failed',2500,ToastMessageType.Error,ToastPlacement.Bottom);
            }
          }
        ); 
      }catch(err){
        this.commonService.hideLoader();
        if(err.error.message){
          this.commonService.toastMessage(err.error.message, 2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }else{
          this.commonService.toastMessage('Event creation failed',2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }
      }    
    }
  }

}
///
// export class Policy{
//   PolicyTitle:string;
//   PolicyDocs:PolicyDocs[];
// };
export class PolicyDocs {
  Url: string;
  CreatedAt: any;
  UpdatedAt: any;
  FileType: string;
  DownloadUrl: string;

  constructor(uri, type) {
    this.Url = uri;
    this.FileType = type;
    this.CreatedAt = new Date().getTime();
    this.UpdatedAt = new Date().getTime();
    this.DownloadUrl = "";
  }
}



import { Image, Category, Listname, UploadImage } from '../../Model/ImageSection';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController, ActionSheetController, Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import { ModalController } from 'ionic-angular';
import { File } from '@ionic-native/file';
import { Camera, PictureSourceType, CameraOptions } from '@ionic-native/camera';
import { NewsAndPhotoInput, NewsImageInput } from './input_output_model/news_photos.dto';
import { SharedServices } from '../../services/sharedservice';
import gql from 'graphql-tag';
import { GraphqlService } from '../../../services/graphql.service';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ImageUploadService } from './imageupload.service';
import { IActivityDetails } from '../../../shared/model/activity.model';


@IonicPage()
@Component({
  selector: 'page-createventsandnews',
  templateUrl: 'createventsandnews.html',
})
export class CreateventsandnewsPage {
  imgUrls = [];
  LangObj: any = {};//by vinod
  ImageObj = new Image();
  activityList:IActivityDetails[] = [];
  selectedActivity: any = {};
  key: any = "";
  ImageList: any = [];
  category = new Category();
  cate: any = "Session"
  ListName = new Listname();
  photoList: any = ""
  loading: any;
  title_url:string;
  presignged_title_img = "";
  inputObj: NewsAndPhotoInput = {
    AppType: 0,
    ActionType: 0,
    DeviceType: 0,
    news_photos_postgre_fields: {
      parentclub_id: '',
      activity_id: ''
    },


    photos: [],
    category_name: '',
    is_headLine: false,
    is_enable: true,
    image_caption: '',
    image_description: '',
    image_tag: '',
    image_title: '',
    image_url: '',
    is_show_applus: false,
    is_show_member: false,
    associatedActivity: ''
  }

  newsImageInput: NewsImageInput;
  postgre_parentclub: string;
  activity: string
  constructor(public events: Events, public actionSheetCtrl: ActionSheetController, private graphqlService: GraphqlService, 
    public http: HttpClient,
    private sharedService: SharedServices, 
    private imageUploadService: ImageUploadService, 
    private camera: Camera, public loadingCtrl: LoadingController, 
    public modalCtrl: ModalController, 
    public toastCtrl: ToastController, 
    public commonService: CommonService, 
    public fb: FirebaseService, public storage: Storage, 
    public navCtrl: NavController, 
    public navParams: NavParams) {
    this.cate = Listname.getListName();
    
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.ImageObj.CreatedBy = "Admin";
        this.ImageObj.IsHeadLine = true;
        this.ImageObj.CreaterKey = val.UserInfo[0].ParentClubKey;
        this.ImageObj.ParentClubName = val.Name;
        this.ImageObj.ParentClubKey = val.UserInfo[0].ParentClubKey;
        this.postgre_parentclub = this.sharedService.getPostgreParentClubId();
        this.getActivityList();
      }
    });
  }

  ionViewWillEnter() {
    this.getLanguage();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CreateventsandnewsPage');
    this.getLanguage();
    this.events.subscribe('language', (res) => {
      this.getLanguage();
    });
  }

  getLanguage() {
    this.storage.get("language").then((res) => {
      console.log(res["data"]);
      this.LangObj = res.data;
    })
  }

  getActivityList() { 
   const club_activity_input = {
      ParentClubKey:this.sharedService.getParentclubKey(),
      AppType:0, //0-Admin
      DeviceType:this.sharedService.getPlatform() == "android" ? 1 : 2 //1-android,2-IOS
    }
      const clubs_activity_query = gql`
      query getAllActiviesByParentClub($input_obj: CommonInputTypeDefs_V3!){
        getAllActiviesByParentClub(venueDetailsInput:$input_obj){
          ActivityCode
          ActivityName
          ActivityImageURL
          FirebaseActivityKey
          ActivityKey
        }
      }
      `;
      this.graphqlService.query(clubs_activity_query,{input_obj:club_activity_input},0)
        .subscribe((res: any) => {
          if(res.data.getAllActiviesByParentClub.length > 0){
            this.activityList = res.data.getAllActiviesByParentClub;
            this.selectedActivity = this.activityList[0].ActivityKey;
          }else{  
            this.commonService.toastMessage("No activities found",2500,ToastMessageType.Error)
          }
        },
       (error) => {
        this.commonService.toastMessage("Activities fetch failed",2500,ToastMessageType.Error);
            console.error("Error in fetching:", error);
           // Handle the error here, you can display an error message or take appropriate action.
        }) 
  }
  
  presentProfileModal() {
    let profileModal = this.modalCtrl.create('ActivitymodalPage', {
      act: this.category
    });
    console.log("categroy passing to other page:", profileModal)
    profileModal.present();
    //this.navCtrl.push('ActivitymodalPage');
  }


  resetVideo() {
    this.ImageObj = new Image();
    this.navCtrl.pop();
  }

  getCategory(): string {
    return Listname.getListName();
  }

  ionViewDidEnter() {
    console.log('executed2');
  }
  presentUploadModal() {
    this.navCtrl.push("AddMorePhotosPage",{callback: this.handleImageData.bind(this),extra_images:this.inputObj.photos.length > 0 ? this.inputObj.photos:[]})
    // let profileModal = this.modalCtrl.create('ImageuploadmodalPage');
    // profileModal.present();
  }
  
  handleImageData(data) {
    // Do whatever operation you want with the received data
    console.log('Received image data:', data);
    // For example, you can update your ImageObj with the received data
    if(Object.values(data).length > 0){
      this.newsImageInput = new NewsImageInput();
      this.newsImageInput.image_url = data.imageUrl;
      this.newsImageInput.image_caption = data.caption;
      this.newsImageInput.image_description = data.description;
      this.inputObj.photos.push(this.newsImageInput);
    }
    
  }

  getPhotoList() {
    this.photoList = UploadImage.getImage();
    return this.photoList;
  }

  async SelectProfImg() {
    console.log("camera is clicked");
    const actionSheet = this.actionSheetCtrl.create({
      //header: 'Choose File',
      buttons: [{
        text: 'Camera',
        role: 'destructive',
        icon: 'ios-camera',
        handler: () => {
          console.log('camera clicked');
          this.CaptureImage(this.camera.PictureSourceType.CAMERA)
        }
      }, {
        text: 'Gallery',
        icon: 'ios-image',
        handler: () => {
          console.log('gallery clicked');
          this.CaptureImage(this.camera.PictureSourceType.PHOTOLIBRARY)
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
    actionSheet.present();
  }
  currentImage:any;

  async CaptureImage(sourceType: PictureSourceType) {
    try {
      const options: CameraOptions = {
        quality: 60,
        sourceType: sourceType,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE
      };
        const encode_img = await this.camera.getPicture(options);
        this.commonService.showLoader("Please wait")
        this.title_url = encode_img.startsWith('data:image/jpeg;base64,') ? encode_img: `data:image/jpeg;base64,${encode_img}`;
        const base64Image = this.title_url;
        const image_url = this.title_url.split(/[\s/]+/);
        const image_name = image_url[image_url.length - 1];
        const parse_url = `${this.postgre_parentclub}/${image_name.charAt(0)}${image_name.charAt(1)}${this.getRandomString()}.jpeg`;
        const presigned_urls = await this.imageUploadService.getPresignedUrl(parse_url);
        console.log('presigned_urls:', presigned_urls[0].url);
        //Upload image using the presigned URL and base64 data
        const is_uploaded = await this.imageUploadService.uploadImage(presigned_urls[0].url, base64Image); 
        this.commonService.hideLoader();
        
        if(is_uploaded){
          this.inputObj.image_url = `${this.sharedService.getCloudfrontURL()}/news/${parse_url}`;
        }else{
          this.commonService.toastMessage("Error uploading image", 2500, ToastMessageType.Error);
        }
        console.log('s3 store success');
    } catch (error) {
      this.commonService.hideLoader();
      //this.commonService.toastMessage(`Error capturing image:${JSON.stringify(error)}`,3000,ToastMessageType.Error);
      console.log('Error capturing image:', JSON.stringify(error));
      //console.error('Error capturing image:', error);
      return null;
    }
    
  }


  async prepareAndUpload(){
    try{
      return new Promise(async(res,rej)=>{
        this.commonService.showLoader("Please wait")
        const base64Image = this.title_url;
        const image_url = this.title_url.split(/[\s/]+/);
        const image_name = image_url[image_url.length - 1];
        const parse_url = `${this.postgre_parentclub}/${image_name.charAt(0)}${image_name.charAt(1)}${this.getRandomString()}.jpeg`;
        const presigned_urls = await this.imageUploadService.getPresignedUrl(parse_url);
        //Upload image using the presigned URL and base64 data
        const is_uploaded = await this.imageUploadService.uploadImage(presigned_urls[0].url, base64Image); 
        this.commonService.hideLoader();
        
        if(is_uploaded){
          this.inputObj.image_url = `${this.sharedService.getCloudfrontURL()}/news/${parse_url}`;
          res(true);
        }else{
          res(false);
        }
      }) 
    }catch(err){
      this.commonService.hideLoader();
      this.commonService.toastMessage(`Error uploading image`, 2500, ToastMessageType.Error);
    }
        
  }


  //const imgUrl = "https://fastly.picsum.photos/id/14/2500/1667.jpg?hmac=ssQyTcZRRumHXVbQAVlXTx-MGBxm6NHWD3SryQ48G-o"
  async saveNewsAndPhoto() {
    try {
      this.inputObj.news_photos_postgre_fields.parentclub_id = this.postgre_parentclub;
      this.inputObj.DeviceType = this.sharedService.getPlatform() == "android" ? 1 : 2 //1-android,2-IOS
      this.inputObj.AppType = 0;
      this.inputObj.associatedActivity = this.selectedActivity;
      this.inputObj.news_photos_postgre_fields.activity_id = await this.getActivityIdsByFirebaseKeys(this.selectedActivity)
      this.inputObj.category_name = Listname.getListName();
      
      if (this.validate()) {
        this.commonService.showLoader("Please wait");
        //if(await this.prepareAndUpload()){
          const addVideos = gql`
          mutation saveNewsAndPhoto($photosData: NewsAndPhotoInput!){
           saveNewsAndPhoto(photosData: $photosData){
            id
           }
         }`;
         const mutationVariable = { photosData: this.inputObj }
         this.graphqlService.mutate(
           addVideos,
           mutationVariable,
           0
         ).subscribe((response) => {
          this.commonService.hideLoader();
           const message = "News saved successfully";
           this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
           this.commonService.updateCategory("refresh_news");
           this.navCtrl.pop();
         }, (err) => {
          this.commonService.hideLoader();
           // this.commonService.toastMessage("video creation  failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
           console.error("GraphQL mutation error:", err);
           if (err.error && err.error.errors) {
             const errorMessage = err.error.errors[0].message;
             this.commonService.toastMessage(errorMessage, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
           } else {
             this.commonService.toastMessage(`video creation failed:${JSON.stringify(err)}`, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
           }
         });
        //}
        // else{
        //   this.commonService.toastMessage("Image upload failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        // }
        
      }
    } catch (err) {
      console.error(err)
    }
  }


  presentActionSheet(index, image) {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Modify Photo',
      buttons: [
        {
          text: 'Remove',
          handler: () => {
            UploadImage.removeImage(index);
            this.getPhotoList();
            this.fb.deletePhoto(image, 'notTiTle')
          }
        }, {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
  }
  validate() {
    if (this.inputObj.image_title == "") {
      this.commonService.toastMessage('Please enter title', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      return false;
    }
    // else if (this.TitleUrl == "" || this.TitleUrl == undefined) {
    //   this.commonService.toastMessage('Please upload an image', 2000, ToastMessageType.Error, ToastPlacement.Bottom);
    //   return false;
    // }

    else {
      return true;
    }
  }
  focusedOnTextArea() {
    console.log("asdfsdf");
    let modal = this.modalCtrl.create("TextareamodalcontrollerPage", { callback: this.getData1, Description: this.inputObj.image_description });
    modal.present();

  }

  

  getData1 = data => {
    return new Promise((resolve, reject) => {
      this.inputObj.image_description = data;
      resolve('')

    });
  };


  



  getActivityIdsByFirebaseKeys(activity_ids): Promise<any> {
    return new Promise((res, rej) => {
      const activity_query = gql`
      query getActivityByFirebaseIds($activityIds: [String!]) {
        getActivityByFirebaseIds(activityIds: $activityIds){
          Id
          FirebaseActivityKey
          ActivityCode
          ActivityName
        }  
      }`
      const activity_query_variables = { activityIds: activity_ids };
      this.graphqlService.query(
        activity_query,
        activity_query_variables,
        0
      ).subscribe((response) => {
        res(response.data["getActivityByFirebaseIds"][0]["Id"]);
      }, (err) => {
        rej(err);
      });
    })
  }

  getRandomString() {
    return this.commonService.randomString(6, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ')
  }


}
//{parentclubkey}/<file_name>.jpg

//<parentclub>/<newsId>/<photo_name>.jpg

// this.camera.getPicture(options).then(async(ImageData)=>{
//   console.log(ImageData);
//   let base64 = "data:image/jpeg;base64" + ImageData;
//   let url = `${this.postgre_parentclub}/${base64}.jpg`
//   let imgUrl=await this.getSignedUrl(url);
//   var realFile = this.base64ToArrayBuffer(ImageData);
//   const headers = { 'Content-Type': 'image/jpeg' }
//   this.http.put(url,realFile,{headers}).subscribe(data => {
//       console.log("uploaded images are:",data);
//  }, err => {
//      alert(err);
//  })
//  })
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ActionSheetController, ToastController, LoadingController, Thumbnail } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import { UploadImage, Category, Listname, Image, ImageFormat } from '../../Model/ImageSection';
import { FirebaseService } from '../../../services/firebase.service';
import { Camera, PictureSourceType, CameraOptions } from '@ionic-native/camera';
import { NewsAndPhotoResult, NewsImageInput, UpdateNewsAndPhotoInput, UpdateNewsImageInput } from './input_output_model/news_photos.dto';
import { GraphqlService } from '../../../services/graphql.service';
import gql from 'graphql-tag';
import { HttpClient } from '@angular/common/http';
import { SharedServices } from '../../services/sharedservice';
import { IActivityDetails } from '../../../shared/model/activity.model';
import { ImageUploadService } from './imageupload.service';


/**
 * Generated class for the EditeventandnewsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-editeventandnews',
  templateUrl: 'editeventandnews.html',
})
export class EditeventandnewsPage {
  ImageObj: NewsAndPhotoResult;
  photoList: any = "";
  category = new Category();
  activityList:IActivityDetails[] = [];
  selectedActivity: any = "";
  img: any = new Image();
  loading: any;
  ImageObjBackUp: any;
  title_url: string;
  activityKey: string
  inputObj: UpdateNewsAndPhotoInput = {
    id: '',
    news_photos_postgre_fields: {
      parentclub_id: '',
      activity_id: ''
    },
    category_name: '',
    image_caption: '',
    image_description: '',
    image_tag: '',
    image_title: '',
    image_url: '',
    is_show_applus: false,
    is_show_member: false,
    is_headLine: false,
    is_enable: false,
    associatedActivity: '',
    photos: []
  }

  newsImageInput: UpdateNewsImageInput;
  constructor(public toastCtrl: ToastController,
    private sharedService: SharedServices, public http: HttpClient,
     private camera: Camera, private graphqlService: GraphqlService,
    public loadingCtrl: LoadingController, public fb: FirebaseService, 
    private imageUploadService: ImageUploadService, 
    public actionSheetCtrl: ActionSheetController, public modalCtrl: ModalController,
     public commonService: CommonService, public navCtrl: NavController, public navParams: NavParams) {

    this.ImageObj = this.navParams.get('imgInfo');
    this.ImageObjBackUp = JSON.parse(JSON.stringify(this.ImageObj))
    console.log("imgInfo", this.ImageObjBackUp)
    UploadImage.resetImageList();
    for (let i = 0; i < this.ImageObj.images.length; i++) {
      //UploadImage.setImage(this.ImageObj.images[i])
    }
    // if (this.ImageObj.OtherImages != undefined) {
    //   if (this.ImageObj.OtherImages.length == undefined) {
    //     this.ImageObj.OtherImages = this.commonService.convertFbObjectToArray(this.ImageObj.OtherImages);
    //   }
    //   if (!(this.ImageObj.OtherImages.length == undefined)) {
    //     for (let i = 0; i < this.ImageObj.OtherImages.length; i++) {
    //       UploadImage.setImage(this.ImageObj.OtherImages[i]);
    //     }
    //   }
    // }
    this.getActivityList();
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
            this.selectedActivity = this.ImageObj.Activity.FirebaseActivityKey;
            Listname.setListName(this.ImageObj.category_name);
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


  focusedOnTextArea() {
    console.log("asdfsdf");
    let modal = this.modalCtrl.create("TextareamodalcontrollerPage", { callback: this.getData1, Description: this.ImageObj.image_description });
    modal.present();
  }
  getData1 = data => {
    return new Promise((resolve, reject) => {
      // resolve();
      this.ImageObj.image_description = data;
      resolve('')
    });
  };
  // checkInclusion(word: string): boolean {
  //   let x: boolean = false;
  //   for (let i = 0; i < this.activityList.length; i++) {
  //     if (this.activityList[i].ActivityKey.trim().toLowerCase() == word.trim().toLowerCase()) {
  //       x = true;
  //       break;
  //     } else {
  //       x = false;
  //     }
  //   }
  //   return x;
  // }
  getPhotoList() {
    this.photoList = UploadImage.getImage();
    return this.photoList;
  }
  presentUploadModal() {
    this.navCtrl.push("AddMorePhotosPage", { callback: this.handleImageData.bind(this),extra_images:this.ImageObj.images.length > 0 ? this.ImageObj.images:[] })
    // let profileModal = this.modalCtrl.create('ImageuploadmodalPage');
    // profileModal.present();
  }

  handleImageData(data) {
    // Do whatever operation you want with the received data
    console.log('Received image data:', data);
    // For example, you can update your ImageObj with the received data
    if(Object.values(data).length > 0){
      this.newsImageInput = new UpdateNewsImageInput();
      this.newsImageInput.id = this.ImageObj.images.length > 0 ? this.ImageObj.images[0].id : "";
      this.newsImageInput.image_url = data.imageUrl;
      this.newsImageInput.image_caption = data.caption;
      this.newsImageInput.image_description = data.description;
      this.inputObj.photos.push(this.newsImageInput);
    }
    
  }

  presentProfileModal() {
    let profileModal = this.modalCtrl.create('ActivitymodalPage', {
      act: this.category
    });
    profileModal.present();
    //this.navCtrl.push('ActivitymodalPage');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditeventandnewsPage');
  }
  getCategory(): string {
    return Listname.getListName();
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
  ionViewWillLeave() {
    //UploadImage.resetImageList();
  }

  SelectProfImg() {
    const actionSheet = this.actionSheetCtrl.create({
      //header: 'Choose File',
      buttons: [{
        text: 'Camera',
        role: 'destructive',
        icon: 'ios-camera',
        handler: () => {
          console.log('clicked');
          this.CaptureImage(this.camera.PictureSourceType.CAMERA);
        }
      }, {
        text: 'Gallery',
        icon: 'ios-image',
        handler: () => {
          console.log('Share clicked');
          this.CaptureImage(this.camera.PictureSourceType.PHOTOLIBRARY);
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
  async CaptureImage(sourceType: PictureSourceType) {
    try {
      const options: CameraOptions = {
        quality: 60,
        sourceType: sourceType,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE
      }
      
      this.camera.getPicture(options).then((data) => {
        this.title_url = "data:image/jpeg;base64," + data;
        console.log(1)
      });
    } catch (e) {
      console.log(e.message);
      let message = "Image capture failed";
      this.commonService.toastMessage(message,2500,ToastMessageType.Error);
    }
  }

  
  
  cancel() {
    this.navCtrl.pop();
  }
  onActivityChange() {
    // Update selectedActivity when the user selects a different activity
    console.log("changes activity", this.selectedActivity)
    // this.activityList.find(
  }

  validate() {
    if (this.ImageObj.image_title == "") {
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

  async prepareAndUpload(){
    try{
      return new Promise(async(res,rej)=>{
        let is_uploaded:boolean = false
        try{
          this.commonService.showLoader("Please wait")
          if(this.title_url!=undefined){
            const base64Image = this.title_url;
            const image_url = this.title_url.split(/[\s/]+/);
            const image_name = image_url[image_url.length - 1];
            
            const parse_url = `${this.sharedService.getPostgreParentClubId()}/${image_name.charAt(0)}${image_name.charAt(1)}${this.commonService.randomString(6, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ')}.jpeg`;
            const presigned_urls = await this.imageUploadService.getPresignedUrl(parse_url);
            //Upload image using the presigned URL and base64 data
            is_uploaded = await this.imageUploadService.uploadImage(presigned_urls[0].url, base64Image); 
            this.inputObj.image_url = `https://d1ybtjfafmsyx2.cloudfront.net/news/${parse_url}`;
            this.commonService.hideLoader();
          }else{
            this.commonService.hideLoader();
            is_uploaded = true
            this.inputObj.image_url = this.ImageObj.image_url;
          }
          if(is_uploaded){
            res(true);
          }else{
            res(false);
          }
        }catch(err){
          this.commonService.hideLoader();
          this.commonService.toastMessage(`Error uploading image:${JSON.stringify(err)}`, 2500, ToastMessageType.Error);
        }
        
      }) 
    }catch(err){
      this.commonService.hideLoader();
      this.commonService.toastMessage(`Error uploading image:${JSON.stringify(err)}`, 2500, ToastMessageType.Error);
    }
  }

  async updateNewsPhotos() {
    try {
      this.inputObj.id = this.ImageObj.id;
      this.inputObj.news_photos_postgre_fields.parentclub_id = this.ImageObj.ParentClub.Id;
      this.inputObj.news_photos_postgre_fields.activity_id = await this.getActivityIdsByFirebaseKeys(this.selectedActivity);
      this.inputObj.is_headLine = this.ImageObj.is_headline
      this.inputObj.is_enable = this.ImageObj.is_enable
      this.inputObj.image_caption = this.ImageObj.image_caption
      this.inputObj.image_description = this.ImageObj.image_description;
      this.inputObj.image_tag = this.ImageObj.image_tag;
      this.inputObj.image_title = this.ImageObj.image_title;
      //this.newsImageInput.id = this.ImageObj.images[0].id;
      //this.inputObj.photos.push(this.newsImageInput);
      this.inputObj.is_show_applus = this.ImageObj.is_show_applus;
      this.inputObj.associatedActivity = this.ImageObj.associated_activity;
      this.inputObj.category_name = Listname.getListName();
      //alert(`giving data to update:${JSON.stringify(this.inputObj)}`);
    if(this.validate()) {
      if(await this.prepareAndUpload()){
        const updateNewsPhotos = gql`
        mutation updateNewsPhotos($updateNewsPhotos:UpdateNewsAndPhotoInput!){
          updateNewsPhotos(updateNewsPhotos:$updateNewsPhotos){
            id
          }
        }`;
        const mutationVariable = { updateNewsPhotos: this.inputObj }
        this.graphqlService.mutate(
          updateNewsPhotos,
          mutationVariable,
          0
        ).subscribe((response) => {
          const message = "Successfully updated";
          this.commonService.toastMessage(message, 2500, ToastMessageType.Success, ToastPlacement.Bottom);
          this.commonService.updateCategory("refresh_news");
          this.navCtrl.pop();
        }, (err) => {
          //  this.commonService.toastMessage("video creation  failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          console.error("GraphQL mutation error:", err);
          if (err.error && err.error.errors) {
            const errorMessage = err.error.errors[0].message;
            this.commonService.toastMessage(errorMessage, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          } else {
            this.commonService.toastMessage("Updation failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          }
        });
      }else{
        this.commonService.toastMessage("Image upload failed:", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
    }
  } catch (error) {
    console.error("Error uploading images:", error);
    this.commonService.toastMessage(`Image upload failed:${JSON.stringify(error)}`, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    return; // Abort mutation if image upload fails
  }


  }
  

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


  

}

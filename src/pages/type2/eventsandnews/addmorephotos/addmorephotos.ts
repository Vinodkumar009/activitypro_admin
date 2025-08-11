
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController, ActionSheetController } from 'ionic-angular';
import { ImageFormat, UploadImage } from '../../../Model/ImageSection';
import { File } from '@ionic-native/file';
import { Storage } from '@ionic/storage';
import { Camera, PictureSourceType, CameraOptions } from '@ionic-native/camera';
import { FirebaseService } from '../../../../services/firebase.service';
import { CommonService, ToastMessageType } from '../../../../services/common.service';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { SharedServices } from '../../../services/sharedservice';
import { ImageUploadService } from '../imageupload.service';

@IonicPage()
@Component({
  selector: 'page-addmorephotos',
  templateUrl: 'addmorephotos.html',
})

export class AddMorePhotosPage {
  format: any = new ImageFormat();
  loading: any;
  ParentClubKey: any;
  TitleUrl: any;
  formed_img_link:string;
  constructor(public toastCtrl: ToastController, 
    private sharedService: SharedServices, public http: HttpClient, 
    storage: Storage, public fb: FirebaseService,
     public actionSheetCtrl: ActionSheetController, 
     private camera: Camera, public loadingCtrl: LoadingController, 
     public navCtrl: NavController,
      public navParams: NavParams,
      private commonService: CommonService,
      private imageUploadService: ImageUploadService,
    ) {
      
      const extra_imgs = this.navParams.get("extra_images");
      if(extra_imgs && extra_imgs.length > 0){
        this.format.ImageCaption = extra_imgs[0].image_caption;
        this.format.ImageDescription = extra_imgs[0].image_description;
        this.format.ImageURL = extra_imgs[0].image_url;
        //this.TitleUrl = extra_imgs[0].image_url;
      }
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.ParentClubKey = val.UserInfo[0].ParentClubKey;
      }
    });

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ImageuploadmodalPage');
  }
  validate() {
    if (this.TitleUrl == "") {
      this.commonService.toastMessage("Upload an image",2500,ToastMessageType.Error);
      return false;
    }
    // else if (this.format.ImageDescription == "") {
    //   this.showToast("Enter Description");
    //   return false;
    // }
    else {
      return true;
    }
  }

  async prepareAndUpload(){
    // try{
    //   return new Promise(async(res,rej)=>{
        
    //     this.commonService.showLoader("Please wait")
    //     const base64Image = this.TitleUrl;
    //     const image_url = this.TitleUrl.split(/[\s/]+/);
    //     const image_name = image_url[image_url.length - 1];
    //     this.formed_img_link = `${this.sharedService.getPostgreParentClubId()}/${image_name.charAt(0)}${image_name.charAt(1)}/${this.commonService.randomString(6, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ')}.jpeg`;
    //     const presigned_urls = await this.imageUploadService.getPresignedUrl(this.formed_img_link);
    //     //Upload image using the presigned URL and base64 data
    //     const is_uploaded = await this.imageUploadService.uploadImage(presigned_urls[0].url, base64Image); 
    //     this.commonService.hideLoader();
        
    //     if(is_uploaded){
    //       res(true);
    //     }else{
    //       res(false);
    //     }
    //   }) 
    // }catch(err){
    //   this.commonService.hideLoader();
    //   this.commonService.toastMessage(`Error while uploading image`, 2500, ToastMessageType.Error);
    // }   
    try{
      return new Promise(async(res,rej)=>{
        let is_uploaded:boolean = false
        try{
          this.commonService.showLoader("Please wait")
          if(this.TitleUrl!=undefined){
            const base64Image = this.TitleUrl;
            const image_url = this.TitleUrl.split(/[\s/]+/);
            const image_name = image_url[image_url.length - 1];
            
            const parse_url = `${this.sharedService.getPostgreParentClubId()}/${image_name.charAt(0)}${image_name.charAt(1)}${this.commonService.randomString(6, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ')}.jpeg`;
            const presigned_urls = await this.imageUploadService.getPresignedUrl(parse_url);
            //Upload image using the presigned URL and base64 data
            is_uploaded = await this.imageUploadService.uploadImage(presigned_urls[0].url, base64Image); 
            this.formed_img_link = `${this.sharedService.getCloudfrontURL()}/news/${parse_url}`;
            this.commonService.hideLoader();
          }else{
            this.commonService.hideLoader();
            is_uploaded = true
            this.formed_img_link = this.format.ImageURL;
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

  async savePic() {
    if(await this.prepareAndUpload()){
      const imageDataToSend = {
        imageUrl: this.formed_img_link, // Assuming this is the URL of the saved image
        caption: this.format.ImageCaption, // Assuming this is the caption of the image
        description: this.format.ImageDescription // Assuming this is the description of the image
      };  
      this.navigateBackWithData(imageDataToSend);
    }else{
      this.commonService.toastMessage(`Error uploading image`, 2500, ToastMessageType.Error);
    }
  }

  

  navigateBackWithData(data) {
    // Pop the current page from the navigation stack
    this.navCtrl.pop().then(() => {
      // Retrieve the callback function from NavParams and execute it with the data
      const callback = this.navParams.get('callback');
      if (callback) {
        callback(data);
      }
    });
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
          const Url = this.CaptureImage(this.camera.PictureSourceType.CAMERA);
        }
      }, {
        text: 'Gallery',
        icon: 'ios-image',
        handler: () => {
          console.log('Share clicked');
          const Url = this.CaptureImage(this.camera.PictureSourceType.PHOTOLIBRARY);
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

      const imageData = await this.camera.getPicture(options);
      this.TitleUrl = "data:image/jpeg;base64," + imageData;
      
    } catch (e) {
      console.log(e.message);
      let message = "Image capturing failed";
      this.commonService.toastMessage(message,2500,ToastMessageType.Error);
    }
  }

  updateProgImg(url: any) {
    this.format.ImageURL = url;
  }
  cancel() {
    this.navCtrl.pop();
  }
  async uploadImageFromSave() {
    return new Promise((res, rej) => {
      if (!this.format.ImageURL) {

        if (this.TitleUrl!= undefined) {
          let imgObj = {};
          console.log(2)
          imgObj["url"] = this.TitleUrl;
          imgObj["upload_type"] = 'newsandevent'
          imgObj["ImageTitle"] = this.format.ImageCaption;
          imgObj["club_name"] = this.ParentClubKey;

          this.fb.uploadPhoto(imgObj).then((url) => {
            this.updateProgImg(url);
            res(url)
          }).catch((err) => {
            rej(err)
          })
        } else {
          rej("fail")
        }
      } else {
        rej("fail")
      }
    })
  }
  
  getPresignedUrl(imageUrl: string): Promise<any[]> {
    // Implement this function to make API call to get pre-signed URL
    return new Promise((resolve, reject) => {
      this.http
        .post(
          `${this.sharedService.getPresignedURL()}`,
          {
            name: "news",
            type: "IMAGE",
            files: [imageUrl],
          }
        )
        .subscribe(
          (res: any) => {
            if (res) {
              console.log(res);
              resolve(res);
            }
          },
          (err) => {
            console.log(`signederr:${JSON.stringify(err)}`);
            reject(err);
          }
        );
    });
  }

  putUrl(presignedUrl,imageUrl): Promise<any> {
    // Implement this function to upload image using pre-signed URL
    console.log("url resource are", imageUrl, presignedUrl)

    return new Promise((resolve, reject) => {
      // Upload image using HTTP PUT request
      let headers = new HttpHeaders();
      this.http.put(presignedUrl, imageUrl, { headers: { 'Content-Type': "image/jpeg" } })
        .subscribe(
          (response) => {

            resolve(response)
          },
          (error: HttpErrorResponse) => {
            if (error.error instanceof ErrorEvent) {
              // Client-side error (e.g., network issue, CORS error)
              console.error('An error occurred on the client side:', error.error.message);
            } else {
              // Server-side error (e.g., HTTP status code 4xx or 5xx)
              console.error('An error occurred on the server side:', error.status, error.statusText);
              console.error('Server response body:', error.error);
            }
            reject(error);
          }
        );
    });
  }

}
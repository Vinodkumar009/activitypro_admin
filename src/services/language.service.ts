import { Injectable,} from "@angular/core";
import { AlertController, Events  } from 'ionic-angular';
import { Storage } from '@ionic/storage';
//import { BehaviorSubject } from 'rxjs';
import { SharedServices } from "../pages/services/sharedservice";
import { HttpService } from "./http.service";
import { API } from "../shared/constants/api_constants";
import { HttpClient } from '@angular/common/http';
@Injectable()
export class LanguageService{
    languages: Array<any> = [];
    private AllLabels:Object = {};
    nodeUrl:string="";
    //public observeableObj:BehaviorSubject<any>;
    constructor(public events: Events, private alertCtrl: AlertController,
      private sharedservice:SharedServices,private storage:Storage,
      public httpService: HttpService,
      public http: HttpClient,){
        
    this.languages = [
      
       
        { language: "Arabic(Saudi Arabia)", code: "Arabic" },
        { language: "English(UK)", code: "English(en-gb)" },
        { language: "French(Standard)", code: "french(fr)" },
        { language: "German(Standard)", code: "German(de)" },
        { language: "Italian(Standard)", code: "Italian(it)" },
        { language: "Russian(Russia)", code: "russian(ru)" },
        { language: "Spanish(Spain)", code: "Spanish(es)" },

      ]
        
        //this.observeableObj = new BehaviorSubject({});
    }

    ionViewWillEnter(){
        
    }

    setLanguageData(reqObj:any){
        this.storage.get("language").then((res)=>{
            if(res!=undefined || res!=null){
                if(res.lang == reqObj.language){

                }else{ //if the selected language not euqal to local storage persisted language then call api
                    this.storage.remove("language").then(()=>{
                        this.getLanguage(reqObj);
                    });
                }
            }else{
                this.getLanguage(reqObj);
            }
        }).catch((err)=>{
          console.log(JSON.stringify(err));
        });
    }

    getLanguage(reqObj:any){
        // this.nodeUrl = this.sharedservice.getnodeURL();
        // //https://activitypro-node.appspot.com/app/language
        this.http.post(`https://activitypro-node-admin.appspot.com/app/language`,reqObj).subscribe((res) => {
            let langObj = {};
            langObj["lang"] = reqObj.language;
            langObj["data"] = res["data"];
            this.storage.set('language',langObj).then(()=>{
              this.events.publish('language', res["data"]);
            });
            //this.observeableObj.next(res["data"]);
        }); 
        // this.httpService.post(`${API.APP_LANGUAGE}`, reqObj)
        //     .subscribe({
        //       next: (res:any) => {
        //         const langObj = {};
        //         langObj["lang"] = reqObj.language;
        //         langObj["data"] = res.data.data;
        //         this.storage.set('language',langObj).then(()=>{
        //           this.events.publish('language', res.data.data);
        //         });
        //         //this.observeableObj.next(res["data"]);   
        //       },
        //       error: (err) => {
        //         console.error("Error fetching menus:", err);
        //         //this.commonService.toastMessage("Failed to load menus",2500,ToastMessageType.Error, ToastPlacement.Bottom);
        //       }
        // });
    }


  //vinod created this for language selection starts here
  selectLanguage() {
    const alert = this.alertCtrl.create();
    alert.setTitle('Select Language');
    this.languages.forEach(language => {
      alert.addInput({
        type: 'radio',
        label: language.language,
        value: language.code
      });
    });
    alert.addButton({
      text: 'Cancel',
      role: 'cancel',
    });
    alert.addButton({
      text: 'OK',
      handler: lang => {
        console.log(lang);
        this.onlangselection(lang); 
      }
    });
    alert.present();
  }

  onlangselection(lang:string){
    let reqObj = {
      language:lang
    }
    this.setLanguageData(reqObj);
  }
}
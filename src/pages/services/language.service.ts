// import { Injectable,} from "@angular/core";
// import { AlertController, Events  } from 'ionic-angular';
// import moment, { Moment } from 'moment';
// import * as $ from 'jquery';
// import { Storage } from '@ionic/storage';
// import { Observable } from "rxjs";
// import { observeOn } from "rxjs/operator/observeOn";
// //import { BehaviorSubject } from 'rxjs';
// import { HttpClient } from '@angular/common/http';
// import { SharedServices } from "../pages/services/sharedservice";

// @Injectable()
// export class LanguageService{
//     languages: Array<any> = [];
//     private AllLabels:Object = {};
//     nodeUrl:string="";
//     //public observeableObj:BehaviorSubject<any>;
//     constructor(public events: Events, private alertCtrl: AlertController, private http:HttpClient,private sharedservice:SharedServices,private storage:Storage){
        
//     this.languages = [
      
       
//         { language: "Arabic(Saudi Arabia)", code: "Arabic" },
//         { language: "English(UK)", code: "English(en-gb)" },
//         { language: "French(Standard)", code: "french(fr)" },
//         { language: "German(Standard)", code: "German(de)" },
//         { language: "Italian(Standard)", code: "Italian(it)" },
//         { language: "Russian(Russia)", code: "russian(ru)" },
//         { language: "Spanish(Spain)", code: "Spanish(es)" },

//       ]
        
//         //this.observeableObj = new BehaviorSubject({});
//     }

//     ionViewWillEnter(){
        
//     }

//     setLanguageData(reqObj:any){
//         this.storage.get("language").then((res)=>{
//             if(res!=undefined || res!=null){
//                 if(res.lang == reqObj.language){

//                 }else{ //if the selected language not euqal to local storage persisted language then call api
//                     this.storage.remove("language").then(()=>{
//                         this.getLanguage(reqObj);
//                     });
//                 }
//             }else{
//                 this.getLanguage(reqObj);
//             }
//         }).catch((err)=>{
//           console.log(JSON.stringify(err));
//         });
//     }

//     getLanguage(reqObj:any){
//         this.nodeUrl = this.sharedservice.getnodeURL();
//         //https://activitypro-node.appspot.com/app/language
//         this.http.post(`https://activitypro-node.appspot.com/app/language`,reqObj).subscribe((res) => {
//             let langObj = {};
//             langObj["lang"] = reqObj.language;
//             langObj["data"] = res["data"];
//             this.storage.set('language',langObj).then(()=>{
//               this.events.publish('language', res["data"]);
//             });
//             //this.observeableObj.next(res["data"]);
//         }); 
//     }


//   //vinod created this for language selection starts here
//   selectLanguage() {
//     const alert = this.alertCtrl.create();
//     alert.setTitle('Select Language');
//     this.languages.forEach(language => {
//       alert.addInput({
//         type: 'radio',
//         label: language.language,
//         value: language.code
//       });
//     });
//     alert.addButton({
//       text: 'Cancel',
//       role: 'cancel',
//     });
//     alert.addButton({
//       text: 'OK',
//       handler: lang => {
//         console.log(lang);
//         this.onlangselection(lang); 
//       }
//     });
//     alert.present();
//   }

//   onlangselection(lang:string){
//     let reqObj = {
//       language:lang
//     }
//     this.setLanguageData(reqObj);
//   }
// }
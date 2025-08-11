import { Injectable } from "@angular/core";
import { AngularFireDatabase } from 'angularfire2/database';
import 'rxjs/Observable';
// import 'rxjs';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import * as $ from 'jquery';
import { User } from "firebase";

@Injectable()
export class FirebaseService {
  public db: any;
  public storage: any;
  public fireAuth: any;
  public userProfile: any;

  //sizeSubject: Subject<any>;
  constructor(public _data: AngularFireDatabase, private http: HttpClient, ) {

    this.db = firebase.database().ref('/');
    this.storage = firebase.storage().ref('/');

  }

  // createUserWithEmailAndPassword(_email:string, _password:string){
  //    return this._data.auth.createUser(
  //         {
  //             email:_email,
  //             password:_password
  //         }).then(
  //             (success)=>{
  //                 console.log(success);
  //             }
  //         ).catch(
  //             (error)=>{
  //                 console.log(error);
  //             }
  //         );
  // }

  // signInWithGoogle(){
  //    // console.log('Google sign-in')
  //     return this.auth.login(this.getProvider('google'))
  //     /*.then((value) => {
  //             console.log("Success");
  //             console.log(value);
  //         }).catch((error) => {
  //             console.log("Failure");
  //             console.log(error);
  //         });*/

  //     //return this._data.auth.login();
  // }

  // signInWithEmailAndPassword(_email:string, _password:string){
  //     return this._data.auth.login( {email:_email, password:_password},this.getProvider('custom') );        
  // }

  // getCurrentUser(){
  //     return this._data.auth.getAuth().auth;
  // }

  // getProvider(from: string) 
  // {
  //     switch (from) {          
  //         case 'custom': 
  //         return {
  //             provider: AuthProviders.Password,
  //             method: AuthMethods.Password
  //             };

  //         case 'twitter': 
  //         return {
  //             provider: AuthProviders.Twitter,
  //             method: AuthMethods.Popup
  //             };
  //         case 'facebook': return {
  //             provider: AuthProviders.Facebook,
  //             method: AuthMethods.Popup
  //             };
  //         case 'github': return {
  //             provider: AuthProviders.Github,
  //             method: AuthMethods.Popup
  //             };
  //         case 'google': return {
  //             provider: AuthProviders.Google,
  //             method: AuthMethods.Popup
  //             };
  //     }
  // }    

  // getAll(tableName:string): Observable<any[]> {      
  //     return this._data.database.list('/'+tableName);
  // } 

  // getAllWithQuery(tableName: string, query: string): Observable<any[]> {
  //     //  firebase.database().ref('user-posts/' + myUserId)
  //     console.log(this._data.database.list('/' + tableName, query));
  //     //         return this._data.database.list('/'+tableName,{
  //     //   query: {
  //     //     orderByChild: 'ParentClubID',
  //     //     equalTo: '100001' 
  //     //   }
  //     // });
  //     return this._data.database.list('/' + tableName);
  //     //const queryObservable = this._data.database.list('/'+tableName, {
  //     //query: {
  //     // orderByChild: 'ContactName'
  //     // }
  //     //});

  //     // subscribe to changes
  //     //queryObservable.subscribe(queriedItems => {
  //     // console.log(queriedItems);  
  //     // return queriedItems;
  //     //});
  //     //       return  this._data.database.list('/'+tableName,query: {
  //     //     orderByChild: 'size',
  //     //     equalTo: subject 
  //     //   }).subscribe(queriedItems => {
  //     //   console.log(queriedItems);  
  //     // });

  // }

  // save(tableName:string,data:any) {      
  //   return this._data.database.child.('/'+tableName).push(data);
  // } 
  async getData(path) {
    return new Promise((res, rej) => {
      const ref = this.db.child(path);
      ref.once(
        'value',
        function(snapshot:any) {
          ref.off();
          const resObj = {$key:snapshot.key,...snapshot.val()}
          res(resObj);
        },
        function(errorObject) {
          ref.off();
          rej(errorObject);
        },
      );
    });
  }

  getAll(tableName: string): Observable<any[]> {
    return this._data.list('/' + tableName).snapshotChanges().map(action => {
      const data = [];
      for (let i = 0; i < action.length; i++) {
        const $key = action[i].payload.key;
        data.push({ $key, ...action[i].payload.val() });
      }
      return data;
    });
  }
  public save(data: any, child: string): Promise<any> {
    let dbRef = this.db.child(child);
    return dbRef.push(data).key;
  }

  //reading a property from a database
  getPropValue(path) {
    return new Promise((res, rej) => {
        const ref = this.db.child(path);
        ref.on("value", function(snapshot) {
            ref.off();
            res(snapshot.val());
        }, function(errorObject) {
            ref.off();
            res(null); 
        });
         
    });
}

  public saveReturningKey(child: string, data: any): Promise<any> {
    let dbRef = this.db.child(child);
    return dbRef.push(data).key;
  }
  public saveAndReturnData(child: string, data: any): Promise<any> {
    let dbRef = this.db.child(child);
    return dbRef.push(data);
  }
  public update(id: string, child: string, data: any): Promise<any> {
    let dbRef = this.db.child(child);
    return dbRef.child(id).update(data)
      .then(response => response)
      .catch("");
  }

  getActiveData(path: string,property:string) {
    return new Promise((res, rej) => {
        //const keyNames = Object.keys(queryObj);
        const today = new Date().toISOString().slice(0, 10); // Get the current date in YYYY-MM-DD format
        const ref = this.db.child(path).orderByChild('property').startAt(today);
        ref.once("value", function(snapshot) {
            ref.off();
            res(snapshot.val());
        }, function(errorObject) {
            ref.off();
            rej(errorObject.code); 
        });
    });
  }

  public deleteFromFb(child: string): Promise<any> {
    let dbRef = this.db.child(child);
    return dbRef.remove();
  }

   uploadPhoto(imgdata: any) {
    return new Promise((resolve, reject) => {
      console.log(`base64: ${JSON.stringify(imgdata.url)}`);
      const cleanedBase64 = imgdata.url.startsWith('data:image/jpeg;base64,') ? imgdata.url : `data:image/jpeg;base64,${imgdata.url}`;
      console.log(`clean base64: ${JSON.stringify(cleanedBase64)}`);
      if (imgdata.upload_type == 'coach') {
        this.storage = firebase.storage().ref("/ActivityPro/AllCoachImages");
        this.storage.child(imgdata["club_name"] + imgdata["coach_name"] + new Date().getTime()).putString(cleanedBase64, 'data_url')
          .then((savedPicture) => {
            resolve(savedPicture.downloadURL);
          }).catch((err: any) => {
            console.log(`profile update in service:${JSON.stringify(err)}`)
            reject(err);
          });
      }
      else if (imgdata.upload_type == 'tips') {
        this.storage = firebase.storage().ref("/Apkids/Tips");
        console.log(JSON.stringify(imgdata));
        this.storage.child(imgdata["club_name"] +"-"+ imgdata["ImageTitle"] + new Date().getTime()).putString(cleanedBase64, 'data_url')
          .then((savedPicture) => {
            resolve(savedPicture.downloadURL);
          }).catch((err: any) => {
            reject(err);
          });
      }
      else if (imgdata.upload_type == 'newsandevent') {
        this.storage = firebase.storage().ref("/ActivityPro/AllNewsAndEventPhotos");
        console.log(JSON.stringify(imgdata));
        this.storage.child(imgdata["club_name"] + new Date().getTime()).putString(cleanedBase64, 'data_url')
          .then((savedPicture) => {
            resolve(savedPicture.downloadURL);
          }).catch((err: any) => {
            reject(err);
          });
      } else if (imgdata.upload_type == 'events') {
        this.storage = firebase.storage().ref("/ActivityPro/Events");
        console.log(JSON.stringify(imgdata));
        this.storage.child(imgdata["club_name"] + new Date().getTime()).putString(cleanedBase64, 'data_url')
          .then((savedPicture) => {
            resolve(savedPicture.downloadURL);
          }).catch((err: any) => {
            reject(err);
          });
      }else if (imgdata.upload_type == 'apkids') {
        this.storage = firebase.storage().ref("/Apkids/Challenges");
        console.log(JSON.stringify(imgdata));
        this.storage.child(imgdata["club_name"] + new Date().getTime()).putString(cleanedBase64, 'data_url')
          .then((savedPicture) => {
            resolve(savedPicture.downloadURL);
          }).catch((err: any) => {
            reject(err);
          });
      } else if (imgdata.upload_type == "applandingimage") {
        //the below one targeting to europe storage bucket
        //this.storage = firebase.storage().ref("gs://activityprouk-b5815") ;
        this.storage = firebase.storage().ref("/AppLandingImages");
        console.log(JSON.stringify(imgdata));
        this.storage.child(imgdata["app_name"] + "_LandingImg").putString(cleanedBase64, 'data_url')
          .then((savedPicture) => {
            resolve(savedPicture.downloadURL);
          }).catch((err: any) => {
            reject(err);
          });
      }
      else if (imgdata.upload_type == "eventpolicy") {
        this.storage = firebase.storage().ref("/ActivityPro/Events");
        console.log(JSON.stringify(imgdata));
        this.storage.child(imgdata["club_name"] + new Date().getTime()).putString(cleanedBase64, 'data_url')
          .then((savedPicture) => {
            resolve(savedPicture.downloadURL);
          }).catch((err: any) => {
            reject(err);
          });
      }
      else {
        this.storage = firebase.storage().ref("/ActivityPro/AllPromotionImages");
        console.log(JSON.stringify(imgdata));
        this.storage.child(imgdata["Parentclub_name"] + new Date().getTime()).putString(cleanedBase64, 'data_url')
          .then((savedPicture) => {
            resolve(savedPicture.downloadURL);
          }).catch((err: any) => {
            reject(err);
          });
      }


    });
  }

  //Deliting firebase storage file using donloaded url
  DeleteFileByRefUrl(imgdata: any) {
    return new Promise((resolve, reject) => {
      if (imgdata.upload_type == 'eventpolicy') {
        this.storage = firebase.storage().refFromURL(imgdata.url).delete().then((suc) => {
          resolve('success');
        }).catch((err) => {
          reject(err)
        })
      }
    })
  }

  deletePhoto(imgdata: any, condition) {
    return new Promise((resolve, reject) => {
      this.storage = firebase.storage().ref("/ActivityPro/AllNewsAndEventPhotos");
      let path = imgdata.ImageURL.split("%2F")[2].split("?")[0];
      if (condition = "onlyTitleImage") {

        this.storage.child(path).delete().then((success) => {
          resolve('success')
        }).catch((err) => {
          reject(err)
        })

      } else if (condition == 'promotion') {
        this.storage = firebase.storage().ref("/ActivityPro/AllPromotionImages");
        let path = imgdata.ImagePath.split("%2F")[2].split("?")[0];


        this.storage.child(path).delete().then((success) => {
          resolve('success')


        }).catch((err) => {
          reject(err)
        })
      }
      else {

        this.storage.child(path).delete().then((success) => {
          if (imgdata.OtherImages) {
            let otherImagePath = imgdata.OtherImages.ImageURL.split("%2F")[2].split("?")[0];
            this.storage.child(otherImagePath).delete().then((success) => {
              resolve('success')
            }).catch((err) => {
              reject(err)
            })
          } else {
            resolve('success')
          }

        }).catch((err) => {
          reject(err)
        })
      }


    })
  }

  getAllWithQuery(tableName: string, query: Object): Observable<any[]> {

    return this._data.list("/" + tableName, ref => {


      let keyNames = Object.keys(query);
      if (keyNames.length == 1) {
        if (keyNames[0] == "orderByKey") {
          return ref[keyNames[0]]();
        } else {
          return ref[keyNames[0]](query[keyNames[0]]);
        }
      }
      else if (keyNames.length == 2) {

        if (keyNames[0] == "orderByKey") {
          return ref[keyNames[0]]()[keyNames[1]](query[keyNames[1]]);
        }
        else if (keyNames[1] == "orderByKey") {
          return ref[keyNames[0]](query[keyNames[0]])[keyNames[1]]();
        } else {
          return ref[keyNames[0]](query[keyNames[0]])[keyNames[1]](query[keyNames[1]]);
        }
      }
      else if (keyNames.length == 3) {

        if (keyNames[0] == "orderByKey") {
          return ref[keyNames[0]]()[keyNames[1]](query[keyNames[1]])[keyNames[2]](query[keyNames[2]]);
        } else if (keyNames[1] == "orderByKey") {
          return ref[keyNames[0]](query[keyNames[0]])[keyNames[1]]()[keyNames[2]](query[keyNames[2]]);
        } else if (keyNames[2] == "orderByKey") {
          return ref[keyNames[0]](query[keyNames[0]])[keyNames[1]](query[keyNames[1]])[keyNames[2]]();
        }
        else {
          return ref[keyNames[0]](query[keyNames[0]])[keyNames[1]](query[keyNames[1]])[keyNames[2]](query[keyNames[2]]);
        }

      } else if (keyNames.length == 4) {
        //return ref[keyNames[0]](query[keyNames[0]])[keyNames[1]](query[keyNames[1]])[keyNames[2]](query[keyNames[2]])[keyNames[3]](query[keyNames[3]]);

        if (keyNames[0] == "orderByKey") {
          return ref[keyNames[0]]()[keyNames[1]](query[keyNames[1]])[keyNames[2]](query[keyNames[2]])[keyNames[3]](query[keyNames[3]]);
        } else if (keyNames[1] == "orderByKey") {
          return ref[keyNames[0]](query[keyNames[0]])[keyNames[1]]()[keyNames[2]](query[keyNames[2]])[keyNames[3]](query[keyNames[3]]);
        } else if (keyNames[2] == "orderByKey") {
          return ref[keyNames[0]](query[keyNames[0]])[keyNames[1]](query[keyNames[1]])[keyNames[2]]()[keyNames[3]](query[keyNames[3]]);
        }
        else if (keyNames[3] == "orderByKey") {
          return ref[keyNames[0]](query[keyNames[0]])[keyNames[1]](query[keyNames[1]])[keyNames[2]]()[keyNames[3]](query[keyNames[3]]);
        }
        else {
          return ref[keyNames[0]](query[keyNames[0]])[keyNames[1]](query[keyNames[1]])[keyNames[2]](query[keyNames[2]])[keyNames[3]](query[keyNames[3]]);
        }

      }
    }).snapshotChanges().map(action => {
      const data = [];
      for (let i = 0; i < action.length; i++) {
        const $key = action[i].payload.key;
        data.push({ $key, ...action[i].payload.val() });
      }
      return data;
    });
  }  

  // ref.startAt("Brahmaa","FirstName").orderByChild("FirstName")
  getFilterValue(path: string, PropertyName: string): Observable<any[]> {
    return this._data.list(path, ref => ref.orderByChild(PropertyName)).snapshotChanges().map(action => {
      const data = [];
      for (let i = 0; i < action.length; i++) {
        const $key = action[i].payload.key;
        data.push({ $key, ...action[i].payload.val() });
      }
      return data;
    });
  }

  getPropertyValue(path: string, PropertyName: string): Observable<any[]> {
    return this._data.list(path).snapshotChanges().map(dataObj => {
      let PropertyValue = null;
      dataObj.forEach((eachProperty: any) => {
        if (eachProperty.key == PropertyName) {
          PropertyValue = eachProperty.payload.node_.value_;
        }
      });
      return PropertyValue;
    });
  }


  //call to notification api 


  CallToApiForNotification(notificationObj: { URL: string, DeviceTokens: any[], Message: string, Subject: string, ParentclubKey: string }) {

    $.ajax({
      url: notificationObj.URL + "umbraco/surface/ActivityProSurface/CreatePlatformEndpointAndPushNotification/",
      data: {
        MembersTokenDetails: notificationObj.DeviceTokens,
        Message: notificationObj.Message,
        Subject: notificationObj.Subject,
        ParentclubKey: notificationObj.ParentclubKey
      },
      type: "POST",
      success: function (response) {
      }, error: function (error, xhr) {


      }
    });
  }

  $post(url: string, model: any, options?: any) {
    // console.log(`${url}`);
    // console.log(`${JSON.stringify(model)}`);
    return Observable.create((observer) => {
      let body = model;
      options = this.prepareOptions(options);
      this.http.post(url, body)
        //.pipe(map(response => response))
        .subscribe((res) => {
          observer.next(res);
        }, (error) => {
          observer.error(error)
        },
          () => {
            observer.complete()
          });
    });
  }

  //perparing options for Http request
  private prepareOptions(options: any) {
    //let token = localStorage.getItem('user_auth_token');
    options = options || {};
    if (!options.headers) {
      options.headers = new Headers();
    }
    // if (token) {
    //     options.headers.append('Authorization', 'Bearer ' + token);
    // }
    options.headers.append('Access-Control-Allow-Origin', '*');
    options.headers.append('Content-Type', 'application/json');
    options.headers.append('Accept', 'application/json');
    return options;
  }

  async loginToFirebaseAuth(){
    return await firebase.auth().signInAnonymously();
  }

  async getCurrentUser():Promise<User>
  {
    return await firebase.auth().currentUser;
  }



}
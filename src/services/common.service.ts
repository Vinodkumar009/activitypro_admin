import { Injectable } from "@angular/core";
import moment, { Moment } from "moment";
import {
  NavController,
  AlertController,
  LoadingController,
  ActionSheetController,
} from "ionic-angular";
import { ToastController } from "ionic-angular";
import { Storage } from "@ionic/storage";
import { GoogleAnalytics } from "@ionic-native/google-analytics";
import * as $ from "jquery";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Apollo, QueryRef } from "apollo-angular";
import gql from "graphql-tag";
import { SharedServices } from "../pages/services/sharedservice";
import { BehaviorSubject } from "rxjs";
import { DomSanitizer } from '@angular/platform-browser';
@Injectable()
export class CommonService {
  loader: any;
  safeImage: any;
  public category: BehaviorSubject<string> = new BehaviorSubject<string>("");
  constructor(
    private sharedService: SharedServices,
    private ga: GoogleAnalytics,
    public loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public storage: Storage,
    public httpService: HttpClient,
    private apollo: Apollo,
    private sanitizer: DomSanitizer,
    private actionSheetCtrl: ActionSheetController,
    
  ) {}
  public navCtrl: NavController;
  //<Summary>
  //
  // sort the array of object according properties name (If Property is string)
  //if property is number it will return the array in descending order
  //
  //</summary>

  updateCategory(updatedCategory: string) {
    this.category.next(updatedCategory);
  }

  getAgeFromYYYY_MM(date) {
    if(date && date!==''){
      let dob = moment(date, "YYYY-MM");
      let present = moment(new Date()).format("YYYY-MM");
      return moment(present, "YYYY-MM").diff(moment(dob, "YYYY-MM"), "years");
    }else{
      return 0;
    }
  }

  calculateAgeFromDOB(dob: string): string {
    // Regular expression to match "YYYY-MM" format
    const dobDate = new Date(dob);

    if (!isNaN(dobDate.getTime())) {
        const currentDate = new Date();
        let age = currentDate.getFullYear() - dobDate.getFullYear();

        // Adjust age if the current month is before the birth month or if it's the birth month but before the birth day
        if (
            currentDate.getMonth() < dobDate.getMonth() ||
            (currentDate.getMonth() === dobDate.getMonth() && currentDate.getDate() < dobDate.getDate())
        ) {
            age--;
        }

        if(age <= 0){
          return "N.A";
        } else{
          return age.toString();
        }
    } else {
        //console.error("Invalid date format or value for DOB");
        return "N.A";
    }
  }  
 

  validateNumber(input: any) {
    ///^[-+]?[0-9]+\.[0-9]+$/;
    var re: any = /^[0-9]+\.[0-9]+$/;
    console.log(input);
    if (!re.test(input)) {
      return false;
    }
  }

  public sortingObjects(data: Array<object>, propname: string,order_type?: number): Array<object> {
    let tempArray = data;
    let sortedArray = [];
    let iteration = data.length;
    for (let j = 0; j < iteration; j++) {
      if (data.length > 1) {
        let smallValueIndex = 0;
        let str1 = data[0][propname];
        let str2 = data[1][propname];
        //if the property value string
        if (isNaN(str1) && isNaN(str2)) {
          for (let i = 1; i < tempArray.length; i++) {
            let result = str1.localeCompare(str2);
            if (i != tempArray.length - 1) {
              if (result > 0) {
                smallValueIndex = i;
                str1 = str2;
                str2 = tempArray[i + 1][propname];
              } else {
                str2 = tempArray[i + 1][propname];
              }
            } else {
              if (result > 0) {
                smallValueIndex = i;
              }
            }
          }
        }
        //if property valuy number
        else {
          for (let i = 1; i < tempArray.length; i++) {
            let result = str1 > str2;
            if (i != tempArray.length - 1) {
              if ((order_type === 1 && result) || (order_type !== 1 && !result)) {
                smallValueIndex = i;
                str1 = str2;
                str2 = tempArray[i + 1][propname];
              } else {
                str2 = tempArray[i + 1][propname];
              }
            } else {
              if ((order_type === 1 && result) || (order_type !== 1 && !result)) {
                smallValueIndex = i;
              }
            }
          }
        }
        sortedArray.push(tempArray[smallValueIndex]);
        tempArray.splice(smallValueIndex, 1);
      } else {
        sortedArray.push(tempArray[0]);
        tempArray.splice(0, 1);
      }
    }
    data = sortedArray;
    return data;
  }
  public sortedObjectsByDays(data: Array<Object>): Array<object> {
    let arrayOfData = [];
    arrayOfData = data;
    let sortedDays = [];

    let days = {
      Mon: [],
      Tue: [],
      Wed: [],
      Thu: [],
      Fri: [],
      Sat: [],
      Sun: [],
    };

    for (let i = 0; i < arrayOfData.length; i++) {
      let day = arrayOfData[i].Days.split(",");
      switch (day[0]) {
        case "Mon":
          days.Mon.push(arrayOfData[i]);
          break;
        case "Tue":
          days.Tue.push(arrayOfData[i]);
          break;
        case "Wed":
          days.Wed.push(arrayOfData[i]);
          break;
        case "Thu":
          days.Thu.push(arrayOfData[i]);
          break;
        case "Fri":
          days.Fri.push(arrayOfData[i]);
          break;
        case "Sat":
          days.Sat.push(arrayOfData[i]);
          break;
        case "Sun":
          days.Sun.push(arrayOfData[i]);
          break;
      }
    }
    //sortedDays = days.Mon;
    // for (let i = 0; i < Object.keys(days).length - 1; i++) {
    //     for(let j=0;j<days.)
    //     sortedDays.push()
    // }
    let keyNames = Object.keys(days);
    for (let prop of keyNames) {
      // console.log(days[prop][0]);
      for (let innerloop = 0; innerloop < days[prop].length; innerloop++) {
        sortedDays.push(days[prop][innerloop]);
      }
    }
    return sortedDays;
  }
  public convertToDDMMYYY(inputDate) {
    var date = new Date(inputDate);
    return (
      date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear()
    );
  }

  getSortedByDaysAndTime(data: Array<Object>): Array<object> {
    let arrayOfData = [];
    arrayOfData = data;
    arrayOfData.sort((a, b) => {
      const aDays = a.Days.split(',');
      const bDays = b.Days.split(',');
      
      // Sort by days
      const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const aIndex = weekdays.indexOf(aDays[0]);
      const bIndex = weekdays.indexOf(bDays[0]);
      if (aIndex < bIndex) {
        return -1;
      }
      if (aIndex > bIndex) {
        return 1;
      }
      
      // Sort by start time
      if (a.StartTime < b.StartTime) {
        return -1;
      }
      if (a.StartTime > b.StartTime) {
        return 1;
      }
      return 0;
    });
    return arrayOfData;
  }

  getDateIn_DD_MMM_YYYY_Format(date): string {
    let d = new Date(date);
    let month = "";
    switch (d.getMonth()) {
      case 0:
        month = "Jan";
        break;
      case 1:
        month = "Feb";
        break;
      case 2:
        month = "Mar";
        break;
      case 3:
        month = "Apr";
        break;
      case 4:
        month = "May";
        break;
      case 5:
        month = "Jun";
        break;
      case 6:
        month = "Jul";
        break;
      case 7:
        month = "Aug";
        break;
      case 8:
        month = "Sep";
        break;
      case 9:
        month = "Oct";
        break;
      case 10:
        month = "Nov";
        break;
      case 11:
        month = "Dec";
        break;
    }

    return d.getDate() + "-" + month + "-" + d.getFullYear();
  }
  getDateIn_DD_MMM_Format(date): string {
    let d = new Date(date);
    let month = "";
    switch (d.getMonth()) {
      case 0:
        month = "Jan";
        break;
      case 1:
        month = "Feb";
        break;
      case 2:
        month = "Mar";
        break;
      case 3:
        month = "Apr";
        break;
      case 4:
        month = "May";
        break;
      case 5:
        month = "Jun";
        break;
      case 6:
        month = "Jul";
        break;
      case 7:
        month = "Aug";
        break;
      case 8:
        month = "Sep";
        break;
      case 9:
        month = "Oct";
        break;
      case 10:
        month = "Nov";
        break;
      case 11:
        month = "Dec";
        break;
    }

    return d.getDate() + "-" + month;
  }

  convertFbObjectToArray(obj: Object): Array<any> {
    let data: Array<any> = [];

    for (let key in obj) {
      if (key != "$key") {
        let objData: Object = {};
        objData = obj[key];
        objData["Key"] = key;
        data.push(objData);
      }
    }
    return data;
  }

  checkResturant(activityKey) {
    if (activityKey == "-MCMaUe_FtFh1RZuIqtG") {
      return true;
    }
  }
  convertFbObjectToArray1(obj: Object): Array<any> {
    let data: Array<any> = [];

    for (let key in obj) {
      if (key != "$key") {
        let objData: Object = {};
        objData = obj[key];
        data.push(objData);
      }
    }
    return data;
  }

  //time to date conversion
  getdate(date) {
    return moment(+date).format("DD-MMM-YYYY");
  }

  getdateInDDMMYYYY(date) {
    return moment(date,"YYYY-MM-DD").format("DD-MM-YYYY");
  }


  getDateFromISOSrtring(isoDate){
    return moment(isoDate).format('DD-MM-YY');
  }
  // Assuming your ISOString date is stored in a variable called 'isoDate'

  


  //<Summary>
  //
  // return undefined properties by separating comma "," delimeter
  //
  //</Summary>

  findUndefinedProp(item): string {
    let undefinedProps = "";
    let keyNames = Object.keys(item);
    let index = 0;
    for (let prop of keyNames) {
      if (item[prop] == undefined) {
        if (index == 0) {
          undefinedProps += prop;
        } else {
          undefinedProps += "," + prop;
          index++;
        }
      }
    }
    return undefinedProps;
  }

  //<Summary>
  //
  //  Params: startDate string, endDate  string
  //  return number of weeks
  //
  //
  //</Summary>

  calculateWeksBetweenDates(startDate: string, endDate: string): number {
    let x = 0;
    let day = 0;
    x = new Date(endDate).getTime() - new Date(startDate).getTime();
    day = Math.ceil(x / 86400000) + 1;
    return Math.ceil(day / 7);
  }

  //<Summary>
  //
  //  Returns current date in     YYYY-MM-DD    format
  //
  //</summary>

  getTodaysDate(): string {
    let todayDate = moment().format("YYYY-MM-DD");
    return todayDate;
  }
  convertDateToDDMMMYY(date: string): string {
    let todayDate = moment(date, "YYYY-MM-DD").format("DD-MMM-YY");
    return todayDate;
  }
  // input 1/2/2017
  //output 01/02/2017 (conversion specific for safari or ios)
  convertDatetoDDMMYYYY(date: string): string {
    let mm;
    let yy = new Date(date).getFullYear().toString();
    let dd;
    if (new Date(date).getMonth() + 1 < 10) {
      // mm = ("0" + ((new Date().getMonth()) + 1)).toString();
      mm = ("0" + (new Date(date).getMonth() + 1)).toString();
    } else {
      mm = (new Date(date).getMonth() + 1).toString();
    }

    if (new Date(date).getDate() < 10) {
      dd = ("0" + new Date(date).getDate()).toString();
    } else {
      dd = new Date(date).getDate().toString();
    }
    return yy + "-" + mm + "-" + dd;
  }
  // input 1/2/2017
  //output 01/02/2017 (conversion specific for safari or ios)
  convertDatetoDDMMYYYYBySpliting(date: string): string {
    let split = date.split("-");
    let yy = split[0];
    let mm = split[1];
    let dd = split[2];
    mm = split[1].length == 1 ? "0" + mm : mm;
    dd = split[2].length == 1 ? "0" + dd : dd;
    return yy + "-" + mm + "-" + dd;
  }

  // input 1/2/2017
  //output 02-Jan (conversion specific for safari or ios)
  convertDatetoDDMMMBySpliting(date: string): string {
    let split = date.split("-");
    let yy = split[0];
    let mm = split[1];
    let dd = split[2];
    mm = split[1].length == 1 ? "0" + mm : mm;
    dd = split[2].length == 1 ? "0" + dd : dd;
    let month = "";
    switch (parseInt(mm) - 1) {
      case 0:
        month = "Jan";
        break;
      case 1:
        month = "Feb";
        break;
      case 2:
        month = "Mar";
        break;
      case 3:
        month = "Apr";
        break;
      case 4:
        month = "May";
        break;
      case 5:
        month = "Jun";
        break;
      case 6:
        month = "Jul";
        break;
      case 7:
        month = "Aug";
        break;
      case 8:
        month = "Sep";
        break;
      case 9:
        month = "Oct";
        break;
      case 10:
        month = "Nov";
        break;
      case 11:
        month = "Dec";
        break;
    }
    return dd + "-" + month;
  }

  getFormattedByInputFormat(inputFormat:any,date) {
    return moment(+date,inputFormat).format("DD-MMM-YYYY, HH:mm");
  }

  itemTapped(event, item) {
    this.ga.trackEvent(
      "Category",
      "Tapped Action",
      "Item Tapped is " + item,
      0
    );
    // That's right, we're pushing to ourselves!
    this.navCtrl.push(event, {
      item: item,
    });
  }

  //Google Analytics Tracking
  screening(page: string) {
    this.storage.get("userObj").then((val) => {
      //console.log(val);
      let userDets = JSON.parse(val);
      let userKey = userDets.EmailID.split("@")[0]; //userid without gmail.com
      this.ga.setUserId(userKey).then(() => {});
      this.ga
        .trackView(page)
        .then(() => {
          console.log("tracking page");
        })
        .catch((e) => console.log(e));
    });
  }
  //tracking analytics ends here

  toastMessage(
    m: string,
    howLongToShow: number,
    msgType = ToastMessageType.Success,
    placement = ToastPlacement.Bottom,
    closeButton = false
  ) {
    let toast = this.toastCtrl.create({
      message: m,
      duration: howLongToShow,
      position: placement == ToastPlacement.Bottom ? "bottom" : "top",
      cssClass:
        msgType == ToastMessageType.Success
          ? "success"
          : msgType == ToastMessageType.Error
          ? "error"
          : "info",
      showCloseButton: closeButton,
    });
    toast.present();
  }

  showLoader(loadertext?: string) {
    //call this fn to show loader
    this.loader = this.loadingCtrl.create({
      content: loadertext,
    });
    this.loader.present();
    
      // let imgContent = '<div class="spinner1"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>';
      // this.safeImage = this.sanitizer.bypassSecurityTrustHtml(imgContent);
      // this.loader = this.loadingCtrl.create({
      //     spinner: 'hide',
      //     content: this.safeImage,
      // });
      // this.loader.present();
  
  }

  hideLoader() {
    //call this fn to hide loader
    this.loader.dismiss().catch((err) => {});
  }

  getMemberSignedUpType(memberObj): number {
    switch (true) {
      case memberObj.IsSchoolMember:
        return 2;
      case memberObj.IsHolidayCampMember:
        return 3;
      default:
        return 1;
    }
  }

  alertWithText(title:string, message:string, btn_text:string) {
    const alert = this.alertCtrl.create({
      title: title,
      subTitle: message,
      buttons: [btn_text]
    });
    alert.present();
  }


  commonAlter(title, message, callback) {
    let confirm = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: [
        {
          text: "No",
          role: "cancel",
          handler: () => {
            console.log("Disagree clicked");
          },
        },
        {
          text: "Yes",
          handler: () => {
            callback();
          },
        },
      ],
    });
    confirm.present();
  }

  commonAlertWithStatus(title,message,btn1,btn2,callback) {
    let confirm = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: [
        {
          text: "No",
          role: "cancel",
          handler: () => {
            console.log("Disagree clicked");
            callback(false);
          },
        },
        {
          text: "Yes",
          handler: () => {
            callback(true);
          },
        },
      ],
    });
    confirm.present();
  }

  commonAlter2(title, message, callback) {
    let confirm = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: [
        {
          text: "Ok",
          handler: () => {
            callback();
          },
        },
        {
          text: "No",
          role: "cancel",
          handler: () => {},
        }
      ],
    });
    confirm.present();
  }

  commonAlert_V3(title, message, agree_btn1_text,cancel_btn1_text, callback) {
    let confirm = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: [
        {
          text: agree_btn1_text,
          handler: () => {
            callback();
          },
        },
        {
          text: cancel_btn1_text,
          role: "cancel",
          handler: () => {},
        }
      ],
    });
    confirm.present();
  }

  commonAlert_V4(title, message, agree_btn1_text,cancel_btn1_text, callback) {
    let confirm = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: [
        {
          text: cancel_btn1_text,
          role: "cancel",
          handler: () => {},
        },
        {
          text: agree_btn1_text,
          handler: () => {
            callback();
          },
        }
      ],
    });
    confirm.present();
  }

  commonAlert_V5(title, message, agree_btn1_text,cancel_btn1_text, callback) {
    let confirm = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: [
        {
          text: cancel_btn1_text,
          role: "cancel",
          handler: () => {
            callback(false);
          },
        },
        {
          text: agree_btn1_text,
          handler: () => {
            callback(true);
          },
        }
      ],
    });
    confirm.present();
  }

  validateStartAndEndDate(startDate: string, endDate: string): boolean {
    if (startDate === "" || endDate === "") {
        const msg = "Please enter valid start and end dates";
        this.toastMessage(msg, 2500, ToastMessageType.Error);
        return false;
    } 
    if (moment(endDate, "YYYY-MM-DD").isBefore(moment(startDate, "YYYY-MM-DD"))) {
        const msg = "Your end date is before the start date. Please enter a valid end date.";
        this.toastMessage(msg, 2500, ToastMessageType.Error);
        return false;
    }
    return true;
  }

  validateTime(startTime: string, endTime: string): boolean {
    if (startTime === "" || endTime === "") {
        const msg = "Please enter valid start and end times";
        this.toastMessage(msg, 2500, ToastMessageType.Error);
        return false;
    }
    if (moment(endTime, "HH:mm").isSame(moment(startTime, "HH:mm"))) {
      const msg = "Your end time and start time same. Please enter a valid time range.";
      this.toastMessage(msg, 2500, ToastMessageType.Error);
      return false;
    }
    if (moment(endTime, "HH:mm").isBefore(moment(startTime, "HH:mm"))) {
        const msg = "Your end time is before the start time. Please enter a valid time range.";
        this.toastMessage(msg, 2500, ToastMessageType.Error);
        return false;
    }
    return true;
  }

  round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(+value * multiplier) / multiplier;
  }

  getPostData(url, params): Promise<any> {
    return new Promise((res, rej) => {
      $.ajax({
        url: url,
        data: params,
        type: "POST",
        success: function (response) {
          res(response);
        },
        error: function (error, xhr) {
          rej(error);
        },
      });
    });
  }

  sendPush(obj): Observable<any> {
    return this.httpService.post(
      `https://activitypro-nest-261607.appspot.com/pushnotification/publish`,
      obj
    );
  }
  sendBulkPush(reqObj): Observable<any> {
    return this.httpService.post(
      `https://activitypro-nest-261607.appspot.com​/pushnotification/publishbulkpush`,
      reqObj
    );
  }
  registerToken(requestingObj): Observable<any> {
    return this.httpService.post(
      `https://activitypro-nest-261607.appspot.com​/superadmin/device`,
      requestingObj
    );
  }
  DeviceInput = {
    Device_id: "",
    Player_id: "",
    Firebase_id: "",
    Platform_type: null,
    DeviceModel: "",
    AppType:1
  };
  saveDeviceDetsforNotify(memberkey: string) {
    if(this.sharedService.getOnesignalPlayerId() && this.sharedService.getDeviceId()){
      let platform: string = this.sharedService.getPlatform();
      this.DeviceInput.Device_id = this.sharedService.getDeviceId();
      this.DeviceInput.Player_id = this.sharedService.getOnesignalPlayerId();
      this.DeviceInput.Firebase_id = memberkey;
      if (platform) {
        this.DeviceInput.Platform_type =
          platform.toLowerCase() == "android" ? 1 : 2;
      }

      this.DeviceInput.DeviceModel = this.sharedService.getdeviceDetails();

      this.apollo
        .mutate({
          mutation: gql`
            mutation addDevice($deviceInput: DeviceInput!) {
              addDevice(devicerInput: $deviceInput) {
                Device_id
                Player_id
                Firebase_id
                Platform_type
              }
            }
          `,
          variables: { deviceInput: this.DeviceInput },
        })
        .subscribe(
          ({ data }) => {
            console.log("saved device data" + data["addDevice"]);
          },
          (err) => {
            console.log(JSON.stringify(err));
          }
        );
    }
  }

  publishPushMessage(ids: string[], message, heading, parentClub) {
    this.apollo
      .mutate({
        mutation: gql`
          mutation notifyGroupUsers($input: GroupUserNotify!) {
            notifyGroupUsers(input: $input)
          }
        `,
        variables: {
          input: {
            userFirebaseIds: ids,
            message: message,
            heading: heading,
            parentClub: parentClub,
          },
        },
      })
      .subscribe(
        (data) => {
          console.log("notification" + data);
        },
        (err) => {
          console.log(JSON.stringify(err));
        }
      );
  }

  getUserDetsById(memberid:string){
    return new Promise((res, rej) => {
      try{
        const userQuery = gql`
        query getUserNDetsByKey_V1($firebasekey:String!) {
            getUserNDetsByKey_V1(Key:$firebasekey){
                Id
                parent_firstname
                parent_lastname
                DOB
                clubkey
                parentFirebaseKey
                email
                phone_number
                childcount
                is_enable
                is_coach
                handicap
                is_gold_member
                allow_court_booking
                membership_Id
                vehicleRegNo1
                vehicleRegNo2
                Gender
                medical_condition
          }
        }
      `;
      this.apollo
        .query({
          query: userQuery,
          fetchPolicy: 'network-only',
          //fetchPolicy: 'cache-first',
         variables: { firebasekey:memberid} ,
        })
        .subscribe(({data}) => {
          console.table(data["getUserNDetsByKey_V1"]);
          res(data["getUserNDetsByKey_V1"])
        },(err)=>{
          rej(err);
        });
    }catch(err){
      rej(err);
    } 
  })
}

  isUUID(str) {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidPattern.test(str);
  }

  //common functions to persist and get in storage with time expirations
  setDataWithExpiry(key, value, ttl): Promise<any> {
    return new Promise(async (res, rej) => {
      const now = new Date();
      // `item` is an object which contains the original value
      // as well as the time when it's supposed to expire
      const item = {
        value: value,
        expiry: ttl,
      };
      await this.storage.remove(key);
      res(this.storage.set(key, JSON.stringify(item)));
    });
  }

  getDataWithExpiry(key): Promise<any[]> {
    return new Promise(async (res, rej) => {
      const itemStr = await this.storage.get(key);

      if (itemStr) {
        const item = JSON.parse(itemStr);
        const now = new Date();
        // compare the expiry time of the item with the current time
        if (now.getTime() > item.expiry) {
          // If the item is expired, delete the item from storage
          // and return null
          await this.storage.remove(key);
          res(null);
        } else {
          res(item.value);
        }
        // if the item doesn't exist, return null
      } else {
        res(null);
      }
    });
  }

  //capitalizes the firstletter in a string
  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  //Getting a random string
  randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
  }

  getAge(DOB){
    let year = DOB.split("-")[0];
    let currentYear = new Date().getFullYear();
    return Number(currentYear) - Number(year);
  }

  presentDynamicAlert(
    title:string,
    message: string,
    inputPlaceholder: string,
    cancelButtonText: string,
    updateButtonText: string,
    default_value:any,
    input_type: string,
    onUpdate: (inputValue: string) => void
  ) {
    let alert = this.alertCtrl.create({
      title: title,
      message: message,
      inputs: [
        {
          name: 'inputValue',
          placeholder: inputPlaceholder,
          type: input_type, // Switch between number and text input
          value:default_value
        },
      ],
      buttons: [
        {
          text: cancelButtonText,
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          },
        },
        {
          text: updateButtonText,
          handler: (data) => {
            if (data.inputValue.trim().length > 0) {
              onUpdate(data.inputValue);
            } else {
              this.toastMessage('Input cannot be empty',2500,ToastMessageType.Error,ToastPlacement.Bottom);
              return false; // Prevent closing the alert
            }
          },
        },
      ],
    });
    alert.present();
  }

  presentMultiInputDynamicAlert(
    title: string,
    inputs: Array<{ name: string; type: string; value?: string; min?: string; max?: string; placeholder?: string }>,
    buttons: Array<{ text: string; role?: string; handler?: (data?: any) => void }>
  ) {
    let alert = this.alertCtrl.create({
      title: title,
      inputs: inputs,
      buttons: buttons,
    });
    alert.present();
  }

  showDynamicActionSheet(options: ActionSheetOptions) {
    const actionSheet = this.actionSheetCtrl.create({
      title: options.title,
      buttons: options.buttons
    });
    actionSheet.present();
  }

  showMatchActionSheet(match: any, callbacks: MatchActionCallbacks) {
    const buttons: ActionSheetButton[] = [];

    if (callbacks.onViewDetails) {
      buttons.push({
        text: 'View Details',
        icon: 'eye',
        handler: callbacks.onViewDetails
      });
    }

    if (callbacks.onEdit) {
      buttons.push({
        text: 'Edit Match',
        icon: 'create',
        handler: callbacks.onEdit
      });
    }

    if (callbacks.onUpdateResult) {
      buttons.push({
        text: 'Update Result',
        icon: 'trophy',
        handler: callbacks.onUpdateResult
      });
    }

    if (callbacks.onDelete) {
      buttons.push({
        text: 'Delete',
        icon: 'trash',
        handler: callbacks.onDelete
      });
    }

    buttons.push({
      text: 'Cancel',
      role: 'cancel'
    });

    this.showDynamicActionSheet({
      title: 'Match Options',
      buttons
    });
  }
  



}
export enum ToastMessageType {
  Success,
  Error,
  Info,
}
export enum ToastPlacement {
  Top,
  Bottom,
}

export enum BookingMemberType{
  MEMBER = 1,
  ADMIN = 2, 
  COACH = 4,
  SUBADMIN = 6,
}

export interface ActionSheetButton {
  text: string;
  icon?: string;
  role?: string;
  handler?: () => void;
}

export interface ActionSheetOptions {
  title?: string;
  buttons: ActionSheetButton[];
}

export interface MatchActionCallbacks {
  onEdit?: () => void;
  onDelete?: () => void;
  onUpdateResult?: () => void;
  onViewDetails?: () => void;
}
// enum Notification {
//     "SessionPayment",
//     "HolidayCampPayment",
//     "SchoolSessionPayment",
//     "MemberEnrollementToSession"
// }

// export enum NotificationType {
//     "UserRegistration" = 101,
//     "SessionEnrollment" = 102,
//     "SessionPayment" = 103,
//     "HolidayCampEnrollment" = 104,
//     "HolidayCampPayment" = 105,
//     "SchoolSessionEnrollment" = 106,
//     "SchoolSessionPayment" = 107
// }

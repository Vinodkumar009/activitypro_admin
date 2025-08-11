import { Component, ViewChildren } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, ModalController, ToastController } from 'ionic-angular';
import * as moment from 'moment';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../../services/firebase.service';
import { forEach } from '@firebase/util';
import { CommonService } from '../../../../services/common.service';
import { HttpClient } from '@angular/common/http';

/**
 * Generated class for the AddlocationformatchPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-addlocationformatch',
  templateUrl: 'addlocationformatch.html',
})
export class AddlocationformatchPage {

  ParentClubKey: string;
  postCode: number;
  location = {
    Name: '',
    Address1: '',
    Address2: '',
    City: '',
    PostCode: 0,
    IsActive: true,
    IsEnable: true,
    CreationDate: (new Date()).getTime(),
    UpdationDate: (new Date()).getTime(),
    MapURL: '',
    WebsiteURL: '',
    Note: '',
    MapLatitude: '',
    MapLongitude: ''
  };

  facilitiesArr = [
    { Label: 'Bar', Value: false, IsActive: true, Key: "" },
    { Label: 'WC', Value: false, IsActive: true, Key: "" },
    { Label: 'Drinking Water', Value: false, IsActive: true, Key: "" },
    { Label: 'Resturant', Value: false, IsActive: true, Key: "" },
    { Label: 'Disabled Friendly', Value: false, IsActive: true, Key: "" },
    { Label: 'Baby Change', Value: false, IsActive: true, Key: "" },
    { Label: 'Parking', Value: false, IsActive: true, Key: "" },
  ]

  locationKey: string;
  dataExists = false;
  facilitiesDataExists = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public toastCtrl: ToastController,
    private fb: FirebaseService,
    public comonService: CommonService,
    public http: HttpClient,
    storage: Storage
  ) {
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.ParentClubKey = val.UserInfo[0].ParentClubKey;
      }

      if (this.navParams.get("LocationKey")) {
        this.locationKey = this.navParams.get("LocationKey");
        this.dataExists = true;
        // console.log(this.locationKey)
        this.getLocationData(this.ParentClubKey, this.locationKey);
      }
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddlocationformatchPage');
  }

  getLocationData(ParentClubKey, locationKey) {
    this.fb.getAllWithQuery("Location/" + ParentClubKey + "/", { orderByKey: true, equalTo: locationKey }).subscribe((data) => {

      this.location.Name = data[0].Name;
      this.location.Address1 = data[0].Address1;
      this.location.Address2 = data[0].Address2;
      this.location.City = data[0].City;
      this.location.IsActive = data[0].IsActive;
      this.location.IsEnable = data[0].IsEnable;
      this.location.CreationDate = data[0].CreationDate;
      this.location.MapURL = data[0].MapURL;
      this.location.WebsiteURL = data[0].WebsiteURL;
      this.location.Note = data[0].Note;
      this.postCode = data[0].PostCode;

      if (data[0].Facilities != undefined) {
        this.facilitiesArr = [];
        this.facilitiesArr = this.comonService.convertFbObjectToArray(data[0].Facilities);
        this.facilitiesDataExists = true;
      }
      console.log(this.location, this.facilitiesArr);
    });
  }

  selectFacility(facilities) {
    facilities.Value = !facilities.Value;

  }

  addLocation() {

    if (this.location.Name && this.location.City && this.location.Address1 && this.postCode) {
      this.http.post("https://obscure-dusk-57372.herokuapp.com/location/getplacedetails",
        {
          addressList: [{
            firstLineAddress: this.location.Name + "," + this.location.Address1 + "," + this.location.Address2,
            postCode: this.postCode,
            state: this.location.City
          }]
        }

      ).subscribe((res: any) => {
        this.location.MapLatitude = res.data[0].MapDetails.location.lat;
        this.location.MapLongitude = res.data[0].MapDetails.location.lng;
        this.location.PostCode = this.postCode;
        let locationKey = this.fb.saveReturningKey("Location/" + this.ParentClubKey, this.location)
        this.facilitiesArr.forEach(element => {
          this.fb.save({ Label: element.Label, Value: element.Value, IsActive: element.IsActive }, "Location/" + this.ParentClubKey + "/" + this.locationKey + "/Facilities")
        })
        console.log(this.location, this.facilitiesArr);
        this.showToast('Location Added')
        this.navCtrl.pop();
      })
     
    } else {
      this.showToast('Please Enter Address Details')
    }
  }
  updateLocation() {
    if (this.location.Name && this.location.City && this.location.Address1 && this.postCode) {
      this.http.post("https://obscure-dusk-57372.herokuapp.com/location/getplacedetails",
        {
          addressList: [{
            firstLineAddress: this.location.Name + "," + this.location.Address1 + "," + this.location.Address2,
            postCode: this.postCode,
            state: this.location.City
          }]
        }

      ).subscribe((res: any) => {
        this.location.MapLatitude = res.data[0].MapDetails.location.lat;
        this.location.MapLongitude = res.data[0].MapDetails.location.lng;
        this.location.PostCode = this.postCode;
        this.fb.update(this.locationKey, "Location/" + this.ParentClubKey, this.location);
        if (this.facilitiesDataExists) {
          this.facilitiesArr.forEach(element => {
            this.fb.update(element.Key, "Location/" + this.ParentClubKey + "/" + this.locationKey + "/Facilities", { Label: element.Label, Value: element.Value, IsActive: element.IsActive });
          });
        } else {
          this.facilitiesArr.forEach(element => {
            this.fb.save({ Label: element.Label, Value: element.Value, IsActive: element.IsActive }, "Location/" + this.ParentClubKey + "/" + this.locationKey + "/Facilities")
          })
        }
    
        console.log(this.location, this.facilitiesArr);
        this.showToast(this.location.Name + " Location Update")
        this.navCtrl.pop()
      })
    }

   
  }
  showToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }

}

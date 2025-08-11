//export class AddLocationModel extends UserDeviceMetadata{
export class AddLocationModel {
    // session_postgre_fields:CommonIdFields;
    // session_firebase_fields:CommonIdField
    address1: string;
    address2: string;
    city: string;
    map_latitude: string;
    map_longitude: string;
    map_url: string;
    name: string;
    note: string;
    post_code: string;
    website_url: string;
    is_bar_available: boolean;
    is_wc_available: boolean;
    is_drinking_water: boolean;
    is_resturant: boolean;
    is_disabled_friendly: boolean;
    is_baby_change: boolean;
    is_parking_available: boolean;
    ParentClubID: string;
    constructor(location:ILocation){
        this.address1 = location.Address1;
        this.address2 = location.Address2;
        this.city = location.City;
        this.map_latitude = location.MapLatitude.toString();
        this.map_longitude = location.MapLongitude.toString();
        this.map_url = location.MapURL;
        this.name = location.Name;
        this.note = location.Note;
        this.post_code = location.PostCode.toString();
        this.website_url = location.WebsiteURL;    
        this.is_bar_available = false;
        this.is_wc_available = false;
        this.is_drinking_water = false;
        this.is_resturant = false;
        this.is_disabled_friendly = false;
        this.is_baby_change = false;
        this.is_parking_available = false;
    }
  }

  export interface ILocation{
    Name:string,
    Address1:string,
    Address2:string,
    City:string,
    PostCode: number,
    IsActive: boolean,
    IsEnable: boolean,
    CreationDate: any,
    UpdationDate: any,
    MapURL: string
    WebsiteURL: string
    Note: string
    MapLatitude: string
    MapLongitude: string
  }
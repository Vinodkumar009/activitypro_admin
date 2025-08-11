//import { Storage } from '@ionic/storage';
export class SharedServices {
    private themeType: number;
    private themeColor: number;
    //private menu: Menu;
    private menus: Array<Menu> = [];
    private deviceToken: string;
    private emailUrl: string;
    private nodeURL: string;
    private nestURL: string;
    private static graphqlURL:string;
    private cloudFrontURL: string;
    private presignedURL:string;
    private group_sessionsUrl:string;
    private group_session_apikey:string;
    private userData:any;
    private ParentclubKey:string;
    private SuperAdminKey: string;
    private AdminStatus: boolean;
    private static TempNodeUrl:string = "";
    private static TempSuperAdminKey:string = "";
    private platform:string;
    private deviceId:string;
    private deviceDetsils:string;
    private onesignalPlayerId:string;
    private can_coach_see_revenue:boolean = false;
    private apikeys_map = new Map();
    private postgreParentClubId:string;
    private loggedInId:string;
    private loggedInUserId:string;
    private loggedin_type:number;
    inclusionList: Array<String> = ["", " ", "-", ".", "..", "...", "A", "adhd", "fit", "good", "great", "healthy",
        "n", "n/a", "N/a", "na", "Na", "NA", "nil", "no", "No", "no e", "nobe", "non", "not applicable", "none", "nope", "None", "None\n\n", "Nope", "nothing", "Nothing", "ok", "Ok", "okay", "no problem",
        "Best", "best", "Good", 'good'
    ];
    constructor() {
        this.themeType = 1;
        this.themeColor = 1;
        this.deviceToken = "";
        this.emailUrl = "";
        this.ParentclubKey=""
    }
    setDeviceId(id:string){
        this.deviceId = id;
    }
    setdeviceDetails(details:string){
        this.deviceDetsils = details;
    }
    setOnesignalPlayerId(id:string){
        this.onesignalPlayerId = id;
    }

    setApikey(key:string,value:string){
        this.apikeys_map.set(key,value);
    }
    
    getApiKey(key:string){
        return this.apikeys_map.get(key);
    }

    setGroupSessionsURL(sessionurl:string){
        this.group_sessionsUrl = sessionurl;
    }
    getGroupSessionsURL(){
        return this.group_sessionsUrl;
    }
    setGroupSessionAPiKey(session_apikey:string){
        this.group_session_apikey = session_apikey;
    }
    getGroupSessionAPiKey(){
        return this.group_session_apikey;
    }
    setAdminStatus(status:boolean){
        this.AdminStatus = status;
    }
    getAdminStatus(){
        return this.AdminStatus;
    }
    setUserData(data){
        this.userData  = data;
    }
    getUserData(){
        return this.userData;
    }
    setnodeURL(url: string) {
        SharedServices.TempNodeUrl = url;
        this.nodeURL = url;
    }
     getnodeURL() {
        return this.nodeURL;
    }
    static getTempNodeUrl(){
        return this.TempNodeUrl;
    }

    setnestURL(url: string) {
        this.nestURL = url;
    }
     getnestURL() {
        return this.nestURL;
    }

    setgraphqlURL(url: string){
        SharedServices.graphqlURL = url;
    }

    static getgraphqlURL() {
        return SharedServices.graphqlURL;
    }

    setCloudfrontURL(url:string){
        this.cloudFrontURL = url;
    }
    getCloudfrontURL(){ 
        return this.cloudFrontURL;
    }

    setPresignedURL(url:string){
        this.presignedURL = url;
    }
    getPresignedURL(){ 
        return this.presignedURL;
    }

    setSuperAdminKey(key: string){
        SharedServices.TempSuperAdminKey = key;
        this.SuperAdminKey = key;
    }
    getSuperAdminKey(){
        return this.SuperAdminKey;
    }
    static getTempSuperAdminKey(){
        return this.TempSuperAdminKey;
    }
    
    setEmailUrl(url: string) {
        this.emailUrl = url;
    }
     getEmailUrl() {
        return this.emailUrl;
    }
    setDeviceToken(token: string) {
        this.deviceToken = token;
    }
    getDeviceToken() {
        return this.deviceToken;
    }

    setThemeType(themeType: number) {
        this.themeType = themeType;
    }
    getThemeType() {
        return this.themeType;
    }
    setThemeColor(themeColor: number) {
        // this.storage.set('ThemeColor', themeColor);
        // this.themeColor = themeColor;
    }
    getThemeColor() {
        //this.storage.get('ThemeColor').then((val) => {
        // this.themeColor = val;
        // console.log('Your name is', val);
        // })
        return this.themeColor;
    }
    setMenu(menu: Menu[]) {
        if (menu != null) {
            //this.menu = menu;
            //this.menus.push(this.menu);
            this.menus = menu;
        } else {
            this.menus = [];
        }
    }
    setPlatform(platform:any){
        this.platform = platform;
    }
    getPlatform(){
        return this.platform;
    }
    getMenuList() {
        return this.menus;
    }
    getParentclubKey():string{
        return this.ParentclubKey;
    }
    setParentclubKey(ParentclubKey){
        this.ParentclubKey = ParentclubKey;
    }

    setLoggedInId(loggedin_id:string){
        this.loggedInId = loggedin_id;
    }

    getLoggedInId(){
        return this.loggedInId;
    }

    getDeviceId(){
        return this.deviceId;
    }
    getdeviceDetails(){
        return this.deviceDetsils;
    }
    getOnesignalPlayerId(){
        return this.onesignalPlayerId;
    }
    getMedicalInclusionList(){
        return this.inclusionList;
    }
    setCanCoachSeeRevenue(coachRevStatus:boolean){
        this.can_coach_see_revenue = coachRevStatus;
    }
    getCanCoachSeeRevenue(){
       return this.can_coach_see_revenue; 
    }  
    
    setLoggedInType(type:number){ //coach or admin/subadmin/superadmin/receptionist
        this.loggedin_type = type;
    }
    getLoggedInType(){ //coach or admin/subadmin/superadmin/receptionist
       return this.loggedin_type; 
    }

    setPostgreParentClubId(posgtre_parentclub_id:string){
        this.postgreParentClubId = posgtre_parentclub_id;
    }

    getPostgreParentClubId(){
        return this.postgreParentClubId;
    }

    setLoggedInUserId(loggedin_user){
        this.loggedInUserId = loggedin_user;
    }

    getLoggedInUserId(){
       return this.loggedInUserId; 
    }
    
}
export class Menu {
    // title: string;
    // component: any;
    // icon: string;
    // Level: number;
    DisplayTitle: string; 
    OriginalTitle:string;
    MobComponent: string;
    WebComponent: string; 
    MobIcon:string;
    MobLocalImage: string;
    MobCloudImage: string; 
    WebIcon:string;
    WebLocalImage: string;
    WebCloudImage:string;
    MobileAccess:boolean;
    WebAccess:boolean;
    Role: number;
    Type: number;
    Level: number
}
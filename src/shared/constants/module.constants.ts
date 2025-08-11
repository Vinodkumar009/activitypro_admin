export enum ModuleTypes {
  TERMSESSION = 105, //don't change it's already used this no
  MONTHLYSESSION = 101,
  SCHOOLSESSION = 110,
  WEEKLYSESSION = 102,
  COURTBOOKING = 100, //don't change it's already used this no
  HOLIDAYCAMP = 500,
  EVENTS = 800,
  APKIDS = 6, //need to confirm
  WALLET = 2, //don't change it's already used this no

  BOOKING = 111,
  TOURNAMENT = 11,
  NEWSPHOTOS = 113,
  VIDEOS = 114,
  MEMBERSHIP= 116,
  Challenges = 117,
  Playground = 118,
  Match = 119,
  league = 121,

  ADMIN = 0,
  MEMBER = 1,
}
export enum NoticationModuleTypes {
  MEMBER_EMAIL = 1,
  NON_MEMBER_EMAIL = 2,
  INDIVIDUALEMAIL = 3,
  TERMSESSION = 4,
  WEEKLYSESSION = 5,
  MONTHLYSESSION = 6,
  INDIVIDUALMEMBER = 7,
  ALL = 8,
  SUPERUSER = 9,
  LEAGUE = 10,
  SCHOOLSESSION = 11,
  HOLIDAYCAMP = 12,
}


export enum AppType {
  ADMIN = 0,
  ADMIN_NEW = 10,
  MEMBER = 1,
  APPPLUS = 2,
  MEMBER_NXTGEN = 11,
  MEMBER_NXTGEN_GLOBAL = 999,
}

export enum DeviceType {
  ANDROID = 1,
  IOS = 2,
  WEB = 3,
  API = 4,
}

export enum ParentclubAccountType {
  SESSION_MANAGEMENT = 1,
  COURT_BOOKING = 2,
  EVENTS = 3,
  MEMBERSHIP = 4
}


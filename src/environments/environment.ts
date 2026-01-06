// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
export const environment = {
  production: false,
  email_url : "http://54.84.255.41:8121/",
  //emailUrl: "http://localhost:32683/";
  node_url :"https://activitypro-node.appspot.com",
  new_http_url:"http://localhost:9000/api",//https://api-dev.activitypro.co.uk:1026/api
  nest_url :"https://oonxvy0hcd.execute-api.eu-west-2.amazonaws.com/DEV",
  group_sessionsUrl: "https://oonxvy0hcd.execute-api.eu-west-2.amazonaws.com/DEV",
  group_session_apikey : "",
  aws_cloudfrontURL : "https://d2ert9om2cv970.cloudfront.net",
  aws_presignedUrl : "https://i97kakk5tk.execute-api.eu-west-2.amazonaws.com/Dev/generatesignedurl",
  SuperAdminKey : "-KoGLONcroK1vB02b9Gg", 
  graphql_url : "https://api-dev.activitypro.co.uk/graphql",  
  new_graphql_url : "http://localhost:9000/graphql",//https://api-dev.activitypro.co.uk:1026/graphql
  apigateway_url1 : "https://i97kakk5tk.execute-api.eu-west-2.amazonaws.com/Dev",
  android_onesignal_id:"",
  ios_onesignal_id:"",
  firebaseConfig:{    
    apiKey: "AIzaSyA3frJ0sYhbVEsh6eBzcbGrEv4ILZDq4uc",
    authDomain: "timekare-app.firebaseapp.com",
    databaseURL: "https://timekare-app.firebaseio.com",
    storageBucket: "timekare-app.appspot.com",
    messagingSenderId: "36681232074"
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

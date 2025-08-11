export class Image{
    ParentClubKey:any="";
    ImageURL:any="";
    ImageTitle:any="";
    ImageDescription:any="";
    ImageTag:any="";
    ImageCaption:any = "";
    AssociatedActivity:any="";
    IsEnable:boolean=true;
    IsActive:boolean=true;
    IsHeadLine:boolean=false;
    Createddate:any="";
    CreatedBy:any="";
    UpdatedDate:any="";
    UpdatedBy:any="";
    CreaterKey:any="";
    ParentClubName="";
    CategoryName:any="";
    is_show_applus:boolean = true;
    ShowInMemberApp:boolean = true;
  }
  export class Category{
    listName:any='Session';
    CategoryList=[
      'Achievement',
      'Annual Day',
      'Celebration',
      'Charity',
      'Event',
      'Fun Day',
      'Gala Day',
      'Session',
      'Holiday Camp',
      'Miscellaneous',
      'News',
      'Party',
      'Result',
      'Special'
    ];
    setListName(name){
      this.setListName = name;
    }
    resetListName(){
      this.listName = "";
    }
    getListName(){
      return this.listName;
    }
  }
  export class Listname{
    static listName:any='Session';
    static setListName(name){
      this.listName = name;
    }
    static getListName():string{
      return this.listName;
    }
    iconsList=[
      "md-ribbon",
      "md-basketball",
      "md-paper-plane",
     "md-cash",
     "md-flask",
     "md-ice-cream",
      "md-medical",
      "md-laptop",
      "md-cog",
     "md-contract",
      "md-albums",
      "md-beer",
      "md-clipboard",
      "md-bowtie"
    ];
  }
  //For uploading Image


  export class UploadImage{
    static imageList=[];
    static setImage(format:ImageFormat){
      this.imageList.push(format); 
    }
    static getImage(){
      return this.imageList;
    }
    static resetImageList(){
      this.imageList = [];
    }
    static removeImage(index){
      this.imageList.splice(index,1);
    }
  }
  export class ImageFormat{
    ImageURL:string=""
    ImageCaption:string="";
    ImageDescription:string="";
  }
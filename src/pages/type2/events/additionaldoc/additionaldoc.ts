import { Component } from '@angular/core';
import { Chooser } from '@ionic-native/chooser';
import { ActionSheetController, IonicPage, NavController, NavParams, Platform, ViewController } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { FileTransfer } from '@ionic-native/file-transfer';
import { FileOpener } from '@ionic-native/file-opener';
import { HttpService } from '../../../../services/http.service';

/**
 * Generated class for the AdditionaldocPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-additionaldoc',
  templateUrl: 'additionaldoc.html',
})
export class AdditionaldocPage {

  docTitle: string = '';
  docDescription: string = '';
  docFile: any = null;
  docFileType: string = '';
  isEdit: boolean = false;
 

  Policies = {
    PolicyTitle: "",
    Description:"",
    PolicyDocs: []
  };

  constructor(public navCtrl: NavController, public navParams: NavParams, private viewCtrl: ViewController,private chooser: Chooser,
    public commonService: CommonService,private file: File,  public actionSheetCtrl: ActionSheetController, private platform: Platform,
    private fileOpener: FileOpener,
    private fileTransfer: FileTransfer,
    private httpService: HttpService,
  ) {
    const data = this.navParams.get('data');
    if (data) {
      this.isEdit = true;
      this.docTitle = data.doc_title || '';
      this.docDescription = data.doc_description || '';
      this.docFile = data.doc_file || null;
      this.docFileType = data.doc_file_type || '';
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AdditionaldocPage');
  }

  saveDocument() {
    const documentData = {
      title: this.docTitle,
      description: this.docDescription,
      file: this.docFile,
      fileType: this.docFileType,
    };
    this.viewCtrl.dismiss(documentData);
  }
  fileUri = "";
  async ChoosePolicies() {
    
     
      

  }
  async PolicyDocActions(index: number) {
    const actionSheet = await this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'View',
          icon: 'ios-eye',
          handler: () => {
            const path = this.platform.is('ios')
              // ? this.file.documentsDirectory
              // : this.file.dataDirectory;
  
            const transfer = this.fileTransfer.create();
            transfer
              .download(
                this.Policies.PolicyDocs[index].DownloadUrl,
                `${path}${new Date().getTime()}.pdf`
              )
              .then((entry) => {
                const url = entry.toURL();
                this.fileOpener
                  .open(url, this.Policies.PolicyDocs[index].MimeType)
                  .then(() =>
                  
                    this.commonService.toastMessage('File Opened', 2500, ToastMessageType.Success, ToastPlacement.Bottom)
                  )
                  .catch((e) =>
                    this.commonService.toastMessage(
                      'File Open Failed',
                      2500,
                      ToastMessageType.Error,
                      ToastPlacement.Bottom
                    )
                  );
              });
          },
        },
        {
          text: 'Delete',
          icon: 'ios-trash',
          handler: () => {
            this.commonService.showLoader();
            const imgObj = {
              url: this.Policies.PolicyDocs[index].DownloadUrl,
              upload_type: 'eventpolicy',
             // club_name: this.eventObj.ParentClubKey,
            };
  
            // this.apiService.deleteFileByUrl(imgObj).subscribe(
            //   (res) => {
            //     this.commonService.hideLoader();
            //     this.commonService.toastMessage(
            //       'File removed',
            //       2500,
            //       ToastMessageType.Success,
            //       ToastPlacement.Bottom
            //     );
            //     this.Policies.PolicyDocs.splice(index, 1);
            //   },
            //   (error) => {
            //     this.commonService.hideLoader();
            //     this.commonService.toastMessage(
            //       error.message,
            //       2500,
            //       ToastMessageType.Error,
            //       ToastPlacement.Bottom
            //     );
            //   }
            // );
          },
        },
        {
          text: 'Upload',
          icon: 'cloud-upload',
          handler: async () => {
            const file = await this.chooseFile();
            if (!file) return;
  
            const mimeType = file.type;
            this.commonService.showLoader();
  
            // 1. Generate pre-signed URL
            // this.apiService
            //   .getPresignedUrl({ fileName: file.name, mimeType })
            //   .subscribe(
            //     async (response: { url: string; fileUrl: string }) => {
            //       const { url, fileUrl } = response;
  
            //       // 2. Upload file to S3
            //       this.uploadFileToS3(url, file, mimeType)
            //         .then(() => {
            //           // 3. Update policies array with file metadata
            //           this.Policies.PolicyDocs.push({
            //             FileType: mimeType.includes('pdf') ? 'pdf' : 'image',
            //             DownloadUrl: fileUrl,
            //             MimeType: mimeType,
            //           });
  
            //           this.DismissLoader();
            //           this.commonService.toastMessage(
            //             'File uploaded successfully',
            //             2500,
            //             ToastMessageType.Success,
            //             ToastPlacement.Bottom
            //           );
            //         })
            //         .catch((error) => {
            //           this.DismissLoader();
            //           this.commonService.toastMessage(
            //             'File upload failed',
            //             2500,
            //             ToastMessageType.Error,
            //             ToastPlacement.Bottom
            //           );
            //           console.error('S3 Upload Error:', error);
            //         });
            //     },
            //     (error) => {
            //       this.DismissLoader();
            //       this.commonService.toastMessage(
            //         'Failed to generate upload URL',
            //         2500,
            //         ToastMessageType.Error,
            //         ToastPlacement.Bottom
            //       );
            //     }
            //   );
          },
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
        },
      ],
    });
    await actionSheet.present();
  }
  
  // Helper method: Open file picker
  async chooseFile(): Promise<File | null> {
    return new Promise((resolve) => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'application/pdf,image/jpeg,image/png';
      fileInput.onchange = (event: any) => {
        const file = event.target.files[0];
        resolve(file || null);
      };
      fileInput.click();
    });
  }
  
  // Helper method: Upload file to S3
  uploadFileToS3(url: string, file: File, mimeType: string){
    // return this.httpService
    //   .put(url, file, {
    //     headers: {
    //       'Content-Type': mimeType,
    //     },
    //   })
    //   .toPromise();
  }
  
  dismiss() {
    this.viewCtrl.dismiss();
  }
}

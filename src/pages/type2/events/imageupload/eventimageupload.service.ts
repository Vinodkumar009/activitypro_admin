
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Injectable } from '@angular/core';
import { SharedServices } from '../../../services/sharedservice';

@Injectable()
export class EventImageUploadService {

  constructor(private http: HttpClient, private sharedService: SharedServices,) { }

  // Function to request pre-signed URL for image upload
  getPresignedUrl(imageUrl: string,moduleName:string,typeName:string): Promise<any[]> {
    // Implement this function to make API call to get pre-signed URL
    
    const signed_url = this.sharedService.getPresignedURL() ? this.sharedService.getPresignedURL() : "https://k26gihyg2c.execute-api.eu-west-2.amazonaws.com/prod/generatesignedurl"
    //console.log(`presignedurl:${signed_url}`)
    return new Promise((resolve, reject) => {
        this.http
          .post(
            `${signed_url}`,
            {
              name: `${moduleName}`,
              type: `${typeName}`,
              files: [imageUrl],
            }
          )
          .subscribe(
            (res: any) => {
              if (res) {
                console.log(res);
                resolve(res);
              }
            },
            (err) => {
              console.log(`signed_url_err:${JSON.stringify(err)}`);
              reject(err);
            }
          );
      });
  }

  base64ToBlob(base64: string, contentType: string = 'image/jpeg') {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length).fill(0).map((_, i) => slice.charCodeAt(i));
      byteArrays.push(new Uint8Array(byteNumbers));
    }
    return new Blob(byteArrays, { type: contentType });
  }

  // Function to upload image using pre-signed URL
  async uploadImage(presignedUrl: string, base64Image: string): Promise<any> {
    return new Promise(async(resolve, reject) => {
      try{
        // Convert base64 data to Blob
        //  await fetch(base64Image).then((response) =>{
        //   const blobData = response.blob();
        //   console.log(`blobData:${blobData}`);
        //   // Set up headers for the PUT request
        //   let headers = new HttpHeaders();
        //   headers.append('Content-Type', 'image/jpeg');
        //   this.http.put(presignedUrl, blobData, { headers }).subscribe(
        //     (res: any) => {
        //       resolve(true);
        //     },
        //     (err) => {
        //       reject(err)
        //       console.error('Error uploading image:', JSON.stringify(err));
        //     }
        //   );
        // }).catch ((error)=> {
        //   console.error('Error uploading image1:', JSON.stringify(error));
        //   reject(error);
        // })
        const blobData = this.base64ToBlob(base64Image, 'image/jpeg');
        console.log(`blobData: ${blobData}`);
  
        const headers = new HttpHeaders({ 'Content-Type': 'image/jpeg' });
        this.http.put(presignedUrl, blobData, { headers }).subscribe(
          (res: any) => resolve(true),
          (err) => {
            console.error('Error uploading image:', JSON.stringify(err));
            reject(err);
          }
        );
      }catch (error) {
        console.error('Error uploading image1:', JSON.stringify(error));
        reject(error);
      }
    })
  }


}

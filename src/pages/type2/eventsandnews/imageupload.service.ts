
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SharedServices } from '../../services/sharedservice';
import { Injectable } from '@angular/core';

@Injectable()
export class ImageUploadService {

  constructor(private http: HttpClient, private sharedService: SharedServices) { }

  // Function to request pre-signed URL for image upload
  getPresignedUrl(imageUrl: string): Promise<any[]> {
    // Implement this function to make API call to get pre-signed URL
    //alert(`${this.sharedService.getPresignedURL()}`)
    console.log(`signedurl:${this.sharedService.getPresignedURL()}`);
    console.log(`imageUrl:${imageUrl}`);
    const signed_url = this.sharedService.getPresignedURL() ? this.sharedService.getPresignedURL() : "https://k26gihyg2c.execute-api.eu-west-2.amazonaws.com/prod/generatesignedurl"
    return new Promise((resolve, reject) => {
        this.http
          .post(
            `${signed_url}`,
            {
              name: "news",
              type: "IMAGE",
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
              console.log(`signederr:${JSON.stringify(err)}`);
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
    try {
      return new Promise(async(resolve, reject) => {
        // Convert base64 data to Blob
        //const blobData = await fetch(base64Image).then(response => response.blob());
        const blobData = this.base64ToBlob(base64Image, 'image/jpeg');
        //console.log(`blobData: ${blobData}`);
        // Set up headers for the PUT request
        let headers = new HttpHeaders();
        headers.append('Content-Type', 'image/jpeg');
        this.http.put(presignedUrl, blobData, { headers }).subscribe(
          (res: any) => {
            resolve(true);
          },
          (err) => {
            reject(err)
          }
        );
      })
   }catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image.');
   }
  }


}

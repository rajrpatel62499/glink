// import { ToastrService } from 'ngx-toastr';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LocationStrategy } from '@angular/common';

export const HEIGHT = 1200;
export const WIDTH = 800;
export const KB = 1024;
export const MB = KB * 1024;
export const GB = MB * 1024;
export const FileType = {
  JPG: 'image/jpg',
  JPEG: 'image/jpeg',
  PNG: 'image/png',
  PDF: 'application/pdf',
  MP4: 'video/mp4',

  CSV: 'application/vnd.ms-excel',
};

export const FileExt = {
  JPG: 'jpg',
  JPEG: 'jpeg',
  PNG: 'png',
  PDF: 'pdf',
  MP4: 'mp4',
  CSV: 'csv',
  XLS: 'xls',
  DOC: 'doc',
};


@Injectable({
  providedIn: 'root',
})
export class UtilService {

  constructor(
    // private toastr: ToastrService, 
    private locationStrategy: LocationStrategy
    ) {

   
  }

  get timezone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }


  /* Spinner Service */
  isSpinnerShow = new BehaviorSubject(false);

  showSpinner() {
    this.isSpinnerShow.next(true);
  }

  hideSpinner() {
    this.isSpinnerShow.next(false);
  }

  getHeader() {
    let token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      Authorization: 'Bearer' + ' ' + token,
    });
    return headers;
  }



  /// Toaster Messages

  // successToast(message: any, title?: any) {
  //   return this.toastr.success(message, title);
  // }

  // errorToast(message: any, title?: any) {
  //   return this.toastr.error(message, title);
  // }

  // warningToast(message: any, title?: any) {
  //   return this.toastr.warning(message, title);
  // }

  // infoToast(message: any, title?: any) {
  //   return this.toastr.info(message, title);
  // }

  public isNullOrEmpty(item) {
    if (item == null || item == '' || item == undefined) {
      return true;
    } else {
      return false;
    }
  }

  public has(value) {
    return !this.isNullOrEmpty(value);
  }

  public jsonToFormData(object) {
    const formData = new FormData();
    Object.keys(object).forEach(key => {
      if (object[key] instanceof Object) {
        console.log(typeof object[key], key, object[key])
        if (object[key] instanceof File) {
          console.log(typeof object[key], key, object[key])
          formData.append(key, object[key]);
          // let file = this.base64ToFile(object[key], key);
          // formData.append(key,file);
        } else {
          console.log(typeof object[key], key, object[key])
          formData.append(key, JSON.stringify(object[key]));
        }
      } else {
        console.log(typeof object[key], key, object[key])
        formData.append(key, object[key]);
      }
    });
    return formData;
  }

  public printFormData(formData) {
    for (var pair of formData.entries()) {
      console.log(pair[0] + ', ' + pair[1]);
    }
  }

  public getParamsFromObj(obj): HttpParams {
    let params = new HttpParams();

    if (obj) {
      Object.keys(obj).forEach(key => {
        if (obj[key] !== '' && obj[key] !== undefined) {
          params = params.set(key, obj[key]);
        }
      });
    }
    return params;
  }

  formatBytes(bytes, decimals, binaryUnits?) {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const unitMultiple = (binaryUnits) ? 1024 : 1000;
    const unitNames = (unitMultiple === 1024) ? // 1000 bytes in 1 Kilobyte (KB) or 1024 bytes for the binary version (KiB)
      ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'] :
      ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const unitChanges = Math.floor(Math.log(bytes) / Math.log(unitMultiple));
    return parseFloat((bytes / Math.pow(unitMultiple, unitChanges)).toFixed(decimals || 0)) + ' ' + unitNames[unitChanges];
  }

  // showToaster(message: string, toastrType: string = 'success', errorTimeout: number = 0) {
  //   switch (toastrType) {
  //     case "success":
  //       setTimeout(() => this.toastr.success(message, "", {progressBar:true}));
  //       break;
  //     case "error":
  //       setTimeout(() => this.toastr.error(message));
  //       break;
  //     case "warning":
  //       setTimeout(() => this.toastr.warning(message));
  //       break;
  //     case "info":
  //       setTimeout(() => this.toastr.info(message));
  //       break;
  //     case "timedError":
  //       console.log("inside timed error case with time: ", errorTimeout)
  //       setTimeout(() => this.toastr.error(message, undefined, { timeOut: errorTimeout }));
  //       break;
  //   }
  // }

  // clearToast() {
  //   this.toastr.clear();
  // }
  // handleError(msg: string, errorTimeout: number = 0) {
  //   if (errorTimeout == 0) {
  //     this.showToaster(msg, 'error');
  //   } else {
  //     this.showToaster(msg, 'timedError', errorTimeout);
  //   }
  // }

  isValidateFileTypeAndSize(file: File, fileType: 'video' | 'image', size: number) {

    if (fileType == 'image') {
      if (
        file.type == FileType.JPEG ||
        file.type == FileType.PNG ||
        file.type == FileType.JPG
      ) {

      } else {
        // this.handleError('Please upload valid file type.!!');
        return false;
      }
    } else if (fileType == 'video') {
      if (
        file.type == FileType.MP4
      ) {

      } else {
        // this.handleError('Please upload valid file type.!!');
        return false;
      }
    }

    return this.isValidFileSize(file, size);
  }
    isValidFileType(file: File, allowedExt: string[]) {
      //@ts-ignore
      const fileExt = file.name.split(".").pop().toLowerCase();
      if(allowedExt.includes(fileExt)) {
          return true;
      } else {
          // this.handleError('Please upload valid file type.!!');
          return false;
      }
  }

  isValidFileSize(file: File, size: number) {
    if (file.size >= size) {
      // this.handleError(`File size should be less than ${this.formatBytes(size, 0)}`);
      return false;
    }
    return true;
  }

  public promptForFile(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      // make file input element in memory
      const fileInput: HTMLInputElement = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.multiple = true;
      fileInput.height = 200;
      fileInput.width = 200;
      fileInput.value = '';
      fileInput.id = `${Math.random()}`;


      // fileInput.setAttribute('capture', 'camera');
      // fileInput['capture'] = 'camera';
      fileInput.addEventListener('error', (event) => {
        reject(event.error);
      });
      fileInput.addEventListener('change', (event) => {
        // resolve(fileInput.files[0]);
        resolve(fileInput.files);
      });
      // prompt for video file
      fileInput.click();
    });
  }

  public promptForFileWithParameters(params: { multiple: boolean }): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      // make file input element in memory
      const fileInput: HTMLInputElement = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.multiple = params.multiple;
      fileInput.height = 200;
      fileInput.width = 200;
      fileInput.value = '';
      fileInput.id = `${Math.random()}`;


      // fileInput.setAttribute('capture', 'camera');
      // fileInput['capture'] = 'camera';
      fileInput.addEventListener('error', (event) => {
        reject(event.error);
      });
      fileInput.addEventListener('change', (event) => {
        // resolve(fileInput.files[0]);
        resolve(fileInput.files);
      });
      // prompt for video file
      fileInput.click();
    });
  }

  setKeyInArray(arr: any[], key, value) {
    arr.forEach(x => {
      x[`${key}`] = value;
    })
    return arr;
  }

  removeKeyFromArray(arr: any[], key) {
    arr.forEach(x => {
      delete x[`${key}`];
    })
  }

  removeCharAt(index: number, str: String) {
    return str.slice(0,index) + str.slice(index + 1, str.length);
  }


  getSlugStr(str: string) {
    if (!this.isNullOrEmpty(str)) {
      return str.toLowerCase().split(' ').join('-');
    } else {
      return '';
    }
  }

  // Define a function to handle back button and use anywhere
  preventBackButton() {
    //@ts-ignore
    history.pushState(null, null, location.href);
    this.locationStrategy.onPopState(() => {
      //@ts-ignore
      history.pushState(null, null, location.href);
    })
  }


  isBase64(str) {
    if (str ==='' || str.trim() ===''){ return false; }
    try {
        return btoa(atob(str)) == str;
    } catch (err) {
        return false;
    }
  }


  imgToBase64(file: File): Promise<string> {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    return new Promise((resolve, reject) => {
      reader.onload = () => {
        typeof reader.result === 'string' && reader.result !== '' ?
          resolve(reader.result) :
          reject("Unable to read image, Image is corrrupted");
      }
    });
  }

  public base64ToFile(dataURI:string, fileName: string ="myfile"): File {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI?.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI?.split(',')[1]);
    else
        byteString = unescape(dataURI?.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI?.split(',')[0]?.split(':')[1]?.split(';')[0];

    var ext = '.' + mimeString?.split('/')[1];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    let blob = new Blob([ia], {type:mimeString});
    var file: File = new File([blob], fileName + ext , {
      type: blob.type
    });
    return file
  }


    downloadImage(data, filename = 'untitled.jpeg') {
      var a = document.createElement('a');
      a.href = data;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
    }


    toBase64 = file => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });



    /* MathMl Helper Function End */

    routeHasText(text: string) {
      const link = window.location.href;
      const status = link.match(text);
      if (status != null) {
        return true;
      } else {
        return false;
      }
    }

    isNumeric(value): boolean {
      return /^-?\d+$/.test(value);
    }

    get domain() {
      return window.location.host;
    }

    get origin() {
      return window.location.origin;
    }


}

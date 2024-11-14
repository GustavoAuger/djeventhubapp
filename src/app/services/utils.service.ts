import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ModalController, ModalOptions, ToastController, ToastOptions } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  LoadingCtrl = inject(LoadingController);
  toastCtrl = inject(ToastController);
  modalCtrl = inject(ModalController);
  router = inject(Router);
  
  async takeImage(promptLabelHeader:string) {
    return await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
      promptLabelHeader,
      promptLabelPhoto: 'selecciona una imagen',
      promptLabelPicture: 'toma una foto'
    });
  
   
  };

  // ================== loading ==================

  loading()
  {
    return this.LoadingCtrl.create({ spinner: 'crescent' });

  }

  // ================== toast ==================

  async presentToast(opts?: ToastOptions) {
    const toast = await this.toastCtrl.create(opts);
    toast.present();
  }

  // ================== enruta a cualquier pagina disp ==================

  routerlink(url: string) {
    return this.router.navigateByUrl(url);
  
  }

  // ================== guarda un elemento en localstorage ==================

  saveInLocalStorage(key: string, value: any) {

  return localStorage.setItem(key, JSON.stringify(value));
  }

  // ================== obtiene un elemento de localstorage ==================

  getFromLocalStorage(key: string) {
    return JSON.parse(localStorage.getItem(key))
  } 

  // ================== Modal  ==================

  async presentModal(opts: ModalOptions) {
    const modal = await this.modalCtrl.create(  opts );
    await modal.present();
  
    const { data } = await modal.onWillDismiss();
    if (data) {
      return data;
    }
  }

  dismisModal(data?: any) {
   return this.modalCtrl.dismiss(data);
  }

  // ================== Comprimir imagen ================== 
  compressImage(dataUrl: string, maxWidth: number, maxHeight: number, quality: number): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Calcular las nuevas dimensiones manteniendo la relación de aspecto
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height *= maxWidth / width));
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round((width *= maxHeight / height));
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Convertir el canvas a un data URL comprimido
            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedDataUrl);
        };
        img.onerror = (error) => reject(error);
    });
}

}

import { Component, inject, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';

import { User } from 'src/app/models/user.model';
import { UtilsService } from 'src/app/services/utils.service';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {

  form = new FormGroup({

    email: new FormControl(''),

    name: new FormControl(''),

  
  });

  
  darkMode: boolean = false;

  


 toggleTheme() {
  this.darkMode = !this.darkMode;
  document.body.classList.toggle('dark', this.darkMode);
  localStorage.setItem('darkMode', this.darkMode ? 'true' : 'false');
}

  ngOnInit() {
    this.darkMode = localStorage.getItem('darkMode') === 'true';
    document.body.classList.toggle('dark', this.darkMode); 
  }

copyEmail() {
  const user = this.user();
  const email = user.email;
  navigator.clipboard.writeText(email).then(() => {
    this.utilsSvc.presentToast({
      message: 'Email copied successfully',
      duration: 1500,
      color: 'success',
      position: 'middle',
      icon: 'checkmark-circle-outline'
    });
  }).catch(error => {
    console.log(error);
    this.utilsSvc.presentToast({
      message: 'Failed to copy email',
      duration: 2500,
      color: 'primary',
      position: 'middle',
      icon: 'alert-circle-outline'
    });
  });
}
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);


  user(): User {
    return this.utilsSvc.getFromLocalStorage('user');
  }


  signOut() {
    this.firebaseSvc.signOut(); // Llama al método de cierre de sesión en tu servicio de Firebase
  }

  // ================== takePicture ==================

  async takeImage() {
    let user = this.user();
    let path = `users/${user.uid}`;
    let imagePath = `${user.uid}/profile`;

    // Obtén la URL de la imagen anterior
    const oldImagePath = user.image ? `${user.uid}/profile` : null;

    const dataUrl = (await this.utilsSvc.takeImage('Imagen de Perfil')).dataUrl;

    // Comprimir la imagen
    const compressedDataUrl = await this.utilsSvc.compressImage(dataUrl, 800, 800, 0.8); // Ajusta los parámetros según tus necesidades

    const loading = await this.utilsSvc.loading();
    await loading.present();

    try {
      // Sube la nueva imagen comprimida y elimina la anterior si existe
      user.image = await this.firebaseSvc.uploadImage(imagePath, compressedDataUrl, oldImagePath);
      await this.firebaseSvc.updateDocument(path, { image: user.image });

      this.utilsSvc.saveInLocalStorage('user', user);
      this.utilsSvc.presentToast({
        message: 'Imagen actualizada exitosamente',
        duration: 1500,
        color: 'success',
        position: 'middle',
        icon: 'checkmark-circle-outline'
      });
    } catch (error) {
      console.log(error);
      this.utilsSvc.presentToast({
        message: error.message,
        duration: 2500,
        color: 'primary',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
    } finally {
      loading.dismiss();
    }
  }

  // ================== updateProfile ==================

  


}
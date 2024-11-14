import { Component, inject, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { UtilsService } from 'src/app/services/utils.service';


@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {

  form = new FormGroup({
    uid: new FormControl(''),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required]),  // Nuevo campo de confirmación de contraseña
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    role: new FormControl('', Validators.required),  // Nuevo campo para el rol
    termsConditions: new FormControl(false, Validators.requiredTrue)  // Nuevo campo para aceptar términos y condiciones
  }, { validators: this.passwordsMatchValidator });  // Agregar validador personalizado

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  ngOnInit() {}

  // Validador personalizado para verificar si las contraseñas coinciden
  passwordsMatchValidator(group: AbstractControl): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    return password === confirmPassword ? null : { notMatch: true };
  }

  async submit() {
    if (this.form.valid) {
      const loading = await this.utilsSvc.loading();
      await loading.present();




      const user = this.form.value as User;

      this.firebaseSvc.signUp(user).then(async res => {
        await this.firebaseSvc.updateProfile(user.name);
        const uid = res.user.uid;
        this.form.controls.uid.setValue(uid);

        this.setUserInfo(uid);
      }).catch(error => {
        console.log(error);
        this.utilsSvc.presentToast({ message: error.message, duration: 2000, color: 'danger', position: 'middle', icon: 'alert-circle-outline' });
      }).finally(() => {
        loading.dismiss();
      });
    }
  }

  async setUserInfo(uid: string) {
    if (this.form.valid) {
      const loading = await this.utilsSvc.loading();
      await loading.present();

      const path = `users/${uid}`;
      delete this.form.value.password;
      delete this.form.value.confirmPassword;  // No guarda la confirmación de la contraseña

      this.firebaseSvc.setDocument(path, this.form.value).then(async res => {
        this.utilsSvc.saveInLocalStorage('user', this.form.value);
        this.utilsSvc.routerlink('/main/home');
        this.form.reset();
      }).catch(error => {
        console.log(error);
        this.utilsSvc.presentToast({ message: error.message, duration: 2000, color: 'danger', position: 'middle', icon: 'alert-circle-outline' });
      }).finally(() => {
        loading.dismiss();
      });
    }
  }
}

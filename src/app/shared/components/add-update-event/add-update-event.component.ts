import { Component, ElementRef, inject, Input, OnInit, ViewChild } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { Event } from 'src/app/models/event.model';
import { UtilsService } from 'src/app/services/utils.service';
import { ToastController } from '@ionic/angular'; 

@Component({
  selector: 'app-add-update-event',
  templateUrl: './add-update-event.component.html',
  styleUrls: ['./add-update-event.component.scss'],
})
export class AddUpdateEventComponent  implements OnInit {

  @Input() event: Event 
  
  
  @ViewChild('addressInput') addressInput!: ElementRef; // Elemento de referencia al campo de dirección

  mapCenter: google.maps.LatLngLiteral = { lat: -33.0, lng: -71.0 }; // Coordenadas iniciales

  address: string = '';
  geocoder: any;
  autocomplete: any; // Instancia del autocompletado de Google Places

form = new FormGroup({
    id: new FormControl(''),
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    Image: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required, Validators.maxLength(1000)]),
    date: new FormControl(new Date().toISOString(), [Validators.required]),
    location: new FormControl({ lat: 0, lng: 0 }, [Validators.required]), // Cambiado a objeto
    creatorId: new FormControl(''),
  });


  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  toastController = inject(ToastController);

  
  user = {} as User;
  charCount = 0;



  ngOnInit() {

    this.geocoder = new google.maps.Geocoder();

    this.user = this.utilsSvc.getFromLocalStorage('user');

    

    this.form.controls['creatorId'].setValue(this.user.uid);

    this.updateCharCount(); // Inicializar el contador de caracteres
    if (this.event) this.form.setValue(this.event);
    
  }
  
  adjustTextareaHeight(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  onLocationSelected(location: { lat: number, lng: number }) {
    this.form.controls['location'].setValue(location);
  }





  updateCharCount() {
    this.charCount = this.form.controls['description'].value.length;
  }
  
  // ================== Tomar una imagen ==================

  async takeImage() {
    const dataUrl = (await this.utilsSvc.takeImage('imagen del evento')).dataUrl;
    this.form.controls.Image.setValue(dataUrl);
  }

  
  async submit() {
    if (this.form.valid) {
    
      if (this.event) this.updateEvent();
       else  this.createEvent()
      
    }
  }


  // ================== Crear evento ==================
  async createEvent() {
    

     // let path = `users/${this.user.uid}/events`;   
      let path = `events`;

      const loading = await this.utilsSvc.loading();
      await loading.present();

      // === Subir la imagen y obtener la url ===
      let dataUrl = this.form.value.Image;
      let imagePath = `${this.user.uid}/${Date.now()}`;
      let imageUrl = await this.firebaseSvc.uploadImage(imagePath, dataUrl);
      this.form.controls.Image.setValue(imageUrl);

      

      

      this.firebaseSvc.addDocument(path, this.form.value).then(async res => {



        


        this.utilsSvc.dismisModal({success : true});
        

        this.utilsSvc.presentToast({ message: 'evento agregado exitosamente', duration: 1500, color: 'succes', position: 'middle', icon: 'checkmark-circle-outline' });

        

        
      }).catch(error => {
        console.log(error);
        this.utilsSvc.presentToast({ message: error.message, duration: 2000, color: 'danger', position: 'middle', icon: 'alert-circle-outline' });

      }).finally(() => {
        loading.dismiss();
      })
    
  }

  // ================== Actualizar un evento ==================
  async updateEvent() {
    

     // let path = `users/${this.user.uid}/events`;   
      let path = `events/${this.event.id}`;

      const loading = await this.utilsSvc.loading();
      await loading.present();

      // === Subir la imagen y obtener la url ===
      if (this.form.value.Image !== this.event.Image) {
        let dataUrl = this.form.value.Image;
        let imagePath = await this.firebaseSvc.getFilePath(this.event.Image);
        let imageUrl = await this.firebaseSvc.uploadImage(imagePath, dataUrl);
        this.form.controls.Image.setValue(imageUrl);
      }
      

      

      

      this.firebaseSvc.updateDocument(path, this.form.value).then(async res => {



        


        this.utilsSvc.dismisModal({success : true});
        

        this.utilsSvc.presentToast({ message: 'evento actualizado exitosamente', duration: 1500, color: 'succes', position: 'middle', icon: 'checkmark-circle-outline' });

        

        
      }).catch(error => {
        console.log(error);
        this.utilsSvc.presentToast({ message: error.message, duration: 2000, color: 'danger', position: 'middle', icon: 'alert-circle-outline' });

      }).finally(() => {
        loading.dismiss();
      })
    
  }

}

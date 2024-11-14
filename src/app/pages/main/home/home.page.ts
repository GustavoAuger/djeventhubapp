import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdateEventComponent } from 'src/app/shared/components/add-update-event/add-update-event.component';
import { Event } from 'src/app/models/event.model';
import { User  } from 'src/app/models/user.model';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { IonModal, ToastController } from '@ionic/angular';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild('eventModal', { static: true }) eventModal: IonModal;



  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  toastController = inject(ToastController);


  events: Event[] = [];
  userLocation: { lat: number, lng: number } = { lat: 0, lng: 0 };
  selectedEvent: any;
  manualLocation: { lat: number, lng: number };

  ngOnInit() {
    this.getUserLocation();
  }

  user() {
    return this.utilsSvc.getFromLocalStorage('user');
  }

  ionViewWillEnter() {

  }
  
  handleRefresh(event) {
    setTimeout(() => {
      this.getUserLocation();
      event.target.complete();
    }, 2000);
  }

  async openEventModal(eventId: string) {
    
    try {
      const eventDoc = await this.firebaseSvc.getEventById(eventId);
      const eventData = eventDoc.data();
      if (eventData && typeof eventData === 'object') {
        this.selectedEvent = { id: eventDoc.id, ...eventData };
        console.log('Selected Event:', this.selectedEvent); // Agrege este console.log
      } else {
        throw new Error('Invalid event data');
      }
      this.eventModal.present();
    } catch (error) {
      const toast = await this.toastController.create({
        message: 'Error al cargar el evento',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }



  
  closeEventModal() {
    this.eventModal.dismiss();
  }

  async postulate() {
    if (this.selectedEvent) {
      const userId = this.user().uid;
  
      // Verifica si el usuario ya está registrado
      const isRegistered = await this.firebaseSvc.isUserRegistered(this.selectedEvent.id, userId);
      if (isRegistered) {
        const toast = await this.toastController.create({
          message: 'Ya estás registrado para este evento.',
          duration: 2000,
          color: 'warning'
        });
        await toast.present();
        return; // Salir si ya está registrado
      }
  
      const applicantsData = {
        userId: userId,
        userName: this.user().name,
        userEmail: this.user().email,
      };
  
      try {
        // Si no está registrado, agrega al applicante
        await this.firebaseSvc.addapplicants(this.selectedEvent.id, applicantsData);
        const toast = await this.toastController.create({
          message: 'Postulación enviada con éxito',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
        this.closeEventModal();
      } catch (error) {
        const toast = await this.toastController.create({
          message: 'Error al enviar la postulación',
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
      }
    }
  }
  
  //obtener eventos
  getEvents() {
    let path = `events`;
    
    let sub = this.firebaseSvc.getCollectionData(path).subscribe({
     next: (res: any) => {
       console.log(res);
       this.events = res;
       this.sortEventsByDistance();
       sub.unsubscribe();
       },
       error: (err: any) => {
         console.error('Error fetching events:', err);
       }
  

    });

}


 

  addUpdateEvent( event?: Event) {
    this.utilsSvc.presentModal({
      component: AddUpdateEventComponent,
      cssClass: 'add-update-modal',
      componentProps: { event }
    });
  }

   //////////////////////////////////////////////// Geolaclización ////////////////////////////////////////////////
  
  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  async checkLocationPermission() {
    const permission = await Geolocation.requestPermissions();
    if (permission.location === 'denied') {
      console.error('Permiso de ubicación denegado');
      return false;
    }
    return true;
  }

  calculateDistance(loc1: { lat: number, lng: number }, loc2: { lat: number, lng: number }): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(loc2.lat - loc1.lat);
    const dLng = this.deg2rad(loc2.lng - loc1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(loc1.lat)) * Math.cos(this.deg2rad(loc2.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distancia en km
    return distance;
  }

  sortEventsByDistance() {
    this.events.sort((a, b) => {
      const distanceA = this.calculateDistance(this.userLocation, a.location);
      const distanceB = this.calculateDistance(this.userLocation, b.location);
      return distanceA - distanceB;
    });
  }

  

  useManualLocation() {
    if (this.manualLocation) {
      console.log('Usando ubicación manual:', this.manualLocation);
      // Aquí puedes continuar con el proceso para usar esta ubicación
      this.getEvents();
    } else {
      console.log('No se ha seleccionado una ubicación válida.');
    }
  }

  async getUserLocation() {
    try {
      if (Capacitor.getPlatform() === 'web') {
        // Utiliza la API del navegador para geolocalización en la web
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            this.getEvents();
          },
          (error) => {
            console.error('Error obteniendo la ubicación en la web', error);
            this.utilsSvc.presentToast({
              message: 'Error obteniendo la ubicación en la web. Por favor, revisa los permisos.',
              duration: 3000,
              position: 'bottom'
            });
          }
        );
      } else {
        // Solicitar permisos en dispositivos móviles
        const permission = await Geolocation.requestPermissions();
        if (permission.location === 'denied') {
          this.utilsSvc.presentToast({
            message: 'Necesitamos acceso a tu ubicación para mostrar eventos cercanos.',
            duration: 3000,
            position: 'bottom'
          });
          return;
        }
  
        // Obtener la ubicación en dispositivos móviles
        const position = await Geolocation.getCurrentPosition();
        this.userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        this.getEvents();
      }
    } catch (error) {
      console.error('Error obteniendo la ubicación', error);
      this.utilsSvc.presentToast({
        message: 'Error obteniendo la ubicación. Por favor, revisa los permisos.',
        duration: 3000,
        position: 'bottom'
      });
    }
  }
}

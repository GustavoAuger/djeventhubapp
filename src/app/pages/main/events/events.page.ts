import { Component, inject, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Event } from 'src/app/models/event.model';
import { AddUpdateEventComponent } from 'src/app/shared/components/add-update-event/add-update-event.component';

@Component({
  selector: 'app-events',
  templateUrl: './events.page.html',
  styleUrls: ['./events.page.scss'],
})
export class EventsPage implements OnInit {



  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  events: Event[] = [];



  ngOnInit() {
  }

  user(): User {
    return this.utilsSvc.getFromLocalStorage('user');
  }


  ionViewWillEnter() {
    this.getEventsUser();
  }

  addUpdateEvent( event?: Event) {
    this.utilsSvc.presentModal({
      component: AddUpdateEventComponent,
      cssClass: 'add-update-modal',
      componentProps: { event }
    });
  }
  
  //obtener eventos
  getEventsUser() {
    let path = `events`;
    let user = this.user();
    
    let sub = this.firebaseSvc.getCollectionUser(path, user.uid).subscribe({
     next: (res: any) => {
       console.log(res);
       this.events = res;
       sub.unsubscribe();
       },
       error: (err: any) => {
         console.error('Error fetching events:', err);
       }
  

    });

}

//eliminar evento
async deleteEvent(event: Event) {
    

  // let path = `users/${this.user.uid}/events`;   
   let path = `events/${event.id}`;

   const loading = await this.utilsSvc.loading();
   await loading.present();


   let imagePath = await this.firebaseSvc.getFilePath(event.Image);
    await this.firebaseSvc.deletefile(imagePath);
   

   this.firebaseSvc.deleteDocument(path).then(async res => {



     this.events = this.events.filter(e => e.id !== event.id);




     this.utilsSvc.presentToast({ message: 'evento eliminado exitosamente', duration: 1500, color: 'succes', position: 'middle', icon: 'checkmark-circle-outline' });

     

     
   }).catch(error => {
     console.log(error);
     this.utilsSvc.presentToast({ message: error.message, duration: 2000, color: 'danger', position: 'middle', icon: 'alert-circle-outline' });

   }).finally(() => {
     loading.dismiss();
   })
 
}

  
  editEvent(_t9: Event) {
  throw new Error('Method not implemented.');
  }

}
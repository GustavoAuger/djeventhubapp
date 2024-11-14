import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms'; // Importa ReactiveFormsModule

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// ======= firebase ========//
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from 'src/environments/environment.prod';
import { SharedModule } from './shared/shared.module';
import { AddUpdateEventComponent } from './shared/components/add-update-event/add-update-event.component';


@NgModule({
  declarations: [AppComponent,],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment), // Inicializa Firebase con la configuración del entorno
    AngularFireAuthModule, // Importa el módulo de autenticación de Firebase
    AngularFirestoreModule, // Importa el módulo de Firestore de Firebase
    SharedModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Añade CUSTOM_ELEMENTS_SCHEMA aquí si es necesario
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
 
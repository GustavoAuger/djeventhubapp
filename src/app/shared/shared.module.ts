import { NgModule } from '@angular/core';

import { HeaderComponent } from './components/header/header.component';
import { CustomInputComponent } from './components/custom-input/custom-input.component';
import { LogoComponent } from './components/logo/logo.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import { AddUpdateEventComponent } from './components/add-update-event/add-update-event.component';
import { MapComponent } from './components/map/map.component';



@NgModule({
  declarations: [
      HeaderComponent,
      CustomInputComponent,
      LogoComponent,
      AddUpdateEventComponent,
      MapComponent
    ],
  exports: [
    HeaderComponent,
    CustomInputComponent,
    LogoComponent,
    MapComponent,
    AddUpdateEventComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class SharedModule { }

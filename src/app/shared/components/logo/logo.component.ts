
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.scss'],
})
export class LogoComponent implements OnInit {
  icono = 'assets/icon/logo.png';  // Define la ruta de la imagen

  constructor() { }

  ngOnInit() {}
}
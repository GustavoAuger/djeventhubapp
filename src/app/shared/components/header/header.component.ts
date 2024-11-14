import { Component, OnInit, Input, input, inject } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'] // Cambiado a SCSS
})
export class HeaderComponent implements OnInit {

  @Input() title!: string;
  @Input() backbutton!: string;
  @Input() isModal!: boolean;

  utilsSvc = inject( UtilsService);

  ngOnInit() {}


  dismissModal() {
    this.utilsSvc.dismisModal();
  
  }

  

}
import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-custom-input',
  templateUrl: './custom-input.component.html',
  styleUrls: ['./custom-input.component.scss'],
})
export class CustomInputComponent  implements OnInit {

  @Input() Control!: FormControl;
  @Input() type!: string;
  @Input() label!: string;
  @Input() autocomplete!: string;
  @Input() icon!: string;
  @Input() maxlength: number;
  @Input() autoGrow: boolean;

  isPassword!: boolean;
  hide: boolean = true;
  charCount: number = 0;



  constructor() { }

  ngOnInit() {
    if (this.type === 'password') {
      this.isPassword = true;
  }
  this.updateCharCount();


}

onInputChange() {
  this.updateCharCount();
}

updateCharCount() {
  this.charCount = this.Control.value ? this.Control.value.length : 0;
}

  showOrHidePassword() {
    this.hide = !this.hide;
    
    if (this.hide) {
      this.type = 'password';
    } else {
      this.type = 'text';
    }
  }

}

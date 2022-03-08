import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { delay } from "rxjs/operators";
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public title = 'clips';

  constructor(public auth: AuthService) {
  }
  
}

import { Component, OnInit } from '@angular/core';
import { ModalService } from 'src/app/services/modal.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  //public isAuthenticated: boolean = false; 
  //public isAuthenticated$: Observable<boolean>;

  constructor(
    public modal: ModalService, 
    public auth: AuthService
  ) { 
    //this.isAuthenticated$ = this.auth.isAuthenticated$;
    // this.auth.isAuthenticated$.subscribe( status => {
    //   this.isAuthenticated = status;
    // });
  }

  ngOnInit(): void {
  }

  public openModal($event: Event, modalId: string) {
    $event.preventDefault(); 
    this.modal.toggleModal(modalId);
  }

  public async logout($event: Event) {
    $event.preventDefault(); 
    await this.auth.logoutUser();
  }

}

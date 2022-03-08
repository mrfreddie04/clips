import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public credentials = {
    email: "",
    password: ""
  };

  public showAlert: boolean = false;
  public alertColor: string = "blue";
  public alertMsg: string = "You are being logged in...";  
  public inSubmission: boolean = false;
  
  constructor(private auth: AuthService, public modal: ModalService) { }

  ngOnInit(): void {
  }

  public get isDisabled(): boolean {
    return this.inSubmission;
  }  

  public async login() {
    this.alertColor = "blue";
    this.alertMsg = "Please wait! We are logging you in.";      
    this.showAlert = true;
    this.inSubmission = true;
    try {
      await this.auth.loginUser(this.credentials.email, this.credentials.password);
      this.alertColor = "green";
      this.alertMsg = "Login successful!";      
    } catch (e) {
      console.error(e);
      this.alertColor = "red";
      this.alertMsg = "An unexpected error occured. Please try again later.";                 
    } finally {
      this.inSubmission = false;
    }
  }

}

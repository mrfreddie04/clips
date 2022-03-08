import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from "../../services/auth.service";
import { EmailTaken } from '../validators/email-taken';
import { RegisterValidators } from "../validators/register-validators";
//import IUser from "../../models/user.model";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  public showAlert: boolean = false;
  public alertColor: string = "blue";
  public alertMsg: string = "Please wait! Your account is being created.";
  public inSubmission: boolean = false;

  public name = new FormControl("",  [
    Validators.required, 
    Validators.minLength(3)
  ]);
  public email = new FormControl("", [
    Validators.required, 
    Validators.email
  ], [this.emailTaken.validate/*.bind(this.emailTaken)*/]);
  public age = new FormControl("", [
    Validators.required, 
    Validators.min(18), 
    Validators.max(120)
  ]);
  public password = new FormControl("", [
    Validators.required, 
    Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
  ]);
  public confirm_password = new FormControl("", [
    Validators.required
  ]);
  public phoneNumber = new FormControl("",[
    Validators.required,
    Validators.minLength(13),
    Validators.maxLength(13)
  ]);  

  public registerForm = new FormGroup({
    name: this.name,
    email: this.email,
    age: this.age,
    password: this.password,
    confirm_password: this.confirm_password,
    phoneNumber: this.phoneNumber
  }, [RegisterValidators.match("password","confirm_password")]);

  constructor(
    private auth: AuthService, private emailTaken: EmailTaken
  ) {}

  public get isDisabled(): boolean {
    return this.registerForm.invalid || this.inSubmission;
  }

  public async register() {    
    this.alertColor = "blue";
    this.alertMsg = "Please wait! Your account is being created.";
    this.showAlert = true;

    this.inSubmission = true;

    // const { email, password, age, phoneNumber, name } = this.registerForm.value;   
    // const userData: IUser = { email, password, age, phoneNumber, name };
    try {  
      await this.auth.createUser(this.registerForm.value);

      this.alertColor = "green";
      this.alertMsg = "Success! Your account has been created.";      
    } catch (e) {
      console.error(e);
      this.alertColor = "red";
      this.alertMsg = "An unexpected error occured. Please try again later.";           

      this.inSubmission = false;
      return;
    } 
  }
}

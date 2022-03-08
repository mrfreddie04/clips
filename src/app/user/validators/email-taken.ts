import { Injectable } from "@angular/core";
import { AbstractControl, AsyncValidator, ValidationErrors } from "@angular/forms";
import { from, Observable, timer, of } from "rxjs";
import { switchMap, map, tap } from "rxjs/operators";
import { AuthService } from "../../services/auth.service";

@Injectable({
  providedIn: 'root'
})
export class EmailTaken implements AsyncValidator {
  constructor(private auth: AuthService ) {}

  public validate1 = (control: AbstractControl): Promise<ValidationErrors | null> => {
    return this.auth.isEmailTaken(control.value).then( (result) => {
      return result ? { emailTaken: true } : null;
    });
  }

  public validate = (control: AbstractControl): Observable<ValidationErrors |null> => {
    return timer(500).pipe(
      tap(() => console.log("isEmailTaken")),
      switchMap(() => {    
        if (!control.value) {
          return of(null)
        }

        return from(this.auth.isEmailTaken(control.value)).pipe( 
          map( (result) => (result ? { emailTaken: true } : null))
        );
      })
    )
  }	  
}

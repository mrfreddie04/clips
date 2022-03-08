import { Injectable } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { AngularFirestore, AngularFirestoreCollection } from "@angular/fire/compat/firestore";
import firebase from 'firebase/compat/app';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Observable, of } from 'rxjs';
import { delay, switchMap, map, filter, tap } from 'rxjs/operators';
import IUser from "../models/user.model";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usersCollection: AngularFirestoreCollection<IUser>;
  public isAuthenticated$: Observable<boolean>; 
  public isAuthenticatedWithDelay$: Observable<boolean>;
  public user$: Observable<firebase.User | null>;
  private redirect: boolean = false;

  constructor(
    private auth: AngularFireAuth, 
    private db: AngularFirestore,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.usersCollection = this.db.collection<IUser>("users");
    this.isAuthenticated$ = this.auth.user.pipe( map( user => !!user) );
    this.isAuthenticatedWithDelay$ = this.isAuthenticated$.pipe( delay(1000) );  
    this.user$ = this.auth.user;
   
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd ),
      map(e => this.route.firstChild),
      switchMap( route => route ? route.data : of({}))
    ).subscribe( data => {      
      this.redirect = data.authOnly ?? false; 
    });

    // this.auth.user.subscribe( user => {
    //   this.user$.next(user);
    // });
  }

  public async createUser(userData: IUser) {
    const { email, password, age, phoneNumber, name } = userData;  

    if(!password)
      throw new Error("Password not provided");

    const userCred = await this.auth.createUserWithEmailAndPassword(email, password);

    if(!userCred.user)
      throw new Error("User can't be found");
    
    const uid = userCred.user.uid;
    //this function generates document id automatically
    //await this.usersCollection.update({ name, email, age, phoneNumber }); 
    await this.usersCollection
      .doc(uid)                                    //adds or retireves exisitng document with a given id
      .set({ name, email, age, phoneNumber });     //set - adds or modifies exisiting properties in the document 

    await userCred.user.updateProfile({displayName: name}); 
  }    

  public async loginUser(email: string, password: string) {
    return await this.auth.signInWithEmailAndPassword(email, password);
  }

  public async logoutUser() {    
    await this.auth.signOut();
    if(this.redirect) {
      await this.router.navigateByUrl("/");    
    }
  }  

  public async isEmailTaken(email: string) {
    return this.auth.fetchSignInMethodsForEmail(email).then( (methods) => {
      return methods.length !== 0;
    });  
  }  
}

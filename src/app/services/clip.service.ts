import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import firebase from 'firebase/compat/app';
import { AngularFireStorage, AngularFireUploadTask } from "@angular/fire/compat/storage";
import { AngularFirestore, AngularFirestoreCollection, DocumentReference, QuerySnapshot } from "@angular/fire/compat/firestore";
import { BehaviorSubject, firstValueFrom, of, combineLatest, Observable } from "rxjs";
import { switchMap, map, last } from 'rxjs/operators';
import { AuthService } from './auth.service';
import IClip from '../models/clip.model';

@Injectable({
  providedIn: 'root'
})
export class ClipService implements Resolve<IClip | null>{
  private clipsCollection: AngularFirestoreCollection<IClip>;
  private user: firebase.User | null = null
  private pendingRequest: boolean = false;
  public pageClips: IClip[] = [];

  constructor(
    private db: AngularFirestore, 
    private storage: AngularFireStorage, 
    private auth: AuthService,
    private router: Router
  ) {
    this.clipsCollection = this.db.collection<IClip>("clips");
    //this.auth.user$.subscribe(user => this.user = user);
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IClip | null> {
    //const id = route.paramMap.get("id");
    const id = route.params.id;

    return this.clipsCollection.doc(id).get().pipe(
      map( shapshot => {        
        const data = shapshot.data();
        if(!data) {
          this.router.navigate(["/"]);
          return null;
        }
        data.docID = shapshot.id;
        return data;
      })
    );
  }

  public createClip(data: IClip): Promise<DocumentReference<IClip>> {
    return this.clipsCollection.add(data); 
  }

  public updateClip(id: string, title: string) {
    return this.clipsCollection
      .doc(id)
      .update({title: title});
  }  

  public getUserClips(sort$: BehaviorSubject<string>) {
    return combineLatest([this.auth.user$, sort$]).pipe(
      switchMap(([user,sort]) => {
        if(!user) return of<IClip[]>([]);
        const query = this.clipsCollection.ref
          .where( "uid", "==", user.uid)
          .orderBy( "timestamp", sort === "1" ? "desc": "asc");
        return query.get();
      }),
      map( snapshot => (snapshot as QuerySnapshot<IClip>).docs )
    ) 
  }

  public async deleteClip(data: IClip) {
    //if(!data.docID) return;

    // Get ref to file in storage   
    const clipRef = this.storage.ref(`clips/${data.fileName}`);
    const shotRef = this.storage.ref(`screenshots/${data.screenshotFileName}`);
    
    // Delete clip file
    await firstValueFrom(clipRef.delete());
    // Delete screenshot file
    await firstValueFrom(shotRef.delete());    
    // Delete record
    await this.clipsCollection.doc(data.docID!).delete();
  }

  public async getClips() {
    if(this.pendingRequest) return;

    this.pendingRequest = true;

    let query = this.clipsCollection.ref
        .orderBy( "timestamp", "desc")
        .limit(3);

    const { length } = this.pageClips;
    if( length ) {
      const lastDocId = this.pageClips[length - 1].docID;
      const lastDoc = await firstValueFrom(this.clipsCollection.doc(lastDocId).get());
      query = query.startAfter(lastDoc);
    }

    //run the query
    const snapshot = await query.get();
    //update padeClips array
    snapshot.forEach( doc => {
      this.pageClips.push({
        docID: doc.id,
        ...doc.data()
      });
    });

    this.pendingRequest = false;
  }
}

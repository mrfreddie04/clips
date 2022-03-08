import { Router, Params } from '@angular/router';
import { Component, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AngularFireStorage, AngularFireUploadTask } from "@angular/fire/compat/storage";
import firebase from 'firebase/compat/app';
import { from, combineLatest, forkJoin } from "rxjs";
import { switchMap, tap, delay } from 'rxjs/operators';
import { v4 as uuid} from "uuid";
import { ClipService } from '../../services/clip.service';
import { AuthService } from '../../services/auth.service';
import IClip from '../../models/clip.model';
import { FfmpegService } from 'src/app/services/ffmpeg.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnDestroy {
  public isDragover: boolean = false;
  public file: File | null = null;
  public task?: AngularFireUploadTask;
  public screenshotTask?: AngularFireUploadTask;
  public user: firebase.User | null = null
  public nextStep: boolean = false;
  public inSubmission: boolean = false;
  public percentage: number = 0;
  public screenshots: string[] = [];
  public selectedScreenshot: string = "";

  public showPercentage: boolean = false;
  public showAlert: boolean = false;
  public alertColor: string = "blue";
  public alertMsg: string = "Please wait! Your clip is being uploaded.";

  public title= new FormControl("", [Validators.required, Validators.minLength(3)] );
  public thumbnail= new FormControl("", [Validators.required] );

  public uploadForm = new FormGroup({
    title: this.title
    //,thumbnail: this.thumbnail
  });  

  constructor(
    private storage: AngularFireStorage, 
    private auth: AuthService,
    private clipService: ClipService,
    private router: Router,
    public ffmpegService: FfmpegService
  ) {
    this.auth.user$.subscribe(user => this.user = user);
    this.ffmpegService.init();
  }

  ngOnDestroy(): void {
    //cancel upload if one is in progress
    this.task?.cancel();
    //console.log("Upload canceled");
  }

  public get isDisabled(): boolean {
    return this.uploadForm.invalid || this.inSubmission;
  }

  public async storeFile(event: Event) {
    if(this.ffmpegService.isRunning) return;

    this.isDragover = false;
    this.nextStep = false;
    this.file = null;

    if(event instanceof DragEvent)
      this.file = (event as DragEvent).dataTransfer?.files.item(0) ?? null;
    if(event.target instanceof HTMLInputElement)
      this.file = (event.target as HTMLInputElement).files?.item(0) ?? null;

    if(!this.file || this.file.type !== "video/mp4") {
      return;  
    }

    this.screenshots = await this.ffmpegService.getScreenshots(this.file);
    this.selectedScreenshot = this.screenshots[0];

    this.title.setValue(this.file.name.replace(/\.[^/.]+$/,""));
    this.nextStep = true;
  }

  public async uploadFile() {
    this.showAlert = true;
    this.inSubmission = true;
    this.showPercentage = true;
    this.alertColor = "blue";
    this.alertMsg = "Please wait! Your clip is being uploaded.";

    this.uploadForm.disable();  

    //create clips/ folder if one does not exists - to better organize FB storage
    const clipFileName = uuid(); 
    const clipPath = `clips/${clipFileName}.mp4`;

    // grab the blob of selected screenshot 
    const screenshotBlob = await this.ffmpegService.blobFromUrl(this.selectedScreenshot);
    const screenshotPath = `screenshots/${clipFileName}.png`;

    //initiate clip upload  
    this.task = this.storage.upload(clipPath, this.file);
    const clipRef = this.storage.ref(clipPath);

    //initiate screenshot upload  
    this.screenshotTask = this.storage.upload(screenshotPath, screenshotBlob); 
    const shotRef = this.storage.ref(screenshotPath);       

    combineLatest([this.task.percentageChanges(),this.screenshotTask.percentageChanges()])
      .subscribe(([progressClip,progressShot]) => {
        this.percentage = ((progressClip ?? 0)+(progressShot ?? 0)) / 200.0;
    });

    forkJoin([this.task.snapshotChanges(),this.screenshotTask.snapshotChanges()]).pipe(
      switchMap(() => forkJoin([clipRef.getDownloadURL(),shotRef.getDownloadURL()])),
      switchMap(([urlClip,urlShot]) => {
        const clip: IClip = {
          uid: this.user?.uid as string,
          displayName: this.user?.displayName as string,
          title: this.title.value,
          fileName: `${clipFileName}.mp4`,
          screenshotFileName: `${clipFileName}.png`,
          url: urlClip,
          screenshotUrl: urlShot,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };    
        return from(this.clipService.createClip(clip));
      }),
      tap(() => {
        this.alertColor = "green";
        this.alertMsg = "Success! Your clip is now ready to share with the world.";
        this.showPercentage = false;        
      }),
      delay(1000)      
    ).subscribe({
      next: async (clipDocRef) => {
        this.router.navigate(["clip", clipDocRef.id]);
      },
      error: (err) => {
        this.uploadForm.enable();  
        this.alertColor = "red";
        this.alertMsg = "Upload failed! Please, try again later.";   
        this.showPercentage = false;  
        this.inSubmission = false;
        console.log(err);
      }
    });
    
    // this.task.snapshotChanges().pipe(
    //   last(),
    //   switchMap(() => clipRef.getDownloadURL()),
    //   switchMap((url) => {
    //     const clip: IClip = {
    //       uid: this.user?.uid as string,
    //       displayName: this.user?.displayName as string,
    //       title: this.title.value,
    //       fileName: `${clipFileName}.mp4`,
    //       url,
    //       timestamp: firebase.firestore.FieldValue.serverTimestamp()
    //     };    
    //     return from(this.clipService.createClip(clip));
    //   }),
    //   tap(() => {
    //     this.alertColor = "green";
    //     this.alertMsg = "Success! Your clip is now ready to share with the world.";
    //     this.showPercentage = false;        
    //   }),
    //   delay(1000)
    // ).subscribe({
    //   next: async (clipDocRef) => {
    //     this.router.navigate(["clip", clipDocRef.id]);
    //     // clip.url = url;
    //     // const clipDocRef = await this.clipsService.createClip(clip);

    //     //console.log("DB updated",clip);

    //     // this.alertColor = "green";
    //     // this.alertMsg = "Success! Your clip is now ready to share with the world.";
    //     // this.showPercentage = false;

    //     //setTimeout(()=>{this.router.navigate(["clip", clipDocRef.id]);},1000)
    //   },
    //   error: (err) => {
    //     this.uploadForm.enable();  
    //     this.alertColor = "red";
    //     this.alertMsg = "Upload failed! Please, try again later.";   
    //     this.showPercentage = false;  
    //     this.inSubmission = false;
    //     console.log(err);
    //   }
    // });
  

    // this.task
    //   .then(result=>console.log("Done:",result))
    //   .catch(err => console.log("Error:",err))
    //   .finally(()=>{ 
    //     this.showAlert = false;
    //     this.inSubmission = false;
    //   });
    //initialize upload  
    //this.storage.upload(clipPath, this.file);
     
    console.log("File uploaded",this.uploadForm.value);
  }
}

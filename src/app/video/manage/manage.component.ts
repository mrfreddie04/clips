import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ModalService } from 'src/app/services/modal.service';
import { ClipService } from '../../services/clip.service';
import IClip from 'src/app/models/clip.model';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css']
})
export class ManageComponent implements OnInit {
  public videoOrder: string = "1";
  public clips: IClip[]= [];
  public activeClip: IClip | null = null;
  public sort$: BehaviorSubject<string>;

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private clipService: ClipService,
    private modal: ModalService
  ) {
    this.sort$ = new BehaviorSubject<string>(this.videoOrder);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: Params)=>{
      this.videoOrder = params.sort === "2" ? params.sort : "1";
      this.sort$.next(this.videoOrder);
    });  
    this.clipService.getUserClips(this.sort$).subscribe( (docs) => {
      this.clips = [];
      docs.forEach( doc => {
        this.clips.push({
          docID: doc.id,
          ...doc.data()
        });
      });
      //console.log(this.clips);
    });  
  }

  public sort($event: Event ) {
    const { value } =($event.target as HTMLSelectElement);
    //this.router.navigateByUrl(`/manage?sort=${value}`);
    //this.sort$.next(value);
    this.router.navigate([], { 
      relativeTo: this.route,
      queryParams: {sort: value}
    });
  }

  public openModal($event: Event, clip: IClip) {
    $event.preventDefault(); 
    this.activeClip = clip;
    this.modal.toggleModal("edit-clip");
  }    

  public updateClip(event: IClip) {
    const clip = this.clips.find( clip => clip.docID === event.docID)
    if(clip) {
      clip.title = event.title;
    }
  }

  public async deleteClip($event: Event, clip: IClip) {
    $event.preventDefault(); 
    await this.clipService.deleteClip(clip);
    const idx = this.clips.findIndex( el => el.docID === clip.docID );
    if(idx >= 0) this.clips.splice(idx,1);
  }      

  public async copyToClipboard(event: MouseEvent, id: string | undefined) {
    event.preventDefault();
    
    if(!id) return;

    const url = `${location.origin}/clip/${id}`;

    await navigator.clipboard.writeText(url);

    alert("Link Copied!");
  }
}

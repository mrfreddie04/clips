import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ClipService } from './../services/clip.service';

@Component({
  selector: 'app-clips-list',
  templateUrl: './clips-list.component.html',
  styleUrls: ['./clips-list.component.css'],
  providers: [DatePipe]
})
export class ClipsListComponent implements OnInit, OnDestroy {
  @Input() scrollable: boolean = true;

  constructor(public clipService: ClipService) { 
    this.clipService.getClips();
  }

  ngOnDestroy(): void {
    if(this.scrollable)
      window.removeEventListener("scroll", this.handleScroll);

    //reset clips
    this.clipService.pageClips = [];
  }

  ngOnInit(): void {
    if(this.scrollable)
      window.addEventListener("scroll", this.handleScroll);    
  }

  public handleScroll = (event: Event) => {
    const { scrollTop, offsetHeight } = document.documentElement;
    const { innerHeight } = window;

    const bottomOfWindow = (innerHeight + Math.round(scrollTop) === offsetHeight);

    if(bottomOfWindow) {
      console.log("scroll");
      this.clipService.getClips();
    }
  }

}

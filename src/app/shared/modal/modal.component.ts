import { Component, Input, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
  //providers: [ModalService]
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() modalId: string = "";

  constructor(public modal: ModalService, private el: ElementRef) { 
    //ElementRef - get access to the native element representing this component
  }

  ngOnDestroy(): void {
    document.body.removeChild(this.el.nativeElement);
  }

  ngOnInit(): void {
    //append this component to the body element (in the DOM)
	  document.body.appendChild(this.el.nativeElement);
  }

  public closeModal() {
    this.modal.toggleModal(this.modalId);
  }
}

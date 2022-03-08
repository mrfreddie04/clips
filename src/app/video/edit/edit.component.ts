import { Component, Input, OnInit, OnChanges, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ClipService } from './../../services/clip.service';
import { ModalService } from './../../services/modal.service';
import IClip from 'src/app/models/clip.model';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit, OnChanges {
  @Input() activeClip: IClip | null = null;
  @Output() update = new EventEmitter<IClip>(); 
  private inSubmission: boolean = false;

  public showAlert: boolean = false;
  public alertColor: string = "blue";
  public alertMsg: string = "Please wait! Updating clip.";  

  public clipID= new FormControl("");
  public title= new FormControl("", [Validators.required, Validators.minLength(3)] );
  public editForm = new FormGroup({
    id: this.clipID,
    title: this.title
  });

  constructor(public modal: ModalService, public clipService: ClipService) { }

  ngOnChanges(): void {
    this.showAlert = false;
    this.inSubmission = false;
    if(this.activeClip) {
      this.clipID.setValue(this.activeClip.docID);      
      this.title.setValue(this.activeClip.title);
    }
  }
  
  ngOnDestroy(): void {
    this.modal.unregister("edit-clip");
  }

  ngOnInit(): void {
    this.modal.register("edit-clip");
  }

  public get isDisabled(): boolean {
    return this.editForm.invalid || this.inSubmission || !this.activeClip;
  }
    
  public async submit() {
    if(!this.activeClip) return;

    this.alertColor = "blue";
    this.alertMsg = "Please wait! Updating clip.";
    this.showAlert = true;
    this.inSubmission = true;

    try {
      await this.clipService.updateClip(this.clipID.value, this.title.value);
    } catch(err) {
      this.alertColor = "red";
      this.alertMsg = "Update failed! Please, try again later.";   
      this.inSubmission = false;
      return;
    }

    this.activeClip.title = this.title.value;
    this.update.emit(this.activeClip);
    
    this.alertColor = "green";
    this.alertMsg = "Success!";     
    this.inSubmission = false;    
  }
}

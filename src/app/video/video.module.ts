import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from './../shared/shared.module';
import { VideoRoutingModule } from './video-routing.module';
import { UploadComponent } from './upload/upload.component';
import { ManageComponent } from './manage/manage.component';
import { EditComponent } from './edit/edit.component';
import { SafeURLPipe } from './pipes/safe-url.pipe';

@NgModule({
  declarations: [
    UploadComponent,
    ManageComponent,
    EditComponent,
    SafeURLPipe
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    VideoRoutingModule,
    SharedModule
  ]
})
export class VideoModule { }



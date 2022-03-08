import { Injectable } from '@angular/core';
import { createFFmpeg, fetchFile, FFmpeg } from "@ffmpeg/ffmpeg";

@Injectable({
  providedIn: 'root'
})
export class FfmpegService {
  public isReady: boolean = false;
  public isRunning: boolean = false;
  private ffmpeg: FFmpeg;

  constructor() { 
    this.ffmpeg = createFFmpeg({ log: true});
  }

  public async init() {
    if(this.isReady) return; //already loaded
    
    await this.ffmpeg.load();
    this.isReady = true;    

  }

  public async getScreenshots(file: File) {
    //if(this.isRunning) return;

    this.isRunning = true;

    //convert to array of bytes
    const data = await fetchFile(file); 
    
    //save to the File System
    this.ffmpeg.FS("writeFile", file.name, data); 

    //run multiple commands to generate series of screenshots
    const seconds: number[] = [1,2,3];
    const commands: string[] = [];

    seconds.forEach( second => {
      commands.push(
        // Input
        '-i', file.name,
        // Output Options
        '-ss', `00:00:0${second}`,
        '-frames:v', '1',
        '-filter:v', 'scale=510:-1',
        // Output
        `output_0${second}.png`
      );
    })

    //run ffmpeg command - we need to provide command args & options
    await this.ffmpeg.run(...commands);

    //convert binary images to URLs
    const screenshots: string[] = [];
    seconds.forEach( second => {
      const screenshotFile = this.ffmpeg.FS("readFile", `output_0${second}.png`);
      const screenshotBlob = new Blob([screenshotFile.buffer], {
        type: "image/png"
      });
      const screenshotUrl = URL.createObjectURL(screenshotBlob);
      //console.log("URL",screenshotUrl);
      screenshots.push(screenshotUrl);
    });

    this.isRunning = false;

    return screenshots;
  }

  public async blobFromUrl(url: string) {
    const response = await fetch(url);
    const blob = await response.blob();
    return blob; 
  }
}

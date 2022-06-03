import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { trigger, transition, useAnimation } from '@angular/animations';
import { fadeIn, fadeOut, scaleIn, scaleOut } from './figma-image-gallery.animation';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'figma-image-gallery',
  templateUrl: './figma-image-gallery.component.html',
  styleUrls: ['./figma-image-gallery.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('carouselAnimation', [
      transition("void => *", [useAnimation(fadeIn, {params: { time: '700ms' }} )]),
      transition("* => void", [useAnimation(fadeOut, {params: { time: '700ms' }})]),
    ]),
    trigger("slideAnimation", [
      /* scale */
      transition("void => *", [useAnimation(scaleIn, {params: { time: '500ms' }} )]),
      transition("* => void", [useAnimation(scaleOut, {params: { time: '500ms' }})]),
    ])
  ]
})
export class FigmaImageGalleryComponent implements OnInit {

  currentSlide = 0;

  closeBtn = false;
  private _unsubscribeAll: Subject<any> = new Subject();
  

  constructor(
    public dialogRef: MatDialogRef<FigmaImageGalleryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      images: string[]
    }
  ) { 
    this.dialogRef.addPanelClass("transparent-background");
    setTimeout(() => {  this.closeBtn = true;}, 300);
  }

  ngOnInit(): void {


    this.dialogRef.beforeClosed()
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(res => {
      this.closeBtn = false;
    })

  }

  close(data?) {
    this.dialogRef.close(data);
  }
  
  onPreviousClick() {
    const previous = this.currentSlide - 1;
    this.currentSlide = previous < 0 ? this.data.images.length - 1 : previous;
    
  }

  onNextClick() {
    const next = this.currentSlide + 1;
    this.currentSlide = next === this.data.images.length ? 0 : next;
    
  }

}

import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatColors } from '@fuse/mat-colors';

@Component({
  selector: 'banner-edit-dialog',
  templateUrl: './banner-edit-dialog.component.html',
  styleUrls: ['./banner-edit-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class BannerEditDialogComponent {
  banner: string;
  eventForm: FormGroup;
  dialogTitle: string;
  presetColors = MatColors.presets;
  title = 'Changement de bannière';

  constructor(
    public matDialogRef: MatDialogRef<BannerEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private _data: any
  ) {
    this.banner = _data.banner;
    this.eventForm = this.createEventForm();
  }

  createEventForm(): FormGroup {
    return new FormGroup({
      banner: new FormControl(this.banner),
    });
  }
}

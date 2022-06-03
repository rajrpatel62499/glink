import { Component, Input, OnInit, Output, ViewEncapsulation, EventEmitter } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import * as moment from 'moment';

@Component({
  selector: 'figma-date-picker',
  templateUrl: './figma-date-picker.component.html',
  styleUrls: ['./figma-date-picker.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FigmaDatePickerComponent implements OnInit {

  @Input('required') required: boolean = false;

  @Input('range') range: FormGroup = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });

  @Output("closed") closed = new EventEmitter<any>();

  
  constructor() { }

  ngOnInit(): void {
  }

  onClose() {
    this.closed.emit(this.range.value);
  }

  onEndDateChange() {
    const val = this.range.value;
    if (val.start) this.range?.get("start")?.setValue(moment(val.start).startOf("day"));
    if (val.end) this.range?.get("end")?.setValue(moment(val.end).endOf("day"));
    
  }

}

import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import * as _ from 'lodash';

export class RecommentedTimeItem {
  timeEndSub: string;
  timeStart: string;
  timeEnd: string;
  timeStartSub: string;
}

@Component({
  selector: 'app-figma-chip-employee',
  templateUrl: './figma-chip-employee.component.html',
  styleUrls: ['./figma-chip-employee.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class FigmaChipEmployeeComponent implements OnInit {
  @Input() item: any;

  times: RecommentedTimeItem[] = [];
  days = [
    'COMMON.SUN',
    'COMMON.MON',
    'COMMON.TUE',
    'COMMON.WED',
    'COMMON.THU',
    'COMMON.FRI',
    'COMMON.SAT',
  ];

  constructor() {}

  ngOnInit(): void {
    // get the first value in the times array (in case multiple employees)
    if (
      this.item?.times?.length > 0 &&
      Object.values(this.item.times[0]) &&
      Object.values(this.item.times[0])[1] &&
      Object.values(this.item.times[0])[1][0]
    ) {
      this.times = Object.values(this.item.times[0])[1][0];
    }
  }
}

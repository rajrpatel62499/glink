import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';

@Component({
  selector: 'app-figma-schedule-list-header',
  templateUrl: './figma-schedule-list-header.component.html',
  styleUrls: ['./figma-schedule-list-header.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class FigmaScheduleListHeaderComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}

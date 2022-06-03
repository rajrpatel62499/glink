import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';

@Component({
  selector: 'app-figma-task-list-header',
  templateUrl: './figma-task-list-header.component.html',
  styleUrls: ['./figma-task-list-header.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class FigmaTaskListHeaderComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}

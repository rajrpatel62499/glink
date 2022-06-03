import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';

@Component({
  selector: 'app-figma-chip-user',
  templateUrl: './figma-chip-user.component.html',
  styleUrls: ['./figma-chip-user.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class FigmaChipUserComponent implements OnInit {
  @Input() item: any;
  constructor() {}

  ngOnInit(): void {
  }
}

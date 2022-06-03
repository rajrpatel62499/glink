import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';

@Component({
  selector: 'app-figma-header',
  templateUrl: './figma-header.component.html',
  styleUrls: ['./figma-header.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
// export class FigmaHeader {
//   title: string;
//   path: string;
//   subpath: string;
//   payload: any;
// }

export class FigmaHeaderComponent implements OnInit {
  @Input() header: any;
  @Output() back: EventEmitter<void>;

  constructor() {
    this.back = new EventEmitter();
  }

  ngOnInit(): void {
  }

  onClickBack() {
    this.back.emit();
  }
}

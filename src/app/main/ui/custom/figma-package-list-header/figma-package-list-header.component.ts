import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';

@Component({
  selector: 'app-figma-package-list-header',
  templateUrl: './figma-package-list-header.component.html',
  styleUrls: ['./figma-package-list-header.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class FigmaPackageListHeaderComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}

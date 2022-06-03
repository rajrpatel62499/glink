import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';

@Component({
  selector: 'app-figma-chip-package',
  templateUrl: './figma-chip-package.component.html',
  styleUrls: ['./figma-chip-package.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class FigmaChipPackageComponent implements OnInit {
  @Input() item: any;
  // @Input() contacts: any[];

  days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  constructor() {}

  ngOnInit(): void {
  }

  // onClickItem(): void
  //   {
  //       // this._chatService.getChat(contact);

  //       // if ( !this._mediaObserver.isActive('gt-md') )
  //       // {
  //       //     this._fuseMatSidenavHelperService.getSidenav('chat-left-sidenav').toggle();
  //       // }
  //   }
}

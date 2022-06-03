import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';

@Component({
  selector: 'app-figma-chip-task',
  templateUrl: './figma-chip-task.component.html',
  styleUrls: ['./figma-chip-task.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class FigmaChipTaskComponent implements OnInit {
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

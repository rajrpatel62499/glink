import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { ChatService } from 'app/main/apps/chat/chat.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class ChatComponent implements OnInit, OnDestroy {
  selectedChat: any;
  private _unsubscribeAll: Subject<any>;

  constructor(private _chatService: ChatService) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this._chatService.onRoomSelected.pipe(takeUntil(this._unsubscribeAll)).subscribe((chatData) => {
      this.selectedChat = chatData;
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}

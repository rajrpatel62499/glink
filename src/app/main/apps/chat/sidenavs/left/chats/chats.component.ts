import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';

import { ChatService } from 'app/main/apps/chat/chat.service';
import { FuseMatSidenavHelperService } from '@fuse/directives/fuse-mat-sidenav/fuse-mat-sidenav.service';
import { MediaObserver } from '@angular/flex-layout';
import { Room } from '../../../room.model';
import { Subject } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'chat-chats-sidenav',
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class ChatChatsSidenavComponent implements OnInit, OnDestroy {
  rooms: Room[] = [];
  chats: any[];
  chatSearch: any;
  contacts: any[];
  contactsNoAdmin: any[];
  searchText: string;
  user: any;

  // Private
  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   *
   * @param {ChatService} _chatService
   * @param {FuseMatSidenavHelperService} _fuseMatSidenavHelperService
   * @param {MediaObserver} _mediaObserver
   */
  constructor(
    private _chatService: ChatService,
    private _fuseMatSidenavHelperService: FuseMatSidenavHelperService,
    public _mediaObserver: MediaObserver
  ) {
    // Set the defaults
    this.chatSearch = {
      name: '',
    };
    this.searchText = '';

    // Set the private defaults
    this._unsubscribeAll = new Subject();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this.user = this._chatService.user;
    this.contacts = this._chatService.contacts;
    this.contactsNoAdmin = this._chatService.contacts.filter(contact => {
      return contact.type !== 'ADMIN';
    });
    this.rooms = this._chatService.rooms;

    this._chatService.onChatsUpdated
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((updatedChats) => {
        this.chats = updatedChats;
      });

    this._chatService.onRoomsUpdated
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((updatedRooms) => {
        this.rooms = updatedRooms;
      });

    this._chatService.onUserUpdated
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((updatedUser) => {
        this.user = updatedUser;
      });
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Get chat
   *
   * @param contact
   */
  getChat(contact): void {
    // this._chatService.getChat(contact);

    if (!this._mediaObserver.isActive('gt-md')) {
      this._fuseMatSidenavHelperService.getSidenav('chat-left-sidenav').toggle();
    }
  }

  getRoomById(room: Room): void {
    this._chatService.getRoomById(room);

    if (!this._mediaObserver.isActive('gt-md')) {
      this._fuseMatSidenavHelperService.getSidenav('chat-left-sidenav').toggle();
    }
  }

  getRoomByContact(contact): void {
    this._chatService.getRoomByContact(contact);

    if (!this._mediaObserver.isActive('gt-md')) {
      this._fuseMatSidenavHelperService.getSidenav('chat-left-sidenav').toggle();
    }
  }

  /**
   * Set user status
   *
   * @param status
   */
  setUserStatus(status): void {
    this._chatService.setUserStatus(status);
  }

  /**
   * Change left sidenav view
   *
   * @param view
   */
  changeLeftSidenavView(view): void {
    this._chatService.onLeftSidenavViewChanged.next(view);
  }

  /**
   * Logout
   */
  logout(): void {
    
  }
}

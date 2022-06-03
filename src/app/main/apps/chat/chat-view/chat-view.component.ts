import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewChildren,
  ViewEncapsulation
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { FusePerfectScrollbarDirective } from '@fuse/directives/fuse-perfect-scrollbar/fuse-perfect-scrollbar.directive';
import { ChatService } from 'app/main/apps/chat/chat.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { User } from '../../user/user.model';
import { Chat } from '../chat.model';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'chat-view',
  templateUrl: './chat-view.component.html',
  styleUrls: ['./chat-view.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ChatViewComponent implements OnInit, OnDestroy, AfterViewInit {
  user: User;
  dialog: Chat[];
  contact: User;
  replyInput: any;
  selectedRoom: any;

  @ViewChild(FusePerfectScrollbarDirective)
  directiveScroll: FusePerfectScrollbarDirective;

  @ViewChildren('replyInput')
  replyInputField;

  @ViewChildren('titleInput')
  titleInputField;

  @ViewChild('replyForm')
  replyForm: NgForm;

  // Private
  private _unsubscribeAll: Subject<any>;
  /**
   * Constructor
   *
   * @param {ChatService} _chatService
   */
  constructor(private _chatService: ChatService, private _socketService: SocketService) {
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
    this._chatService.onRoomSelected.pipe(takeUntil(this._unsubscribeAll)).subscribe((roomData) => {
      if (roomData) {
        this.selectedRoom = roomData;
        this.contact = roomData.contact;
        this.dialog = roomData.chats;

        if (!!roomData._id) {
          const loggedInUserToken = localStorage.getItem('loggedInUserToken');

          let param = {
            token: loggedInUserToken,
            room: roomData._id,
          };
          this._socketService.emit('anka-join', param);
        }

        this.readyToReply();
      }
    });

    this._socketService.listen('anka-message').subscribe((data) => {
      this.dialog.push(data);
    });
  }

  /**
   * After view init
   */
  ngAfterViewInit(): void {
    this.replyInput = this.replyInputField.first.nativeElement;
    this.readyToReply();
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
   * Decide whether to show or not the contact's avatar in the message row
   *
   * @param message
   * @param i
   * @returns {boolean}
   */
  shouldShowContactAvatar(message, i): boolean {
    return (
      message.who === this.contact._id &&
      ((this.dialog[i + 1] && this.dialog[i + 1]._id !== this.contact._id) || !this.dialog[i + 1])
    );
  }

  /**
   * Check if the given message is the first message of a group
   *
   * @param message
   * @param i
   * @returns {boolean}
   */
  isFirstMessageOfGroup(message, i): boolean {
    const first = i === 0 || (this.dialog[i - 1] && this.dialog[i - 1].sender !== message.sender);
    return first;
  }

  /**
   * Check if the given message is the last message of a group
   *
   * @param message
   * @param i
   * @returns {boolean}
   */
  isLastMessageOfGroup(message, i): boolean {
    const last =
      i === this.dialog.length - 1 ||
      (this.dialog[i + 1] && this.dialog[i + 1].sender !== message.sender);
    return last;
  }

  /**
   * Select contact
   */
  selectContact(): void {
    this._chatService.selectContact(this.contact);
  }

  onComplete(): void {
    // const room = new Room({ _id: this.selectedRoom._id, isCompleted: true });
    this.selectedRoom.isCompleted = true;
    this._chatService.updateRoomById(this.selectedRoom);
  }

  /**
   * Ready to reply
   */
  readyToReply(): void {
    setTimeout(() => {
      this.focusReplyInput();
      this.scrollToBottom();
    });
  }

  /**
   * Focus to the reply input
   */
  focusReplyInput(): void {
    setTimeout(() => {
      this.replyInput.focus();
    });
  }

  /**
   * Scroll to the bottom
   *
   * @param {number} speed
   */
  scrollToBottom(speed?: number): void {
    speed = speed || 400;
    if (this.directiveScroll) {
      this.directiveScroll.update();

      setTimeout(() => {
        this.directiveScroll.scrollToBottom(0, speed);
      });
    }
  }

  /**
   * Reply
   */
  reply(event): void {
    event.preventDefault();

    if (!this.replyForm.form.value.message) {
      return;
    }

    const chat = new Chat({
      type: 'TEXT',
      message: this.replyForm.form.value.message,
      sender: this.user._id,
      username: this.user.username,
      room: this.selectedRoom._id,
    });

    if (!!this.selectedRoom && !!this.selectedRoom._id) {
      this._socketService.emit('anka-message', chat);
    } else {
      if (!this.replyForm.form.value.title) {
        return;
      }

      // it is a brand new room. create the room like so:
      const room = {
        type: 'ADMIN',
        title: this.replyForm.form.value.title,
        chats: [chat],
        participants: [this.user._id, this.contact._id],
        expiry: '2099-02-07T07:07:07-05:00',
      } as any;

      this._chatService.createNewRoom(room);
    }

    // Reset the reply form
    this.replyForm.reset();
    this.readyToReply();
  }
}

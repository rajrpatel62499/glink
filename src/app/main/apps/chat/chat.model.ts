import { User } from '../user/user.model';
import { Room } from './room.model';

enum ChatType {
  TEXT = 'TEXT',
  LINK = 'LINK',
}

export class Chat {
  _id?: string;
  sender?: User;
  type?: string;
  message?: string;
  username?: string;
  room?: Room;
  isRead?: boolean;
  updatedAt?: string;
  modifiedAt?: string;
  createdAt?: string;

  constructor(chat) {
    {
      this._id = chat._id;
      this.sender = chat.sender;
      this.type = chat.type;
      this.message = chat.message;
      this.username = chat.username;
      this.room = chat.room;
      this.isRead = chat.isRead;
      this.updatedAt = chat.updatedAt;
      this.modifiedAt = chat.modifiedAT;
      this.createdAt = chat.createdAt;
    }
  }
}

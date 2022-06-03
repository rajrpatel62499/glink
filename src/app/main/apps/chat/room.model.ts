import { User } from '../user/user.model';
import { Chat } from './chat.model';

enum RoomType {
  CHAT = 'CHAT',
  MESSAGE = 'MESSAGE',
  UNKNOWN = 'UNKNOWN',
}

enum RoomStatus {
  WIP = 'WIP',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
}

export class Room {
  _id?: string;
  title?: string;
  sender?: string;
  chats?: Chat[];
  participants?: User[];
  connections?: User[];
  isCompleted?: boolean;
  isImageRequired?: boolean;
  type?: RoomType;
  status?: RoomStatus;
  hasUnread?: boolean;
  expiry?: string;
  createdBy?: User;
  modifiedBy?: User;
  updatedAt?: string;
  modifiedAt?: string;
  contact?: User;

  availability?: string;
  mood?: string;

  /**
   * Constructor
   *
   * @param room
   */
  constructor(room) {
    {
      this._id = room._id;
      this.title = room.title;
      this.sender = room.sender;
      this.chats = room.chats;
      this.participants = room.participants;
      this.connections = room.connections;
      this.isCompleted = room.isCompleted;
      this.isImageRequired = room.isImageRequired;
      this.type = room.type;
      this.status = room.status;
      this.hasUnread = room.hasUnread;
      this.expiry = room.expiry;

      this.createdBy = room.createdBy;
      this.modifiedBy = room.modifiedBy;
      this.updatedAt = room.updatedAt;
      this.modifiedAt = room.modifiedAt;
      this.availability = 'online';
      this.mood = 'some moode';

      this.contact = this.createContact(this);
    }
  }

  createContact(room: Room): User {
    if (!room.participants) {
      return null;
    }

    const otherParticipants = room.participants.filter((p) => {
      return p._id != room.createdBy._id;
    });
    if (!!otherParticipants && otherParticipants.length > 0) {
      return new User(otherParticipants[0]);
    } else {
      return null;
    }
  }
}

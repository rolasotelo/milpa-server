import { Socket } from 'socket.io';

export interface MiSocket extends Socket {
  nickname?: string;
}

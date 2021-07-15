import { RemoteSocket, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

export interface MiSocket extends Socket {
  nickname?: string;
}

export interface MiRemoteSocket extends RemoteSocket<DefaultEventsMap> {
  nickname?: string;
}

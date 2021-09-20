import { RemoteSocket, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

export interface MiSocket extends Socket {
  nickname?: string;
  sessionID?: string;
  userID?: string;
  roomCode: string | string[];
  gameStatus: GameStatus;
}

export interface MiRemoteSocket extends RemoteSocket<DefaultEventsMap> {
  nickname?: string;
  sessionID?: string;
  userID?: string;
  gameStatus?: GameStatus;
}

export interface GameStatus {
  yourTurn: boolean;
  score: number;
  milpas: string[][];
}

export interface Session {
  userID: string;
  nickname: string;
  connected: boolean;
  roomCode: string;
  gameStatus: GameStatus;
}

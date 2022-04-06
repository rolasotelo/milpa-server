import { RemoteSocket, Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

export interface MiClientSocket extends Socket {
  nickname: string;
  sessionID?: string;
  userID?: string;
  roomCode: string;
  gameStatus?: GameStatus;
}

export interface MiServerSocket extends RemoteSocket<DefaultEventsMap> {
  nickname: string;
  sessionID: string;
  userID: string;
  roomCode: string;
  gameStatus?: GameStatus;
}

export interface Session {
  userID: string;
  nickname: string;
  connected: boolean;
  roomCode: string;
  gameStatus?: GameStatus;
}

export interface ExtendedError extends Error {
  data?: any;
}

export interface IO
  extends Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap> {}

export interface GameStatus {
  playerInTurnID: string;
  currentTurn: number;
  currentStage: number;
  score: {
    [k: string]: number;
  };
  cropsDeck: Array<any>;
  goodsDeck: Array<any>;
  cropsHand: Array<any>;
  goodsHand: Array<any>;
}

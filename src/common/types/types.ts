import { RemoteSocket, Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

export interface MiSocket extends Socket {
  nickname: string;
  sessionID: string;
  userID: string;
  roomCode: string;
  gameStatus: GameStatus;
}

export interface MiRemoteSocket extends RemoteSocket<DefaultEventsMap> {
  nickname?: string;
  sessionID?: string;
  userID?: string;
  gameStatus?: GameStatus;
}

export interface GameStatus {
  playerTurn: string;
  score: Map<string, number>;
  milpas: Map<string, Milpa>;
  cropsDeck: Crop[];
  goodsDeck: Good[];
}

export interface Session {
  userID: string;
  nickname: string;
  connected: boolean;
  roomCode: string;
  gameStatus: GameStatus;
}

export interface ExtendedError extends Error {
  data?: any;
}

export interface IO
  extends Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap> {}

// ! Copied form Client
export type CropAndGoodSlots = (Crop | Good | undefined)[][];

export interface Milpa {
  goods: CropAndGoodSlots;
  crops: CropAndGoodSlots;
}

export interface Crop extends Card {}

export interface Good extends Card {}

interface Card {
  id: string;
  type: 'crop' | 'good';
  name: string;
  icon: string;
  description: string;
  resume: string;
  rules: string;
  modifier?: string[];
  canInteractWith: {
    ownEmptyMilpaSlots: boolean;
    ownFilledMilpaSlots: boolean | string[];
    ownEmptyEdgeSlots: boolean;
    ownFilledEdgeSlots: boolean | string[];
    othersEmptyMilpaSlots: boolean;
    othersFilledMilpaSlots: boolean | string[];
    othersEmptyEdgeSlots: boolean;
    othersFilledEdgeSlots: boolean | string[];
  };
}

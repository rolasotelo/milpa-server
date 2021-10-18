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
  gameStatus: GameStatus;
}

export interface GameStatus {
  playerInTurnID: string;
  currentTurn: number;
  currentStage: number;
  score: {
    [k: string]: number;
  };
  boards: {
    [k: string]: Readonly<Board>;
  };
  cropsDeck: ReadonlyArray<Crop>;
  goodsDeck: ReadonlyArray<Good>;
  cropsHand: ReadonlyArray<Crop>;
  goodsHand: ReadonlyArray<Good>;
}

export interface Session {
  userID: string;
  nickname: string;
  connected: boolean;
  roomCode: string;
  gameStatus: GameStatus | undefined;
}

export interface ExtendedError extends Error {
  data?: any;
}

export interface IO
  extends Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap> {}

// ! Copied form Client
export interface BoardSlot {
  type: string | undefined;
  row: number | undefined;
  column: number | undefined;
  cards: ReadonlyArray<AnyCard>;
}

export type Board = {
  milpa: Readonly<Milpa>;
  edges: Readonly<Edges>;
};
export type Milpa = BoardSlot[][];

export type Edges = BoardSlot[][];

export type AnyCard = Crop | Good | Empty;

export interface Crop extends Card {}

export interface Good extends Card {}
export interface Empty extends Card {}

interface Card {
  type: string;
  name: string;
  icon: string;
  description: string;
  resume: string;
  rules: string;
  modifier: string[];
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

export type Player = {
  userID: string;
  sessionID: string;
  roomCode: string;
  nickname: string;
  connected: boolean;
  gameStatus: GameStatus;
};

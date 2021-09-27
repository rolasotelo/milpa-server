import crypto from 'crypto';

export const MAX_PLAYERS = 2;
export const log = console.log;
export const randomID = () => crypto.randomBytes(8).toString('hex');

import { Session } from 'src/common/types/types';

/* abstract */ class SessionStore {
  findSession(_id: string) {}
  saveSession(_id: string, _session: Session) {}
  findAllSessions() {}
}

class InMemorySessionStore extends SessionStore {
  sessions: Map<string, Session>;
  constructor() {
    super();
    this.sessions = new Map<string, Session>();
  }

  findSession(id: string) {
    return this.sessions.get(id);
  }

  saveSession(id: string, session: Session) {
    this.sessions.set(id, session);
  }

  findAllSessions() {
    return [...this.sessions.values()];
  }
}

module.exports = {
  InMemorySessionStore,
};

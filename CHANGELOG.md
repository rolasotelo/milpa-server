# Milpa Server

Changelog for [la-milpa-server](https://github.com/rolasotelo/la-milpa-server)

## Issue [#1](https://github.com/rolasotelo/la-milpa-server/issues/1)

### Persist players and handle players leaving the game.

    As it is now, a new Socket ID is generated upon reconnection, so every time a user gets disconnected and reconnects, it will get a new user ID.

    Also it is needed to start a timer when players leave for then automatically closing the room.

- I plan to check on https://socket.io/get-started/private-messaging-part-2/ to solve the 'persist players' issue.
- Session storage is initially implemented in memory.
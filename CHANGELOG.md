# Milpa Server

Changelog for [la-milpa-server](https://github.com/rolasotelo/la-milpa-server)

## Issue [#1](https://github.com/rolasotelo/la-milpa-server/issues/1)

### Persist players and handle players leaving the game.

    As it is now, a new Socket ID is generated upon reconnection, so every time a user gets disconnected and reconnects, it will get a new user ID.

    Also it is needed to start a timer when players leave for then automatically closing the room.

- I plan to check on https://socket.io/get-started/private-messaging-part-2/ to solve the 'persist players' issue. (rola@hey.com)
- Session storage is initially implemented in memory. (rola@hey.com)
- Maybe a timer to close a room and player sessions after player disconnections will be needed, because now you can always come back to the room. (rola@hey.com)
- A logical follow up to this issue will probably be working on the match workflow and the messages that will be send during it. (rola@hey.com)

## Issue [#3](https://github.com/rolasotelo/la-milpa-server/issues/3)

### Create match workflow

    Create match workflow and design messages and data types of the information that will be shared.

- I plan to add the 'game status' (Not sure yet how i will call it) to the session stored for every player, it will probably be an object formed with at least the information of both players milpas, the current score for each one and who's turn it is. Then everytime a player in client takes a action, an event is recieved that updates the 'game status' of all players in the room. (rola@hey.com)

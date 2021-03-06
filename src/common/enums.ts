enum MatchEvent {
  Connection_Error = 'connect_error',
  Session_Saved = 'session saved',
  Users_In_Room = 'users in room',
  Room_Filled = 'room filled',
  Start_Game = 'start game',
  Start_Game_Handshake = 'start game handshake',
  Player_Disconnection = 'player disconnected',
  Ok_Start_Game = 'ok start game',
  End_Of_Handshake = 'end of handshake',
  Start_Update_Board = 'start update board',
  End_Update_Board = 'end update board',
  Player_Joined_The_Room = 'player joined the room',
  User_Connected = 'user connected',
  New_User_Connected = 'new user connected',
  Connection_Attempted = 'connection attempted',
  Ok_Update_Milpa = 'ok update milpa',
  Disconnection = 'disconnect',
}

// eslint-disable-next-line import/prefer-default-export
export { MatchEvent };

// ****  Server  ****//

const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMessage, generateLocation } = require("./utils/message");
const {
  addUser,
  getUser,
  removeUser,
  getUsersInRoom,
} = require("../src/utils/users");

const app = express();
//we create the server outside our express librarie
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

//setup the static directory too serve
app.use(express.static(publicDirectoryPath));

// let count = 0;

// connection ==> run some code wen the use connected
io.on("connection", (socket) => {
  console.log("New Websocket connection");

  //   //send an event from the server
  //   socket.emit("countUpdated", count);

  // // get connected to incrment from the client
  //   socket.on("increment", () => {
  //     count++;
  //     // socket.emit("countUpdated", count); //emit the event to spcefic connection (socket.emit= one user)
  //     io.emit("countUpdated", count); // emit the event to every signle connection (io.emit=all the users)
  //   });

  // user joining the room
  socket.on("join", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    // socket.on("join", ({ username, room }, callback) => {
    //   const { error, user } = addUser({ id: socket.id, username, room });
    if (error) {
      return callback(error);
    }
    socket.join(user.room);

    socket.emit("message", generateMessage("Admin", "Welcome!"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("Admin", `${user.username} has joined!`)
      );
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    callback();
  });

  socket.on("sendMessage", (data, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();
    if (filter.isProfane(data)) {
      return callback("Profanity is not allowed!");
    }
    io.to(user.room).emit("message", generateMessage(user.username, data));
    callback();
  });

  socket.on("sendLocation", ({ lat, long }, callback) => {
    const user = getUser(socket.id);
    // io.emit("message", `Location: ${lat},${long}`);
    io.to(user.room).emit(
      "locationMessage",
      generateLocation(
        user.username,
        `https://google.com/maps?q=${lat},${long}`
      )
    );

    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} has left!`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});

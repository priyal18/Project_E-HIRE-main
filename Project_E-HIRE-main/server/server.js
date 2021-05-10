const express = require("express");
const http = require("http");
const request = require("request");
const app = express();
const { ExpressPeerServer } = require('peer');
const server = http.createServer(app);
const peerServer = ExpressPeerServer(server, {
  debug:true
});
const socket = require("socket.io");
const io = socket(server, { cors: { origin: "*" } });


app.use(require('cors')());
app.use('/peerjs',peerServer);



io.on("connection", (socket) => {
  socket.on("join-room", (userData) => {
    const { roomId, userId } = userData;
    socket.join(roomId);

    socket.broadcast.to(roomId).emit('user-connected',userData);

    socket.on("codeChanged", (code) => {
      socket.broadcast.to(roomId).emit("codeChanged1", code);
    });
    socket.on("outputChanged", (text) => {
      socket.broadcast.to(roomId).emit("outputChanged1", text);
    });
    socket.on("inputChanged", (text) => {
      socket.broadcast.to(roomId).emit("inputChanged1", text);
    });

    socket.on("submit-code", (data) => {
      request(
        {
          url: "https://api.jdoodle.com/v1/execute",
          method: "POST",
          json: data,
        },
        function (error, response, body) {
          socket.emit("recieve-output", body);
        }
      );
    });

    socket.on('disconnect', () => {
      socket.broadcast.to(roomId).emit('user-disconnected', userId);
    });
  });
});

server.listen(5000);

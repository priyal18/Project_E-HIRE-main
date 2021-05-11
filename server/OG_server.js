const express = require("express");
const http = require("http");
const request = require("request");
const app = express();

const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  socket.on("join-room", (roomId) => {
    socket.join(roomId);

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
  });
});

server.listen(5000);

const express = require("express");
const http = require("http");
const request = require("request");
const app = express();
const path = require('path');
const { ExpressPeerServer } = require('peer');
const server = http.createServer(app);
const peerServer = ExpressPeerServer(server, {
  debug:false
});
const socket = require("socket.io");
const io = socket(server, { cors: { origin: "*" } });


app.use(require('cors')());
app.use('/peerjs',peerServer);

app.use(express.static(path.join(__dirname, 'client/build')));


io.on("connection", (socket) => {
  socket.on("join-room", (userData) => {
    const { userId , roomId } = userData;
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

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

server.listen(process.env.PORT||5000);

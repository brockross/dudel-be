const app = require("express")();
const httpServer = require("http").createServer(app);
const cors = require("cors");
app.use(cors);
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET"],
  },
});

io.on("connection", (socket) => {
  console.log(`somebody connected!`);
  socket.emit("testyBoi", "hey buddy");
});

httpServer.listen(1337, () => {
  console.log("server listening...");
});

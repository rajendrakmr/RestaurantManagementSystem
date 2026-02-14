const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const app = require("./app"); 
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*" }
});

global.io = io;
require("dotenv").config();  

const uri ="mongodb+srv://rajen:Ckjdz6k9ylnU85Bc@cluster0.qnsjbe8.mongodb.net/?appName=Cluster0"
// const uri = "mongodb://rajen:Ckjdz6k9ylnU85Bc@atlas-sql-698f2d2ddbdd40b4b55ce703-2nmnrz.a.query.mongodb.net:27017/myVirtualDatabase?ssl=true&authSource=admin&retryWrites=true&w=majority";

mongoose.connect(uri)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));


io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

// const PORT = 5000;
const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

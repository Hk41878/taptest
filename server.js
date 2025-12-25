const express = require("express");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const DATA_FILE = path.join(__dirname, "taps.json");

let taps = 0;

// load saved data
if (fs.existsSync(DATA_FILE)) {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
        taps = data.taps || 0;
    } catch {}
}

app.use(express.static(__dirname));

io.on("connection", socket => {
    socket.emit("update", taps);

    socket.on("tap", () => {
        taps++;

        fs.writeFileSync(
            DATA_FILE,
            JSON.stringify({ taps }, null, 2)
        );

        io.emit("update", taps);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log("Running on port", PORT);
});

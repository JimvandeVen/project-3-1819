const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.set("views", "view");
app.set("view engine", "ejs");

app.use(express.static('public'))

app.get('/', index)
app.get('/newLog', newLog)
app.get('/notifications', notifications)

function index(req, res) {
    res.render("pages/index");
};

function newLog(req, res) {
    res.render("pages/newLog");
};

function notifications(req, res) {
    res.render("pages/notifications");
};

let logs = []





io.on("connection", function (socket) {

    socket.on('joinShifter', function () {
        socket.join('shifter');
        console.log("shifter");
    });

    socket.on('joinShiftleader', function () {
        socket.join('shiftleader');
        console.log("shiftleader");
    });

    socket.on('joinRunManager', function () {
        socket.join('runManager');
        console.log("runManager");
    });

    socket.on("newLog", function (socket) {
        let log = socket
        logs.push(log)
        if (log.tags.includes("criticalError") || log.tags.includes("criticalSucces")) {
            io.to('runManager').emit('log', log);
            io.to('shiftleader').emit('log', log);
            io.to('shifter').emit('log', log);
        } else if (log.tags.includes("error") || log.tags.includes("succes")) {
            io.to('shiftleader').emit('log', log);
            io.to('shifter').emit('log', log);
        } else {
            io.to('runManager').emit('log', log);
        }
    })
})

http.listen(process.env.PORT || 3000)
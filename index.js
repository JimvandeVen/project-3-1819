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
let runManagerLogs = []
let shiftleaderLogs = []
let shifterLogs = []
let runManagerCount = 0
let shiftleaderCount = 0
let shifterCount = 0




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
        socket.id = logs.length + 100000000
        let log = socket
        console.log(log)

        logs.push(log)
        if (log.tags.includes("criticalError") || log.tags.includes("criticalSucces")) {

            runManagerCount++
            runManagerLogs.push(log)
            io.to('runManager').emit('newLog', { log: log, count: runManagerCount });

            shiftleaderCount++
            shiftleaderLogs.push(log)
            io.to('shiftleader').emit('newLog', { log: log, count: shiftleaderCount });

            // shifterCount++
            // shifterLogs.push(log)
            // io.to('shifter').emit('newLog', { log: log, count: shifterCount });
        } else if (log.tags.includes("error") || log.tags.includes("succes")) {

            shiftleaderCount++
            shiftleaderLogs.push(log)

            io.to('shiftleader').emit('newLog', { log: log, count: shiftleaderCount });

            // shifterCount++
            // shifterLogs.push(log)
            // io.to('shifter').emit('newLog', { log: log, count: shifterCount });
        } else {
            runManagerCount++
            runManagerLogs.push(log)

            io.to('runManager').emit('newLog', { log: log, count: runManagerCount });
        }
    })

    socket.on("loadNotifications", function (role) {
        if (role == "runManager") {
            io.to('runManager').emit('notifications', { logs: runManagerLogs, count: runManagerCount });
        } else if (role == "shiftleader") {
            io.to('shiftleader').emit('notifications', { logs: shiftleaderLogs, count: shiftleaderCount });
        } else {
            io.to('shifter').emit('notifications', { logs: shifterLogs, count: shifterCount });
        }
    })

    socket.on("statusChange", async function (change) {
        console.log(change);
        let isInManager = runManagerLogs.some(runManagerLog => runManagerLog['id'] == change.logId)
        let isInLeader = shiftleaderLogs.some(shiftleaderLog => shiftleaderLog['id'] == change.logId)
        let isInShifter = shifterLogs.some(shifterLog => shifterLog['id'] == change.logId)

        if (isInManager) {
            await changeStatus(runManagerLogs, change)
            await moveLog(runManagerLogs, change)
            runManagerCount--
        } else if (isInLeader) {
            await changeStatus(shiftleaderLogs, change)
            await moveLog(shiftleaderLogs, change)
            shiftleaderCount--
        } else if (isInShifter) {
            await changeStatus(shifterLogs, change)
            await moveLog(shifterLogs, change)
            shifterCount--
        }
    })

    function changeStatus(logs, change) {
        logs.forEach(log => {
            if (log.id == change.logId) {
                log.status = change.status
            }
        })
    }

    function moveLog(logs, change) {
        logs.forEach(log => {
            if (log.id == change.logId && log.status == "shifters") {
                shifterLogs.push(log)
                shifterCount++
                io.to('shifter').emit('newCount', { count: shifterCount });
            } else if (log.id == change.logId && log.status == "manager") {
                runManagerLogs.push(log)
                runManagerCount++
                io.to('runManager').emit('newCount', { count: runManagerCount });
            } else if (log.id == change.logId && log.status == "manager") {

            }
        })
        let removeIndex = logs.findIndex(log => log.id == change.logId);
        logs.splice(removeIndex, 1);
    }
})

http.listen(process.env.PORT || 3000)
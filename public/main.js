const socket = io.connect(window.location.origin);
const login = document.querySelector(".login");
const notificationNumber = document.querySelector(".notificationNumber")
const notificationFeed = document.querySelector(".notificationFeed")
const newLog = document.querySelector(".newLog")
const notifications = document.querySelector(".notifications")
const newLogSubmit = document.querySelector(".newLogSubmit")
const main = document.querySelector(".main")
const loginSection = document.querySelector(".loginSection")
const newlogSection = document.querySelector(".newlogSection")



newLog.addEventListener("click", e => {
    e.preventDefault()
    main.classList.add("hide")
    newlogSection.classList.remove("hide")
})

notifications.addEventListener("click", e => {
    e.preventDefault()
    getNotifications(socket)
    newlogSection.classList.add("hide")
    main.classList.remove("hide")
})


if (login) {
    login.addEventListener("submit", e => {
        e.preventDefault();
        let job = new FormData(login)
        let output = ""
        for (const entry of job) {
            output = entry[1];
        };
        // console.log(output)
        if (output == "shifter") {
            socket.role = "shifter"
            socket.emit("joinShifter")
        } else if (output == "shiftleader") {
            socket.role = "shiftleader"
            socket.emit("joinShiftleader")
        } else {
            socket.role = "runManager"
            socket.emit("joinRunManager")
        }

        getNotifications(socket)
        loginSection.classList.add("hide")
        main.classList.remove("hide")

        // main.innerHTML = `
        // <section class="notificationFeed">
        //     <h2 class="logTitle">Logs</h2>
        // </section>`
    });
}

function getNotifications(socket) {
    let role = socket.role
    socket.emit("loadNotifications", role)
}

if (newLogSubmit) {
    newLogSubmit.addEventListener("submit", e => {
        e.preventDefault()
        const title = document.querySelector("#title").value
        const tagRadios = document.querySelectorAll(".tag")
        const text = document.querySelector(".text").value
        let tagValues = []

        tagRadios.forEach(tagRadio => {
            if (tagRadio.checked == true) {
                tagValues.push(tagRadio.value)
            }

        })

        let log = {
            title: title,
            tags: tagValues,
            text: text,
            id: 1,
            status: ""
        }

        socket.emit("newLog", log)
    })
}

socket.on("newLog", function (data) {
    let log = data.log
    let count = data.count
    console.log(log, count)

    notificationCount(count)
})

socket.on("newCount", function (data) {
    let count = data.count
    notificationCount(count)
})

function notificationCount(count) {
    notificationNumber.innerHTML = count
}

socket.on("notifications", function (data) {
    let logs = data.logs
    let count = data.count
    notificationFeedHandler(logs)
    notificationCount(count)
})

function notificationFeedHandler(logs) {
    if (logs.length > 0) {
        main.innerHTML = logs.map(log => {
            return `<div id="${log.id}"class="log ${log.tags[0]} ${log.status}">
            <h2>${log.tags[0]}</h2>
            <form class="logHandleForm">
                <div class="inputs">
                    <input type="radio" data-id="${log.id}" id="archived:${log.id}" name="review" value="archived">
                    <label class="label" for="archived:${log.id}">Reviewed and Archived</label>


                    <input type="radio" data-id="${log.id}" id="shifters:${log.id}" name="review" value="shifters">
                    <label class="label" for="shifters:${log.id}">Reviewed and sent back to shifters</label>


                    <input type="radio" data-id="${log.id}" id="manager:${log.id}" name="review" value="manager">
                    <label class="label" for="manager:${log.id}">Reviewed and sent back to run manager</label>
                </div>
            </form>
            <h3>Title: ${log.title}</h3>
            <p>Log: ${log.text}</p>
        </div>`}).join('')
    } else {
        main.innerHTML = `
        <h3>No new notifications</h3>
        `
    }

    const logHandleForms = document.querySelectorAll(".logHandleForm")
    logHandleForms.forEach(logHandleForm => {
        logHandleForm.addEventListener("change", function (e) {
            reviewHandler(e)
        })
    })
}

function reviewHandler(e) {
    console.log(e)

    let change = {
        logId: e.srcElement.dataset.id,
        status: e.srcElement.value
    }
    socket.emit("statusChange", change)

}
// removeAnimation()


// function removeAnimation() {
//     const tweets = document.querySelectorAll(".tweet")
//     tweets.forEach(tweet => {
//         tweet.classList.add("oldTweet")
//         setTimeout(function () { tweet.classList.remove("tweet"); }, 300);
//     })
// }
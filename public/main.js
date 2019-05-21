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
        const tagCheckboxes = document.querySelectorAll(".tag")
        const text = document.querySelector(".text").value
        let tagValues = []

        tagCheckboxes.forEach(tagCheckbox => {
            if (tagCheckbox.checked == true) {
                tagValues.push(tagCheckbox.value)
            }

        })

        let log = {
            title: title,
            tags: tagValues,
            text: text,
            id: 1
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

function notificationCount(count) {
    notificationNumber.innerHTML = count
}

socket.on("notifications", function (data) {
    let logs = data.logs
    notificationFeedHandler(logs)
})

function notificationFeedHandler(logs) {
    if (logs.length > 0) {
        main.innerHTML = logs.map(log => {
            return `<div class="log">
            <h3>${log.title}</h3>
            <form class="logHandleForm">
                <input type="radio" data-id="${log.id}" id="like:${log.id}" name="likes" value="like">
                <label for="like:${log.id}">Like</label>
                <input type="radio" data-id="${log.id}" id="dislike:${log.id}" name="likes" value="dislike">
                <label for="dislike:${log.id}">Dislike</label>
            </form>
            <p>${log.text}</p>
        </div>`}).join('')
    } else {
        main.innerHTML = `
        <h3>No new notifications</h3>
        `
    }


}




// const likeForms = document.querySelectorAll(".likeForm")
// likeForms.forEach(likeForm => {
//     likeForm.addEventListener("change", function (e) {
//         likeHandler(e)
//     })
// })
// removeAnimation()


// function removeAnimation() {
//     const tweets = document.querySelectorAll(".tweet")
//     tweets.forEach(tweet => {
//         tweet.classList.add("oldTweet")
//         setTimeout(function () { tweet.classList.remove("tweet"); }, 300);
//     })
// }
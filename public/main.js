const socket = io.connect(window.location.origin);
const login = document.querySelector(".login");

if (login) {
    login.addEventListener("submit", e => {
        e.preventDefault();
        let job = new FormData(login)
        let output = ""
        for (const entry of job) {
            output = entry[1];
        };
        console.log(output)
        if (output == "shifter") {
            socket.emit("joinShifter")
        } else if (output == "shiftleader") {
            socket.emit("joinShiftleader")
        } else {
            socket.emit("joinRunManager")
        }
        login.remove()
    });
}


const newLogSubmit = document.querySelector(".newLogSubmit")
if (newLogSubmit) {
    newLogSubmit.addEventListener("submit", e => {
        e.preventDefault();

        const title = document.querySelector("#title").value
        const tagCheckboxes = document.querySelectorAll(".tag")
        const text = document.querySelector(".text").value
        // console.log(text)
        let tagValues = []

        tagCheckboxes.forEach(tagCheckbox => {
            if (tagCheckbox.checked == true) {
                // console.log(tagCheckbox.value)
                tagValues.push(tagCheckbox.value)
            }

        })

        let log = {
            title: title,
            tags: tagValues,
            text: text
        }
        // console.log("newLog", log)

        socket.emit("newLog", log)
    })
}

socket.on("log", function (log) {
    console.log(log)
})

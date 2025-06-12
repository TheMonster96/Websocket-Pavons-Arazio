//const form_button=document.getElementById("form_button")

const shelly_devices = []

const ws = new WebSocket("wss://192.168.1.2:3000/home")
console.log(ws)


ws.addEventListener("open", function () {
    console.log("Connection established")
})

ws.addEventListener("error", (event) => {
    console.log("WebSocket error" + event)
    console.log(event.type)
    console.log(event.target)
})


shelly_devices.forEach(shelly_device => {
    shelly_device.setAttribute('state', false)

    shelly_device.addEventListener('click', (e) => {
        e.preventDefault()

        const msg = JSON.stringify({
            dest: shelly_device.id,
            method: "Toggle"
        })
        console.log(msg)

        ws.send(msg)
    })
})



ws.addEventListener("message", message => {
    const msg = JSON.parse(message.data)
    console.log(msg)

    if (msg.shelly_information) {
        console.log("adding new shelly")
        const shelly = document.createElement("img")

        shelly.setAttribute('src', (msg.state ? "/public/B_On.svg" : "/public/B_Off.svg"))
        shelly.setAttribute('state', msg.state)
        if (msg.name !== undefined)
            shelly.setAttribute('id', msg.name)
        else if (msg.id !== undefined)
            shelly.setAttribute('id', msg.id)
        else
            shelly.setAttribute('id', 'no name')

        shelly.addEventListener('click', (e) => {
            e.preventDefault()

            const msg = JSON.stringify({
                dest: shelly.id,
                method: "Toggle"
            })
            console.log(msg)

            ws.send(msg)
        })

        shelly_devices.push(shelly)
        document.body.appendChild(shelly)
    }

    else if (msg.is_closed) {
        shelly_devices.forEach(shelly_device => {
            if (shelly_device.name === msg.name || shelly_device.id === msg.id) {
                shelly_devices.pop(shelly_device)
                document.body.removeChild(shelly_device)
            }
        })
    }

    else if (msg.state !== undefined) {
        let which_shelly;
        if (msg.which_shelly.name !== null)
            which_shelly = msg.which_shelly.name
        else if (msg.which_shelly.id !== undefined)
            which_shelly = msg.which_shelly.id
        changeImage(msg.state, which_shelly)
    }


    //console.log(msg.was_on)
    //changeImage(msg.was_on)
    //changeImage(switch_state)

})

function changeImage(switch_state, shelly_device_name) {
    //console.log(switch_state, shelly_device_name)
    let shelly_device = undefined

    shelly_devices.forEach(shelly_device_map => {
        if (shelly_device_name == shelly_device_map.id)
            shelly_device = shelly_device_map
    })

    console.log(shelly_device, " ", shelly_device.getAttribute('state'))

    const shelly_state = getBoolean(shelly_device.getAttribute('state'))
    console.log(shelly_state)

    if (switch_state !== shelly_state) {
        console.log(switch_state, " previous state: ", shelly_state)
        shelly_device.setAttribute('state', !shelly_state)
        console.log("new state: ", shelly_device.getAttribute('state'))
        !shelly_state ? shelly_device.src = "/public/B_On.svg" : shelly_device.src = "/public/B_Off.svg"
    }
}

function getBoolean(string) {
    if (string === "true")
        return true
    return false
}




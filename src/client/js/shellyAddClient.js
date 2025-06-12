
let shelly_selection = document.getElementById('shelly_devices')

if (shelly_selection != null)
    console.log(shelly_selection.options)

const ws_test_button = document.getElementById('ws_test_button')



const ws = new WebSocket("wss://192.168.1.2:3000/api/v1/shellyAdd")
console.log(ws)


ws.addEventListener('open', () => {
    console.log("WebSocket started and listening")
})

ws.addEventListener("error", (error) => {
    console.log("WebSocket error" + error)
    console.log(error.type)
    console.log(error.target)
    ws.close()
})

ws.addEventListener('message', (data) => {
    const message = JSON.parse(data.data)
    console.log(message)
    let eventNotifier = document.createElement("p")

    eventNotifier.style.color = "lightblue"

    if (message.eventTypes && message.newShellys) {
        eventNotifier.innerHTML = "New Refresh. Updating list"

        for (let i = 0; i < message.newShellys.length; i++) {
            //console.log(message.newShellys[i])
            createNewShellyElement(message.newShellys[i])
        }
    }

    console.log(eventNotifier)
    document.body.appendChild(eventNotifier)
    setTimeout(function removeNotifier() {
        document.body.removeChild(eventNotifier)

    }, 3000)
})

function createNewShellyElement(shellyInfo) {

    let exists = false
    for (const option of shelly_selection.options) {
        const [id_or_name, ws_conf] = option.text.split(" ")
        console.log([id_or_name, ws_conf])
        console.log(option.value, option.text)

        if (option.value !== shellyInfo.address && (id_or_name !== shellyInfo.name || id_or_name !== shellyInfo.id) && ws_conf !== shellyInfo.ws.server) {
            console.log("Iè divessu connutu diu")
            console.log(shellyInfo.address, shellyInfo.name, shellyInfo.id, shellyInfo.ws.server)
        } else {
            exists = true
        }
    }

    if (!exists) {
        const shelly = document.createElement('option')
        shelly.setAttribute('value', shellyInfo.address)
        shelly.innerHTML = `${shellyInfo.id || shellyInfo.name} ${shellyInfo.ws.server}`
        shelly_selection.appendChild(shelly)
    }
}
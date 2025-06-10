
let shelly_selection = document.getElementById('shelly_device')

const ws_test_button = document.getElementById('ws_test_button')



const ws = new WebSocket("wss://192.168.1.2:3000/api/v1/shellyAdd")
console.log(ws)

ws_test_button.addEventListener("click", (e) => {
    e.preventDefault()

    ws.send("Test")
})

ws.addEventListener('open', () => {
    console.log("WebSocket started and listening")
})

const eventTypes = ["Refresh", "ShellyNameUpdate", "RegisteredShelly"]

ws.addEventListener('message', (data) => {
    const message = JSON.parse(data.data)
    console.log(message)

    if (data.eventType === eventTypes[0]) {

    }
})
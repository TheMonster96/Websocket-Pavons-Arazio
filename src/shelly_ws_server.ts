/*import { WebSocketServer, WebSocket } from "ws"
import { shelly_devices } from "./utils.js"
import wsS_clients from "./client_ws_server.js"
import { IncomingMessage, Server } from "http"

/*export function createShellyWSS(): WebSocketServer {
    return new WebSocketServer({ port: 8888 }, () => {
        console.log("WS client server started")
    })
}

const wsS_shelly = createShellyWSS()
const wsS_shelly = new WebSocketServer({ port: 8888 }, () => {
    console.log("WS client server started")
})

wsS_shelly.on('close', () => {
    console.log("WebSocket Shelly Server connection closed")
})

wsS_shelly.on('connection', function (socket: WebSocket, req: IncomingMessage) {
    if (req.headers['sec-websocket-protocol'] == 'json-rpc' && req.headers['user-agent']?.includes('(ShellyOS)')) {
        const address = req.socket.remoteAddress?.substring(7)
        socket.connected_device_information = { is_shelly: true, remote_address: address, which_shelly: shelly_devices.get(address), state: false }
    }
    console.log(socket.connected_device_information)

    socket.on('close', (code, reason) => {
        console.log(`WebSocket shelly ${socket.connected_device_information} connection closed with code ${code} and reason ${reason}`)
    })

    socket.on('message', (data) => {
        const message = JSON.parse(data.toString('utf-8'))

        if (message.params !== undefined) {
            if (message.params['switch:0']) {
                socket.connected_device_information.state = message.params['switch:0'].output
                console.log(socket.connected_device_information)

                wsS_clients.clients.forEach((client: WebSocket) => {
                    if (client.connected_device_information.is_client) {
                        client.send(JSON.stringify(socket.connected_device_information))
                    }
                })
            }
        }
        else if (message.result !== undefined) {
            if (message.result.source === "WS_in") {
                wsS_clients.clients.forEach((client: WebSocket) => {
                    if (client.connected_device_information.is_client) {
                        client.send(JSON.stringify({
                            is_shelly: socket.connected_device_information.is_shelly,
                            remote_address: socket.connected_device_information.remote_address,
                            which_shelly: socket.connected_device_information.which_shelly,
                            state: message.result.output
                        }))
                    }
                })
            }
        }
    })
}) */

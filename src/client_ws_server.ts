/*import { WebSocketServer, WebSocket, Server } from "ws"
import app from "./express-app.js"
import { shelly_devices } from "./utils.js"
import serverS from "./httpsServer.js"
import wsS_shelly from "./shelly_ws_server.js"
import { getKeyByValue } from "./utils.js"



export function createClientWSS(): WebSocketServer {
    return new WebSocketServer({ server: serverS }, () => {
        console.log("WS client server started")
    })
}



const wsS_clients = createClientWSS()
export default wsS_clients

wsS_clients.on("error", error => {
    console.log("WS Server? error : " + error.name)
    console.log(error.message)
    console.log(error.stack)
    console.log(error.cause)
})

wsS_clients.on("wsClientError", error => {
    console.log("WS Client error : " + error.name)
    console.log(error.message)
    console.log(error.stack)
    console.log(error.cause)

})

wsS_clients.on('close', () => {
    console.log("WebSocket Client Server connection closed")
})




wsS_clients.on('connection', function (socket, req) {
    console.log("WebSocket connesso")
    //console.log(req)

    let remote_address = req?.socket?.remoteAddress?.substring(7)

    socket.connected_device_information = { is_client: true, remote_address: ((remote_address === '') ? "::1" : remote_address) }

    wsS_shelly.clients.forEach((shelly_client: WebSocket) => {
        if (shelly_client.connected_device_information.is_shelly) {
            console.log(shelly_client.connected_device_information)
            shelly_client.send(JSON.stringify({
                /*{
                    "jsonrpc":"2.0",
                    "id": 1,
                    "src":"user_1",
                    "method":"Switch.GetConfig",
                    "params": {
                        "id":2
                    }
                  }  
                    

id: 1,
    src: "WS server",
        method: "Switch.GetStatus",
            params: {
    id: 0
}
            }))
        }


    })

console.log(socket.connected_device_information)

socket.on('close', (code, reason) => {
    console.log(`WebSocket client ${socket.connected_device_information} connection closed with code ${code} and reason ${reason}`)
})

socket.on('message', (data) => {
    const message = JSON.parse(data.toString('utf-8'))

    if (message.dest !== undefined && message.method !== undefined) {
        console.log(message)
        let shelly_address = getKeyByValue(message.dest)
        console.log(shelly_address)
        if (shelly_address) {
            wsS_shelly.clients.forEach((client: WebSocket) => {
                if (client.connected_device_information.is_shelly && client.connected_device_information.remote_address === shelly_address) {
                    client.send(JSON.stringify({
                        id: 1,
                        src: "WS server",
                        method: "Switch.Toggle",
                        params: {
                            id: 0
                        }
                    }))
                }

            })
        }
    }
})
})*/

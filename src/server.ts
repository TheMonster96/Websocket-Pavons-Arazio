import { startHTTPS, createUpgradeHandler } from "./httpsServer.js";
import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";
import { getKeyByValue, shelly_devices } from "./utils.js";




const serverS = startHTTPS()
//console.log(serverS.listeners('upgrade'))

export const wsS_clients = new WebSocketServer({ server: serverS }, () => {
    console.log(wsS_clients)
})

//console.log(wsS_clients)

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
    console.log(socket)

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
                    */

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
        console.log(`WebSocket client ${JSON.stringify(socket.connected_device_information)} connection closed with code ${code} and reason ${reason}`)
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
})
//Get value by key
/*function getKeyByValue(/** @param {Map} @param {*} */ /*map, search_value)
{
    console.log(map)
    assert(typeof(map) == Map)
    for(const [key, value] in map.entries()){
        console.log(key, value)
        if(Object.is(value, search_value))
            return key
    }

    return false
}*/




//console.log(https_options)







//console.log(message)
//message.dest ? console.log(message.dest) : console.log(message)
/*{
            id: 1,
            src: 'shelly1minig3-543204635e0c',
            dst: 'WS server',
            result: {
                id: 0,
                source: 'WS_in',
                output: true,
                temperature: { tC: 54.6, tF: 130.2 }
            }
            }
 */





//})

export const wsS_shelly = new WebSocketServer({ port: 8888 }, () => {
    console.log("WS shelly server started")
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
})
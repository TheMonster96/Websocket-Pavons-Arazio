import { startHTTPS, createUpgradeHandler } from "./httpsServer.js";
import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";
import { getKeyByValue, getShellyConfig } from "./utils.js";
import { ShellyClosing, ShellyInformation } from "./types.js";





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
    //console.log(socket)

    let remote_address = req?.socket?.remoteAddress?.substring(7)

    //Checks if the remote address is not ::1, which means localhost (127.0.0.1)

    socket.connected_device_information = { is_client: true, remote_address: ((remote_address === '') ? "::1" : remote_address) }
    /**
     * 
     * 
     *  Dynamically sends connected Shellies to every client that has just connected
     * 
     *  TODO: Implement logic to dynamically send new Shellies as they connect
     *  
     * 
     */

    wsS_shelly.clients.forEach((shelly_client: WebSocket) => {
        if (shelly_client.connected_device_information.is_shelly) {
            //console.log(shelly_client.connected_device_information)
            let message: ShellyInformation = {
                shelly_information: true,
                state: shelly_client.connected_device_information.state
            }
            if (shelly_client.connected_device_information.which_shelly?.name !== null)
                message.name = shelly_client.connected_device_information.which_shelly?.name
            else if (shelly_client.connected_device_information.which_shelly?.id !== null)
                message.id = shelly_client.connected_device_information.which_shelly?.id
            socket.send(JSON.stringify(message))
        }
    })


    wsS_shelly.clients.forEach((shelly_client: WebSocket) => {
        if (shelly_client.connected_device_information.is_shelly) {
            //console.log(shelly_client.connected_device_information)
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

        /**
         * 
         * 
         * Checks if the message is a client request to toggle the shelly  internal switch and checks 
         * if the request destination and methods aren't null, then fetches the specified Shelly by going 
         * through the Shelly WSS connected Shellies and checking if the name matches one of the connected 
         * Shellies and returns its remote address to then forward the request
         * 
         * 
         * 
         */


        if (message.dest !== undefined && message.method !== undefined) {
            console.log(message)
            let shelly_address = getKeyByValue(message.dest, wsS_shelly.clients)
            console.log(shelly_address)
            if (shelly_address) {
                wsS_shelly.clients.forEach((shelly: WebSocket) => {
                    if (shelly.connected_device_information.is_shelly && shelly.connected_device_information.remote_address === shelly_address) {
                        shelly.send(JSON.stringify({
                            id: 1,
                            src: "WS server / " + socket.connected_device_information.remote_address,
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


export const wsS_shelly = new WebSocketServer({ port: process.env.SHELLY_WEBSOCKET_SERVER_PORT }, () => {
    console.log("WS shelly server started")
})

wsS_shelly.on('close', () => {
    console.log("WebSocket Shelly Server connection closed")
})

wsS_shelly.on('connection', async function (socket: WebSocket, req: IncomingMessage) {
    /**
     * 
     * Initialize the Shelly Device by adding some properties to the WebSocket object (redefined in types.d.ts):
     *  is_shelly: boolean / checks if the WebSocket refers to a Shelly Device, useful for checking
     *  remote_address: string / the shelly device address
     *  which_shelly : string / used to identify which 
     * 
     */
    if (req.headers['sec-websocket-protocol'] == 'json-rpc' && req.headers['user-agent']?.includes('(ShellyOS)')) {
        const address = req.socket.remoteAddress?.substring(7)
        socket.connected_device_information = { is_shelly: true, remote_address: address, which_shelly: await getShellyConfig(address), state: undefined }
    }
    else {
        socket.close(404, "Attempted access to the Shelly WebSocket Server from a non Shelly client")
    }

    //Debug info
    console.log(socket.connected_device_information)

    /** 
     * 
     * Automatically and dynamically send Shellies to already connected clients as they connect to the Shelly WebSocket Server 
     * 
     * 
     */

    wsS_clients.clients.forEach((client: WebSocket) => {
        let message: ShellyInformation = {
            shelly_information: true,
            state: socket.connected_device_information.state
        }
        if (socket.connected_device_information.which_shelly?.name !== null)
            message.name = socket.connected_device_information.which_shelly?.name
        else if (socket.connected_device_information.which_shelly?.id !== null)
            message.id = socket.connected_device_information.which_shelly?.id

        client.send(JSON.stringify(message))
    })


    socket.on('close', (code, reason) => {
        console.log(`WebSocket shelly ${socket.connected_device_information.remote_address} connection closed with code ${code} and reason ${reason}`)

        let message: ShellyClosing = {
            is_closed: true
        }

        if (socket.connected_device_information.which_shelly?.name !== null)
            message.name = socket.connected_device_information.which_shelly?.name
        else if (socket.connected_device_information.which_shelly?.id !== null)
            message.id = socket.connected_device_information.which_shelly?.id

        wsS_clients.clients.forEach((client) => {
            client.send(JSON.stringify(message))
        })
    })

    socket.on('message', (data) => {
        /*
        *
        * Checks the internal switch state after the Shelly sends a Notify Status response 
        * (when a change in state occurs from withing the built-in web API or when the device first connects after boot)
        * and updates the Shelly socket state and broadcasts it to every connected client
        * 
        * 
        */

        const message = JSON.parse(data.toString('utf-8'))
        console.log(message)
        if (message.params !== undefined && message.method === 'NotifyStatus' && message.dst === 'ws') {
            console.log("Shelly Notify Status ")
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
        /*
        *
        * Broadcasts the result of Switch.Toggle to every connected client and sends the information of the shelly device 
        * mainly which shelly it is and the updated state 
        * 
        * 
        */

        else if (message.result !== undefined) {
            //console.log(message)
            /**
             * {
                id: 1,
                src: 'shelly1minig3-543204635e0c',
                dst: 'WS server',
                result: {
                    id: 0,
                    source: 'WS_in',
                    output: true,
                    temperature: { tC: 41.5, tF: 106.8 }
                }
               }
             * 
             */
            if (message.result.source === "WS_in") {
                socket.connected_device_information.state = message.result.state
                wsS_clients.clients.forEach((client: WebSocket) => {
                    if (client.connected_device_information.is_client) {
                        client.send(JSON.stringify({
                            which_shelly: socket.connected_device_information.which_shelly,
                            state: message.result.output
                        }))
                    }
                })
            }
        }
    })
})
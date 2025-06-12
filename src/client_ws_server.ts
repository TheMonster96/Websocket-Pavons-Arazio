import { WebSocket, WebSocketServer } from "ws";

import { type ShellyInformation } from "./utils/types.js";
import { getShellyAddressFromNameOrID } from "./utils/utils.js";
import { wsS_shelly } from "./shelly_ws_server.js";
import { IncomingMessage } from "http";

export let wsS_clients: WebSocketServer


export function createAndAddClientWSSListeners() {

    wsS_clients = new WebSocketServer({ noServer: true }, () => {
        wsS_clients.on('listening', () => {
            console.log("Client WSS has been started")
        })
    })

    wsS_clients.on("error", (error: { name: string; message: any; stack: any; cause: any; }) => {
        console.log("WS Server? error : " + error.name)
        console.log(error.message)
        console.log(error.stack)
        console.log(error.cause)
    })

    wsS_clients.on("wsClientError", (error: { name: string; message: any; stack: any; cause: any; }) => {
        console.log("WS Client error : " + error.name)
        console.log(error.message)
        console.log(error.stack)
        console.log(error.cause)

    })

    wsS_clients.on('close', () => {
        console.log("WebSocket Client Server connection closed")
    })

    wsS_clients.on('connection', (socket: WebSocket, req: IncomingMessage) => {
        console.log("WebSocket connesso")

        //console.log(socket)

        let remote_address = req.socket?.remoteAddress?.substring(7)

        //Checks if the remote address is not ::1, which means localhost (127.0.0.1)

        socket.connected_device_information = { is_client: true, remote_address: ((remote_address === '') ? "::1" : remote_address) }
        /**
         * 
         *  Dynamically sends connected Shellies to every client that has just connected
         */

        wsS_shelly.clients.forEach((shelly_client: WebSocket) => {
            if (shelly_client.connected_device_information) {
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
            }
        })


        wsS_shelly.clients.forEach((shelly_client: WebSocket) => {
            if (shelly_client.connected_device_information) {
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
                let shelly_address = getShellyAddressFromNameOrID(message.dest, wsS_shelly.clients)
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
}
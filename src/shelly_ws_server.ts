import { WebSocket, WebSocketServer } from "ws";
import { wsS_clients } from "./client_ws_server.js";
import { IncomingMessage, Server, ServerResponse } from "http";
import type { ShellyInformation, ShellyClosing, ShellySetName, Certificates } from "./utils/types.js";
import { getShellyConfig } from "./utils/utils.js";
import { readFileSync } from "fs";
import { createServer } from "https";

export let wsS_shelly: WebSocketServer



export function createAndAddShellyWSSListeners() {
    /*const wss_options: Certificates = {
        key: readFileSync(process.env.WSS_TLS_CERTIFICATE_KEY),
        ca: readFileSync(process.env.CA_CERTIFICATE),
        cert: readFileSync(process.env.WSS_TLS_CERTIFICATE),
        rejectUnauthorized: true
    }*/

    /**
     * This TLS Server is being used just to add TLS to the WSS since it's not natively supported
     */

    //const tls_server = createServer(wss_options)

    wsS_shelly = new WebSocketServer({ port: process.env.SHELLY_WEBSOCKET_SERVER_PORT }, () => {

        console.log("Shelly WSS has been started")

    })

    wsS_shelly.on('close', () => {
        console.log("WebSocket Shelly Server connection closed")
    })

    wsS_shelly.on("error", (error: { name: string; message: any; stack: any; cause: any; }) => {
        console.log("WS Shelly Server? error : " + error.name)
        console.log(error.message)
        console.log(error.stack)
        console.log(error.cause)
    })

    wsS_shelly.on("wsClientError", (error: { name: string; message: any; stack: any; cause: any; }) => {
        console.log("WS Shelly error : " + error.name)
        console.log(error.message)
        console.log(error.stack)
        console.log(error.cause)

    })

    wsS_shelly.on('NameUpdate', (updatedShelly: ShellySetName) => {
        let update = false
        let oldShelly: WebSocket
        wsS_shelly.clients.forEach((shelly: WebSocket) => {
            if (shelly.connected_device_information.remote_address === updatedShelly.address) {
                shelly.connected_device_information.which_shelly!.name = updatedShelly.name
                oldShelly = shelly
                update = true
            }
        })

        if (update) {
            wsS_clients.clients.forEach((client: WebSocket) => {
                client.send(JSON.stringify({
                    old_shelly_name: oldShelly.connected_device_information.which_shelly?.name,
                    new_shelly_name: updatedShelly.name,
                    address: updatedShelly.address
                }))
            })
        }

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

            wsS_clients.clients.forEach((client: WebSocket) => {
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

    /*tls_server.on('upgrade', (request, socket, head) => {
        wsS_shelly.handleUpgrade(request, socket, head, socket => {
            wsS_shelly.emit('connection', socket, request)
        })
    })

    tls_server.listen({ port: process.env.SHELLY_WEBSOCKET_SERVER_PORT }, () => {
        console.log("TLS Server and WSS Shelly started")
    })*/
}

export function getConnectedShellys() {
    return wsS_shelly.clients
}


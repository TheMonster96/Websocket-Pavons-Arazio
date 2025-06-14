import { WebSocket, WebSocketServer } from "ws";
//import { wsS_clients_shellyDisovery } from "./server.js";
import { IncomingMessage } from "http";
import { ShellyDevice, ShellySetWS } from "./utils/types.js";

export let wsS_clients_shellyDisovery: WebSocketServer


export function createAndAddShellyDisoveryWSSListeners() {

    wsS_clients_shellyDisovery = new WebSocketServer({ noServer: true }, () => {
        wsS_clients_shellyDisovery.on('listening', () => {
            console.log("Shelly Disovery WSS has been started")
        })
    })

    wsS_clients_shellyDisovery.on('close', () => {
        console.log(`Discovery WSS closed `)
    })

    wsS_clients_shellyDisovery.on("error", (error: { name: string; message: any; stack: any; cause: any; }) => {
        console.log("Discovery WS Server? error : " + error.name)
        console.log(error.message)
        console.log(error.stack)
        console.log(error.cause)
    })

    wsS_clients_shellyDisovery.on("wsClientError", (error: { name: string; message: any; stack: any; cause: any; }) => {
        console.log("WS Client error : " + error.name)
        console.log(error.message)
        console.log(error.stack)
        console.log(error.cause)
    })

    /*wsS_clients_shellyDisovery.on('ShellyNameUpdate', (nameChangeShelly: string) => {
        const shelly = JSON.parse(nameChangeShelly)

        console.log("Shelly name change event fired, new name: " + (shelly))

        wsS_clients_shellyDisovery.clients.forEach((client: WebSocket) => {
            client.send(JSON.stringify(
                {
                    eventType: "ChangedShellyName",
                    newName: shelly.name,
                    shellyAddress: shelly.address
                }
            ))
        })
    })*/

    wsS_clients_shellyDisovery.on('Refresh', (discoveryData: ShellyDevice[]) => {

        let newShellys: ShellyDevice[] = []
        discoveryData.forEach((shelly) => {
            console.log("New Shelly : " + shelly.id)
            newShellys.push(JSON.parse(JSON.stringify(shelly)))
        })


        console.log("Refresh emitted, new shellies :  \n " + (newShellys))


        wsS_clients_shellyDisovery.clients.forEach((client: WebSocket) => {
            console.log("Sending to client")
            client.send(JSON.stringify(
                {
                    eventType: "Refresh",
                    newShellys: newShellys
                }
            ))
        })
    })

    wsS_clients_shellyDisovery.on('DiscoveryUpdate', (discoveryData: ShellyDevice[]) => {

        console.log("Discovery completed, new scan :  \n ", (discoveryData))
        console.log("WSS Discovery connected clients count : ", wsS_clients_shellyDisovery.clients.size)
        wsS_clients_shellyDisovery.clients.forEach((client: WebSocket) => {
            console.log("Sending to client")
            client.send(JSON.stringify(
                {
                    eventType: "Refresh",
                    newShellys: discoveryData
                }
            ))
        })
    })
    /*let newShellys: ShellyAPI_Response[] = []
    
            discoveryData.forEach((shelly) => {
                console.log("New Shelly : " + shelly.id)
                newShellys.push((shelly))
            })*/


    wsS_clients_shellyDisovery.on('RegisteredShelly', (registeredShelly: ShellySetWS) => {
        //const registeredShelly = JSON.parse(registerData)

        console.log("New Shelly registered (fired event) : " + (registeredShelly))

        wsS_clients_shellyDisovery.clients.forEach((client: WebSocket) => {
            client.send(JSON.stringify(
                {
                    eventType: "RegistredShelly",
                    whichShelly: registeredShelly
                }
            ))
        })
    })



    wsS_clients_shellyDisovery.on('connection', (socket: WebSocket, req: IncomingMessage) => {

        console.log("New WS connection on discovery WSS")

        let remote_address = req.socket?.remoteAddress?.substring(7)

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

        socket.on('close', (code, reason) => {
            console.log(`WebSocket client ${JSON.stringify(socket.connected_device_information)} connection closed with code ${code} and reason ${reason}`)
        })


        socket.on('data', (data) => {
            const message = data.toString('utf-8')
            console.log(message)

        })

    })

}
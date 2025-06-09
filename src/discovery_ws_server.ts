import { WebSocket } from "ws";
import { wsS_clients_shellyDisovery } from "./server.js";
import { Socket } from "dgram";
import { IncomingMessage } from "http";

export function addShellyDisoveryWSSListeners() {

    wsS_clients_shellyDisovery.on('close', () => {
        console.log(`Discovery WSS closed `)
    })

    wsS_clients_shellyDisovery.on("error", error => {
        console.log("Discovery WS Server? error : " + error.name)
        console.log(error.message)
        console.log(error.stack)
        console.log(error.cause)
    })

    wsS_clients_shellyDisovery.on("wsClientError", error => {
        console.log("WS Client error : " + error.name)
        console.log(error.message)
        console.log(error.stack)
        console.log(error.cause)
    })

    wsS_clients_shellyDisovery.on('ShellyNameUpdate', (nameChangeShelly) => {
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
    })

    wsS_clients_shellyDisovery.on('Refresh', (discoveryData) => {

        const newShellys = JSON.parse(discoveryData)

        console.log("Refresh emitted, new shellies :  \n " + (newShellys))


        wsS_clients_shellyDisovery.clients.forEach((client: WebSocket) => {
            client.send(JSON.stringify(
                {
                    eventType: "Refresh",
                    newShellys: newShellys
                }
            ))
        })
    })

    wsS_clients_shellyDisovery.on('RegisteredShelly', (registerData) => {
        const registeredShelly = JSON.parse(registerData)

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
            const message = JSON.parse(data.toString('utf-8'))

        })

    })

}
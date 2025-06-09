//import { startHTTPS } from "./httpsServer.js";
import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";
import { getShellyAddressFromNameOrID, getShellyConfig } from "./utils/utils.js";
import { ShellyClosing, ShellyInformation } from "./utils/types.js";
import { startDiscoveryInterval } from "./shelly discovery/shellyDiscovery.js";
import { addClientWSSListeners } from "./client_ws_server.js";
import { addShellyWSSListeners } from "./shelly_ws_server.js";
import { addShellyDisoveryWSSListeners } from "./discovery_ws_server.js";
import { startHTTPS } from "./httpsServer.js";


startDiscoveryInterval(16)

startHTTPS()


export const wsS_clients_shellyDisovery = new WebSocketServer({ noServer: true }, () => {
    wsS_clients_shellyDisovery.on('listening', () => {
        console.log("Shelly Disovery WSS has been started")
    })
})

addShellyDisoveryWSSListeners()

/*wsS_clients_shellyDisovery.on('connection', (socket, req) => {
    console.log("New client connected to /api/v1/shellyAdd")
})*/

/**
 * Instatiates the Clients WebSocket server and adds its listeners
 */

export const wsS_clients = new WebSocketServer({ noServer: true }, () => {
    wsS_clients.on('listening', () => {
        console.log("Client WSS has been started")
    })
})

addClientWSSListeners()


/**
 * Instatiates the Shelly WebSocket server and adds its listeners
 */

export const wsS_shelly = new WebSocketServer({ port: process.env.SHELLY_WEBSOCKET_SERVER_PORT }, () => {
    wsS_shelly.on('listening', () => {
        console.log("Shely WSS has been started")
    })
})


addShellyWSSListeners()

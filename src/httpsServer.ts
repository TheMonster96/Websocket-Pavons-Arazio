import { createAndAddExpressListeners } from "./express-app.js";
import { dotenvConf } from "./utils/utils.js";
import { readFileSync } from "fs";
import { createServer, Server } from "https"
import { wsS_clients } from "./client_ws_server.js";
import { type Certificates } from "./utils/types.js";
import { IncomingMessage } from "http";
import { wsS_clients_shellyDisovery } from "./discovery_ws_server.js";

console.log("HTTPS Server porco dio")

dotenvConf(import.meta.dirname)

const https_options: Certificates = {
    key: readFileSync(process.env.TLS_CERTIFICATE_KEY),
    //ca_cert: readFileSync('./certificates/shelly-ca.crt'),
    cert: readFileSync(process.env.TLS_CERTIFICATE),
}


export let serverS: Server

function createHTTPSServer() {
    return createServer(https_options, createAndAddExpressListeners())
}


export function InitializeHTTPSServer() {

    serverS = createHTTPSServer()
    serverS.on('upgrade', function (request: IncomingMessage, socket, head) {
        console.log("New WebSocket upgrade ")

        switch (request.url) {
            case "/api/v1/shellyAdd":
                wsS_clients_shellyDisovery.handleUpgrade(request, socket, head, socket => {
                    wsS_clients_shellyDisovery.emit('connection', socket, request)
                })
                break

            case "/api/v1/shellyUpdateName":
                wsS_clients_shellyDisovery.handleUpgrade(request, socket, head, socket => {
                    wsS_clients_shellyDisovery.emit('connection', socket, request)
                })
                break

            case "/home":
                wsS_clients.handleUpgrade(request, socket, head, (socket: any) => {
                    wsS_clients.emit('connection', socket, request)
                })
                break

        }
    })

    serverS.listen(process.env.HTTPS_SERVER_PORT, () => {
        console.log("https Server started on 3000")
    })

    return serverS
}




import { createAndAddExpressListeners } from "./express-app.js";
import { dotenvConf } from "./utils/utils.js";
import { readFileSync } from "fs";
import { createServer, Server } from "https"
import { wsS_clients } from "./client_ws_server.js";
import { type Certificates } from "./utils/types.js";
import { IncomingMessage } from "http";
import { wsS_clients_shellyDisovery } from "./discovery_ws_server.js";

dotenvConf(import.meta.dirname)


/**
 * HTTPS server export. Not initialized to not mess up when importing/exporting
 */

export let serverS: Server

/**
 * 
 * Initialization of the HTTPS server and addition of listeners for handling WebSockets connections since more
 * WebSocket server use the same HTTPS server, and it cannot be specified in all of them since any new handleUpgrade()
 * would fire off a new connection to all servers
 * 
 */

export function InitializeHTTPSServer() {

    /**
    * TLS certificates for HTTPS
    */
    const https_options: Certificates = {
        key: readFileSync(process.env.HTTPS_TLS_CERTIFICATE_KEY),
        ca: readFileSync(process.env.CA_CERTIFICATE),
        cert: readFileSync(process.env.HTTPS_TLS_CERTIFICATE),
        rejectUnauthorized: true
    }

    serverS = createServer(https_options, createAndAddExpressListeners())
    serverS.on('upgrade', function (request: IncomingMessage, socket, head) {
        console.log("New WebSocket upgrade ")

        switch (request.url) {
            case "/api/v1/shellyAdd":
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




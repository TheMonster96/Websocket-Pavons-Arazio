import { readFileSync } from "fs";
import { createServer, createServer as HTTPSServer, Server } from "https"
import app from "./express-app.js";
//import Certificates from "./certInterface.js";
import { wsS_clients, wsS_clients_shellyDisovery } from "./server.js";
import { Certificates } from "./utils/types.js";
import { dotenvConf } from "./utils/utils.js";
import { Request } from "express";
import { assert } from "console";
import { IncomingMessage } from "http";


dotenvConf(import.meta.dirname)
let serverS: Server

const https_options: Certificates = {
    key: readFileSync(process.env.TLS_CERTIFICATE_KEY),
    //ca_cert: readFileSync('./certificates/shelly-ca.crt'),
    cert: readFileSync(process.env.TLS_CERTIFICATE),
}


export function startHTTPS() {
    serverS = createServer(https_options, app)

    serverS.listen(process.env.HTTPS_SERVER_PORT, () => {
        console.log("https Server started on 3000")
    })

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
                wsS_clients.handleUpgrade(request, socket, head, socket => {
                    wsS_clients.emit('connection', socket, request)
                })
                break

        }
    })
}




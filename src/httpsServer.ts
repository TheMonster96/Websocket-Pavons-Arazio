import { readFileSync, writeFile } from "fs";
import { createServer as HTTPSServer, Server } from "https"
import app from "./express-app.js";
import Certificates from "./certInterface.js";
import { wsS_clients } from "./server.js";
import { WebSocketServer } from "ws";

let serverS: Server

export function startHTTPS(): Server {
    //console.log(app)
    const https_options: Certificates = {
        key: readFileSync('./certificates/server.key'),
        //ca_cert: readFileSync('./certificates/shelly-ca.crt'),
        cert: readFileSync('./certificates/server.cert'),
    }

    serverS = HTTPSServer(https_options, app)


    serverS.listen(3000, () => {
        console.log("https Server started on 3000")
    })

    return serverS
}

export function createUpgradeHandler() {

    serverS.on('upgrade', function (request, socket, head) {
        console.log("New WebSocket upgrade ")
        wsS_clients.handleUpgrade(request, socket, head, socket => {
            wsS_clients.emit('connection', socket, request)
        })
    })
}

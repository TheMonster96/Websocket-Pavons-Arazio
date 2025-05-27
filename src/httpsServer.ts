import { readFileSync, writeFile } from "fs";
import { createServer as HTTPSServer, Server } from "https"
import app from "./express-app.js";
//import Certificates from "./certInterface.js";
import { wsS_clients } from "./server.js";
import { WebSocketServer } from "ws";
import { Certificates } from "./types.js";
import { dotenvConf } from "./utils.js";


dotenvConf()

let serverS: Server

export function startHTTPS(): Server {
    //console.log(app)
    const https_options: Certificates = {
        key: readFileSync(process.env.TLS_CERTIFICATE_KEY),
        //ca_cert: readFileSync('./certificates/shelly-ca.crt'),
        cert: readFileSync(process.env.TLS_CERTIFICATE),
    }

    serverS = HTTPSServer(https_options, app)


    serverS.listen(process.env.HTTPS_SERVER_PORT, () => {
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

import { WebSocketServer } from "ws";
import { createServer as HTTPSServer } from "https"
import { createServer as HTTPServer } from "http";
import e, { json } from "express";
import cors from "cors"
import { readFileSync, writeFile } from "fs";
import { readDevices } from "./initializeDevices.js";
import { assert } from "console";
import { readFile } from "fs/promises";


//Get value by key
/*function getKeyByValue(/** @param {Map} @param {*} */ /*map, search_value)
{   
    console.log(map)
    assert(typeof(map) == Map)
    for(const [key, value] in map.entries()){
        console.log(key, value)
        if(Object.is(value, search_value))
            return key
    }

    return false
}*/


const https_options = {
    key: readFileSync('./server.key'),
    //ca_cert: readFileSync('./certificates/shelly-ca.crt'),
    cert: readFileSync('./server.cert'),
}

//console.log(https_options)


const shelly_devices = await readDevices()
console.log(shelly_devices)

function getKeyByValue(/**@param {*} */ search_value) {
    for (const [key, value] of shelly_devices.entries()) {
        console.log(key, value)
        if (Object.is(value, search_value))
            return key
    }

    return false
}



const app = e()
//console.log(app)
const allowedOrigins = ["http://localhost:3000", "http://localhost:8888", "http://192.168.1.2", "https://localhost:3000", "https://localhost:8888", "https://192.168.1.2"]

app.set('view engine', 'hbs')
app.set('views', './')

app.use('/public', e.static('./client/'))

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        }
        else {
            callback(new Error("Not allowed"))
        }
    },
    methods: "GET,PUT,POST,DELETE",
    credentials: false
}))


app.get('/', (req, res) => {
    res.render('index', { shelly_devices: shelly_devices })
})

/*app.listen(3000, (e) => {
    if (e)
        console.error(e)
    else
        console.log("Server started on 3000")
})*/

const serverS = HTTPSServer(https_options, app)

serverS.listen(3000, (e) => {
    if (e)
        console.error(e)
    else
        console.log("https Server started on 3000")
})


serverS.on('upgrade', function (request, socket, head) {
    console.log("New WebSocket upgrade ")
    wsS_clients.handleUpgrade(request, socket, head, socket => {
        wsS_clients.emit('connection', socket, request)
    })
})

const wsS_clients = new WebSocketServer({ server: app }, (e) => {
    if (e)
        console.log(e)
    else
        console.log("WS client server started")
})

const wsS_shelly = new WebSocketServer({ port: 8888 }, (e) => {
    if (e)
        console.log(e)
    else
        console.log("WS shelly server started at 8888")
})

wsS_clients.on("error", error => {
    console.log("WS Server? error : " + error.name)
    console.log(error.message)
    console.log(error.stack)
    console.log(error.cause)
})

wsS_clients.on("wsClientError", error => {
    console.log("WS Client error : " + error.name)
    console.log(error.message)
    console.log(error.stack)
    console.log(error.cause)

})

wsS_clients.on('close', () => {
    console.log("WebSocket Client Server connection closed")
})

wsS_shelly.on('close', () => {
    console.log("WebSocket Shelly Server connection closed")
})

wsS_shelly.on('connection', function (socket, req) {
    if (req.headers['sec-websocket-protocol'] == 'json-rpc' && req.headers['user-agent'].includes('(ShellyOS)')) {
        const address = req.socket.remoteAddress.substring(7)
        socket.connected_device_information = { is_shelly: true, remote_address: address, which_shelly: shelly_devices.get(address), state: false }
    }
    console.log(socket.connected_device_information)

    socket.on('close', (code, reason) => {
        console.log(`WebSocket shelly ${socket.connected_device_information} connection closed with code ${code} and reason ${reason}`)
    })

    socket.on('message', (data) => {
        const message = JSON.parse(data)

        if (message.params !== undefined) {
            if (message.params['switch:0']) {
                socket.connected_device_information.state = message.params['switch:0'].output
                console.log(socket.connected_device_information)

                wsS_clients.clients.forEach(client => {
                    if (client.connected_device_information.is_client) {
                        client.send(JSON.stringify(socket.connected_device_information))
                    }
                })
            }
        }
        else if (message.result !== undefined) {
            if (message.result.source === "WS_in") {
                wsS_clients.clients.forEach(client => {
                    if (client.connected_device_information.is_client) {
                        client.send(JSON.stringify({
                            is_shelly: socket.connected_device_information.is_shelly,
                            remote_address: socket.connected_device_information.remote_address,
                            which_shelly: socket.connected_device_information.which_shelly,
                            state: message.result.output
                        }))
                    }
                })
            }
        }
    })
})

wsS_clients.on('connection', function (socket, req) {
    console.log("WebSocket connesso")
    //console.log(req)

    let remote_address = req.socket.remoteAddress.substring(7)

    socket.connected_device_information = { is_client: true, remote_address: ((remote_address === '') ? "::1" : remote_address) }

    wsS_shelly.clients.forEach(shelly_client => {
        if (shelly_client.connected_device_information.is_shelly) {
            console.log(shelly_client.connected_device_information)
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


    })

    console.log(socket.connected_device_information)

    socket.on('close', (code, reason) => {
        console.log(`WebSocket client ${socket.connected_device_information} connection closed with code ${code} and reason ${reason}`)
    })

    socket.on('message', (data) => {
        const message = JSON.parse(data)

        if (message.dest !== undefined && message.method !== undefined) {
            console.log(message)
            let shelly_address = getKeyByValue(message.dest)
            console.log(shelly_address)
            if (shelly_address) {
                wsS_shelly.clients.forEach(client => {
                    if (client.connected_device_information.is_shelly && client.connected_device_information.remote_address === shelly_address) {
                        client.send(JSON.stringify({
                            id: 1,
                            src: "WS server",
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

    //console.log(message)
    //message.dest ? console.log(message.dest) : console.log(message)
    /*{
                id: 1,
                src: 'shelly1minig3-543204635e0c',
                dst: 'WS server',
                result: {
                    id: 0,
                    source: 'WS_in',
                    output: true,
                    temperature: { tC: 54.6, tF: 130.2 }
                }
                }
     */


})


//})



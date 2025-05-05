import { WebSocketServer } from "ws";
import e, { json } from "express";
import cors from "cors"
import { writeFile } from "fs/promises";
import { readDevices } from "./initializeDevices.js";
import { arrayBuffer } from "stream/consumers";


function getValueByKey(map , search_value)
{
    for( const [key, value] in map.entries()){
        if(Object.is(value, search_value))
                return key
    }

    return undefined
}


let shelly_devices=await readDevices()
console.log(shelly_devices)

let i=0
const app=e()
//console.log(app)
const allowedOrigins= ["http://localhost:3000", "http://localhost:8888", "http://192.168.1.125", "http://192.168.1.2"]

app.set('view engine', 'hbs')
app.set('views', './')

app.use('/public', e.static('./client/'))

app.use(cors( {
    origin: function(origin, callback){
        if(!origin || allowedOrigins.includes(origin)){
            callback(null, true)
        }
        else{
            callback(new Error("Not allowed"))
        }
    },
    methods: "GET,PUT,POST,DELETE",
    credentials: false
}))


app.get('/', (req, res) => {
    res.render('index', {shelly_devices: shelly_devices})
})


const wsS= new WebSocketServer({port: 8888}, (e) => {
    if(e)
        console.log(e)
    else
        console.log("Server started at 8888")
})


wsS.on('connection', function(socket, req) {
    console.log("WebSocket connesso")

    if(req.headers['sec-websocket-protocol'] == 'json-rpc' && req.headers['user-agent'].includes('(ShellyOS)')){
        const address=req.socket.remoteAddress.substring(7)
        socket.connected_device_information={ is_shelly : true, remote_address : address, which_shelly: shelly_devices.get(address)}
    }
    else {
        let remoteAddress=req.socket.remoteAddress.substring(7)
        
        socket.connected_device_information={ is_client : true, remote_address : ((remoteAddress==='') ?  "::1" : remoteAddress)}
        
    }
    console.log(socket.connected_device_information)
    

    socket.on("message", (data) =>{
        const message = JSON.parse(data)
        
        if(message.params !== undefined)
            if(message.params['switch:0'])
            {
                socket.connected_device_information.state=message.params['switch:0'].output
                console.log(socket.connected_device_information)

                wsS.clients.forEach(client => {
                    if(client.connected_device_information.is_client){
                        client.send(JSON.stringify(socket.connected_device_information))
                    }
                })
            }

        
        //message.dest ? console.log(message.dest) : console.log(message)

        
        
    })
})

//})

app.listen(3000, (e) => {
    if(e)
        console.error(e)
    else
        console.log("Server started on 3000")
})

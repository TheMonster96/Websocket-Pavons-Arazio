import { WebSocketServer } from "ws";
import e, { json } from "express";
import cors from "cors"
import { writeFile } from "fs/promises";
import { readDevices } from "./initializeDevices.js";
import { arrayBuffer } from "stream/consumers";


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
            callback(new Error("Not allowed porcoddio"))
        }
    },
    methods: "GET,PUT,POST,DELETE",
    credentials: false
}))


app.get('/', (req, res) => {
    res.render('index')
})


const wsS= new WebSocketServer({port: 8888}, (e) => {
    if(e)
        console.log(e)
    else
        console.log("Server started at 8888")
})


wsS.on('connection', function(socket, req) {
    console.log("WebSocket connesso")
    //socket.send(JSON.stringify(state))
    //writeFile("./websocket.log", JSON.stringify(wsS.clients)).then( "wrote to file").catch((e) => {console.log(e)})
    //console.log(wsS.clients)
    //console.log(req.rawHeaders)
    console.log(req.headers)

    if(req.headers['sec-websocket-protocol'] == 'json-rpc' && req.headers['user-agent'].includes('(ShellyOS)')){
        socket.is_shelly=true;
        socket.remoteAddress=req.socket.remoteAddress.substring(7)
        socket.which_shelly=shelly_devices.get(socket.remoteAddress)
        //socket.mac_address=req.socket
        console.log(socket)
    }
    else {
        socket.is_client=true;
        let remoteAddress=req.socket.remoteAddress.substring(7)
        socket.remoteAddress=(remoteAddress==='') ?  "::1" : remoteAddress 
        console.log(socket)
    }

    

    /*socket.on("message", async (data) =>{

        const message= JSON.parse(data)
        console.log(req.socket.remoteAddress.slice(7, req.socket.remoteAddress.length))
        console.log(message)
        
        if(message.dest !== undefined){
            
        }

        //console.log(typeof message)
        else if(message instanceof Object && message.params!== undefined ){
            if(message.params['switch:0'] !== undefined){
                console.log(message.params['switch:0'])
            }
           
        }
        else{
            console.log(message)
            socket.send(data.toJSON())
        }
        
        if(message instanceof Object && message.output !== undefined){
            console.log(message)
            state=message.output
             console.log(state)
            wsS.clients.forEach(client => {
                if(client != socket)
                    client.send((JSON.stringify(state)))
            })
        }
        else{
            console.log(message)
        }*/
})

//})

app.listen(3000, (e) => {
    if(e)
        console.error(e)
    else
        console.log("Server started on 3000")
})

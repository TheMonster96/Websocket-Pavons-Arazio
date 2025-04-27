import { WebSocketServer } from "ws";
import e, { json } from "express";
import cors from "cors"
//import {createServer} from 'http'

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

// app.get('/shelly', async (req, res) => {

//     let message=""
//     const response= await fetch("http://192.168.1.125/rpc/Ws.GetConfig")

//     const response_data=await response.json()

//     if(response_data.code){
//         response_data.code === -105 ? (message= "Error, something went wrong " + JSON.stringify(response_data)) : message=""
//     }
//     else if (response_data.was_on){
//         response_data.was_on == true ? message= "Shelly has been turned off" : message= "Shelly has been turned on"
//     }
//     else 
//         message=JSON.stringify(response_data)

//     res.render('shelly', {message: message})
// })



const wsS= new WebSocketServer({port: 8888}, (e) => {
    if(e)
        console.log(e)
    else
        console.log("Server started at 8888")
})

let state=false

wsS.on('connection', function(socket, req) {
    console.log("Socket connesos")
    socket.send(JSON.stringify(state))

    socket.on("message", async (data) =>{

        const message= JSON.parse(data)
        
        console.log(typeof message)
        if(message instanceof Object && message.params['switch:0'] !== undefined && message.params['switch:0'] != state){
            console.log(message.params['switch:0'])
            state= message.params['switch:0'].output
            console.log(state)
            wsS.clients.forEach(client => {
                if(client != socket)
                    client.send((JSON.stringify(state)))
            })
        }
        else
            console.log(message)
            socket.send(data.toJSON())

        console.log(req.socket.remoteAddress)

        
        // let message=""
        // const response= await fetch("http://192.168.1.125/rpc/Switch.toggle?id=0")

        // const response_data=await response.json()

        // if(response_data.code){
        //     response_data.code === -105 ? (message= "Error, something went wrong " + JSON.stringify(response_data)) : message=""
        // }
        // else if (response_data.was_on){
        //     response_data.was_on == true ? message= "Shelly has been turned off" : message= "Shelly has been turned on"
        // }
        // else 
        //     message=JSON.stringify(response_data)

        //socket.send(message)
    })
})

app.listen(3000, (e) => {
    if(e)
        console.error(e)
    else
        console.log("Server started on 3000")
})

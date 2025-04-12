import { WebSocketServer } from "ws";

var i=0

const wsS= new WebSocketServer({port: 3300}, () => {
    console.log("Server started at 3000")
})

wsS.on('connection', socket => {
    console.log("Socket connesos")
    

    socket.on("message", data =>{
        console.log(JSON.parse(data))

        socket.send("Cunsuntu Orazio " + i)
        i++
    })
})

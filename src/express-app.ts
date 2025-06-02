import Express, { response } from "express"
import cors from "cors"
//import { shelly_devices } from "./utils.js"
import { returnFoundShellys, shellyDiscovery } from "./shellyDiscovery.js"
import { setShellyName, SetShellyWSS, updateShellyDeviceInfo } from "./utils.js"
import { ShellyFailedAPI_Response, ShellySetName, ShellySetWS } from "./types.js"
import { wsS_shelly } from "./server.js"
import { dotenvConf } from "./utils.js"

dotenvConf()
const app = Express()
export default app

const allowedOrigins = ["http://localhost:3000", "http://localhost:8888", "http://192.168.1.2", "https://localhost:3000",
    "https://localhost:8888", "https://192.168.1.2:3000", "http://192.168.1.125", "http://192.168.1.133"]

app.set('view engine', 'hbs')
app.set('views', './src/views')

app.use('/public', Express.static('./src/client/'))

app.use(Express.json())
app.use(Express.urlencoded({ extended: true }))

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
    res.render('index')
})

app.route('/api/v1/shellyAdd')

    .get(async (req, res) => {
        //console.log(result.text)
        const results = returnFoundShellys()
        console.log(results)

        //console.log(results)
        res.render('shellySetup', { shelly_devices: results })
    })

    .post(async (req, res) => {
        /**
         * 
         *  
         * This API Route simply saves the Shelly Device specified in the form and then calls a function 
         * giving it the Shelly Device as argument and then updates the WS Config in the device. If the call
         * is successfull, then the function will return true, else it will return false + error 
         * 
         */

        const shelly_set_ws: ShellySetWS = {
            name: req.body.shelly_name,
            address: req.body.shelly_device
        }

        console.log(req.body.shelly_name, req.body.shelly_device)
        const success: ShellyFailedAPI_Response = await SetShellyWSS(shelly_set_ws)

        if (success.success) {
            //updateShellyDeviceInfo(shelly_set_ws.name, shelly_set_ws.address, wsS_shelly.clients)
            res.status(200).json({ ok: true, message: `Shelly WS Server set to ${process.env.HOST_SHELLY_WSS_ADDRESS}` })


        }
        else {
            throw new Error("Internal server error " + success.error)
        }


    })



app.route('/api/v1/shellyUpdateName')

    .get(async (req, res) => {
        //console.log(result.text)
        const results = returnFoundShellys()
        //console.log(results)
        res.render('shellyUpdateName', { shelly_devices: results })
    })

    .post(async (req, res) => {
        /**
         * TODO: Implement name validation under some kind of rule, like shelly_{house_part} 
         * 
         * Creates a new object of type ShellySetName, which is an interface that stores the most essential informations
         * to upate or set a Shelly's name. The properties values are obtained from the HTTP POST Request, and then an helper function 
         * calls the API with the previously created object and returns true for success or false for error. If the function call 
         * is successfull, then the client is informed with some *temporary* json and the Shelly's name is updated in the
         * Shelly WebSocket Server as well. Might have to implement some logic to inform connected clients in the home page that the 
         * Shelly's name has changed, but it's not really necessary yet
         * 
         */

        const shelly_set_name: ShellySetName = {
            name: req.body.shelly_name,
            address: req.body.shelly_device
        }

        console.log(req.body.shelly_name, req.body.shelly_device)
        const success: ShellyFailedAPI_Response = await setShellyName(shelly_set_name)

        if (success.success) {
            updateShellyDeviceInfo(shelly_set_name.name, shelly_set_name.address, wsS_shelly.clients)
            res.status(200).json({ ok: true, message: `Shelly name correctly set to ${shelly_set_name.name}` })
        }
        else {
            throw new Error("Internal server error " + success.error)
        }


    })



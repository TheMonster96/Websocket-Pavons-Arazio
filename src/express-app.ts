import Express from "express"
import cors from "cors"
import { shelly_devices } from "./utils.js"

const app = Express()
export default app

const allowedOrigins = ["http://localhost:3000", "http://localhost:8888", "http://192.168.1.2", "https://localhost:3000", "https://localhost:8888", "https://192.168.1.2:3000"]

app.set('view engine', 'hbs')
app.set('views', './src/')

app.use('/public', Express.static('./src/client/'))

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



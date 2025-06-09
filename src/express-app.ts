import Express, { Response } from "express"
import cors from "cors"
//import { shelly_devices } from "./utils.js"
import { dotenvConf } from "./utils/utils.js"
import { router as apiRouter } from "./routes/apiRouter.js"
import { router as userRouter } from "./routes/usersRouter.js"
import { isAuthenticated, sessionInitialization } from "./sessionHandling/sessionHandler.js"

dotenvConf(import.meta.dirname)

const app = Express()
export default app


const allowedOrigins = ["http://localhost:3000", "http://localhost:8888", "http://192.168.1.2", "https://localhost:3000",
    "https://localhost:8888", "https://192.168.1.2:3000", "http://192.168.1.125", "http://192.168.1.133"]

export const allowedRefererURLs = ["/api/v1/shellyAdd", "/api/v1/shellyUpdateName", "/api/v1/refreshDiscovery"]



app.set('view engine', 'hbs')
app.set('views', './src/views')

app.use('/public', Express.static('./src/client', { redirect: false }))
app.use('/assets/vendor/bootstrap/', Express.static('./node_modules/bootstrap/dist/', { redirect: false }))

app.use(sessionInitialization)
app.use(isAuthenticated)

app.use(Express.json())
app.use(Express.urlencoded({ extended: true }))

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        }
        else {
            callback(new Error("Non allowed origin"))
        }
    },
    methods: "GET,PUT,POST,DELETE",
    credentials: false
}))

app.use('/', userRouter)

app.use('/api', apiRouter)

app.get('/home', (req, res) => {
    res.render('index', { username: req.session.username })
})




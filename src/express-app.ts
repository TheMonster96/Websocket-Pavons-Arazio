import express, { type Express } from "express"
import cors from "cors"
import { isAuthenticated, sessionInitialization } from "./sessionHandling/sessionHandler.js"
import { router as apiRouter } from "./routes/apiRouter.js"
import { router as userRouter } from "./routes/usersRouter.js"

export const allowedRefererURLs = ["/api/v1/shellyAdd", "/api/v1/refreshDiscovery"]
export const allowedOrigins = ["http://localhost:3000", "http://localhost:8888", "http://192.168.1.2", "https://localhost:3000",
    "https://localhost:8888", "https://192.168.1.2:3000", "http://192.168.1.125", "http://192.168.1.133"]


/**
 * 
 * This function is used to create an Express server and add all listeners. It's then called in the httpsServer.ts file
 * when creating the HTTPS server.
 * 
 */

export function createAndAddExpressListeners() {

    const app: Express = express()

    app.set('view engine', 'hbs')
    app.set('views', './src/views')

    app.use('/public', express.static('./src/client', { redirect: false }))
    app.use('/assets/vendor/bootstrap/', express.static('./node_modules/bootstrap/dist/', { redirect: false }))

    app.use(sessionInitialization)
    app.use(isAuthenticated)

    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    app.use(cors({
        origin: function (origin, callback) {
            //if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
            /*}
            else {
                callback(new Error("Non allowed origin"))
            }*/
        },
        methods: "GET,PUT,POST,DELETE",
        credentials: false
    }))

    app.use('/', userRouter)

    app.use('/api', apiRouter)

    app.get('/home', (req, res) => {
        res.render('index', { username: req.session.username })
    })
    return app
}


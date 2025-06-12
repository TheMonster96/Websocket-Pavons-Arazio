import { type Request, type Response, Router } from "express";
import { getConnectedShellys, wsS_shelly } from "../shelly_ws_server.js";
import { getFoundShellys, refreshDiscoveryInterval } from "../shelly discovery/shellyDiscovery.js";
import type { ShellySetWS, ShellyFailedAPI_Response, ShellySetName } from "../utils/types.js";
import { SetShellyWSS, setShellyName, updateShellyDeviceInfo, isValidRefererURL, emitWSSDiscoveryEvent } from "../utils/utils.js";

export const router = Router()

router.route('/v1/shellyAdd')

    .get(async (req: Request, res: Response) => {
        //console.log(result.text)
        const results = getFoundShellys()
        results ? console.log(results) : console.log("No results yet")

        //console.log(results)
        res.render('shellySetup', { shelly_devices: results })
    })

    .post(async (req: Request, res: Response) => {
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
            emitWSSDiscoveryEvent('RegisteredShelly', shelly_set_ws)


        }
        else {
            throw new Error("Internal server error " + success.error)
        }


    })



router.route('/v1/shellyUpdateName')

    .get(async (req: Request, res: Response) => {
        //console.log(result.text)
        const results = getConnectedShellys()
        //console.log(results)
        res.render('shellyUpdateName', { shelly_devices: results })
    })

    .post(async (req: Request, res: Response) => {
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
            updateShellyDeviceInfo(shelly_set_name.name, shelly_set_name.address)
            res.status(200).json({ ok: true, message: `Shelly name correctly set to ${shelly_set_name.name}` })
            //emitWSSDiscoveryEvent('ShellyNameUpdate', shelly_set_name)
        }
        else {
            throw new Error("Internal server error " + success.error)
        }


    })


router.get('/v1/refresher', async (req: Request, res: Response) => {
    try {
        //console.log(req.headers.referer)
        //console.log(req.headers.origin)
        await refreshDiscoveryInterval()
        const refererSplit = req.headers.referer?.split('/')
        console.log(refererSplit)
        let previous_url = ""

        for (let i = 3; i < refererSplit?.length!; i++) {
            //console.log(i)
            previous_url += '/' + refererSplit![i]
        }

        //console.log(previous_url === true)

        //res.json(previous_url)
        if (isValidRefererURL(previous_url)) {
            console.log("URL is valid " + req.session.username)
            res.redirect(303, previous_url)
        }

        else {
            console.log("URL is not valid")
            res.status(403).send("Forbidden operation, you need to pass from an allowed endpoint")
        }

    }
    catch (error) {
        res.status(500).send("Cazzarola " + error)
    }
})





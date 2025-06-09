import { response } from "express"
import { workerData, parentPort } from "node:worker_threads"
import { ShellyAPI_Response } from "../utils/types.js"
import { checkIfNotAlreadyExists } from "./shellyDiscovery.js"


async function callShellyApi() {

    const baseIPAddress = workerData.baseIPAddress
    const startIPAddress = workerData.startIPAddress
    const endIPAddress = workerData.endIPAddress

    //console.log(baseIPAddress, startIPAddress, endIPAddress)

    for (let address = startIPAddress; address < endIPAddress; address++) {
        try {
            //console.log("Address " + address)
            const result: Response = await fetch(`http://${baseIPAddress}${address}/rpc/Shelly.GetConfig`, {
                method: "Get",
                headers: {
                    'Accept': "application/ json"
                },
                signal: AbortSignal.timeout(220)
            })



            if (result.ok) {
                let json = await result.json()

                if (json.ws.server === process.env.HOST_SHELLY_WSS_ADDRESS && !checkIfNotAlreadyExists(json.sys.device.name, json.wifi.ap.ssid)) {
                    console.log("Can be sent ")
                    let message: ShellyAPI_Response = {
                        name: json.sys.device.name,
                        id: json.wifi.ap.ssid,
                        address: (baseIPAddress + address),
                        ws: json.ws
                    }
                    parentPort?.postMessage(message)
                }
            }
            else {
                console.log("motti buttana")
                throw new Error(`Error contacting shelly Shelly.GetConfig api ${result.status} \n ${result.statusText}`)
            }
        }
        catch (error: any) {
            //console.log(baseIPAddress + address)
            //console.log(error)

            //parentPort?.postMessage(`Error with api call on address ${baseIPAddress}${address}`)
        }
    }
    parentPort?.postMessage('done')
    parentPort?.close()
}

callShellyApi()
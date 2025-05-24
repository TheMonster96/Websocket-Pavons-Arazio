import { response } from "express"
import { workerData, parentPort } from "node:worker_threads"


async function callShellyApi() {

    const baseIPAddress = workerData.baseIPAddress
    const startIPAddress = workerData.startIPAddress
    const endIPAddress = workerData.endIPAddress

    //console.log(baseIPAddress, startIPAddress, endIPAddress)

    for (let address = startIPAddress; address < endIPAddress; address++) {
        try {
            const result: Response = await fetch(`http://${baseIPAddress}${address}/rpc/Shelly.GetConfig`, {
                method: "Get",
                headers: {
                    'Accept': "application/ json"
                },
                signal: AbortSignal.timeout(100)
            })



            if (result.ok) {
                let json = await result.json()
                let message = {
                    name: json.sys.device.name,
                    id: json.wifi.ap.ssid,
                    address: (baseIPAddress + address),
                    ws: json.ws
                }

                parentPort?.postMessage(message)
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
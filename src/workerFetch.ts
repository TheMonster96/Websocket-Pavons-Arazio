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

                json.address = baseIPAddress + address
                parentPort?.postMessage(json)
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
import { workerData, parentPort } from "node:worker_threads"


async function callShellyApi() {

    const baseIPAddress = workerData.baseIPAddress
    const startIPAddress = workerData.startIPAddress
    const endIPAddress = workerData.endIPAddress

    //console.log(baseIPAddress, startIPAddress, endIPAddress)

    for (let address = startIPAddress; address < endIPAddress; address++) {
        try {
            const resultSysConfig: Response = await fetch(`http://${baseIPAddress}${address}/rpc/Sys.GetConfig`, {
                method: "Get",
                headers: {
                    'Accept': "application/ json"
                },
                signal: AbortSignal.timeout(100)
            })

            const resultWSConfig: Response = await fetch(`http://${baseIPAddress}${address}/rpc/Ws.GetConfig`, {
                method: "Get",
                headers: {
                    'Accept': "application/ json"
                },
                signal: AbortSignal.timeout(100)
            })

            if (resultSysConfig.ok && resultWSConfig.ok) {
                let jsonSysConfig = await resultSysConfig.json()
                let jsonWSConfig = await resultWSConfig.json()

                jsonSysConfig.address = baseIPAddress + address
                jsonSysConfig.websocketConfig = jsonWSConfig
                parentPort?.postMessage(jsonSysConfig)
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
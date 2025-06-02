import { assert } from "node:console"
import path from "node:path"
import { Worker } from "node:worker_threads"
import { ShellyAPI_Response, ShellyDiscovery } from "./types.js"
import { isShellyAPI_Response } from "./utils.js"
import { isNullishCoalesce } from "typescript"

let shellyDiscoveryInterval: NodeJS.Timeout

let foundShellys: ShellyDiscovery = { shellies: [], initialization_time: 0, last_update: 0 }
let firstExecution: boolean = true

let baseIpAddress = "192.168.1."
const addressRange = 256

let __dirname = path.dirname(new URL(import.meta.url).pathname)
__dirname = __dirname.substring(1, __dirname.length)

/**
 * 
 * TODO: Update this description because it sucks
 * 
 * Util function to split the address range into an incremental array, such as [0,16,32...256] if the provided address is 16
 * Works by dividing the address range (in this case 256 meaning a local /24 network) to obtain the increment. After obtaining
 * the increment, a for loop will be used to add the increment + the previous element to every element of the array, like 
 * array[2] = array[2-1]+ increment.
 * 
 * IMPORTANT: the splitFactor argument must be a power of 2 to have integer results and a coherent number of "pair addresses"
 * 
 * Works fine but there's a bug when setting the splitFactor as 128 or 256 where the 2nd element is always 1, will have to implement
 * a different logic
 */

function splitAddressIntervals(splitFactor: number): number[] {
    //assert(splitFactor <= 64 && splitFactor % 8)
    let splitAddresses: number[] = [0]
    let address: number = addressRange / splitFactor
    for (let i = 1; i <= splitFactor; i++) {
        /*if (i == 1)
            splitAddresses.push(address - 1)
        else*/
        splitAddresses.push(splitAddresses[i - 1] + address)
    }

    console.log(splitAddresses.toString())

    return splitAddresses
}

/**
 * 
 * This is the function where the Worker Threads are created and where the Event listeners are managed
 * 
 * The function returns a promise that gets resolved only when all threads are done. This is accomplished by 
 * checking if the message from the worker is "done", and if so will increment the thread_counter. The actual
 * API responses from the Shellies are stored in the results: JSON[] variable, and they'll be added if the message
 * from the worker is an instance of the ShellyAPI_Response interface. The resolved value is an array of 
 * JSON responses, in this case the ShellyAPI_Response interface to have a more robust type safety. 
 * In case of worker exits or errors, the promise will be rejected, but a different logic will have to be implemented
 * 
 */

export async function shellyDiscovery(splitFactor: number) {
    foundShellys.shellies = await new Promise((resolve, reject) => {
        let results: ShellyAPI_Response[] = []
        let thread_counter = 0

        splitAddressIntervals(splitFactor).forEach((address, index, array) => {
            if (index !== array.length - 1) {
                const worker = new Worker(path.join(__dirname, "./workerShellyDiscovery.js"), {
                    workerData: {
                        baseIPAddress: baseIpAddress,
                        startIPAddress: index === 0 ? address + 1 : address,
                        endIPAddress: array[index + 1] - 1
                    }
                })

                worker.on('message', (message) => {
                    //console.log(message)
                    if (typeof message === "string" && message === "done")
                        thread_counter++

                    else if (isShellyAPI_Response(message)) {
                        console.log(message)
                        results.push(message)
                        //resolve(message)
                    }

                    if (thread_counter === splitFactor) {
                        console.log("Resolving the array")
                        resolve(results)
                    }


                    console.log("Workers left ", (splitFactor - thread_counter))
                    //console.log(results)
                    //console.log(message)
                })

                worker.on('error', (err) => {
                    console.error(`Error from worker ${err}`)
                    reject(err)
                })

                worker.on('exit', (code) => {
                    if (code !== 0) {
                        console.log(`Worker exited with code ${code}`)
                        reject(new Error(`Worker exited with code ${code}`))
                    }

                })

            }
        })

    });
    /*if (foundShellys.initialization_time === 0) {
        foundShellys.initialization_time = Date.now()
    }

    foundShellys.last_update = Date.now()*/
}

export async function startDiscoveryInterval(splitFactor: number) {
    if (firstExecution) {
        await shellyDiscovery(splitFactor)
    }

    shellyDiscoveryInterval = setInterval(async () => {
        await shellyDiscovery(splitFactor)
    }, 30000)
}

export function stopDiscoveryInterval() {
    clearInterval(shellyDiscoveryInterval)
}

export function returnFoundShellys(): ShellyAPI_Response[] | undefined | [] {
    //console.log(foundShellys.shellies?.length)
    if (foundShellys.shellies?.length !== 0) {
        return foundShellys.shellies
    }
    return undefined
}

export function removeShelly() {
    if (foundShellys.shellies?.length !== 0) {

    }
}

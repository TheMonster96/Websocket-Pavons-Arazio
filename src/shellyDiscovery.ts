import path from "node:path"
import { Worker } from "node:worker_threads"

let baseIpAddress = "192.168.1."
const addressRange = 256

let __dirname = path.dirname(new URL(import.meta.url).pathname)
__dirname = __dirname.substring(1, __dirname.length)

function splitAddressIntervals(splitFactor: number): number[] {
    let splitAddresses: number[] = [1]
    let address: number = addressRange / splitFactor
    for (let i = 1; i < splitFactor + 1; i++) {
        if (i == 1)
            splitAddresses.push(splitAddresses[i - 1] + address - 2)
        else
            splitAddresses.push(splitAddresses[i - 1] + address)
    }

    return splitAddresses
}

export function shellyDiscovery(splitFactor: number): JSON[] {
    let results: JSON[] = []
    let thread_counter = 0

    splitAddressIntervals(splitFactor).forEach((address, index, array) => {
        if (index !== array.length - 1)
            new Promise((resolve, reject) => {
                const worker = new Worker(path.join(__dirname, "./workerFetch.js"), {
                    workerData: {
                        baseIPAddress: baseIpAddress,
                        startIPAddress: index === 0 ? address : address + 1,
                        endIPAddress: array[index + 1]
                    }
                })

                worker.on('message', (message) => {
                    console.log(message)
                    if (message instanceof Object)
                        results.push(message)
                    else if (message === 'done')
                        thread_counter++

                    if (thread_counter === splitFactor) {
                        resolve(results)
                    }
                    //console.log(results)
                    //console.log(message)
                })

            })

    })

    return results
}


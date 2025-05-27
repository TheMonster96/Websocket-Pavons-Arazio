//import { readDevices } from "./initializeDevices.js"
import { WebSocket } from "ws"
import { config, DotenvConfigOptions, DotenvConfigOutput } from "dotenv"
import path from "node:path"
import { ShellyAPI_Response } from "./types.js"

let __dirname = path.dirname(new URL(import.meta.url).pathname)
__dirname = __dirname.substring(1, __dirname.length)



//export const shelly_devices = await readDevices()

export function getKeyByValue(/**@param {*} */ search_value: string, set: Set<WebSocket>) {
    for (const [key, value] of set.entries()) {
        const name = value.connected_device_information.which_shelly?.name
        const id = value.connected_device_information.which_shelly?.id
        if (Object.is(name, search_value) || Object.is(id, search_value))
            return key.connected_device_information.remote_address
    }

    return false
}

export async function getShellyConfig(shellyAddress: string | undefined) {
    try {
        const response = await fetch(`http://${shellyAddress}/rpc/Shelly.GetConfig`)

        if (response.ok) {
            const json = await response.json()
            //console.log(json.sys.device.name + json.wifi.ap.ssid)
            return { name: json.sys.device.name, id: json.wifi.ap.ssid }

        }
        else
            throw new Error(`HTTP Error contacting the Shelly device's API to get the name/id ${response.status} \n ${response.statusText} `)
    } catch (err) {
        console.log(err)
    }



}

export function dotenvConf() {
    config({ path: path.join(__dirname, "../.env") })
}

export function isShellyAPI_Response(response: ShellyAPI_Response): response is ShellyAPI_Response {
    //console.log(typeof response, response)
    console.log("Type of null : " + typeof null)
    console.log("Response type : " + typeof response)
    console.log("Response name type : " + typeof response.name)
    console.log("Response id type : " + typeof response.id)
    console.log("Response address type : " + typeof response.address)
    console.log("Response ws type : " + typeof response.ws)
    return typeof response === "object"
        && response !== null
        && (typeof response.name === "string" || (response.name === null && typeof response.name === "object"))
        && (typeof response.id === "string" || (response.id === null && typeof response.id === "object"))
        && typeof response.address === "string"
        && response.ws !== null && typeof response.ws === "object"

}

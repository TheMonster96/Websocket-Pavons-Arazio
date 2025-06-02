//import { readDevices } from "./initializeDevices.js"
import { WebSocket } from "ws"
import { config, DotenvConfigOptions, DotenvConfigOutput } from "dotenv"
import path from "node:path"
import { ShellyAPI_Response, ShellyFailedAPI_Response, ShellySetName, ShellySetWS } from "./types.js"
import { abort } from "node:process"
import { assert } from "node:console"

let __dirname = path.dirname(new URL(import.meta.url).pathname)
__dirname = __dirname.substring(1, __dirname.length)



//export const shelly_devices = await readDevices()

export function getShellyAddressFromNameOrID(search_value: string, set: Set<WebSocket>) {
    for (const [key, value] of set.entries()) {
        const name = value.connected_device_information.which_shelly?.name
        const id = value.connected_device_information.which_shelly?.id
        if (Object.is(name, search_value) || Object.is(id, search_value))
            return key.connected_device_information.remote_address
    }

    return false
}

export function updateShellyDeviceInfo(new_name: string, search_address: string, set: Set<WebSocket>) {
    for (const [key, value] of set.entries()) {
        const shelly_address = value.connected_device_information.remote_address
        if (Object.is(shelly_address, search_address)) {
            assert(typeof key.connected_device_information.which_shelly !== undefined)
            key.connected_device_information.which_shelly!.name = new_name
        }

    }
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
    // console.log("Type of null : " + typeof null)
    // console.log("Response type : " + typeof response)
    // console.log("Response name type : " + typeof response.name)
    // console.log("Response id type : " + typeof response.id)
    // console.log("Response address type : " + typeof response.address)
    // console.log("Response ws type : " + typeof response.ws)
    return typeof response === "object"
        && response !== null
        && (typeof response.name === "string" || (response.name === null && typeof response.name === "object"))
        && (typeof response.id === "string" || (response.id === null && typeof response.id === "object"))
        && typeof response.address === "string"
        && response.ws !== null && typeof response.ws === "object"

}

export async function setShellyName(shelly_info: ShellySetName): Promise<ShellyFailedAPI_Response> {
    console.log("Address received :" + shelly_info.address + "\n" + "Name received :" + shelly_info.name)
    try {
        const response = await fetch(`http://${shelly_info.address}/rpc/Sys.SetConfig?config={"device" : {"name" : "${shelly_info.name}"}}`, {
            method: "Get",
            signal: AbortSignal.timeout(3000)
        }
        )

        if (response.ok) {
            console.log(`Name for Shelly ${shelly_info.address} updated to ${shelly_info.name}`)
            return { success: true, error: undefined }
        }
        else {
            return { success: false, error: new Error(`HTTP Error contacting the Shelly device's API to get the name/id ${response.status} \n ${response.statusText} `) }
        }

    } catch (err) {
        //console.log("motti buttana")
        console.error(err)
        return { success: false, error: err }
    }

}

export async function SetShellyWSS(shelly_info: ShellySetWS): Promise<ShellyFailedAPI_Response> {
    console.log("Address received :" + shelly_info.address + "\n" + "Name received :" + shelly_info.name)
    try {
        const response = await fetch(`http://${shelly_info.address}/rpc/WS.SetConfig?config={"server" : "${process.env.HOST_SHELLY_WSS_ADDRESS}" }`, {
            method: "Get",
            signal: AbortSignal.timeout(3000)
        }
        )

        if (response.ok) {
            console.log(`${shelly_info.name} : ${shelly_info.address} WS config successfully updated to ${process.env.HOST_SHELLY_WSS_ADDRESS}`)
            return { success: true, error: undefined }
        }
        else {
            return { success: false, error: new Error(`HTTP Error contacting the Shelly device's API to get the name/id ${response.status} \n ${response.statusText} `) }
        }

    } catch (err) {
        //console.log("motti buttana")
        console.error(err)
        return { success: false, error: err }
    }
}
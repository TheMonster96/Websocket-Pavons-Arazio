//import { readDevices } from "./initializeDevices.js"
import { WebSocket } from "ws"
import { config } from "dotenv"
import path from "node:path"
import { ShellyAPI_Response, ShellyFailedAPI_Response, ShellySetName, ShellySetWS } from "./types.js"
import { allowedRefererURLs } from "../express-app.js"
import { createHash } from "node:crypto"
import { assert } from "node:console"


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
            //assert(typeof key.connected_device_information.which_shelly !== undefined)
            key.connected_device_information.which_shelly!.name = new_name
        }

    }
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

export function get__dirname() {
    let __dirname = path.dirname(new URL(import.meta.url).pathname)
    __dirname = __dirname.substring(1, __dirname.length)

    return __dirname
}

export function dotenvConf(__dirname: string, depth?: number) {

    let envPath = '../.env'
    if (depth) {
        for (let i = 1; i < depth; i++) {
            envPath = "../" + envPath
        }
    }
    config({ path: path.join(__dirname, envPath) })
}

export function isShellyAPI_Response(response: ShellyAPI_Response): response is ShellyAPI_Response {

    return typeof response === "object"
        && response !== null
        && (typeof response.name === "string" || (response.name === null && typeof response.name === "object"))
        && (typeof response.id === "string" || (response.id === null && typeof response.id === "object"))
        && typeof response.address === "string"
        && response.ws !== null && typeof response.ws === "object"

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

export function isValidRefererURL(URL: string = ""): boolean {

    allowedRefererURLs.forEach((allowedURL) => {
        if (allowedURL === URL)
            return true
    })

    return false
}

export function computeSHA256(input: string): string {

    return createHash('sha-256').update(input).digest("base64")

}

/**
 * 
 * Will probably never be used
 *  
 * 
 */
export function generateUniquePrimaryKey() {
    return (Math.random() * 9999) + 1
}

export function getMessageByStatusCode(statusCode: number): string | undefined {
    assert(400 <= statusCode && statusCode <= 500, "FALSE ALARM: Somehow the function was invoked on a successful call")

    let statusMessage: string | undefined

    switch (statusCode) {
        case 400:
            statusMessage = "Bad Request. Given Username and/or Password aren't valid for login or signup"
            break
        case 404:
            statusMessage = "User not found"
        case 500:
            statusMessage = "Something went wrong in the Server"
    }

    return statusMessage
}

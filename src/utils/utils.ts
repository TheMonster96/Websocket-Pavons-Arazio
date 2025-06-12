//import { readDevices } from "./initializeDevices.js"
import { WebSocket } from "ws"
import { config } from "dotenv"
import path from "node:path"
import type { ShellyAPI_Response, ShellyFailedAPI_Response, ShellySetName, ShellySetWS } from "./types.js"
import { allowedRefererURLs } from "../express-app.js"
import { createHash } from "node:crypto"
import { assert } from "node:console"
import { wsS_clients_shellyDisovery } from "../discovery_ws_server.js"
import { wsS_shelly } from "../shelly_ws_server.js"
import { readFileSync } from "node:fs"


//export const shelly_devices = await readDevices()
export function emitWSSDiscoveryEvent(eventType: string, data: Object) {
    wsS_clients_shellyDisovery.emit(eventType, (data))
}

export function getShellyAddressFromNameOrID(search_value: string, set: Set<WebSocket>) {
    for (const [key, value] of set.entries()) {
        const name = value.connected_device_information.which_shelly?.name
        const id = value.connected_device_information.which_shelly?.id
        if (Object.is(name, search_value) || Object.is(id, search_value))
            return key.connected_device_information.remote_address
    }

    return false
}

export function updateShellyDeviceInfo(new_name: string, search_address: string) {
    for (const [key, value] of wsS_shelly.clients.entries()) {
        const shelly_address = value.connected_device_information.remote_address
        if (Object.is(shelly_address, search_address)) {
            //assert(typeof key.connected_device_information.which_shelly !== undefined)
            key.connected_device_information.which_shelly!.name = new_name
        }

    }
}

/**
 * Function to update a specified Shelly's name 
 * @param shelly_info A ShellySetName interface object containing the name and the address of the shelly
 * @returns An object of ShellyFailedAPI_Response (Bad name) that returns a true if the calls is successfull or a false and an error if the call was unsuccessfull
 */

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
/**
 * Function to retreive a specific Shelly configuration, to get its name, id, address, WS config ecc.
 * @param shellyAddress THe address of the specified shelly
 * @returns A result with the name and id (because it's all that's needed) or throws an error in case of a bad request
 */

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

/**
 * 
 * Function to start dotenv in just 1 line
 * 
 * @param __dirname The directory of the file from where it's  called
 * @param depth The depth of the file from where it's called
 */

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

/**
 * 
 * Function to set the new WS config for a specicied Shelly, providing the address of the shelly.
 * If the API call to the Shelly was successful then a result object will be returned and the logic to interpret the result
 * is handled by the Express routers
 * TODO: Add TLS as well 
 * 
 */

export async function SetShellyWSS(shelly_info: ShellySetWS): Promise<ShellyFailedAPI_Response> {
    console.log("Address received :" + shelly_info.address + "\n" + "Name received :" + shelly_info.name)
    //let return_value: ShellyFailedAPI_Response
    try {
        const response_ws_config = await fetch(`http://${shelly_info.address}/rpc/WS.SetConfig?config={"enable": true, "server" : "${process.env.HOST_SHELLY_WSS_ADDRESS}", "ssl_ca": "user_ca.pem" }`, {
            method: "Get",
            signal: AbortSignal.timeout(3000)
        }
        )

        if (response_ws_config.ok) {
            console.log(`${shelly_info.name} : ${shelly_info.address} WS config successfully updated to ${process.env.HOST_SHELLY_WSS_ADDRESS}`)
            //return_value = { success: true, error: undefined }
        }
        else {
            return { success: false, error: new Error(`HTTP Error contacting the Shelly device's API to set the ws config: ${response_ws_config.status} \n ${response_ws_config.statusText} `) }
        }

        const ca_bundle: Buffer = readFileSync(process.env.CERT_BUNDLE)
        const response_ca_config = await fetch(`http://${shelly_info.address}/rpc/Shelly.PutUserCA?data="${ca_bundle}"`)

        if (response_ca_config.ok) {
            console.log(`${shelly_info.name} : ${shelly_info.address} WS config successfully updated to ${process.env.HOST_SHELLY_WSS_ADDRESS}`)
            //return_value = { success: true, error: undefined }
        }
        else {
            return { success: false, error: new Error(`HTTP Error contacting the Shelly device's API to set the CA certificate: ${response_ca_config.status} \n ${response_ca_config.statusText} `) }
        }

        const wss_cert: Buffer = readFileSync(process.env.WSS_TLS_CERTIFICATE)
        const response_cert_config = await fetch(`http://${shelly_info.address}/rpc/Shelly.PutTLSClientCert?data="${wss_cert}"`)

        if (response_cert_config.ok) {
            console.log(`${shelly_info.name} : ${shelly_info.address} WS config successfully updated to ${process.env.HOST_SHELLY_WSS_ADDRESS}`)
            //return_value = { success: true, error: undefined }
        }
        else {
            return { success: false, error: new Error(`HTTP Error contacting the Shelly device's API to set the TLS certificate: ${response_cert_config.status} \n ${response_cert_config.statusText} `) }
        }

    } catch (err) {
        console.error(err)
        return { success: false, error: err }
    }

    return { success: true, error: undefined }
}

/**
 * 
 * Function to validate a URL when calling the Refresh list API, to refresh the Discovery list
 * 
 */

export function isValidRefererURL(URL: string = ""): boolean {
    console.log("URL is " + URL)

    for (let i = 0; i < allowedRefererURLs.length; i++) {
        if (allowedRefererURLs[i] === URL)
            return true
    }

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

/**
 * 
 * Function to handle error status codes returned by the login/sign up calls 
 * 
 */

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

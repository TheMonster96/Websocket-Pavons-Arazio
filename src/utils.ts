import { readDevices } from "./initializeDevices.js"


export const shelly_devices = await readDevices()

export function getKeyByValue(/**@param {*} */ search_value: string) {
    for (const [key, value] of shelly_devices.entries()) {
        console.log(key, value)
        if (Object.is(value, search_value))
            return key
    }

    return false
}
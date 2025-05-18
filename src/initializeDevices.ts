import { error } from "console";
import { readFile } from "fs/promises";
import Shelly from "./shelly.js";

const path = "./shelly_devices.json"

export async function readDevices() {

    const shelly = new Map()

    await readFile(path).then((data) => {
        let json = JSON.parse(data.toString('utf-8'))

        json.forEach((element: { address: String; name: String; }) => {
            shelly.set(element.address, element.name)
        });
    }).catch(error => console.error(error))

    return shelly
}
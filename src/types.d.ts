import WebSocket from "ws";

declare module "ws" {
    interface WebSocket {
        connected_device_information: {
            is_shelly?: boolean,
            is_client?: boolean,
            remote_address?: String,
            which_shelly?: {
                name?: string,
                id?: string
            },
            state?: boolean
        }
    }
}

interface ShellyInformation {
    shelly_information?: boolean,
    state?: boolean,
    name?: string,
    id?: string
}

interface ShellyClosing {
    is_closed?: boolean,
    name?: string,
    id?: string
}

interface Certificates {
    key: Buffer,
    cert: Buffer
}


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

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            TLS_CERTIFICATE: string,
            TLS_CERTIFICATE_KEY: string,
            HTTPS_SERVER_PORT: number,
            TLS_CA_PATH?: string,
            NODE_ENV: 'development' | 'production' | 'test',
            SHELLY_WEBSOCKET_SERVER_PORT: number,
            HOST_WSS_ADDRESS: string

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

interface ShellyAPI_Response {
    name: string,
    id: string,
    address: string,
    ws: object
}

interface Certificates {
    key: Buffer,
    cert: Buffer
}


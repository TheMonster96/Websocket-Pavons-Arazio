import { FieldPacket, QueryResult, RowDataPacket } from "mysql2";
import WebSocket from "ws";

declare module "ws" {
    interface WebSocket {
        connected_device_information: {
            is_shelly?: boolean,
            remote_address?: String,
            which_shelly?: {
                name?: string,
                id?: string
            },
            state?: boolean
            username?: string,
            is_client?: boolean,
        }
    }
}

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            HTTPS_TLS_CERTIFICATE: string,
            HTTPS_TLS_CERTIFICATE_KEY: string,
            WSS_TLS_CERTIFICATE: string,
            WSS_TLS_CERTIFICATE_KEY: string,
            HTTPS_SERVER_PORT: number,
            CA_PRIVATE_KEY: string,
            CA_CERTIFICATE: string,
            CERT_BUNDLE: string,
            NODE_ENV: 'development' | 'production' | 'test',
            SHELLY_WEBSOCKET_SERVER_PORT: number,
            HOST_SHELLY_WSS_ADDRESS: string

        }
    }
}

/**
 * 
 * Shelly Interfaces for Web Socket messages or for API calls 
 *
 */


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

interface ShellyDevice {
    name: string,
    id: string,
    address: string,
    ws: {
        enable: boolean,
        server: string,
        ssl_ca: string
    },
    ca_bundle?: Buffer,
    cert?: Buffer
}

interface ShellyFailedAPI_Response {
    success: boolean,
    error: Error | any
}
interface ShellySetName {
    name: string,
    address: string
}

interface ShellySetWS {
    name: string,
    address: string,
}

interface Certificates {
    key: Buffer,
    cert: Buffer,
    ca?: Buffer,
    rejectUnauthorized?: boolean,
    requestCert?: boolean
}

interface ShellyDiscovery {
    shellies?: ShellyAPI_Response[],
    initialization_time?: number,
    last_update?: number
}


/**
 *  Interface for storing or retrieving Users on the DB
 */

declare module "express-session"
{
    interface Session {
        authenticated: boolean,
        username: string,
        icon?: Buffer,
    }
}

interface User {
    Username: string,
    readonly Password: string
}

interface User_Retrieved extends RowDataPacket {
    Username: string,
    Icon: string,
    readonly Password: string,

}

/**
 * 
 * For simplicity the statusCode attribute values will be the same as HTTP Status codes
 * 
 */

interface DB_Result {
    success: boolean,
    statusCode: number
}

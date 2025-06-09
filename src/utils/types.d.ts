import { FieldPacket, QueryResult, RowDataPacket } from "mysql2";
import WebSocket from "ws";

declare module "ws" {
    interface WebSocket {
        connected_device_information: {
            is_shelly?: boolean,
            username?: string,
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

interface ShellyAPI_Response {
    name: string,
    id: string,
    address: string,
    ws: object
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
    address: string
}

interface Certificates {
    key: Buffer,
    cert: Buffer
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

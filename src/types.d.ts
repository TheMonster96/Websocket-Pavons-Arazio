import WebSocket from "ws";

declare module "ws" {
    interface WebSocket {
        connected_device_information: {
            is_shelly?: boolean,
            is_client?: boolean,
            remote_address?: String,
            which_shelly?: string,
            state?: boolean
        }
    }
}


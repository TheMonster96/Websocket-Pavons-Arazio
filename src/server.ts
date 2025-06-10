import { startDiscoveryInterval } from "./shelly discovery/shellyDiscovery.js";
import { InitializeHTTPSServer } from "./httpsServer.js";
import { createAndAddClientWSSListeners } from "./client_ws_server.js";
import { createAndAddShellyWSSListeners } from "./shelly_ws_server.js";
import { createAndAddShellyDisoveryWSSListeners } from "./discovery_ws_server.js";

startDiscoveryInterval(16)

InitializeHTTPSServer()


createAndAddShellyDisoveryWSSListeners()

/**
 * Instatiates the Clients WebSocket server and adds its listeners
 */

createAndAddClientWSSListeners()

/**
 * Instatiates the Shelly WebSocket server and adds its listeners
 */

createAndAddShellyWSSListeners()


import { startDiscoveryInterval } from "./shelly discovery/shellyDiscovery.js";
import { InitializeHTTPSServer } from "./httpsServer.js";
import { createAndAddClientWSSListeners } from "./client_ws_server.js";
import { createAndAddShellyWSSListeners } from "./shelly_ws_server.js";
import { createAndAddShellyDisoveryWSSListeners } from "./discovery_ws_server.js";

/**
 * Starts the Discovery Interval to not fire it off on every client request
 */

startDiscoveryInterval(16)

/**
 * Initializes the HTTPS Server
 */

InitializeHTTPSServer()

/**
 * Inizialized the Discovery WebSocket server and adds its listeners
 */

createAndAddShellyDisoveryWSSListeners()

/**
 * Instatiates the Clients WebSocket server and adds its listeners
 */

createAndAddClientWSSListeners()

/**
 * Instatiates the Shelly WebSocket server and adds its listeners
 */

createAndAddShellyWSSListeners()


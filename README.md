

**TODO: Implement simple WebSocket communicaton to dynamically send configurable Shellys instead of rendering after the Discovery is completed**
      **to make the navigation non blocking and almost seamless**

**TODO: Implement registration POST API endpoint to ShellyWSS and unregistration. TODO: Implement an update name API to change shelly devices' names.**
      **Implement an API to call the specific's shelly Ws.SetConfig API to setup Outbound WebSockets connection to ShellyWSS.**
      **Implement an API to call the specific's shelly Sys.SetConfig with {name: ... } to change device name**

**TODO: Implement wss:// on ShellyWSS**

**DONE (Shelly Discovery kinda): Implement some sort of database or use Shelly Discovery to send the devices to the client**

**DONE: Implement logic to dynamically inform connected clients of new Shelly connections or closed connections and then add or remove them from the web page automaically**

**NON CRITICAL TODO: Change UI to be somewhat decent**

**NON CRITICAL TODO: Change UI to Svelte/Vue. Need for a frontend-only server to just call backend APIs**


**DONE: Implement registration POST API endpoint to ShellyWSS and unregistration. TODO: Implement an update name API to change shelly devices' names.**
      **Implement an API to call the specific's shelly Ws.SetConfig API to setup Outbound WebSockets connection to ShellyWSS.**
      **Implement an API to call the specific's shelly Sys.SetConfig with {name: ... } to change device name**

**TODO: Implement wss:// on ShellyWSS**


**DONE: Implemented Shelly Discovery Interval but need to add WebSockets**

**TODO: Reimplement the Shelly Disovery logic to, instead of scanning on every new request, create an interval (around 20s or 30s) to scan the network periodically**
      **and then, through a WebSocket server to which the clients connect upon requesting to endpoints /api/v1/shellyAdd or /api/v1/shellyUpdate, broadcast**
      **the changes to the clients. The data structure of said Shelly Discovery will be an interface (or maybe class in the future) that is composed of**
      **api_responses: JSON[]**
      **(not sure) devices (to reduce overhead if devices are the same, uses network id ): string[]**
      **last_time_created (or updated): string**
**CHECK ShellyDiscovery WS reimplementation.png FOR SCHEME**

**TODO: Add Docker to have scalable and ephemeral processes.**
**TODO: Add Nginx as Reverse Proxy for added security.**
**TODO: Add Kubernetes to orchestrate Containers (not necessary but cool)**
**TODO: Transfer everything to the Zimablade Server as final step**

**NON NECESSARY TODO: Change UI to be somewhat decent**

**NON NECESSARY TODO: Change UI to Svelte/Vue. Need for a frontend-only server to just call backend APIs**

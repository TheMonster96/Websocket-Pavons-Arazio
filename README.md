
**TODO: Implement wss:// on ShellyWSS**

**TODO: Reimplement the Shelly Disovery logic to, instead of scanning on every new request, create an interval (around 20s or 30s) to scan the network periodically**
      **and then, through a WebSocket server to which the clients connect upon requesting to endpoints /api/v1/shellyAdd or /api/v1/shellyUpdate, broadcast**
      **the changes to the clients. The data structure of said Shelly Discovery will be an interface (or maybe class in the future) that is composed of**
      **api_responses: JSON[]**
      **(not sure) devices (to reduce overhead if devices are the same, uses network id ): string[]**
      **last_time_created (or updated): string**

#DA FARE COME PROSSIMo
**TODO: Complete Discovery with WebSocket reimplementation on client side**

**TODO: if there's enough time left, switch to JWT**
**TODO: Add NoSQL database if there's enough time left**

#DA FARE DOPO I DATABASE E LA REIMPLEMENTAZIONE SHELLYDISCOVERY
**TODO: Add Docker to have scalable and ephemeral processes.**

#DA FARE DOPO DOCKER E REIMPLEMENTAZIONE SHELLYDISCOVERY
**TODO: Change UI to be somewhat decent**
**TODO: Write a presentation for this project**

#DA FARE COME FINE SE RIMANE TEMPO
**TODO: Change UI to Svelte/Vue. Need for a frontend-only server to just call backend APIs**
**TODO: Make everything a separate service in docker to have more security, stability**
**TODO: Transfer everything to the Zimablade Server**





#NON NECESSARI
**TODO: Add Nginx as Reverse Proxy for added security.**
**TODO: Add Kubernetes to orchestrate Containers (not necessary but cool)**
//const form_button=document.getElementById("form_button")

const shelly_button=document.getElementById("shelly_button")

const ws=new WebSocket("ws://192.168.1.125/rpc")
console.log(ws)

let state=false

ws.addEventListener("open", function() {
    console.log("Connection established")
})

shelly_button.addEventListener('click', (e) => {
    e.preventDefault()

    ws.send(JSON.stringify({
        id: 1,
        src: "user",
        method: "Switch.Toggle",
        params: {
            id:0
        }
    }))

    //state=!state
    //state ? shelly_button.src="/public/B_On.svg" : shelly_button.src="/public/B_Off.svg" 
    // const vForm=document.createElement("form")

    // vForm.setAttribute('action', '/shelly')
    // vForm.setAttribute('method', 'GET')

    // document.body.appendChild(vForm)
    // vForm.submit()

})

/*form_button.addEventListener("click", (e) => {
    e.preventDefault()

    const vForm=document.createElement("form")

    vForm.setAttribute('action', '/coddio')
    vForm.setAttribute('method', 'POST')

    document.body.appendChild(vForm)
    vForm.submit()
})*/

ws.addEventListener("message", message => {
    console.log(JSON.parse(message.data))

    const msg=JSON.parse(message.data)
    

    if(msg.params !== undefined){
        if(msg.params["switch:0"] !== undefined){
            if(msg.params["switch:0"].output !== undefined)
                changeImage(msg.params["switch:0"].output)
        }
    } 
    //console.log(msg.was_on)
    //changeImage(msg.was_on)
    //changeImage(switch_state)
})

function changeImage(switch_state)
{
    
    if(switch_state != state)
    {
        console.log(switch_state, "previous state: " + state)
        state=!state
        console.log("new state: ", state)
        state ? shelly_button.src="/public/B_On.svg" : shelly_button.src="/public/B_Off.svg" 
    }
}




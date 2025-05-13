//const form_button=document.getElementById("form_button")

const shelly_devices=document.querySelectorAll("img.shelly")
console.log(shelly_devices)

const ws=new WebSocket("ws://192.168.1.2:3000")
console.log(ws)


ws.addEventListener("open", function() {
    console.log("Connection established")
})

ws.addEventListener("error", (event) => {
    console.log("WebSocket error" + event)
    console.log(event.type)
    console.log(event.target)
})


shelly_devices.forEach(shelly_device =>{    
    shelly_device.setAttribute('state', false)

    shelly_device.addEventListener('click', (e)=> {
        e.preventDefault()

        const msg=JSON.stringify({
            dest: shelly_device.id,
            method: "Toggle"
        })
        console.log(msg)

        ws.send(msg)
    }) 
})



ws.addEventListener("message", message => {
    const msg=JSON.parse(message.data)
    console.log(msg)

    if(msg.state !== undefined){
        changeImage(msg.state, msg.which_shelly)
    }
    //console.log(msg.was_on)
    //changeImage(msg.was_on)
    //changeImage(switch_state)

})

function changeImage(switch_state, shelly_device_name)
{
    //console.log(switch_state, shelly_device_name)
    let shelly_device=undefined
    
    shelly_devices.forEach(shelly_device_map => {
        if(shelly_device_name == shelly_device_map.id)
            shelly_device=shelly_device_map
    })

    console.log(shelly_device, " ", shelly_device.getAttribute('state') )

    const shelly_state= getBoolean(shelly_device.getAttribute('state'))
    console.log(shelly_state)

    if(switch_state !== shelly_state){
        console.log(switch_state, " previous state: ", shelly_state)
        shelly_device.setAttribute('state', !shelly_state)
        console.log("new state: ", shelly_device.getAttribute('state'))
        !shelly_state ? shelly_device.src="/public/B_On.svg" : shelly_device.src="/public/B_Off.svg" 
    }
}

function getBoolean(string)
{
    if(string=== "true")
        return true
    return false
}




const ul=document.getElementById("ul")
const msg=document.getElementById("msg")
const button=document.getElementById("button")
const form=document.getElementById("form")


const ws=new WebSocket("ws://localhost:3300")
console.log(ws)


ws.addEventListener("message", message => {
    console.log(message)

    const msgBack= document.createElement("li")

    msgBack.innerHTML=message.data

    ul.appendChild(msgBack)
})

console.log(button)

form.addEventListener("submit", (e) =>{
    e.preventDefault()

    console.log(msg.value)
    if(msg.value !== "")
    {
        ws.send(JSON.stringify(msg.value))
        msg.value=""
    }
    

})


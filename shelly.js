export default class Shelly{
    
    #name
    #address
    //#mac_address
    constructor(name, address){
        this.#name=name
        this.#address=address
        //this.#mac_address=mac_address
    }

    get getName(){ return this.#name}
    get getAddress(){ return this.#address}
    //get getmac(){ return this.#mac_address}
}
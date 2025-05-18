export default class Shelly {

    #name: String
    #address: String
    //#mac_address
    constructor(name: String, address: String) {
        this.#name = name
        this.#address = address
        //this.#mac_address=mac_address
    }

    get getName() { return this.#name }
    get getAddress() { return this.#address }
    //get getmac(){ return this.#mac_address}
}
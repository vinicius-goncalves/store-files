export class Coords {

    #x
    #y 
    
    constructor(x = 0, y = 0) { 
        this.#x = x
        this.#y = y
    }

    getCoords() {
        return { x: this.#x, y: this.#y }
    }
    
    setCoords(x, y) {
        this.#x = x
        this.#y = y
    }

    setX(x) {
        this.#x = x
    }

    setY(y) {
        this.#y = y
    }
}
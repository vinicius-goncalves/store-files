export { randomUUID, getSize, CustomFile }

function randomUUID() {
    let dateTime = Date.now()
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
        dateTime = dateTime / 16
        const random = Math.floor(dateTime + Math.random() * 16) % 16 | 0
        return (char === 'x' ? random : random & 0x3 | 0x8).toString(16)
    })
    return uuid
}

function CustomFile(id, name, type, size, buffer) {
    this.id = id
    this.name = name
    this.type = type
    this.size = size
    this.buffer = buffer
}

function getSize(fileSize) {
    const bytes = 1024
    const sizes = [
        'Bytes',
        'KB',
        'MB',
        'GB',
        'TB'
    ]

    const sizePrefix = Math.floor(Math.log(fileSize) / Math.log(bytes))
    return parseFloat((fileSize / Math.pow(bytes, sizePrefix)).toFixed(2)) + sizes[sizePrefix]
}

function dropTempData() {

    const objProto = {

        getUUID: function() {
            return this.randomUUID
        },

        setUUID: function(uuid) {
            this.randomUUID = uuid
        }
    }

    const obj = Object.create(objProto)
    return obj
}
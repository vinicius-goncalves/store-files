export { randomUUID, getSize, CustomFile, downloadByBlob }

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

function downloadByBlob(blobParts, type, name) {

    const blob = new Blob(blobParts, { type })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `file-${name || new Intl.DateTimeFormat(navigator.language, {
        hour: '2-digit',
        minute: '2-digit'
    }).format(Date.now())}`
    a.click()
    a.remove()

}
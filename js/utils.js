export { randomUUID }

function randomUUID() {
    let dateTime = Date.now()
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
        dateTime = dateTime / 16
        const random = Math.floor(dateTime + Math.random() * 16) % 16 | 0
        return (char === 'x' ? random : random & 0x3 | 0x8).toString(16)
    })
    return uuid
}
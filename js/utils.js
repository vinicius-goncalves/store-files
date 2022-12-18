export { 
    randomUUID, 
    getSize, 
    CustomFile, 
    downloadByBlob, 
    createLoader, 
    createElement,
    formatWithZeroUnit }

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
    const sizePrefix = fileSize === 0 
        ? 0 
        : Math.floor(Math.log(fileSize) / Math.log(bytes))

    const sizes = [
        'Bytes',
        'KB',
        'MB',
        'GB',
        'TB',
        'PB',
        'EB',
        'ZB',
        'YB',
    ]

    return sizes.indexOf(sizes[sizePrefix]) === -1 
        ? 'Unknown' 
        : parseFloat((fileSize / Math.pow(bytes, sizePrefix))).toFixed(2) + sizes[sizePrefix]
}

function downloadByBlob(blobParts, type, name) {

    try {

        const blob = new Blob(blobParts, { type })
        const a = document.createElement('a')

        a.href = URL.createObjectURL(blob)
        a.download = `file-${name || new Intl.DateTimeFormat(navigator.language, {
            hour: '2-digit',
            minute: '2-digit'
        }).format(Date.now())}`
        
        a.click()
        a.remove()

    } catch (error) {

        console.error(error)

    }
}

function createLoader(insertBefore) {
    
    const div = document.createElement('div')
    
    const divClassAttr = document.createAttribute('class')
    divClassAttr.value = 'loader-wrapper'
    div.setAttributeNode(divClassAttr)

    const divDataAttr = document.createAttribute('data-loader-id')
    const id = Math.floor(Math.random() * (20 - 1) + 1)
    divDataAttr.value = id
    div.setAttributeNode(divDataAttr)

    const divLoaderContent = document.createElement('div')
    
    const divLoaderClassAttr = document.createAttribute('class')
    divLoaderClassAttr.value = 'loader-content'
    divLoaderContent.setAttributeNode(divLoaderClassAttr)

    div.appendChild(divLoaderContent)
    insertBefore.insertAdjacentElement('afterbegin', div)

    return id

}

function createElement(element, attributesObj) {
    
    const el = document.createElement(element)
    
    Object.keys(attributesObj).forEach(key => {
        el.setAttribute(key, attributesObj[key])
    })

    return el

}

function formatWithZeroUnit(unit) {
    if(typeof unit !== 'number') {
        throw new Error('The unit must be a number.')
    }

    return unit < 10 ? '0' + unit : window.parseInt(unit)

}
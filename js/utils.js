export { 
    randomUUID, 
    getSize, 
    CustomFile, 
    downloadByBlob, 
    createLoader, 
    createElement,
    loadScript,
    getHTMLMediaByFormat,
    manageDOMElementClasses
}

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

        const fileName = `file-${name || new Intl.DateTimeFormat(navigator.language, {
            hour: '2-digit',
            minute: '2-digit'
        }).format(Date.now())}`

        const a = document.createElement('a')
        a.setAttribute('href', URL.createObjectURL(blob))
        a.setAttribute('download', fileName)
        a.click()
        a.remove()

    } catch (error) {
        console.error(error)
    }
}

function createLoader(insertBefore) {
    
    const div = document.createElement('div')
    div.setAttribute('class', 'loader-wrapper')

    const loaderID = Math.floor(Math.random() * (1000 - 1 + 1) + 1)

    div.setAttribute('data-loader-id', loaderID)

    const divLoaderContent = document.createElement('div')
    divLoaderContent.setAttribute('class', 'loader-content')

    div.appendChild(divLoaderContent)

    insertBefore.insertAdjacentElement('afterbegin', div)

    return {
        id: loaderID,
        remove: function() {
            
            const loaderSelector = (id) => `[data-loader-id="${id}"]`
            const loaderFound = document.querySelector(loaderSelector(loaderID))
            
            if(!loaderFound) {
                return {
                    hasLoaderFound: false
                }
            }

            loaderFound.remove()
        }
    }
}

function createElement(element, attributesObj) {
    
    const el = document.createElement(element)
    
    Object.keys(attributesObj).forEach(key => {
        el.setAttribute(key, attributesObj[key])
    })

    return el

}

function loadScript(file, isModule = false) {
    
    const script = document.createElement('script')
    script.setAttribute('src', file)
    
    if(isModule) {
        script.setAttribute('type', 'module')
    }
    
    document.body.insertAdjacentElement('beforeend', script)
}

function getHTMLMediaByFormat(fileFormat) {
    
    const formats = {
        video: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'mpeg', 'asf', 'ogv', '3gp', 'm4v', 'swf'],
        img: ['jpeg', 'png', 'gif', 'tiff', 'bmp', 'raw'],
        audio: ['mp3', 'wav', 'aiff', 'flac', 'alac', 'ogg', 'm4a']
    }

    const [ pair ] = Object
        .entries(formats)
        .filter(([_, TagHTMLElement ]) => TagHTMLElement.includes(fileFormat))

    const [ TagHTMLElementFound ] = pair
    return TagHTMLElementFound 

}

function manageDOMElementClasses(toAdd, toRemove, DOMElement) {
    
    if(arguments.length <= 0) {
        throw new TypeError('You must to insert at least one argument')
    }

    const args = Array.prototype.slice.call(arguments, 0, 2)
    const everyIsNotArray = args.every(arg => Array.isArray(arg))

    if(!everyIsNotArray) {
        throw new Error('The toAdd and toRemove args must be an array')
    }

    toAdd.forEach(elClass => DOMElement.classList.add(elClass))
    toRemove.forEach(elClass => DOMElement.classList.remove(elClass))
}
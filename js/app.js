import { randomUUID } from './utils.js';

const dropFileZone = document.querySelector('.drop-zone-file')
const docEl = document.documentElement

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

const uuidObj = dropTempData()

function handleWithFile(event, callback) {

    dropFileZone.classList.remove('enter-drag-file-zone')

    const dataTransferFiles = event.target.files || event.dataTransfer.files
    const filesLength = dataTransferFiles.length

    if(filesLength === 1) {

        const file = dataTransferFiles[0]
        
        const fileReader = new FileReader()
        
        const obj = {}
        obj.type = file.type

        fileReader.addEventListener('progress', (event) => {

            const currentPercentage = Math.floor((event.loaded / event.total) * 100)
            const progress = currentPercentage >= 1 && currentPercentage <= 99
                ? currentPercentage
                : 0

            docEl.style.setProperty('--reading-file-height', `${progress}%`)

            const readingProgressPercetange = document.querySelector('.progress-percentage')
            
            const currentProgress = currentPercentage >= 0 && currentPercentage <= 99 
                ? `${currentPercentage}%`
                : `Read`

            const textContentNode = document.createTextNode(currentProgress)

            if(readingProgressPercetange.childNodes[0].nodeType === Node.TEXT_NODE) {
                readingProgressPercetange.childNodes[0].remove()
            }

            readingProgressPercetange.append(textContentNode)

        })

        fileReader.addEventListener('load', (event) => {
            obj.result = event.target.result
            callback(obj)
        })

        if(fileReader.readyState === 0) {
            dropFileZone.classList.add('reading-item')
            dropFileZone.querySelector('.file-icon').style.display = 'none'
            document.querySelector('.reading-progress').removeAttribute('style')
        }

        fileReader.readAsArrayBuffer(file)
    }
}

const events = ['dragover', 'drop']
events.forEach(event => {
    window.addEventListener(event, (e) => {
        e.preventDefault()
    })
})

dropFileZone.addEventListener('click', (event) => {

    const element = document.createElement('input')
    const attribute = document.createAttribute('type')
    attribute.value = 'file'
    element.setAttributeNode(attribute)
    element.click()

    element.addEventListener('change', (event) => {
        handleWithFile(event, obj => {
            console.log(obj)
        })
    })
})

dropFileZone.addEventListener('dragenter', () => {

    const uuid = randomUUID()
    uuidObj.setUUID(uuid)
    
    const attr = document.createAttribute('data-temp-uuid')
    attr.value = uuidObj.getUUID()

    dropFileZone.setAttributeNode(attr)
    dropFileZone.classList.add('enter-drag-file-zone')
    
})

dropFileZone.addEventListener('dragover', (event) => {
    event.preventDefault()
})

dropFileZone.addEventListener('dragleave', (event) => {
    dropFileZone.classList.remove('enter-drag-file-zone')
})

dropFileZone.addEventListener('drop', (event) => {

    event.preventDefault()
    handleWithFile(event, fileObjResult => {
        console.log(fileObjResult)
    })

})
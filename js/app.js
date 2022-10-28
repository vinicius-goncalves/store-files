import { randomUUID } from './utils.js';

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

(() => {

    const dropFileZone = document.querySelector('.drop-zone-file')
    const docEl = document.documentElement
    
    const uuidObj = dropTempData()

    const events = ['dragover', 'drop']
    events.forEach(event => {
        window.addEventListener(event, (e) => {
            e.preventDefault()
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
        dropFileZone.classList.remove('enter-drag-file-zone')

        const dataTransferFiles = event.dataTransfer.files
        const filesLength = dataTransferFiles.length

        if(filesLength === 1) {

            const file = dataTransferFiles[0]
            const fileReader = new FileReader()

            fileReader.addEventListener('progress', (event) => {

                const percentange = Math.floor((event.loaded / event.total) * 100)
                docEl.style.setProperty('--reading-file-height', `${percentange}%`)

                const uploadProgress = document.querySelector('.progress-percentage')
                const textContentNode = document.createTextNode(`${percentange}%`)

                uploadProgress.childNodes[0].remove()
                uploadProgress.append(textContentNode)

            })

            fileReader.addEventListener('load', (event) => {
                console.log(event.target.result)
            })

            if(fileReader.readyState === 0) {
                dropFileZone.classList.add('reading-item')
                dropFileZone.querySelector('.file-icon').style.display = 'none'
                document.querySelector('.reading-progress').removeAttribute('style')
            }

            fileReader.readAsArrayBuffer(file)
        }
    })


})();
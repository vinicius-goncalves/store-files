import { handleWithFile } from './app.js'
import { randomUUID, CustomFile } from './utils.js'
import { putItem } from './indexedDBUtils.js'

const dropFileZone = document.querySelector('.drop-zone-file')

const events = ['dragover', 'drop']
events.forEach(event => {
    window.addEventListener(event, (e) => {
        e.preventDefault()
    })
})

function createFile(event) {

    handleWithFile(event, dropFileZone, fileObjResult => {
            
        const { dimensions, type, name, ['result']: arrBuffer } = fileObjResult

        const uuid = randomUUID()
        
        const file = new CustomFile(
                uuid, 
                name, 
                type, 
                arrBuffer.byteLength, 
                arrBuffer)

        if(dimensions) {
            file.dimensions = dimensions
        }

        putItem(file, result => {
            
            switch(result.created) {
                case true:
                    document.querySelector('.progress-percentage').textContent = 'Created!'
                    break
                case false:
                    document.querySelector('.progress-percetange').textContent = 'An error has occurred...'
                    break
                default:
                    break
            }
            
        })
    })
}

dropFileZone.addEventListener('click', (event) => {

    const element = document.createElement('input')
    const attribute = document.createAttribute('type')
    attribute.value = 'file'
    element.setAttributeNode(attribute)
    element.click()

    element.addEventListener('change', (event) => {
        createFile(event)
    })
})

dropFileZone.addEventListener('dragenter', () => {
    dropFileZone.classList.add('enter-drag-file-zone')
})

dropFileZone.addEventListener('dragleave', () => {
    dropFileZone.classList.remove('enter-drag-file-zone')
})

dropFileZone.addEventListener('drop', (event) => {
    createFile(event)
})
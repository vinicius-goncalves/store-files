import { handleWithFile } from './app.js'
import { randomUUID, CustomFile } from './utils.js'
import { putItem } from './indexedDBUtils.js'

const dropFileZone = document.querySelector('.drop-zone-file')

dropFileZone.addEventListener('click', (event) => {

    const element = document.createElement('input')
    const attribute = document.createAttribute('type')
    attribute.value = 'file'
    element.setAttributeNode(attribute)
    element.click()

    element.addEventListener('change', (event) => {
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
    handleWithFile(event, dropFileZone, fileObjResult => {

        console.log(fileObjResult)
        
    })
})
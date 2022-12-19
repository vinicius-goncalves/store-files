import { randomUUID, getSize, CustomFile } from './utils.js'
import { putItem } from './indexedDBUtils.js'

const docEl = document.documentElement

window.addEventListener('DOMContentLoaded', () => {

    const script = document.createElement('script')
    
    const srcAttr = document.createAttribute('src')
    srcAttr.value = '../js/drag-drop.js'
    script.setAttributeNode(srcAttr)

    const typeAttr = document.createAttribute('type')
    typeAttr.value = 'module'
    script.setAttributeNode(typeAttr)
    document.body.insertAdjacentElement('beforeend', script)

})

export function handleWithFile(event, dropFileZone, callback) {

    dropFileZone.classList.remove('enter-drag-file-zone')

    const dataTransferFiles = event.target.files || event.dataTransfer.files
    const filesLength = dataTransferFiles.length

    if(filesLength === 1) {

        const file = dataTransferFiles[0]
        const fileObj = {}
        
        const fileReader = new FileReader()
        
        const imagePromise = new Promise(resolve => {
            if(String(file.type).startsWith('image')) {
            
            
            const image = new Image()
            const attribute = document.createAttribute('src')
            attribute.value = URL.createObjectURL(file)
            image.setAttributeNode(attribute)

            image.addEventListener('load', () => {
                
                fileObj.dimensions = {
                    width: image.naturalWidth,
                    height: image.naturalHeight
                }

                resolve(fileObj)
            })
        }

        resolve(fileObj)

        })

        imagePromise.then(fileObj => {
            
            fileObj.type = file.type 
            fileObj.name = file.name
            fileObj.lastModified = file.lastModified

        }).finally(() => {

            fileReader.addEventListener('progress', (event) => {

                const currentPercentage = Math.floor((event.loaded / event.total) * 100)
                const progress = currentPercentage >= 1 && currentPercentage <= 99
                    ? currentPercentage
                    : 0

                docEl.style.setProperty('--reading-file-height', `${progress}%`)

                const readingProgressPercentage = document.querySelector('.progress-percentage')
                
                const currentProgress = currentPercentage >= 0 && currentPercentage <= 99 
                    ? `${currentPercentage}%`
                    : `Read`

                const textContentNode = document.createTextNode(currentProgress)

                if(readingProgressPercentage.childNodes[0].nodeType === Node.TEXT_NODE) {
                    readingProgressPercentage.childNodes[0].remove()
                }

                readingProgressPercentage.append(textContentNode)

            })

            fileReader.addEventListener('load', (event) => {
                
                fileObj.result = event.target.result
                callback(fileObj)

            })

            if(fileReader.readyState === 0) {
                dropFileZone.classList.add('reading-item')
                dropFileZone.querySelector('.file-icon').style.display = 'none'
                document.querySelector('.reading-progress').removeAttribute('style')
            }

            fileReader.readAsArrayBuffer(file)
            
        })
    }
}
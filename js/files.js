import { getAllItems, getItemByKey } from './indexedDBUtils.js'
import { createLoader, createElement, getSize, loadScript, getHTMLMediaByFormat, manageDOMElementClasses } from './utils.js'
import { handleWithMedia } from './media-utils.js'

const filesWrapper = document.querySelector('.files-wrapper')
const viewContent = document.querySelector('.view-content')
const viewWrapper = document.querySelector('[data-close="view-wrapper"]')

viewWrapper.addEventListener('click', (event) => {
    
    const targetClicked = event.target
    const closestViewWrapper = targetClicked.closest('.view-wrapper')

    manageDOMElementClasses([ 'close' ], ['active'], closestViewWrapper)
})

async function loadFiles() {

    const loaderOptions = createLoader(document.body)

    await customElements.whenDefined('custom-file')

    function handleWithFile(file) {
        
        try {

            const { buffer, id, name, size, ['type']: mimeType } = file
            const [ _, fileFormat ] = mimeType.split('/')

            const customFileEl = document.createElement('custom-file')

            const tag = getHTMLMediaByFormat(fileFormat)
            const mediaEl = document.createElement(tag)
            mediaEl.setAttribute('class', `${tag}-file`)

            customFileEl.defineFileDetails(
                mediaEl,
                id,
                mimeType,
                name,
                buffer,
                getSize(size)
            )

            return customFileEl

        } catch (err) {
            console.log(err)
        }
    }
    
    const filesDocumentFragment = await (new Promise(async (resolve) => {
        
        const filesStored = await getAllItems()
        const lisDocumentFragment = document.createDocumentFragment()
        
        const DOMLis = filesStored.map(file => {
            return handleWithFile(file, lisDocumentFragment)
        })

        const lisFulfilled = await Promise.allSettled(DOMLis)
        lisFulfilled.forEach(({ ['value']: li }) => lisDocumentFragment.appendChild(li))

        const resolveObj = { hasPromiseFinished: true, lis: lisDocumentFragment }
        resolve(resolveObj)

    }))

    if(filesDocumentFragment.hasPromiseFinished) {
        loaderOptions.remove()
        filesWrapper.appendChild(filesDocumentFragment.lis)
    }

    customElements.whenDefined('custom-file').then(() => {

        const eventsToRemoveDropdown = [
            'click',
            'resize'
        ]
    
        eventsToRemoveDropdown.forEach(event => {
            window.addEventListener(event, () => {
                
                const customFiles = [...document.querySelectorAll('custom-file')]
                const shadowRootFromCustomFiles = customFiles.map(customFile => customFile.shadowRoot)
                shadowRootFromCustomFiles.forEach(shadowRoot => {
                    const activeDropdown = shadowRoot.querySelector('[data-dropdown-active]')
                    if(!activeDropdown) {
                        return
                    }

                    activeDropdown.removeAttribute('data-dropdown-active')
                    activeDropdown.style.setProperty('display', 'none')
                })
            })
        })
    })
}

function callFirstInitialization() {

    loadFiles()
    loadScript('../js/features/mouse-swap.js', true)
    loadScript('../js/classes.js', true)
    loadScript('../js/features/custom-element.js', true)
    
    const video = createElement('video', { class: 'view-file-visualizer' })
    const img = createElement('img', { class: 'view-file-visualizer' })

    viewContent.insertAdjacentElement('afterbegin', video)
    viewContent.insertAdjacentElement('afterbegin', img)

    const viewFileNameElement = createElement('h1', { class: 'view-file-name '})
    viewContent.appendChild(viewFileNameElement)

    handleWithMedia(video)
    
}

window.onload = () => callFirstInitialization()
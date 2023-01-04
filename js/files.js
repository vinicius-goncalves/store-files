import { getAllItems, getItemByKey } from './indexedDBUtils.js'
import { downloadByBlob, createLoader, createElement, getSize, loadScript } from './utils.js'
import { handleWithMedia } from './media-utils.js'
import { Coords } from './classes.js'

const filesWrapper = document.querySelector('.files-wrapper')
const viewContent = document.querySelector('.view-content')

const docEl = document.documentElement

function defineObjectURL () {

    let currentMedia = null

    return {

        setObjectURL: function(itemBuffer) {
            currentMedia = URL.createObjectURL(itemBuffer)
            return currentMedia
        },

        deleteObjectURL: function() {
            if(!currentMedia) {
                return
            }
            URL.revokeObjectURL(currentMedia)
        },

        redefineObjectURL: function(itemBuffer) {
            this.deleteObjectURL(itemBuffer)
            return this.setObjectURL(itemBuffer)
        },

        getURLObject: function() {
            return currentMedia
        }
    }
}

const dfnObjURL = defineObjectURL()

document.querySelector('[data-close="view-wrapper"]').addEventListener('click', (event) => {
    event.target.closest('.view-wrapper').classList.remove('active')
    event.target.closest('.view-wrapper').classList.add('close')
})

const viewFileNameElement = document.createElement('h1')
viewFileNameElement.setAttribute('class', 'view-file-name')
viewContent.appendChild(viewFileNameElement)

function createButtonsByType(divDropdownOptions, item) {

    const { name, type, buffer } = item

    const aView = document.createElement('a')
    const aViewTextNode = document.createTextNode(`View: `)
    aView.appendChild(aViewTextNode)

    const spanView = document.createElement('span')
    const spanViewTextNode = document.createTextNode(type)
    spanView.setAttribute('class', 'view-file-type')
    spanView.appendChild(spanViewTextNode)

    aView.appendChild(spanView)

    divDropdownOptions.appendChild(aView)

    aView.addEventListener('click', () => {

        const viewWrapper = document.querySelector('.view-wrapper')
        viewWrapper.classList.remove('close')
        viewWrapper.classList.add('active')

        const viewFileName = document.querySelector('.view-file-name')        
        viewFileName.textContent = `${name}`

        dfnObjURL.redefineObjectURL(buffer)

        const [ fileFormat ] = type.split('/')

        const video = viewContent.querySelector('video')
        const videoStyle = video.style

        const img = viewContent.querySelector('img')
        const imgStyle = img.style

        const mediaButtons = viewContent.querySelector('.media-buttons')
        const mediaButtonsStyle = mediaButtons.style

        if(fileFormat === 'image') {
            
            const img = viewContent.querySelector('img')
            img.setAttribute('src', dfnObjURL.getURLObject())
            
            imgStyle.setProperty('display', 'block')

            mediaButtonsStyle.setProperty('display', 'none')

            if(video.src === null) return
            if(!video.paused) video.pause()
            videoStyle.setProperty('display', 'none')
        }
        
        if(fileFormat === 'video' || fileFormat === 'audio') {

            video.setAttribute('src', dfnObjURL.getURLObject())
            imgStyle.setProperty('display', 'none')

            if(mediaButtonsStyle.getPropertyValue('display') === 'none') {
                mediaButtonsStyle.removeProperty('display')
            }
            
            videoStyle.setProperty('display', 'block')
        }
    })
}

async function loadFiles() {

    const loaderOptions = createLoader(document.body)

    function handleWithFile(file) {
        
        try {

            const { buffer, id, name, size, ['type']: mimeType } = file

            const [ fileType ] = mimeType.split('/')

            const blob = new Blob([ buffer ], { mimeType })
        
            const li = document.createElement('li')
            li.setAttribute('data-item-id', id)
            li.setAttribute('class', 'file')

            function createElementByType(type, elClass) {
                const el = document.createElement(type)
                el.setAttribute('src', URL.createObjectURL(blob))
                el.setAttribute('class', elClass)
                return el
            }
            
            switch(fileType) {
                case 'image':
                    const img = createElementByType('img', 'img-file')
                    li.append(img)
                    break

                case 'video':
                    const video = createElementByType('video', 'video-file')
                    li.append(video)
                    break

                default:
                    break
            }
            
            const div = document.createElement('div')
            div.setAttribute('class', 'file-details')

            const h1 = document.createElement('h1')
            h1.setAttribute('class', 'file-name')

            const textNode = name.length < 16 
                ? name 
                : `${name.slice(0, 10)}...${name.slice(name.length - 10)}`

            const h1TextNode = document.createTextNode(textNode)
            h1.appendChild(h1TextNode)

            const pForSize = document.createElement('p')
            const pForSizeTextNode = document.createTextNode('Size: ')
            pForSize.appendChild(pForSizeTextNode)
            pForSize.setAttribute('class', 'file-desc')

            const spanSize = document.createElement('span')
            const spanTextNode = document.createTextNode(getSize(size))
            spanSize.appendChild(spanTextNode)
            spanSize.setAttribute('class', 'file-size')
            pForSize.appendChild(spanSize)

            const pForType = document.createElement('p')
            const pForTypeTextNode = document.createTextNode('Type: ')
            pForType.setAttribute('class', 'file-desc')
            pForType.appendChild(pForTypeTextNode)

            const spanType = document.createElement('span')
            const spanTypeTextNode = document.createTextNode(mimeType)
            spanType.appendChild(spanTypeTextNode)
            pForType.appendChild(spanType)
            
            const iExpandMore = document.createElement('i')
            const iExpandMoreTextNode = document.createTextNode('expand_more')
            iExpandMore.setAttribute('class', 'material-icons')
            iExpandMore.appendChild(iExpandMoreTextNode)
            
            const buttonSpan = document.createElement('span')
            const buttonSpanTextNode = document.createTextNode('Options')
            buttonSpan.appendChild(buttonSpanTextNode)
            
            const buttons = document.createElement('button')
            buttons.setAttribute('class', 'options')
            buttons.append(buttonSpan, iExpandMore)

            const divDropdownOptions = document.createElement('div')
            divDropdownOptions.setAttribute('class', 'dropdown-options')
            divDropdownOptions.setAttribute('style', 'display: none;')
            divDropdownOptions.setAttribute('data-dropdown-id', id)

            const aDownload = document.createElement('a')
            const aDownloadTextNode = document.createTextNode('Download')
            aDownload.appendChild(aDownloadTextNode)

            aDownload.onclick = () => downloadByBlob([ buffer ], mimeType, name)

            divDropdownOptions.append(aDownload)

            createButtonsByType(divDropdownOptions, file)

            div.append(h1, pForSize, pForType, buttons, divDropdownOptions)
            li.append(div)

            return li

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

    const dropdowns = document.querySelectorAll('.options')

    const coords = new Coords()

    function handleWithDropdown(dropdown) {
        
        dropdown.addEventListener('click', (event) => {
            event.stopPropagation()

            const allActiveDropdowns = document.querySelectorAll('[data-dropdown-active]')
                .forEach(dropdown => {
                    dropdown.style.display = 'none'
                    dropdown.removeAttribute('data-dropdown-active')
                })

            const targetClicked = event.target
            
            const currLi = targetClicked.closest('li')
            const IDCurrLi = currLi.dataset.itemId

            const currDropdown = document.querySelector(`[data-dropdown-id="${IDCurrLi}"]`)
            const currDropdownStyle = currDropdown.style

            if(currDropdownStyle.getPropertyValue('display') !== 'none') {
                return
            }

            currDropdown.removeAttribute('style')
            currDropdown.setAttribute('data-dropdown-active', '')

            coords.setCoords(event.pageX, event.pageY)
                
            const { x, y } = coords.getCoords()

            currDropdown.style.top = `${y}px`
            currDropdown.style.left = `${x}px`

            const { right, bottom } = currDropdown.getBoundingClientRect()

            if(right > docEl.clientWidth) {
                currDropdown.style.left = `${docEl.clientWidth - currDropdown.offsetWidth}px`
            }

            if(bottom > docEl.clientHeight) {
                currDropdownStyle
                    .setProperty('top', `${docEl.clientHeight - currDropdown.offsetHeight}px`)
            }
        })
    }

    dropdowns.forEach(dropdown => {
        handleWithDropdown(dropdown)
    })

    const eventsToRemoveDropdown = [
        'click',
        'resize'
    ]

    eventsToRemoveDropdown.forEach(event => {
        window.addEventListener(event, () => {
            const activeDropdowns = [...document.querySelectorAll('[data-dropdown-active]')]
            activeDropdowns.forEach(activeDropdown => {
                activeDropdown.style.setProperty('display', 'none')
                activeDropdown.removeAttribute('data-dropdown-active')
            })
        })
    })
}

function callFirstInitialization() {

    loadFiles()
    loadScript('../js/features/mouse-swap.js', true)
    
    const video = createElement('video', { class: 'view-file-visualizer' })
    const img = createElement('img', { class: 'view-file-visualizer' })

    viewContent.insertAdjacentElement('afterbegin', video)
    viewContent.insertAdjacentElement('afterbegin', img)

    handleWithMedia(video)
    
}

window.onload = () => callFirstInitialization()
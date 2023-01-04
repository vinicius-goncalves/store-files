import { getAllItems, getItemByKey } from './indexedDBUtils.js'
import { downloadByBlob, createLoader, createElement, getSize, loadScript } from './utils.js'
import { handleWithMedia } from './media-utils.js'
import { Coords } from './classes.js'

handleWithMedia(document.querySelector('video'))

const filesWrapper = document.querySelector('.files-wrapper')
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
    document.querySelector('video').src = null
    event.target.closest('.view-wrapper').classList.remove('active')
    event.target.closest('.view-wrapper').classList.add('close')    
})

const viewContent = document.querySelector('.view-content')

const viewFileNameElement = document.createElement('h1')
viewFileNameElement.setAttribute('class', 'view-file-name')
viewContent.appendChild(viewFileNameElement)

function createButtonsByType(divDropdownOptions, item) {

    const aView = document.createElement('a')
    const aViewTextNode = document.createTextNode(`View: `)
    aView.appendChild(aViewTextNode)

    const spanView = document.createElement('span')
    const spanViewTextNode = document.createTextNode(item.type)
    spanView.setAttribute('class', 'view-file-type')
    spanView.appendChild(spanViewTextNode)

    aView.appendChild(spanView)

    divDropdownOptions.appendChild(aView)

    aView.addEventListener('click', () => {

        const viewWrapper = document.querySelector('.view-wrapper')
        viewWrapper.classList.remove('close')
        viewWrapper.classList.add('active')

        const viewFileName = document.querySelector('.view-file-name')        
        viewFileName.textContent = `${item.name}`

        dfnObjURL.redefineObjectURL(item.buffer)

        if(item.type.indexOf('image') >= 0) {
            
            const img = createElement('img', {
                class: 'view-file-visualizer',
                src: dfnObjURL.getURLObject()
            })

            viewContent.insertAdjacentElement('afterbegin', img)
        }
        
        if(item.type.indexOf('video') >= 0) {

            const video = document.querySelector('video')
            video.setAttribute('src', dfnObjURL.getURLObject())

        }

        if(item.type.indexOf('audio') >= 0) {

            const audio = createElement('audio', {
                class: 'view-file-visualizer-video'
            })

            const source = createElement('source', {
                src: currentMedia
            })

            audio.appendChild(source)
            viewContent.insertAdjacentElement('afterbegin', audio)

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

    function handleWithDropdown(dropdown) {
        
        dropdown.addEventListener('click', (event) => {
            event.stopPropagation()

            const targetClicked = event.target
            
            const currLi = targetClicked.closest('li')
            const IDCurrLi = currLi.dataset.itemId

            const currDropdown = document.querySelector(`[data-dropdown-id="${IDCurrLi}"]`)
            const currDropdownStyle = currDropdown.style

            console.log(currDropdownStyle)

            if(currDropdownStyle.getPropertyValue('display') !== 'none') {
                return
            }

            currDropdown.removeAttribute('style')
            currDropdown.setAttribute('data-dropdown-active', '')
                
            const { x, y } = new Coords(event.pageX, event.pageY).getCoords()

            currDropdown.style.top = `${x}px`
            currDropdown.style.left = `${y}px`

            const { right } = currDropdown.getBoundingClientRect()
            if(right > docEl.clientWidth) {
                currDropdown.style.left = `${docEl.clientWidth - currDropdown.offsetWidth}px`
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
            document.querySelectorAll('[data-dropdown-active]').forEach(item => {
                item.style.setProperty('display', 'none')
                item.removeAttribute('data-dropdown-active')
            })
        })
    })
}

function callFirstInitialization() {
    loadFiles()
    loadScript('../js/features/mouse-swap.js', true)
}

window.onload = () => callFirstInitialization()
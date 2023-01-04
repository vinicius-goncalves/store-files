import { Coords } from '../classes.js'
import { manageDOMElementClasses } from '../utils.js'

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
        manageDOMElementClasses([ 'active' ], [ 'close' ], viewWrapper)

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

class CustomFile extends HTMLElement {
    constructor() {
        
        super()

        const template = document.querySelector('[data-template="custom-file"]')
        const templateContent = template.content
        
        const shadowRoot = this.attachShadow({ mode: 'open' })
        shadowRoot.appendChild(templateContent.cloneNode(true))

        const dropdownOptions = shadowRoot.querySelector('.dropdown-options')
        dropdownOptions.style.setProperty('display', 'none')
    }

    get fileID() {
        return this.getAttribute('id')
    }

    
    handleWithDropdown(dropdown) {

        const coords = new Coords(0, 0)

        dropdown.addEventListener('click', (event) => {
            event.stopPropagation()
            
            const customFiles = [...document.querySelectorAll('custom-file')]
            const shadowRootCustomFiles = customFiles.map(customFile => customFile.shadowRoot)

            shadowRootCustomFiles.forEach(shadowRoot => {
                const dropdownActive = shadowRoot.querySelector('[data-dropdown-active]')
                if(!dropdownActive) {
                    return
                }

                dropdownActive.removeAttribute('data-dropdown-active')
                dropdownActive.style.setProperty('display', 'none')
            })
            
            const currCustomFile = this
            const shadowRoot = currCustomFile.shadowRoot

            const currDropdown = shadowRoot.querySelector(`.dropdown-options`)
            const currDropdownStyle = currDropdown.style

            currDropdownStyle.removeProperty('display')
            currDropdown.setAttribute('data-dropdown-active', '')

            coords.setCoords(event.pageX, event.pageY)
                
            const { x, y } = coords.getCoords()

            currDropdown.style.top = `${y}px`
            currDropdown.style.left = `${x}px`

            const { right, bottom } = currDropdown.getBoundingClientRect()

            if(right > docEl.clientWidth) {
                currDropdownStyle
                    .setProperty('left', `${docEl.clientWidth - currDropdown.offsetWidth}px`)
            }

            if(bottom > docEl.clientHeight) {
                currDropdownStyle
                    .setProperty('top', `${docEl.clientHeight - currDropdown.offsetHeight}px`)
            }
        })
    }

    defineFileDetails(mediaEl, id, type, name, buffer, size) {
        
        const currEl = this
        const shadowRoot = currEl.shadowRoot

        const fileName = shadowRoot.querySelector('.file-name')
        const fileSize = shadowRoot.querySelector('.file-size')
        const fileType = shadowRoot.querySelector('.file-type')

        const dropdown = shadowRoot.querySelector('.options')
        this.handleWithDropdown(dropdown)

        const item = { id, type, name, buffer, size }

        createButtonsByType(shadowRoot.querySelector('.dropdown-options'), item)

        currEl.setAttribute('id', id)
        currEl.setAttribute('class', 'file')

        shadowRoot.prepend(mediaEl)
        mediaEl.setAttribute('src', URL.createObjectURL(buffer))
        
        fileName.textContent = name
        fileSize.textContent = size
        fileType.textContent = type
    }
}

customElements.define('custom-file', CustomFile)
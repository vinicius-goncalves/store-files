import { getAllItems } from './indexedDBUtils.js'
import { downloadByBlob, createLoader, createElement, getSize } from './utils.js'

const dropdownOptions = document.querySelector('.dropdown-options')
const filesWrapper = document.querySelector('.files-wrapper')
const docEl = document.documentElement

document.querySelector('[data-close="view-wrapper"]').addEventListener('click', (event) => {
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

        document.querySelector('.view-file-visualizer')?.remove()
        document.querySelector('.view-file-visualizer-video')?.remove()

        const viewWrapper = document.querySelector('.view-wrapper')
        viewWrapper.classList.remove('close')
        viewWrapper.classList.add('active')

        const viewFileName = document.querySelector('.view-file-name')        
        viewFileName.textContent = `${item.name}`

        const blob = new Blob([item.buffer], { type: item.type })
        const blobSrc = URL.createObjectURL(blob)

        if(item.type.indexOf('image') >= 0) {

            const img = createElement('img', {
                class: 'view-file-visualizer',
                src: blobSrc
            })
            viewContent.insertAdjacentElement('afterbegin', img)
        }

        if(item.type.indexOf('video') >= 0) {

            const x = document.querySelector('.media-buttons')

            const video = createElement('video', {
                class: 'view-file-visualizer-video'
            })

            const source = createElement('source', {
                src: blobSrc
            })
            
            video.appendChild(source)
            viewContent.insertAdjacentElement('afterbegin', video)

            let isPlaying = !video.paused
            let interval = null

            const pauseButton = document.querySelector('.pause')
            const stopButton = document.querySelector('.stop')
            const fastRewind = document.querySelector('.rewind')
            const fastForward = document.querySelector('.forward')
            const volume = document.querySelector('.volume')

            const objDuration = Object.create(null)
            
            function updateTimeDetails() {
                const hoursRemains = Math.floor((video.duration - video.currentTime) / 3600)
                    const minutesRemain = Math.floor((video.duration - video.currentTime) / 60)
                    const secondsRemain = Math.floor((video.duration - video.currentTime) % 60)

                    const h = hoursRemains < 10 ? `0${hoursRemains}` : hoursRemains
                    const m = minutesRemain < 10 ? `0${minutesRemain}` : minutesRemain
                    const s = secondsRemain < 10 ? `0${secondsRemain}` : secondsRemain

                    Object.defineProperty(objDuration, 'currentDuration', {
                        value: video.duration > 3600 
                            ? `${h}:${m}:${s}`
                            : `${m}:${s}`,
                        enumerable: true,
                        writable: true
                    })

                    for(let property in objDuration) {
                        const itemDurationByProperty = document.querySelector(`.${property}`)
                        if(itemDurationByProperty instanceof Node) {
                            itemDurationByProperty.textContent = `${objDuration[property]}`
                        }
                    }
            }

            video.addEventListener('loadedmetadata', (event) => {

                if(pauseButton.textContent.includes('pause') && !isPlaying) {
                    pauseButton.textContent = 'play_arrow'
                }

                const durationInSeconds = event.target.duration

                const hours = Math.floor(durationInSeconds / 3600)
                const minutes = Math.floor(durationInSeconds % 3600 / 60)
                const seconds = Math.floor(durationInSeconds % 3600 % 60)

                Object.defineProperty(objDuration, 'totalDuration', {
                    value: video.duration > 3600 
                        ? `${hours}:${minutes}:${seconds}` 
                        : `${minutes}:${seconds}` ,
                    enumerable: true
                })
            })

            video.addEventListener('loadeddata', () => {
                
                updateTimeDetails()

                video.addEventListener('play', () => {
                
                    interval = setInterval(() => {
                        updateTimeDetails()
                    }, 1000)
                })
    
                video.addEventListener('pause', () => {
                    if(interval) {
                        clearInterval(interval)
                    }
                })
    
                pauseButton.addEventListener('click', () => {
    
                    if(video instanceof HTMLMediaElement) {
    
                        if(!isPlaying) {
                            pauseButton.textContent = 'pause'
                            isPlaying = true
                            video.play()
                            return
                        }
    
                        pauseButton.textContent = 'play_arrow'
                        isPlaying = false
                        video.pause()
                    }
                })
    
                fastForward.addEventListener('click', () => {
                    if(!(video.currentTime >= video.duration - 10)) {
                        video.currentTime += 10
                    }
                })
    
                fastRewind.addEventListener('click', () => {
                    if(!(video.currentTime <= 10)) {
                        video.currentTime -= 10
                    }
                })
    
                //change -> To Microsoft IE
                //input -> To Microsoft Edge (Chromium), Chrome, Safari, etc.
                const volumeEvents = ['input', 'change']
                volumeEvents.forEach(event => {
                    volume.addEventListener(event, e => {
                        const volume = Number.parseInt(e.target.value)
                        video.volume = (volume / 100).toFixed(1)
                    })
                })
    
                stopButton.addEventListener('click', (event) => {
                    if(isPlaying) {
                        isPlaying = false
                        pauseButton.textContent = 'play_arrow'
                    }
                    video.currentTime = 0
                    video.pause()
                })
            })
        }
    })
}

window.addEventListener('load', (event) => {

    const loader = createLoader(document.body)

    getAllItems(items => {

        try {

            const lis = items.map(item => {
            
                const blob = new Blob([ item.buffer ], { type: item.type })
                
                const docFrag = document.createDocumentFragment()
    
                const li = document.createElement('li')
                li.setAttribute('data-item-id', item.id)
                const liClassAttr = document.createAttribute('class')
                liClassAttr.value = 'file'
                li.setAttributeNode(liClassAttr)
    
                if(item.type.includes('image')) {
    
                    const img = document.createElement('img')
                    const imgSrcAttr = document.createAttribute('src')
                    imgSrcAttr.value = URL.createObjectURL(blob)
                    
                    const imgClassAttr = document.createAttribute('class')
                    imgClassAttr.value = 'file-img'
                    
                    img.setAttributeNode(imgSrcAttr)
                    img.setAttributeNode(imgClassAttr)
    
                    li.append(img)
    
                }
    
                if(item.type.includes('video')) {
                    
                    const video = document.createElement('video')
                    video.setAttribute('class', 'file-img')
                    
                    const srcVideo = document.createElement('source')
                    srcVideo.setAttribute('type', item.type)
                    srcVideo.setAttribute('src', URL.createObjectURL(blob))
                    
                    video.appendChild(srcVideo)
    
                    li.append(video)
                
                }
                
                const div = document.createElement('div')
                const divClassAttr = document.createAttribute('class')
                divClassAttr.value = 'file-details'
                div.setAttributeNode(divClassAttr)
    
                const h1 = document.createElement('h1')
                const h1TextNode = document.createTextNode(item.name.length < 16 
                        ? item.name 
                        : item.name.slice(0, 5) + '...' + item.name.slice(5, 10) + '.' + item.type.split('/')[1])
                const h1ClassAttr = document.createAttribute('class')
                h1ClassAttr.value = 'file-name'
                h1.setAttributeNode(h1ClassAttr)
                h1.appendChild(h1TextNode)
    
                const pForSize = document.createElement('p')
                const pForSizeTextNode = document.createTextNode('Size: ')
                pForSize.appendChild(pForSizeTextNode)
                pForSize.setAttribute('class', 'file-desc')
    
                const spanSize = document.createElement('span')
                const spanTextNode = document.createTextNode(getSize(item.size))
                spanSize.appendChild(spanTextNode)
                spanSize.setAttribute('class', 'file-size')
                pForSize.appendChild(spanSize)
    
                const pForType = document.createElement('p')
                const pForTypeTextNode = document.createTextNode('Type: ')
                pForType.setAttribute('class', 'file-desc')
                pForType.appendChild(pForTypeTextNode)
    
                const spanType = document.createElement('span')
                const spanTypeTextNode = document.createTextNode(item.type)
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
                divDropdownOptions.setAttribute('data-dropdown-id', item.id)
    
                const aDownload = document.createElement('a')
                const aDownloadTextNode = document.createTextNode('Download')
                aDownload.appendChild(aDownloadTextNode)
    
                divDropdownOptions.append(aDownload)
    
                aDownload.addEventListener('click', () => {
                    downloadByBlob([ item.buffer ], item.type)
                })
                
                createButtonsByType(divDropdownOptions, item)
    
                div.append(h1, pForSize, pForType, buttons, divDropdownOptions)
    
                li.append(div)
    
                docFrag.appendChild(li)
                
                return docFrag
    
            })
            
            lis.forEach(li => filesWrapper.append(li))

        } catch (error) {

            console.error(error)

        } finally {

            document.querySelector(`[data-loader-id="${loader}"]`)?.remove()

        }
        
        const dropdowns = document.querySelectorAll('.options')

        dropdowns.forEach(dropdown => {
            dropdown.addEventListener('click', (event) => {

                Array.from(filesWrapper.children).forEach(item => {
                    const dropdown = item.querySelector('.dropdown-options')
                    if(dropdown) {
                        dropdown.style.setProperty('display', 'none')
                    }
                })
                
                event.stopPropagation()

                const dropdownFound = document.querySelector(`[data-dropdown-id="${event.target.closest('li').dataset.itemId}"]`)

                if(dropdownFound.style.display === 'none') {

                    dropdownFound.removeAttribute('style')
                    dropdownFound.setAttribute('data-dropdown-active', event.target.closest('li').dataset.itemId)
                    
                    const coordX = event.pageX
                    const coordY = event.pageY
    
                    dropdownFound.style.top = `${coordY}px`
                    dropdownFound.style.left = `${coordX}px`

                    const rect = dropdownFound.getBoundingClientRect()
                    if(rect.right > docEl.clientWidth) {
                        dropdownFound.style.left = `${docEl.clientWidth - dropdownFound.offsetWidth}px`
                    }

                    return
                }
                
                dropdownFound.style.display = 'none'
                
            })
        })

        dropdowns.forEach(dropdown => {
                dropdown.addEventListener('click', (event) => {
    
                    Array.from(filesWrapper.children).forEach(item => {
                        const dropdown = item.querySelector('.dropdown-options')
                        if(dropdown) {
                            dropdown.style.setProperty('display', 'none')
                        }
                    })
                    
                    event.stopPropagation()
    
                    const dropdownFound = document.querySelector(`[data-dropdown-id="${event.target.closest('li').dataset.itemId}"]`)
    
                    if(dropdownFound.style.display === 'none') {
    
                        dropdownFound.removeAttribute('style')
                        dropdownFound.setAttribute('data-dropdown-active', event.target.closest('li').dataset.itemId)
                        
                        const coordX = event.pageX
                        const coordY = event.pageY
        
                        dropdownFound.style.top = `${coordY}px`
                        dropdownFound.style.left = `${coordX}px`
    
                        const rect = dropdownFound.getBoundingClientRect()
                        if(rect.right > docEl.clientWidth) {
                            dropdownFound.style.left = `${docEl.clientWidth - dropdownFound.offsetWidth}px`
                        }
    
                        return
                    }
                    
                    dropdownFound.style.display = 'none'
                    
                })
            })

        const eventsToRemoveDropdown = [
            'click',
            'resize'
        ]

        eventsToRemoveDropdown.forEach(event => {
            window.addEventListener(event, () => {
                document.querySelectorAll('[data-dropdown-active]').forEach(item => {
                    item.style.setProperty('display', 'none')
                })
            })
        })
    })
})

let isScrolling = false
let coordY = 0
let prevScrollTop = 0

filesWrapper.addEventListener('mousedown', (event) => {
    event.preventDefault()
    if(!isScrolling) {
        prevScrollTop = filesWrapper.scrollTop
        coordY = event.clientY
        isScrolling = true
    }
})

filesWrapper.addEventListener('mousemove', (event) => {
    event.preventDefault()
    if(isScrolling) {
        filesWrapper.scrollTop = prevScrollTop - (event.clientY - coordY)
    }
})

filesWrapper.addEventListener('mouseup', () => {
    if(isScrolling) {
        isScrolling = false
    }
})

filesWrapper.addEventListener('mouseleave', () => {
    if(isScrolling) {
        isScrolling = false
    }
})
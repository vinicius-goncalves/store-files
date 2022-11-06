import { getAllItems } from './indexedDBUtils.js'
import { downloadByBlob } from './utils.js'

const dropdownOptions = document.querySelector('.dropdown-options')
const filesWrapper = document.querySelector('.files-wrapper')

const docEl = document.documentElement

window.addEventListener('load', (event) => {

    getAllItems(items => {
        
        const lis = items.map(item => {
            
            const blob = new Blob([ item.buffer ], { type: item.type })
            
            const docFrag = document.createDocumentFragment()

            const li = document.createElement('li')
            li.setAttribute('data-item-id', item.id)
            const liClassAttr = document.createAttribute('class')
            liClassAttr.value = 'file'
            li.setAttributeNode(liClassAttr)

            const img = document.createElement('img')
            const imgSrcAttr = document.createAttribute('src')
            imgSrcAttr.value = URL.createObjectURL(blob)
            
            const imgClassAttr = document.createAttribute('class')
            imgClassAttr.value = 'file-img'
            
            img.setAttributeNode(imgSrcAttr)
            img.setAttributeNode(imgClassAttr)
            
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
            const spanTextNode = document.createTextNode(item.size)
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
            

            function createButtonsByType(type) {
                if(type.includes('image')) {
                    const aView = document.createElement('a')
                    const aViewTextNode = document.createTextNode(`View: `)
                    aView.appendChild(aViewTextNode)

                    const spanView = document.createElement('span')
                    const spanViewTextNode = document.createTextNode(item.type)
                    spanView.setAttribute('class', 'view-file-type')
                    spanView.appendChild(spanViewTextNode)

                    aView.appendChild(spanView)

                    divDropdownOptions.appendChild(aView)
                }
            } 

            createButtonsByType(item.type)
            

            div.append(h1, pForSize, pForType, buttons, divDropdownOptions)

            li.append(img, div)
            docFrag.appendChild(li)
            
            return docFrag

        })

        
        lis.forEach(li => filesWrapper.append(li))
        
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
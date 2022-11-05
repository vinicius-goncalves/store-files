const dropdown = document.querySelector('.options')
const dropdownOptions = document.querySelector('.dropdown-options')
const docEl = document.documentElement

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

dropdown.addEventListener('click', (event) => {
    
    event.stopPropagation()

    if(dropdownOptions.style.getPropertyValue('display') === 'none') {
        
        dropdownOptions.style.removeProperty('display')

        dropdownOptions.style.left = `${event.pageX}px`
        dropdownOptions.style.top = `${event.pageY}px`
        
        const dropdownOptionsBCR = dropdownOptions.getBoundingClientRect()
        if(dropdownOptionsBCR.right > docEl.clientWidth) {
            dropdownOptions.style.left = `${docEl.clientWidth - dropdownOptions.offsetWidth}px`
        }

        dropdownOptions.setAttribute('data-dropdown-active', 'true')
        return
    }

    dropdownOptions.style.setProperty('display', 'none')
})
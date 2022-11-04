const dropdown = document.querySelector('.options')
const dropdownOptions = document.querySelector('.dropdown-options')
const docEl = document.documentElement

window.addEventListener('click', () => {
    document.querySelectorAll('[data-dropdown-active]').forEach(item => {
        item.style.setProperty('display', 'none')
    })
})

dropdown.addEventListener('click', (event) => {
    
    event.stopPropagation()

    if(dropdownOptions.style.getPropertyValue('display') === 'none') {
        
        dropdownOptions.style.removeProperty('display')

        dropdownOptions.style.left = `${event.clientX}px`
        dropdownOptions.style.top = `${event.clientY}px`
        
        const dropdownOptionsBCR = dropdownOptions.getBoundingClientRect()
        
        if(dropdownOptionsBCR.right > docEl.clientWidth) {
            dropdownOptions.style.setProperty('left', `${docEl.clientWidth - dropdownOptions.offsetWidth}px`)
            console.log(window.innerWidth - dropdownOptions.offsetWidth)
        }

        dropdownOptions.setAttribute('data-dropdown-active', 'true')

        return
    }

    dropdownOptions.style.setProperty('display', 'none')
})
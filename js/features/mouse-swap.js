import { Coords } from '../classes.js'

const filesWrapper = document.querySelector('.files-wrapper')

let isScrolling = false
let prevScrollTop = null

const coords = new Coords()

filesWrapper.addEventListener('mousedown', (event) => {
    event.preventDefault()

    if(!isScrolling) {
        prevScrollTop = filesWrapper.scrollTop
        coords.setY(event.pageY)
        isScrolling = true
    }
})

filesWrapper.addEventListener('mousemove', (event) => {
    event.preventDefault()

    if(!isScrolling) {
        return
    }

    const { y } = coords.getCoords()
    filesWrapper.scrollTop = prevScrollTop - (event.pageY - y)

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
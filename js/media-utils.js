const timeObj = Object.create(null)

function Interval() {

    this.startInterval = function(callback, msInterval) {
        setInterval(callback, msInterval)
    }

    this.deleteInterval = function() {
        clearInterval(this.interval)
    }
}

function renderVolume() {
    
    const volumeDatalist = document.querySelector('#volume')
    const docFrag = document.createDocumentFragment()

    for(let i = 0; i < 100; i += 10) {
        
        const option = document.createElement('option')
        option.setAttribute('value', i)
        docFrag.appendChild(option)

    }

    volumeDatalist.appendChild(docFrag)
}

window.addEventListener('DOMContentLoaded', renderVolume.bind(this))

export function formatUnit(unit) {
    return unit < 10 ? `0${unit}` : `${unit}`
}

function updateDOMTime() {

    Object.entries(timeObj).forEach(pair => {
        const [ selector, value ] = pair

        const DOMEl = document.querySelector(`.${selector}`)
        DOMEl.textContent = value

    })
}

function getTotalTime(media) {

    if(!(media instanceof HTMLMediaElement)) {
        throw new Error(`Media argument must be an instance of HTMLMediaElement, the value ${media} was passed.`)
    }

    try {

        const { duration } = media

        const totalHours = Math.floor(duration / 3600)
        const totalMinutes = Math.floor(duration % 3600 / 60)
        const totalSeconds = Math.floor(duration % 3600 % 60)
    
        const unitsToFormat = totalHours == 0 
            ? [totalMinutes, totalSeconds]
            : [totalHours, totalMinutes, totalSeconds]
    
        const unitsFormatted = unitsToFormat.map(unit => formatUnit(unit)).join(':')
    
        Object.defineProperties(timeObj, {
            'total-duration': {
                value: unitsFormatted,
                enumerable: true,
                writable: true
            },
            'remain-duration': {
                value: unitsFormatted,
                enumerable: true,
                writable: true
            }
        })

    } catch (error) {
        console.log(error)
    } finally {
        updateDOMTime()
    }
}

function getCurrentTime(media, msInterval = 1000) {

    if(!(media instanceof HTMLMediaElement)) {
        throw new Error(`Media argument must be an instance of HTMLMediaElement, the value ${media} was passed.`)
    }

    const newInterval = new Interval()

    if(media.paused) {
        newInterval.deleteInterval()
    }

    function updateRemainDuration() {

        try {

            const { duration, currentTime } = media

            const currentHours = Math.floor((duration - currentTime) / 3600)
            const currentMinutes = Math.floor((duration - currentTime) / 60 % 60)
            const currentSeconds = Math.floor((duration - currentTime) % 60)

            const unitsToFormat = currentHours == 0 
                ? [currentMinutes, currentSeconds]
                : [currentHours, currentMinutes, currentSeconds]

            const unitsFormatted = unitsToFormat.map(unit => formatUnit(unit)).join(':')

            Object.defineProperty(timeObj, 'remain-duration', {
                value: unitsFormatted,
                enumerable: true,
                writable: true
            })

        } catch (error) {
            console.log(error)
        } finally {
            updateDOMTime()
        }
    }

    newInterval.startInterval(updateRemainDuration.bind(this), msInterval)
}

function setMediaStatus(media, status) {

    if(!(media instanceof HTMLMediaElement)) {
        throw new Error(`Media argument must be an instance of HTMLMediaElement, the value ${media} was passed.`)
    }

    if(status === 'pause') {
        media.pause()
        return { paused: true, currentButton: 'play_arrow' }
    }

    if(status === 'play') {
        media.play()
        return { paused: false, currentButton: 'pause' }
    }

    if(status === 'stop') {
        media.pause()
        media.currentTime = 0
        return { paused: true, currentButton: 'play_arrow' }
    }
}

const mediaSpeedManagerTwo = {
    currentSpeed: 1,
    updateSpeed: function() {
        this.currentSpeed = this.currentSpeed >= 2 ? .25 : this.currentSpeed + .25
        return { newSpeed: this.currentSpeed }
    },
    setSpeed: function(newSpeed) {
        this.currentSpeed = newSpeed
    }
}

export function handleWithMedia(currentMedia) {

    if(!(currentMedia instanceof HTMLMediaElement)) {
        throw new Error(`Media argument must be an instance of HTMLMediaElement, the value ${currentMedia} was passed.`)
    }

    const pauseButton = document.querySelector('.pause')
    const stopButton = document.querySelector('.stop')
    const rewindButton = document.querySelector('.rewind')
    const forwardButton = document.querySelector('.forward')
    const speedButton = document.querySelector('.speed')
    const volumeRange = document.querySelector('.volume')
    
    function loadEvents() {

        const eventsToUpdateCurrentTime = ['play', 'pause']
        eventsToUpdateCurrentTime.forEach(event => {
            currentMedia.addEventListener(event, getCurrentTime.bind(this, currentMedia, 1000))
        })

        const pauseButtonEv = () => {

            const buttonStatus = currentMedia.paused
                ? setMediaStatus(currentMedia, 'play')
                : setMediaStatus(currentMedia, 'pause')

            pauseButton.textContent = buttonStatus.currentButton

        }

        const stopButtonEv = () => {

            const buttonStatus = setMediaStatus(currentMedia, 'stop')
            pauseButton.textContent = buttonStatus.currentButton

        }

        const rewindButtonEv = () => {
            if(!(currentMedia.currentTime <= 10)) {
                currentMedia.currentTime -= 10
                return   
            }
        }

        const forwardButtonEv = () => {
            if(!(currentMedia.currentTime >= currentMedia.duration - 10)) {
                currentMedia.currentTime += 10
                return
            }
        }

        const videoSpeed = mediaSpeedManagerTwo
        const speedButtonEv = () => {
            
            const { newSpeed } = videoSpeed.updateSpeed()
            console.log(newSpeed)

            currentMedia.playbackRate = newSpeed
            speedButton.textContent = `x${newSpeed}`

        }


        const { value } = volumeRange
        volumeRange.setAttribute('value', currentMedia.volume * 100)

        const volumeRangeEv = () => {
            currentMedia.volume = (value / 100)
        }
        
        pauseButton.addEventListener('click', pauseButtonEv.bind(this))
        stopButton.addEventListener('click', stopButtonEv.bind(this))
        rewindButton.addEventListener('click', rewindButtonEv.bind(this))
        forwardButton.addEventListener('click', forwardButtonEv.bind(this))
        speedButton.addEventListener('click', speedButtonEv.bind(this))
        volumeRange.addEventListener('input', volumeRangeEv.bind(this))
    }

    currentMedia.addEventListener('loadedmetadata', () => {

        pauseButton.textContent = currentMedia.paused
            ? 'play_arrow'
            : 'play'
            
            getTotalTime(currentMedia)
        
    })

    loadEvents()

}
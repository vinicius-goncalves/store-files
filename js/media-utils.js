const timeObj = Object.create(null)

function Interval() {

    this.startInterval = function(callback) {
        setInterval(callback, 1000)
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

function formatUnit(unit) {
    return unit < 10 ? `0${unit}` : `${unit}`
}

function updateDOMTime() {

    Object.entries(timeObj).forEach(pair => {
        const [ selector, value ] = pair

        const DOMEl = document.querySelector(`.${selector}`)
        DOMEl.textContent = value

    })
}

function getTotalTime(video) {

    if(!(video instanceof HTMLVideoElement)) {
        throw new Error(`Video (args) must be an instance of HTMLVideoElement, the value ${video} was passed.`)
    }

    try {

        const { duration } = video

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

function getCurrentTime(video) {

    if(!(video instanceof HTMLVideoElement)) {
        throw new Error(`Video (args) must be an instance of HTMLVideoElement, the value ${video} was passed.`)
    }

    const newInterval = new Interval()

    if(video.paused) {
        newInterval.deleteInterval()
        return
    }
    
    function updateRemainDuration() {
        try {

            const { duration, currentTime } = video

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

    newInterval.startInterval(updateRemainDuration.bind(this))
}

function setVideoStatus(video, status) {
    if(status === 'pause') {
        video.pause()
        return { paused: true, currentButton: 'play_arrow' }
    }

    if(status === 'play') {
        video.play()
        return { paused: false, currentButton: 'pause' }
    }

    if(status === 'stop') {
        video.pause()
        video.currentTime = 0
        return { paused: true, currentButton: 'play_arrow' }
    }
}

function videoSpeedManager() {
    
    let currentSpeed = 1

    function updateSpeed() {
        currentSpeed = currentSpeed >= 2 ? .25 : currentSpeed + .25
        return { newSpeed: currentSpeed }
    }

    return { updateSpeed }
}

export function handleWithMedia(currentVideo) {

    if(!(currentVideo instanceof HTMLVideoElement)) {
        return
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
            currentVideo.addEventListener(event, () => {
                getCurrentTime(currentVideo)
            })
        })

        pauseButton.addEventListener('click', () => {

            const buttonStatus = currentVideo.paused
                ? setVideoStatus(currentVideo, 'play')
                : setVideoStatus(currentVideo, 'pause')

            pauseButton.textContent = buttonStatus.currentButton

        })

        stopButton.addEventListener('click', () => {

            const buttonStatus = setVideoStatus(currentVideo, 'stop')
            pauseButton.textContent = buttonStatus.currentButton

        })

        rewindButton.addEventListener('click', () => {
            if(!(currentVideo.currentTime <= 10)) {
                currentVideo.currentTime -= 10
                return   
            }
        })

        forwardButton.addEventListener('click', () => {
            if(!(currentVideo.currentTime >= currentVideo.duration - 10)) {
                currentVideo.currentTime += 10
                return
            }
        })

        const videoSpeed = videoSpeedManager()
        speedButton.addEventListener('click', () => {
            
            const { newSpeed } = videoSpeed.updateSpeed()
            currentVideo.playbackRate = newSpeed
            speedButton.textContent = `x${newSpeed}`

        })

        volumeRange.addEventListener('input', () => {
            const { value } = volumeRange
            currentVideo.volume = (value / 100)

        })
    }

    currentVideo.addEventListener('loadedmetadata', () => {
        
        pauseButton.textContent = currentVideo.paused
            ? 'play_arrow'
            : 'play'
    
        loadEvents()
        getTotalTime(currentVideo)

    })
}
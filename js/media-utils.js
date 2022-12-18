const timeObj = Object.create(null)
let currentInterval = null

function formatUnit(unit) {
    return unit < 10 ? `0${unit}` : `${unit}`
}

function getTotalTime(video) {

    if(!(video instanceof HTMLVideoElement)) {
        throw new Error('Video (args) must be an instance of HTMLVideoElement')
    }

    const { duration } = video

    const totalHours = Math.floor(duration / 3600)
    const totalMinutes = Math.floor(duration % 3600 / 60)
    const totalSeconds = Math.floor(duration % 3600 % 60)
    
    const unitsToFormat = totalHours == 0 
        ? [totalMinutes, totalSeconds]
        : [totalHours, totalMinutes, totalSeconds]

    const unitsFormatted = unitsToFormat.map(unit => formatUnit(unit)).join(':')

    Object.defineProperty(timeObj, 'total-duration', {
        value: unitsFormatted,
        enumerable: true,
        writable: true
    })
}

function getCurrentTime(video) {

    if(!(video instanceof HTMLVideoElement)) {
        throw new Error('Video (args) must be an instance of HTMLVideoElement')
    }

    if(video.paused) {
        clearInterval(currentInterval)
        return
    }
    
    currentInterval = setInterval(() => {
        
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

    }, 1000)
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
}

export function handleWithMedia(currentVideo) {

    if(currentVideo instanceof HTMLVideoElement) {
        
        const pauseButton = document.querySelector('.pause')
        const stopButton = document.querySelector('.stop')
        const rewindButton = document.querySelector('.rewind')
        const forwardButton = document.querySelector('.forward')

        function loadEvents() {

            pauseButton.addEventListener('click', () => {

                const button = currentVideo.paused
                    ? setVideoStatus(currentVideo, 'play')
                    : setVideoStatus(currentVideo, 'pause')

                pauseButton.textContent = button.currentButton

            })

            currentVideo.addEventListener('play', () => {
                getCurrentTime(currentVideo)
            })

            currentVideo.addEventListener('pause', () => {
                getCurrentTime(currentVideo)
            })

            rewindButton.addEventListener('click', () => {
                if(!(video.currentTime <= 10)) {
                    video.currentTime -= 10
                    return   
                }
            })

            forwardButton.addEventListener('click', () => {
                if(!(video.currentTime >= video.duration - 10)) {
                    video.currentTime += 10
                    return
                }
            })
        }

        currentVideo.addEventListener('loadedmetadata', () => {
            
            if(currentVideo.paused) {
                pauseButton.textContent = 'play_arrow'
            }
            
            getTotalTime(currentVideo)
            loadEvents()
              
        })
    }
}
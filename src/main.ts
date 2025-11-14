import './style.css'

// Configuration - Update these URLs to your own video and audio files
const VIDEO_URL = 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
const AUDIO_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'

// You can also use local files in the public directory:
// const VIDEO_URL = '/video.mp4'
// const AUDIO_URL = '/music.mp3'

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = document.querySelector<HTMLDivElement>('#app')!

  app.innerHTML = `
    <div class="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div class="max-w-4xl w-full">
        <h1 class="text-4xl font-bold text-white text-center mb-8">
          Sergeant Doakes is Watching
        </h1>
        
        <div class="bg-gray-800 rounded-lg shadow-2xl overflow-hidden">
          <video 
            id="main-video" 
            class="w-full h-auto"
            autoplay 
            muted
            playsinline
            loop
          >
            <source src="${VIDEO_URL}" type="video/mp4">
            Your browser does not support the video tag.
          </video>
        </div>
        
        <div class="mt-8 text-center">
          <button 
            id="audio-toggle" 
            class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-colors duration-200"
          >
            🔊 Play Background Music
          </button>
          <p class="text-gray-400 text-sm mt-4">
            Click the button above to start the background music
          </p>
        </div>
      </div>
    </div>
  `

  // Setup audio
  const audio = new Audio(AUDIO_URL)
  audio.loop = true
  audio.volume = 0.3

  const audioToggle = document.querySelector<HTMLButtonElement>('#audio-toggle')!
  let isPlaying = false

  audioToggle.addEventListener('click', async () => {
    try {
      if (!isPlaying) {
        await audio.play()
        audioToggle.textContent = '🔇 Pause Background Music'
        audioToggle.classList.remove('bg-blue-600', 'hover:bg-blue-700')
        audioToggle.classList.add('bg-red-600', 'hover:bg-red-700')
        isPlaying = true
      } else {
        audio.pause()
        audioToggle.textContent = '🔊 Play Background Music'
        audioToggle.classList.remove('bg-red-600', 'hover:bg-red-700')
        audioToggle.classList.add('bg-blue-600', 'hover:bg-blue-700')
        isPlaying = false
      }
    } catch (error) {
      console.error('Error playing audio:', error)
    }
  })

  // Try to autoplay audio (may be blocked by browser)
  audio.play().catch(() => {
    console.log('Autoplay was prevented. User interaction required.')
  })
})

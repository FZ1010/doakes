import { useEffect, useRef, useState } from 'react'
import { getBrowserInfo } from './utils/getBrowserInfo'
import { saveToDatabase } from './utils/saveToDatabase'
import { sendToTelegram } from './utils/sendToTelegram'

export default function App() {
  const audioRef = useRef(null)
  const videoRef = useRef(null)
  const easterEggAudio1Ref = useRef(null)
  const easterEggAudio2Ref = useRef(null)
  const [audioStarted, setAudioStarted] = useState(false)
  const [clickCount, setClickCount] = useState(0)
  const [isHolding, setIsHolding] = useState(false)
  const holdTimerRef = useRef(null)

  useEffect(() => {
    async function notifyVisitor() {
      const info = await getBrowserInfo()

      // First save to database
      await saveToDatabase(info)

      // Then send to Telegram
      await sendToTelegram(info)
    }

    notifyVisitor()

    // Try to autoplay audio
    const tryAutoplay = async () => {
      try {
        if (audioRef.current) {
          await audioRef.current.play()
          setAudioStarted(true)
        }
      } catch (err) {
        console.log('Autoplay blocked, waiting for user interaction')
      }
    }

    tryAutoplay()

    // Start audio on any user interaction
    const startAudio = async () => {
      if (audioRef.current && !audioStarted) {
        try {
          await audioRef.current.play()
          setAudioStarted(true)
        } catch (err) {
          console.error('Error playing audio:', err)
        }
      }
    }

    // Easter egg: 35 clicks
    const handleClick = () => {
      startAudio()
      setClickCount(prev => {
        const newCount = prev + 1
        if (newCount === 35) {
          // Play easter egg audio 1
          if (audioRef.current) {
            audioRef.current.pause()
          }
          if (easterEggAudio1Ref.current) {
            easterEggAudio1Ref.current.currentTime = 0
            easterEggAudio1Ref.current.play()
          }
          // Reset click count after 5 seconds
          setTimeout(() => setClickCount(0), 5000)
        }
        return newCount
      })
    }

    // Easter egg: Hold for 10 seconds
    const handleMouseDown = () => {
      holdTimerRef.current = setTimeout(() => {
        // Play easter egg audio 2
        if (audioRef.current) {
          audioRef.current.pause()
        }
        if (easterEggAudio2Ref.current) {
          easterEggAudio2Ref.current.currentTime = 0
          easterEggAudio2Ref.current.play()
        }
        setIsHolding(true)
      }, 10000) // 10 seconds
    }

    const handleMouseUp = () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current)
      }
      if (isHolding) {
        setIsHolding(false)
        // Resume main audio
        if (audioRef.current) {
          audioRef.current.play()
        }
      }
    }

    document.addEventListener('click', handleClick)
    document.addEventListener('touchstart', startAudio)
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('touchstart', handleMouseDown)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('touchend', handleMouseUp)

    // Fix Safari mobile video looping
    const handleVideoEnd = () => {
      if (videoRef.current) {
        videoRef.current.currentTime = 0
        videoRef.current.play()
      }
    }

    if (videoRef.current) {
      videoRef.current.addEventListener('ended', handleVideoEnd)
    }

    return () => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('touchstart', startAudio)
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('touchstart', handleMouseDown)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchend', handleMouseUp)
      if (videoRef.current) {
        videoRef.current.removeEventListener('ended', handleVideoEnd)
      }
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current)
      }
    }
  }, [])

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-black relative">
      <video
        ref={videoRef}
        className="h-full w-auto object-cover"
        autoPlay
        muted
        loop
        playsInline
        webkit-playsinline="true"
      >
        <source src="/video.webm" type="video/webm" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/*<h1 className="text-yellow-400 text-5xl md:text-7xl lg:text-8xl text-center px-8 drop-shadow-[0_0_40px_rgba(250,204,21,0.9)] tracking-wider uppercase" style={{ fontFamily: '"Bebas Neue", sans-serif', textShadow: '4px 4px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 0 20px rgba(0,0,0,0.8)', letterSpacing: '0.05em' }}>*/}
        {/*  Surprise MF!, this is a text u can add.*/ }
        {/*</h1>*/}
      </div>
      <audio
        ref={audioRef}
        loop
        playsInline
      >
        <source src="/music.mp3" type="audio/mpeg" />
        Your browser does not support the audio tag.
      </audio>

      {/* Easter Egg Audio 1: 35 clicks */}
      <audio
        ref={easterEggAudio1Ref}
        playsInline
      >
        <source src="/easter-egg-1.mp3" type="audio/mpeg" />
      </audio>

      {/* Easter Egg Audio 2: 10 second hold */}
      <audio
        ref={easterEggAudio2Ref}
        playsInline
      >
        <source src="/easter-egg-2.mp3" type="audio/mpeg" />
      </audio>
    </div>
  )
}

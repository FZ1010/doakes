import FingerprintJS from '@fingerprintjs/fingerprintjs'

export async function getBrowserInfo() {
  // Get IP and geolocation data
  const geoData = await getGeoLocation()

  // Get FingerprintJS data
  const fpPromise = FingerprintJS.load()
  const fp = await fpPromise
  const fpResult = await fp.get()

  const info = {
    // Timestamp
    timestamp: new Date().toISOString(),

    // FingerprintJS unique visitor ID
    visitorId: fpResult.visitorId,
    confidence: fpResult.confidence?.score || 'N/A',

    // IP and Location
    ip: geoData.ip,
    city: geoData.city,
    region: geoData.region,
    country: geoData.country,
    countryCode: geoData.countryCode,
    latitude: geoData.latitude,
    longitude: geoData.longitude,
    isp: geoData.isp,
    org: geoData.org,
    asn: geoData.as,
    postal: geoData.postal,

    // User Agent
    userAgent: navigator.userAgent,
    platform: navigator.platform,

    // Language & Locale
    language: navigator.language,
    languages: navigator.languages,

    // Screen Info
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    screenColorDepth: window.screen.colorDepth,
    viewportSize: `${window.innerWidth}x${window.innerHeight}`,
    devicePixelRatio: window.devicePixelRatio,

    // Timezone
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),

    // Browser Features
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    hardwareConcurrency: navigator.hardwareConcurrency,
    maxTouchPoints: navigator.maxTouchPoints,

    // Device Memory (if available)
    deviceMemory: navigator.deviceMemory || 'N/A',

    // Connection Info (if available)
    connectionType: navigator.connection?.effectiveType || 'N/A',
    connectionDownlink: navigator.connection?.downlink || 'N/A',
    connectionRtt: navigator.connection?.rtt || 'N/A',

    // Referrer
    referrer: document.referrer || 'Direct',

    // Page URL
    url: window.location.href,

    // Browser Vendor
    vendor: navigator.vendor,

    // WebGL Renderer (GPU info)
    webglRenderer: getWebGLRenderer(),

    // Canvas Fingerprint
    canvasFingerprint: getCanvasFingerprint(),

    // Audio Fingerprint
    audioFingerprint: await getAudioFingerprint(),

    // WebRTC IPs
    webrtcIPs: await getWebRTCIPs(),

    // Fonts
    installedFonts: getInstalledFonts(),

    // Plugins
    plugins: getPlugins(),

    // Battery (if available)
    battery: await getBatteryInfo(),

    // All FingerprintJS components
    fingerprintComponents: fpResult.components,
  }

  return info
}

async function getGeoLocation() {
  try {
    const response = await fetch('https://ipapi.co/json/')
    const data = await response.json()
    return {
      ip: data.ip || 'N/A',
      city: data.city || 'N/A',
      region: data.region || 'N/A',
      country: data.country_name || 'N/A',
      countryCode: data.country_code || 'N/A',
      latitude: data.latitude || 'N/A',
      longitude: data.longitude || 'N/A',
      isp: data.org || 'N/A',
      org: data.org || 'N/A',
      as: data.asn || 'N/A',
      postal: data.postal || 'N/A',
    }
  } catch (e) {
    return {
      ip: 'N/A',
      city: 'N/A',
      region: 'N/A',
      country: 'N/A',
      countryCode: 'N/A',
      latitude: 'N/A',
      longitude: 'N/A',
      isp: 'N/A',
      org: 'N/A',
      as: 'N/A',
      postal: 'N/A',
    }
  }
}

function getWebGLRenderer() {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) return 'N/A'

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    if (!debugInfo) return 'N/A'

    return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
  } catch (e) {
    return 'N/A'
  }
}

async function getBatteryInfo() {
  try {
    if (!navigator.getBattery) return 'N/A'

    const battery = await navigator.getBattery()
    return {
      charging: battery.charging,
      level: Math.round(battery.level * 100) + '%',
      chargingTime: battery.chargingTime,
      dischargingTime: battery.dischargingTime,
    }
  } catch (e) {
    return 'N/A'
  }
}

function getCanvasFingerprint() {
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = '#f60'
    ctx.fillRect(125, 1, 62, 20)
    ctx.fillStyle = '#069'
    ctx.fillText('Canvas fingerprint', 2, 15)
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
    ctx.fillText('Canvas fingerprint', 4, 17)
    return canvas.toDataURL().substring(0, 50) + '...'
  } catch (e) {
    return 'N/A'
  }
}

async function getAudioFingerprint() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return 'N/A'

    const context = new AudioContext()
    const oscillator = context.createOscillator()
    const analyser = context.createAnalyser()
    const gainNode = context.createGain()
    const scriptProcessor = context.createScriptProcessor(4096, 1, 1)

    gainNode.gain.value = 0
    oscillator.connect(analyser)
    analyser.connect(scriptProcessor)
    scriptProcessor.connect(gainNode)
    gainNode.connect(context.destination)
    oscillator.start(0)

    const fingerprint = analyser.frequencyBinCount
    oscillator.stop()
    context.close()

    return fingerprint
  } catch (e) {
    return 'N/A'
  }
}

async function getWebRTCIPs() {
  try {
    const ips = []
    const pc = new RTCPeerConnection({ iceServers: [] })
    pc.createDataChannel('')

    pc.createOffer().then(offer => pc.setLocalDescription(offer))

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        pc.close()
        resolve(ips.length > 0 ? ips : 'N/A')
      }, 2000)

      pc.onicecandidate = (ice) => {
        if (!ice || !ice.candidate || !ice.candidate.candidate) return
        const parts = ice.candidate.candidate.split(' ')
        const ip = parts[4]
        if (ip && !ips.includes(ip)) ips.push(ip)
      }
    })
  } catch (e) {
    return 'N/A'
  }
}

function getInstalledFonts() {
  try {
    const baseFonts = ['monospace', 'sans-serif', 'serif']
    const testFonts = [
      'Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia',
      'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS', 'Trebuchet MS',
      'Impact', 'Lucida Console', 'Tahoma', 'Lucida Sans Unicode',
      'MS Sans Serif', 'MS Serif'
    ]

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    const text = 'mmmmmmmmmmlli'
    const textSize = '72px'

    const baseFontWidths = {}
    baseFonts.forEach(baseFont => {
      context.font = textSize + ' ' + baseFont
      baseFontWidths[baseFont] = context.measureText(text).width
    })

    const detectedFonts = []
    testFonts.forEach(font => {
      let detected = false
      baseFonts.forEach(baseFont => {
        context.font = textSize + ' ' + font + ',' + baseFont
        const width = context.measureText(text).width
        if (width !== baseFontWidths[baseFont]) {
          detected = true
        }
      })
      if (detected) detectedFonts.push(font)
    })

    return detectedFonts.length > 0 ? detectedFonts.join(', ') : 'N/A'
  } catch (e) {
    return 'N/A'
  }
}

function getPlugins() {
  try {
    if (!navigator.plugins || navigator.plugins.length === 0) return 'N/A'
    const plugins = []
    for (let i = 0; i < navigator.plugins.length; i++) {
      plugins.push(navigator.plugins[i].name)
    }
    return plugins.join(', ')
  } catch (e) {
    return 'N/A'
  }
}

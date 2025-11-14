import pkg from 'pg';
const { Pool } = pkg;

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
  }
  return pool;
}


async function initDb() {
  const pool = getPool();
  const query = `
    CREATE TABLE IF NOT EXISTS visitors (
      id SERIAL PRIMARY KEY,
      visitor_id VARCHAR(255) NOT NULL,
      timestamp TIMESTAMP NOT NULL,
      ip VARCHAR(45),
      city VARCHAR(255),
      region VARCHAR(255),
      country VARCHAR(255),
      country_code VARCHAR(10),
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      isp TEXT,
      org TEXT,
      asn TEXT,
      postal VARCHAR(20),
      user_agent TEXT,
      platform VARCHAR(255),
      language VARCHAR(50),
      languages JSONB,
      screen_resolution VARCHAR(50),
      screen_color_depth INTEGER,
      viewport_size VARCHAR(50),
      device_pixel_ratio DECIMAL(5, 2),
      timezone VARCHAR(255),
      timezone_offset INTEGER,
      cookies_enabled BOOLEAN,
      do_not_track VARCHAR(10),
      hardware_concurrency INTEGER,
      max_touch_points INTEGER,
      device_memory DECIMAL(5, 2),
      connection_type VARCHAR(50),
      connection_downlink DECIMAL(10, 2),
      connection_rtt INTEGER,
      referrer TEXT,
      url TEXT,
      vendor VARCHAR(255),
      webgl_renderer TEXT,
      canvas_fingerprint TEXT,
      audio_fingerprint VARCHAR(255),
      webrtc_ips JSONB,
      installed_fonts TEXT,
      plugins TEXT,
      battery JSONB,
      fingerprint_components JSONB,
      confidence DECIMAL(5, 4),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_visitor_id ON visitors(visitor_id);
    CREATE INDEX IF NOT EXISTS idx_timestamp ON visitors(timestamp);
    CREATE INDEX IF NOT EXISTS idx_ip ON visitors(ip);
  `;

  try {
    await pool.query(query);
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const pool = getPool();

  // Initialize database
  await initDb();

  if (req.method === 'POST') {
    const data = req.body;

    const query = `
      INSERT INTO visitors (
        visitor_id, timestamp, ip, city, region, country, country_code,
        latitude, longitude, isp, org, asn, postal, user_agent, platform,
        language, languages, screen_resolution, screen_color_depth, viewport_size,
        device_pixel_ratio, timezone, timezone_offset, cookies_enabled, do_not_track,
        hardware_concurrency, max_touch_points, device_memory, connection_type,
        connection_downlink, connection_rtt, referrer, url, vendor, webgl_renderer,
        canvas_fingerprint, audio_fingerprint, webrtc_ips, installed_fonts, plugins,
        battery, fingerprint_components, confidence
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
        $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43
      ) RETURNING id
    `;

    const values = [
      data.visitorId,
      data.timestamp,
      data.ip,
      data.city,
      data.region,
      data.country,
      data.countryCode,
      data.latitude,
      data.longitude,
      data.isp,
      data.org,
      data.asn,
      data.postal,
      data.userAgent,
      data.platform,
      data.language,
      JSON.stringify(data.languages),
      data.screenResolution,
      data.screenColorDepth,
      data.viewportSize,
      data.devicePixelRatio,
      data.timezone,
      data.timezoneOffset,
      data.cookiesEnabled,
      data.doNotTrack,
      data.hardwareConcurrency,
      data.maxTouchPoints,
      data.deviceMemory === 'N/A' ? null : data.deviceMemory,
      data.connectionType,
      data.connectionDownlink === 'N/A' ? null : data.connectionDownlink,
      data.connectionRtt === 'N/A' ? null : data.connectionRtt,
      data.referrer,
      data.url,
      data.vendor,
      data.webglRenderer,
      data.canvasFingerprint,
      String(data.audioFingerprint),
      JSON.stringify(data.webrtcIPs),
      data.installedFonts,
      data.plugins,
      JSON.stringify(data.battery),
      JSON.stringify(data.fingerprintComponents),
      data.confidence === 'N/A' ? null : data.confidence,
    ];

    try {
      const result = await pool.query(query, values);
      res.status(200).json({ success: true, id: result.rows[0].id });
    } catch (error) {
      console.error('Error saving visitor data:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else if (req.method === 'GET') {
    try {
      const result = await pool.query('SELECT * FROM visitors ORDER BY created_at DESC LIMIT 100');
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching visitors:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

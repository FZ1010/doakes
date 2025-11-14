import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

async function checkTable() {
  try {
    // Check if table exists
    const tableCheck = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'visitors'
    `)

    if (tableCheck.rows.length === 0) {
      console.log('❌ Table "visitors" does NOT exist')
    } else {
      console.log('✅ Table "visitors" exists!')

      // Get table structure
      const columns = await pool.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'visitors'
        ORDER BY ordinal_position
      `)

      console.log('\n📋 Table Structure:')
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`)
      })

      // Count rows
      const count = await pool.query('SELECT COUNT(*) FROM visitors')
      console.log(`\n📊 Total visitors: ${count.rows[0].count}`)

      // Get recent visitors if any
      if (count.rows[0].count > 0) {
        const recent = await pool.query('SELECT visitor_id, ip, city, country, timestamp FROM visitors ORDER BY created_at DESC LIMIT 5')
        console.log('\n🔍 Recent visitors:')
        recent.rows.forEach(v => {
          console.log(`  - ${v.visitor_id} | ${v.ip} | ${v.city}, ${v.country} | ${v.timestamp}`)
        })
      }
    }

    await pool.end()
  } catch (error) {
    console.error('❌ Error:', error.message)
    await pool.end()
    process.exit(1)
  }
}

checkTable()

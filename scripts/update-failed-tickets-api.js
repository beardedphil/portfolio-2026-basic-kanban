/**
 * Update failed tickets in To-do column using Supabase REST API.
 * This script makes direct HTTP requests to Supabase - no env vars needed if called via HAL API.
 */

async function fetchTicketsFromSupabase(supabaseUrl, anonKey) {
  const url = `${supabaseUrl}/rest/v1/tickets?kanban_column_id=eq.col-todo&select=id,filename,title,body_md,kanban_column_id&order=id`
  const response = await fetch(url, {
    headers: {
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }
  })
  
  if (!response.ok) {
    throw new Error(`Failed to fetch tickets: ${response.status} ${response.statusText}`)
  }
  
  return await response.json()
}

async function updateTicketInSupabase(supabaseUrl, anonKey, ticketId, updates) {
  const url = `${supabaseUrl}/rest/v1/tickets?id=eq.${ticketId}`
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(updates)
  })
  
  if (!response.ok) {
    throw new Error(`Failed to update ticket: ${response.status} ${response.statusText}`)
  }
  
  return await response.json()
}

// Check if we're being called with HAL API credentials
// If supabaseUrl and anonKey are provided as arguments or env, use them
// Otherwise, this should be called via HAL API which provides them

const args = process.argv.slice(2)
const supabaseUrl = args[0] || process.env.SUPABASE_URL
const anonKey = args[1] || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !anonKey) {
  console.error('Usage: node update-failed-tickets-api.js <SUPABASE_URL> <ANON_KEY>')
  console.error('Or set SUPABASE_URL and SUPABASE_ANON_KEY environment variables')
  console.error('Or call via HAL API which provides credentials')
  process.exit(1)
}

// Import fs for checking audit folders
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const auditDir = path.join(projectRoot, 'docs', 'audit')

function parseFrontmatter(content) {
  if (!content.startsWith('---')) return { frontmatter: {}, body: content }
  const afterFirst = content.slice(3)
  const closeIdx = afterFirst.indexOf('\n---')
  if (closeIdx === -1) return { frontmatter: {}, body: content }
  const block = afterFirst.slice(0, closeIdx).trim()
  const body = afterFirst.slice(closeIdx + 4).trimStart()
  const frontmatter = {}
  for (const line of block.split('\n')) {
    const colon = line.indexOf(':')
    if (colon === -1) continue
    const key = line.slice(0, colon).trim()
    const value = line.slice(colon + 1).trim().replace(/^["']|["']$/g, '')
    if (key) frontmatter[key] = value
  }
  return { frontmatter, body }
}

function serializeFrontmatter(frontmatter) {
  const lines = []
  for (const [key, value] of Object.entries(frontmatter)) {
    if (value === null || value === undefined) continue
    lines.push(`${key}: ${typeof value === 'string' && (value.includes(':') || value.includes(' ')) ? `"${value}"` : value}`)
  }
  return lines.length > 0 ? `---\n${lines.join('\n')}\n---\n` : ''
}

function checkForFailure(ticketId, ticketBody) {
  if (ticketBody.includes('[FAILED]') || ticketBody.includes('[RETRY]')) {
    return null
  }
  
  const matchingFolders = fs.existsSync(auditDir) 
    ? fs.readdirSync(auditDir).filter(f => {
        const dirPath = path.join(auditDir, f)
        return fs.statSync(dirPath).isDirectory() && f.startsWith(ticketId + '-')
      })
    : []
  
  if (matchingFolders.length === 0) return null
  
  const auditFolderPath = path.join(auditDir, matchingFolders[0])
  const pmReviewPath = path.join(auditFolderPath, 'pm-review.md')
  const verificationPath = path.join(auditFolderPath, 'verification.md')
  const worklogPath = path.join(auditFolderPath, 'worklog.md')
  
  const hasAudit = fs.existsSync(pmReviewPath) || fs.existsSync(verificationPath) || fs.existsSync(worklogPath)
  
  if (!hasAudit) return null
  
  return {
    auditFolder: matchingFolders[0],
    auditPath: auditFolderPath,
    pmReviewPath: fs.existsSync(pmReviewPath) ? pmReviewPath : null,
    verificationPath: fs.existsSync(verificationPath) ? verificationPath : null,
    worklogPath: fs.existsSync(worklogPath) ? worklogPath : null,
  }
}

function updateTicketWithFailureMarkers(ticket, failureInfo) {
  const { frontmatter, body } = parseFrontmatter(ticket.body_md)
  
  const titleMatch = body.match(/\*\*Title\*\*:\s*(.+?)(?:\n|$)/)
  const currentTitle = titleMatch ? titleMatch[1].trim() : ticket.title
  
  if (currentTitle.startsWith('[FAILED]') || currentTitle.startsWith('[RETRY]')) {
    return null
  }
  
  frontmatter.status = 'failed'
  frontmatter.failedAttempts = frontmatter.failedAttempts ? parseInt(frontmatter.failedAttempts, 10) + 1 : 1
  frontmatter.lastFailedAt = new Date().toISOString()
  frontmatter.kanbanColumnId = 'col-todo'
  
  const newTitle = `[FAILED] ${currentTitle}`
  let updatedBody = body.replace(/\*\*Title\*\*:\s*(.+?)(?:\n|$)/, `**Title**: ${newTitle}$1${titleMatch ? '' : '\n'}`)
  
  const linkageEnd = updatedBody.indexOf('## Goal')
  const failureHistorySection = `## ⚠️ FAILURE HISTORY

**This ticket has FAILED verification and is being retried.**

- **Failed attempt count**: ${frontmatter.failedAttempts}
- **Last failed**: ${new Date().toLocaleDateString()}
- **Why it failed**: This ticket was previously attempted and is being retried. Review the previous audit artifacts for details.
- **What was attempted**: See previous implementation in audit folder.
- **Previous audit**: \`docs/audit/${failureInfo.auditFolder}/\` (review \`pm-review.md\` and \`verification.md\` for details)
- **Key learnings**: Review the previous audit artifacts to understand what was attempted and why it may have failed.

`
  
  if (linkageEnd !== -1) {
    updatedBody = updatedBody.slice(0, linkageEnd) + failureHistorySection + updatedBody.slice(linkageEnd)
  } else {
    const ticketEnd = updatedBody.indexOf('## Goal')
    if (ticketEnd !== -1) {
      updatedBody = updatedBody.slice(0, ticketEnd) + failureHistorySection + updatedBody.slice(ticketEnd)
    } else {
      updatedBody = failureHistorySection + updatedBody
    }
  }
  
  if (!updatedBody.includes('## QA failure summary')) {
    const goalEnd = updatedBody.indexOf('## Acceptance criteria')
    if (goalEnd !== -1) {
      const qaSection = `## QA failure summary

- This ticket failed verification and is being retried
- Review previous audit artifacts for specific failure details
- Expected vs actual behavior documented in previous verification steps

`
      updatedBody = updatedBody.slice(0, goalEnd) + qaSection + updatedBody.slice(goalEnd)
    }
  }
  
  const implNotesMatch = updatedBody.match(/## Implementation notes \(optional\)\n\n([\s\S]*?)(?=\n## |$)/)
  if (implNotesMatch) {
    const existingNotes = implNotesMatch[1]
    if (!existingNotes.includes('failure history') && !existingNotes.includes('FAILURE HISTORY')) {
      updatedBody = updatedBody.replace(
        /(## Implementation notes \(optional\)\n\n)/,
        `$1- **If retrying a failed ticket**: This ticket has failed before. Review the ⚠️ FAILURE HISTORY section above and the previous audit artifacts in \`docs/audit/${failureInfo.auditFolder}/\` to understand what was attempted and why it may have failed.\n- **Previous attempt**: See \`docs/audit/${failureInfo.auditFolder}/worklog.md\` and \`pm-review.md\` for details.\n\n`
      )
    }
  }
  
  const newBodyMd = serializeFrontmatter(frontmatter) + updatedBody
  
  return {
    ...ticket,
    body_md: newBodyMd,
    title: newTitle
  }
}

async function main() {
  try {
    console.log('Fetching tickets from Supabase...')
    const todoTickets = await fetchTicketsFromSupabase(supabaseUrl, anonKey)
    
    if (!todoTickets || todoTickets.length === 0) {
      console.log('No tickets found in To-do column.')
      return
    }
    
    console.log(`Found ${todoTickets.length} ticket(s) in To-do column.\n`)
    
    let updated = 0
    let skipped = 0
    
    for (const ticket of todoTickets) {
      console.log(`Checking ticket ${ticket.id}: ${ticket.title}`)
      
      const failureInfo = checkForFailure(ticket.id, ticket.body_md)
      
      if (!failureInfo) {
        console.log(`  No failure indicators found - skipping`)
        skipped++
        continue
      }
      
      const updatedTicket = updateTicketWithFailureMarkers(ticket, failureInfo)
      
      if (!updatedTicket) {
        skipped++
        continue
      }
      
      await updateTicketInSupabase(supabaseUrl, anonKey, ticket.id, {
        body_md: updatedTicket.body_md,
        title: updatedTicket.title
      })
      
      console.log(`  ✓ Updated ticket ${ticket.id} with failure markers`)
      updated++
    }
    
    console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}`)
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

main()

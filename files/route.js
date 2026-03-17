import { NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are HackRore AI — an expert laptop and PC repair technician assistant.
You analyse hardware diagnostic scan reports and return structured JSON diagnoses.
You are direct, practical, and technically accurate.
Never include markdown, backticks, or explanatory text outside the JSON object.`

function buildPrompt(report) {
  const R = report
  const issues = R?.diagnosis?.criticalIssues || []
  const warnings = R?.diagnosis?.warnings || []
  const devErrors = R?.devices?.errors || []

  return `Analyse this hardware scan report and return a JSON diagnosis.

SCAN SUMMARY:
- Device: ${R?.system?.manufacturer} ${R?.system?.model} (${R?.system?.serial})
- OS: ${R?.system?.osName} ${R?.system?.osBuild} — Activation: ${R?.system?.activation}
- CPU: ${R?.cpu?.name} — ${R?.cpu?.cores}C/${R?.cpu?.threads}T — Load: ${R?.cpu?.loadPercent}% — Temp: ${R?.cpu?.tempCelsius}°C — Throttle: ${R?.thermal?.throttlingDetected}
- RAM: ${R?.ram?.totalGB}GB total — ${R?.ram?.usedPercent}% used
- Storage: ${(R?.storage?.disks || []).map(d => `${d.model} ${d.sizeGB}GB ${d.storageType} SMART:${d.smartStatus} PowerOnHours:${d?.smartAttributes?.powerOnHours} Reallocated:${d?.smartAttributes?.reallocatedSectors} Pending:${d?.smartAttributes?.pendingSectors}`).join(', ')}
- Battery: ${R?.battery?.wearPercent}% wear — ${R?.battery?.cycleCount} cycles — Status: ${R?.battery?.statusText}
- GPU: ${(R?.gpu || []).map(g => `${g.name} ErrorCode:${g.errorCode}`).join(', ')}
- Thermal zones: ${(R?.thermal?.thermalZones || []).map(z => z.tempC + '°C').join(', ')}
- Benchmarks: Disk read ${R?.benchmarks?.diskSeqReadMBps} MB/s, write ${R?.benchmarks?.diskSeqWriteMBps} MB/s
- Health score: ${R?.score?.value}/100 — Grade: ${R?.score?.grade} — Verdict: ${R?.score?.verdict}
- Critical issues flagged: ${issues.join('; ') || 'none'}
- Warnings flagged: ${warnings.join('; ') || 'none'}
- Device errors: ${devErrors.map(e => `${e.name} Code ${e.code}`).join('; ') || 'none'}
- Pending updates: ${R?.updates?.pendingCount || 0}
- Startup programs: ${R?.startup?.count || 0}
- Event log criticals: ${(R?.eventLog?.critical || []).map(e => `EventID ${e.eventId}`).join(', ') || 'none'}

Return ONLY this JSON object with no other text:
{
  "summary": "2-3 sentences in plain English. What is the overall state of this machine? Lead with the most important finding.",
  "issues": [
    {
      "priority": 1,
      "severity": "critical",
      "title": "short issue title",
      "action": "specific actionable step to fix it",
      "estimatedTime": "e.g. 5 min"
    }
  ],
  "verdict": {
    "decision": "one of: Good condition | Needs attention | Worth repairing | Replace soon",
    "reason": "one sentence explaining the verdict",
    "rating": "one of: pass | warn | fail"
  },
  "customerMessage": "2-3 sentences written for a non-technical customer. No jargon. Explain what was found and what action is recommended.",
  "repairTime": "total estimated repair time for all issues combined e.g. 30-45 min"
}`
}

export async function POST(req) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY is not configured. Add it to .env.local' },
      { status: 500 }
    )
  }

  let report
  try {
    report = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!report?.meta || !report?.score) {
    return NextResponse.json({ error: 'Not a valid HackRore report' }, { status: 400 })
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: buildPrompt(report) }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return NextResponse.json(
        { error: `Claude API error ${response.status}: ${err.slice(0, 200)}` },
        { status: 502 }
      )
    }

    const data = await response.json()
    const raw = data.content?.[0]?.text || ''

    let parsed
    try {
      const clean = raw.replace(/```json|```/g, '').trim()
      parsed = JSON.parse(clean)
    } catch {
      return NextResponse.json(
        { error: 'Could not parse Claude response as JSON', raw: raw.slice(0, 300) },
        { status: 502 }
      )
    }

    return NextResponse.json(parsed)
  } catch (err) {
    return NextResponse.json(
      { error: 'Network error calling Claude API: ' + err.message },
      { status: 503 }
    )
  }
}

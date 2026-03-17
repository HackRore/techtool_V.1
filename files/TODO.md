# HackRore TechWorkbench - UI Migration & Two-Way Bridge TODO

## Current Status (UI Migration)
✅ UI Components created (Card, ErrorBlock, Badge, Sidebar)  
⚠️ Lint errors fixed in progress  
⏳ Tailwind migration ongoing  
🔄 Build failed (fixlab/page.js syntax)  

## Two-Way Bridge Plan (New - Industry Standard Auto-Dashboard)
**Goal:** Tech runs 1 PS command → script generates report → browser auto-opens ScanLab with populated dashboard. Zero manual upload.

### Breakdown Steps:
**Step 1: ✅ Create files/components/ui/CommandCenter.jsx**
New React component (terminal-style PS one-liner with copy button for hosted script).

**Step 2: ✅ Edit files/app/page.js**  
Import/add <CommandCenter /> to home dashboard (spacing fixed).

**Step 3: ✅ Edit files/app/scanlab/page.js**  
Add useSearchParams + useEffect: detect ?import=base64JSON → auto-decode/parse → setReport → show Dashboard.

**Step 4: [ ] Update HackRore_Master.ps1 (local)**  
Replace end summary: save JSON to Desktop, base64 encode, Start-Process scanlab URL.

**Step 5: [ ] Sync files/public/scripts/HackRore_Master.ps1**  
Copy updated logic to hosted version.

**Step 6: ✅ Install deps**  
lucide-react installed, audit fix running.  
Next: npm run lint && npm run build && npm run dev  
- Test UI copy  
- Test PS script → auto-browser with data  
- Manual URL test ?import=...

## Senior Developer UI/Flow Audit (New Phase)

**Current Score:** 8/10 – Solid prototype, lacks polish for production.

**Priority Fixes:**
1. **Dashboard:** CommandCenter #1 position, "How it Works" → accordion.
2. **TestLab:** "Run All Tests" sequence + progress badges.
3. **ScanLab:** Health ribbon + decode animation.
4. **FixLab:** Huge search bar, terminal copy blocks.
5. **Global:** Sidebar tech profile + API status dot.

**Plan:** Update existing files with refinements.


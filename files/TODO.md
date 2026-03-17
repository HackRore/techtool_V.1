# HackRore TechWorkbench - UI Migration & Fixes TODO

## Current Status
✅ UI Components created (Card, ErrorBlock, Badge, Sidebar)  
⚠️ Lint errors fixed in progress  
⏳ Tailwind migration ongoing  
🔄 Build failed (fixlab/page.js syntax)  

## Approved Plan Breakdown - Step-by-Step

**Step 1: Fix app/scanlab/page.js (Missing Dashboard component)**  
- Define Dashboard component using helpers (ScoreArc, Row, MiniBar, ModCard).  
- Display: Health score, CPU/RAM/Storage/Battery/GPU/Network/BT/Errors/Thermal.  
- Progress: [ ] Complete  

**Step 2: Fix app/fixlab/page.js (Parsing error line 205 - unterminated template)**  
- Complete truncated JSX in category filter badge span.  
- Ensure EntryCard fully closes, all imports correct.  
- Progress: [ ] Complete  

**Step 3: Fix react/no-unescaped-entities (app/page.js, app/not-found.js)**  
- Replace apostrophes with &apos; in text strings.  
- Progress: [ ] Complete  

**Step 4: Fix MicTest useEffect dependency (components/testlab/MicTest.js)**  
- Wrap stop() in useCallback or add to deps.  
- Progress: [ ] Complete  

**Step 5: Verify & Test**  
- `npm run lint` → 0 errors  
- `npm run build` → Success  
- `npm run dev` → Test all pages:  
  - / (Home)  
  - /testlab (hardware tests)  
  - /scanlab (JSON upload + dashboard)  
  - /fixlab (KB search)  
- Lighthouse audit, responsive check.  
- Progress: [ ] Complete  

**Step 6: Update Migration TODO**  
- Migrate remaining pages to Tailwind/UI components.  
- Mark original TODO steps complete.  
- Git commit/push.  
- Progress: [ ] Complete  

*Updated after each step completion.*


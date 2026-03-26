# UI/UX Modernization Plan - HackRore TechWorkbench

**Goal**: Transform dark inline-styles app to modern light blue diagnostic platform (thetest.com style).

**Current Status**: Functionality perfect, dev running localhost:3000.

**Step 1: Fonts & Theme**
- tailwind.config.js: Add Inter, blue colors.
- globals.css: Light vars, components.
- layout.js: Inter font.

**Step 2: Components**
- ui/Card.jsx: White bg, shadow.
- ui/Badge.jsx: Status.
- ui/Sidebar.jsx: Fixed nav.

**Step 3: Pages**
- page.js: Grid cards blue buttons.
- testlab/scanlab/fixlab: Sidebar + content.

**Step 4: Responsive + Test**
- npm run build
- Dev test
- Vercel deploy hachtool.vercel.app

Progress:
- [x] Step 1 complete (fonts/theme)
- [x] Step 2 complete (components)


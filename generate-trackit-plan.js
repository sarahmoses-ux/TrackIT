const path = require('path');
const fs = require('fs');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  WidthType,
  ShadingType,
  LevelFormat,
  PageBreak,
  PageNumber,
  Header,
  Footer
} = require('docx');

const BRAND_GREEN = '1A7A4A';
const LIGHT_GREEN = 'E8F5EE';
const MID_GREEN = 'C3E6D1';
const DARK_TEXT = '1C1C1E';
const GRAY = '6B7280';
const LIGHT_GRAY = 'F3F4F6';
const WHITE = 'FFFFFF';

const border = { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: BRAND_GREEN, space: 6 } },
    children: [new TextRun({ text, bold: true, size: 36, color: BRAND_GREEN, font: 'Arial' })]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 320, after: 120 },
    children: [new TextRun({ text, bold: true, size: 28, color: DARK_TEXT, font: 'Arial' })]
  });
}

function h3(text) {
  return new Paragraph({
    spacing: { before: 240, after: 80 },
    children: [new TextRun({ text, bold: true, size: 24, color: BRAND_GREEN, font: 'Arial' })]
  });
}

function body(text, options = {}) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, size: 22, color: DARK_TEXT, font: 'Arial', ...options })]
  });
}

function note(text) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    indent: { left: 360 },
    children: [
      new TextRun({ text: '→  ', bold: true, size: 20, color: BRAND_GREEN, font: 'Arial' }),
      new TextRun({ text, size: 20, color: '374151', font: 'Arial', italics: true })
    ]
  });
}

function bullet(text, bold_prefix = null) {
  const children = [];
  if (bold_prefix) {
    children.push(new TextRun({ text: bold_prefix + ' ', bold: true, size: 22, color: DARK_TEXT, font: 'Arial' }));
  }
  children.push(new TextRun({ text, size: 22, color: DARK_TEXT, font: 'Arial' }));
  return new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    spacing: { before: 40, after: 40 },
    children
  });
}

function numberedItem(text, bold_prefix = null) {
  const children = [];
  if (bold_prefix) {
    children.push(new TextRun({ text: bold_prefix + ' ', bold: true, size: 22, color: DARK_TEXT, font: 'Arial' }));
  }
  children.push(new TextRun({ text, size: 22, color: DARK_TEXT, font: 'Arial' }));
  return new Paragraph({
    numbering: { reference: 'numbers', level: 0 },
    spacing: { before: 40, after: 40 },
    children
  });
}

function codeBlock(lines) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: noBorders,
            width: { size: 9360, type: WidthType.DXA },
            shading: { fill: '1C1C2E', type: ShadingType.CLEAR },
            margins: { top: 160, bottom: 160, left: 240, right: 240 },
            children: lines.map(line =>
              new Paragraph({
                spacing: { before: 20, after: 20 },
                children: [new TextRun({ text: line, size: 18, font: 'Courier New', color: 'A8FF78' })]
              })
            )
          })
        ]
      })
    ]
  });
}

function infoBox(label, text) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [1440, 7920],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders,
            width: { size: 1440, type: WidthType.DXA },
            shading: { fill: BRAND_GREEN, type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            verticalAlign: 'center',
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: label, bold: true, size: 20, color: WHITE, font: 'Arial' })]
            })]
          }),
          new TableCell({
            borders,
            width: { size: 7920, type: WidthType.DXA },
            shading: { fill: LIGHT_GREEN, type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 160, right: 120 },
            children: [new Paragraph({
              children: [new TextRun({ text, size: 21, color: DARK_TEXT, font: 'Arial' })]
            })]
          })
        ]
      })
    ]
  });
}

function phaseHeader(num, title, duration) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: noBorders,
            width: { size: 9360, type: WidthType.DXA },
            shading: { fill: BRAND_GREEN, type: ShadingType.CLEAR },
            margins: { top: 160, bottom: 160, left: 280, right: 280 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: `PHASE ${num}  `, bold: true, size: 28, color: 'AAFFD0', font: 'Arial' }),
                  new TextRun({ text: title, bold: true, size: 28, color: WHITE, font: 'Arial' }),
                  new TextRun({ text: `    ${duration}`, size: 20, color: 'CCEEDC', font: 'Arial', italics: true })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
}

function sectionDivider() {
  return new Paragraph({
    spacing: { before: 40, after: 40 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: 'E5E7EB', space: 1 } },
    children: [new TextRun({ text: '' })]
  });
}

function spacer(before = 160) {
  return new Paragraph({ spacing: { before, after: 0 }, children: [new TextRun('')] });
}

function colorChip(hex, name, usage) {
  return new TableRow({
    children: [
      new TableCell({
        borders,
        width: { size: 1200, type: WidthType.DXA },
        shading: { fill: hex, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 80, right: 80 },
        children: [new Paragraph({ children: [new TextRun({ text: ' ', size: 22 })] })]
      }),
      new TableCell({
        borders,
        width: { size: 2400, type: WidthType.DXA },
        shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 80 },
        children: [new Paragraph({ children: [new TextRun({ text: name, bold: true, size: 20, font: 'Arial', color: DARK_TEXT })] })]
      }),
      new TableCell({
        borders,
        width: { size: 2160, type: WidthType.DXA },
        shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 80 },
        children: [new Paragraph({ children: [new TextRun({ text: `#${hex}`, size: 20, font: 'Courier New', color: GRAY })] })]
      }),
      new TableCell({
        borders,
        width: { size: 3600, type: WidthType.DXA },
        shading: { fill: WHITE, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 80 },
        children: [new Paragraph({ children: [new TextRun({ text: usage, size: 20, font: 'Arial', color: GRAY })] })]
      })
    ]
  });
}

const doc = new Document({
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: '•',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 560, hanging: 280 } } }
        }]
      },
      {
        reference: 'numbers',
        levels: [{
          level: 0,
          format: LevelFormat.DECIMAL,
          text: '%1.',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 560, hanging: 280 } } }
        }]
      },
      {
        reference: 'subbullets',
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: '–',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1080, hanging: 280 } } }
        }]
      }
    ]
  },
  styles: {
    default: { document: { run: { font: 'Arial', size: 22 } } },
    paragraphStyles: [
      {
        id: 'Heading1',
        name: 'Heading 1',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 36, bold: true, font: 'Arial', color: BRAND_GREEN },
        paragraph: { spacing: { before: 400, after: 160 }, outlineLevel: 0 }
      },
      {
        id: 'Heading2',
        name: 'Heading 2',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { size: 28, bold: true, font: 'Arial', color: DARK_TEXT },
        paragraph: { spacing: { before: 320, after: 120 }, outlineLevel: 1 }
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: {
      default: new Header({
        children: [
          new Paragraph({
            spacing: { before: 0, after: 160 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BRAND_GREEN, space: 4 } },
            children: [
              new TextRun({ text: 'TrackIt — ', bold: true, size: 18, color: BRAND_GREEN, font: 'Arial' }),
              new TextRun({ text: 'Frontend Codex Execution Plan', size: 18, color: GRAY, font: 'Arial' }),
              new TextRun({ text: '        Confidential — Internal Use Only', size: 16, color: 'AAAAAA', font: 'Arial' })
            ]
          })
        ]
      })
    },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            border: { top: { style: BorderStyle.SINGLE, size: 2, color: 'E5E7EB', space: 4 } },
            spacing: { before: 80, after: 0 },
            children: [
              new TextRun({ text: 'TrackIt  ·  Frontend Plan  ·  Page ', size: 16, color: GRAY, font: 'Arial' }),
              new TextRun({ children: [PageNumber.CURRENT], size: 16, color: GRAY, font: 'Arial' }),
              new TextRun({ text: ' of ', size: 16, color: GRAY, font: 'Arial' }),
              new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: GRAY, font: 'Arial' })
            ]
          })
        ]
      })
    },
    children: [
      spacer(800),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 80 },
        children: [new TextRun({ text: 'TrackIt', bold: true, size: 96, color: BRAND_GREEN, font: 'Arial' })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 40 },
        children: [new TextRun({ text: 'Small Business Sales Tracker', size: 36, color: DARK_TEXT, font: 'Arial' })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 320 },
        children: [new TextRun({ text: 'Frontend Codex Execution Plan', size: 28, color: GRAY, font: 'Arial', italics: true })]
      }),
      new Table({
        width: { size: 4000, type: WidthType.DXA },
        columnWidths: [4000],
        rows: [new TableRow({
          children: [new TableCell({
            borders: noBorders,
            width: { size: 4000, type: WidthType.DXA },
            shading: { fill: BRAND_GREEN, type: ShadingType.CLEAR },
            margins: { top: 6, bottom: 6, left: 0, right: 0 },
            children: [new Paragraph({ children: [new TextRun({ text: ' ' })] })]
          })]
        })]
      }),
      spacer(320),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 60 },
        children: [new TextRun({ text: 'Version 1.0  ·  Frontend-Only Build  ·  Backend TBD', size: 20, color: GRAY, font: 'Arial' })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 60 },
        children: [new TextRun({ text: 'Stack: React · Vite · Tailwind CSS · Recharts · React Router v6', size: 20, color: GRAY, font: 'Arial' })]
      }),
      spacer(1200),

      new Paragraph({ children: [new PageBreak()] }),

      h1('Project Overview'),
      body('This document is a complete, phase-by-phase instruction set for Codex to build the TrackIt frontend. All screens are powered by a mock data layer that mirrors the real API contracts exactly — making backend integration a simple drop-in swap when ready.'),
      spacer(80),
      infoBox('Goal', 'Build a fully functional, visually polished React frontend with mock data, ready for real API integration.'),
      spacer(80),
      infoBox('Audience', 'Small business owners in Nigeria — retail stores, boutiques, kiosks, e-commerce sellers.'),
      spacer(80),
      infoBox('Scope', 'Frontend only. No real backend. All API calls simulated via mockApi.js with exact request/response shapes from the PRD.'),
      spacer(160),

      h2('Screens to Build'),
      body('The application has 6 core screens plus a public landing page:'),
      spacer(40),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1440, 3480, 4440],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 1440, type: WidthType.DXA },
                shading: { fill: BRAND_GREEN, type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 80 },
                children: [new Paragraph({ children: [new TextRun({ text: 'Route', bold: true, size: 20, color: WHITE, font: 'Arial' })] })]
              }),
              new TableCell({
                borders,
                width: { size: 3480, type: WidthType.DXA },
                shading: { fill: BRAND_GREEN, type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 80 },
                children: [new Paragraph({ children: [new TextRun({ text: 'Screen', bold: true, size: 20, color: WHITE, font: 'Arial' })] })]
              }),
              new TableCell({
                borders,
                width: { size: 4440, type: WidthType.DXA },
                shading: { fill: BRAND_GREEN, type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 80 },
                children: [new Paragraph({ children: [new TextRun({ text: 'Description', bold: true, size: 20, color: WHITE, font: 'Arial' })] })]
              })
            ]
          }),
          ...[
            ['/', 'Landing Page', 'Public marketing page — hero, features, CTA'],
            ['/login', 'Login / Register', 'Auth screens (mocked — no real auth)'],
            ['/dashboard', 'Dashboard', 'KPI cards, charts, live stock alerts'],
            ['/inventory', 'Inventory', 'Product table, add/edit/delete, low-stock highlight'],
            ['/sales', 'Sales Log', 'Record sales, history table, date filter'],
            ['/insights', 'AI Insights', 'Profit forecast, low stock predictions, trend charts'],
            ['/reports', 'Reports', 'Export inventory & sales as CSV or PDF']
          ].map(([route, screen, desc], i) =>
            new TableRow({
              children: [
                new TableCell({
                  borders,
                  width: { size: 1440, type: WidthType.DXA },
                  shading: { fill: i % 2 === 0 ? WHITE : LIGHT_GRAY, type: ShadingType.CLEAR },
                  margins: { top: 80, bottom: 80, left: 120, right: 80 },
                  children: [new Paragraph({ children: [new TextRun({ text: route, size: 19, font: 'Courier New', color: BRAND_GREEN })] })]
                }),
                new TableCell({
                  borders,
                  width: { size: 3480, type: WidthType.DXA },
                  shading: { fill: i % 2 === 0 ? WHITE : LIGHT_GRAY, type: ShadingType.CLEAR },
                  margins: { top: 80, bottom: 80, left: 120, right: 80 },
                  children: [new Paragraph({ children: [new TextRun({ text: screen, bold: true, size: 20, color: DARK_TEXT, font: 'Arial' })] })]
                }),
                new TableCell({
                  borders,
                  width: { size: 4440, type: WidthType.DXA },
                  shading: { fill: i % 2 === 0 ? WHITE : LIGHT_GRAY, type: ShadingType.CLEAR },
                  margins: { top: 80, bottom: 80, left: 120, right: 80 },
                  children: [new Paragraph({ children: [new TextRun({ text: desc, size: 20, color: GRAY, font: 'Arial' })] })]
                })
              ]
            })
          )
        ]
      }),

      spacer(160),
      new Paragraph({ children: [new PageBreak()] }),

      h1('Design System'),
      body('All UI must follow this design system. Pass these tokens as Tailwind config values or CSS variables in index.css. Codex should define these before touching any component.'),

      spacer(120),
      h2('Color Palette'),
      spacer(40),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1200, 2400, 2160, 3600],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 1200, type: WidthType.DXA },
                shading: { fill: BRAND_GREEN, type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 80, right: 80 },
                children: [new Paragraph({ children: [new TextRun({ text: 'Swatch', bold: true, size: 18, color: WHITE, font: 'Arial' })] })]
              }),
              new TableCell({
                borders,
                width: { size: 2400, type: WidthType.DXA },
                shading: { fill: BRAND_GREEN, type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 80 },
                children: [new Paragraph({ children: [new TextRun({ text: 'Token Name', bold: true, size: 18, color: WHITE, font: 'Arial' })] })]
              }),
              new TableCell({
                borders,
                width: { size: 2160, type: WidthType.DXA },
                shading: { fill: BRAND_GREEN, type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 80 },
                children: [new Paragraph({ children: [new TextRun({ text: 'Hex', bold: true, size: 18, color: WHITE, font: 'Arial' })] })]
              }),
              new TableCell({
                borders,
                width: { size: 3600, type: WidthType.DXA },
                shading: { fill: BRAND_GREEN, type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 80 },
                children: [new Paragraph({ children: [new TextRun({ text: 'Usage', bold: true, size: 18, color: WHITE, font: 'Arial' })] })]
              })
            ]
          }),
          colorChip('1A7A4A', '--color-primary', 'Primary green — buttons, links, active states'),
          colorChip('15623B', '--color-primary-dark', 'Hover/pressed state for primary'),
          colorChip('E8F5EE', '--color-primary-light', 'Backgrounds, tag chips, highlights'),
          colorChip('F59E0B', '--color-warning', 'Low-stock warnings, caution alerts'),
          colorChip('EF4444', '--color-danger', 'Errors, delete actions, critical alerts'),
          colorChip('3B82F6', '--color-info', 'Informational banners, AI insight accents'),
          colorChip('1C1C1E', '--color-text', 'Primary text'),
          colorChip('6B7280', '--color-muted', 'Secondary text, placeholders'),
          colorChip('F9FAFB', '--color-surface', 'Page background'),
          colorChip('FFFFFF', '--color-card', 'Card/modal backgrounds'),
          colorChip('E5E7EB', '--color-border', 'Dividers, table borders, input borders')
        ]
      }),

      spacer(120),
      h2('Typography'),
      spacer(40),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2400, 2400, 2160, 2400],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 2400, type: WidthType.DXA },
                shading: { fill: BRAND_GREEN, type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 80 },
                children: [new Paragraph({ children: [new TextRun({ text: 'Role', bold: true, size: 18, color: WHITE, font: 'Arial' })] })]
              }),
              new TableCell({
                borders,
                width: { size: 2400, type: WidthType.DXA },
                shading: { fill: BRAND_GREEN, type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 80 },
                children: [new Paragraph({ children: [new TextRun({ text: 'Font', bold: true, size: 18, color: WHITE, font: 'Arial' })] })]
              }),
              new TableCell({
                borders,
                width: { size: 2160, type: WidthType.DXA },
                shading: { fill: BRAND_GREEN, type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 80 },
                children: [new Paragraph({ children: [new TextRun({ text: 'Size / Weight', bold: true, size: 18, color: WHITE, font: 'Arial' })] })]
              }),
              new TableCell({
                borders,
                width: { size: 2400, type: WidthType.DXA },
                shading: { fill: BRAND_GREEN, type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 80 },
                children: [new Paragraph({ children: [new TextRun({ text: 'Usage', bold: true, size: 18, color: WHITE, font: 'Arial' })] })]
              })
            ]
          }),
          ...[
            ['Display / Hero', 'Plus Jakarta Sans', '48–64px / 800', 'Landing page headlines'],
            ['Page Title', 'Plus Jakarta Sans', '28–32px / 700', 'Screen titles in app'],
            ['Section Heading', 'Plus Jakarta Sans', '20–22px / 600', 'Card titles, section labels'],
            ['Body', 'Inter', '14–16px / 400', 'Paragraphs, table text'],
            ['Label / Caption', 'Inter', '12px / 500', 'Form labels, timestamps, tags'],
            ['Monospace', 'JetBrains Mono', '12–14px / 400', 'SKUs, IDs, code snippets']
          ].map(([role, font, size, usage], i) =>
            new TableRow({
              children: [
                new TableCell({
                  borders,
                  width: { size: 2400, type: WidthType.DXA },
                  shading: { fill: i % 2 === 0 ? WHITE : LIGHT_GRAY, type: ShadingType.CLEAR },
                  margins: { top: 80, bottom: 80, left: 120, right: 80 },
                  children: [new Paragraph({ children: [new TextRun({ text: role, bold: true, size: 20, color: DARK_TEXT, font: 'Arial' })] })]
                }),
                new TableCell({
                  borders,
                  width: { size: 2400, type: WidthType.DXA },
                  shading: { fill: i % 2 === 0 ? WHITE : LIGHT_GRAY, type: ShadingType.CLEAR },
                  margins: { top: 80, bottom: 80, left: 120, right: 80 },
                  children: [new Paragraph({ children: [new TextRun({ text: font, size: 20, color: BRAND_GREEN, font: 'Arial' })] })]
                }),
                new TableCell({
                  borders,
                  width: { size: 2160, type: WidthType.DXA },
                  shading: { fill: i % 2 === 0 ? WHITE : LIGHT_GRAY, type: ShadingType.CLEAR },
                  margins: { top: 80, bottom: 80, left: 120, right: 80 },
                  children: [new Paragraph({ children: [new TextRun({ text: size, size: 19, font: 'Courier New', color: GRAY })] })]
                }),
                new TableCell({
                  borders,
                  width: { size: 2400, type: WidthType.DXA },
                  shading: { fill: i % 2 === 0 ? WHITE : LIGHT_GRAY, type: ShadingType.CLEAR },
                  margins: { top: 80, bottom: 80, left: 120, right: 80 },
                  children: [new Paragraph({ children: [new TextRun({ text: usage, size: 20, color: GRAY, font: 'Arial' })] })]
                })
              ]
            })
          )
        ]
      }),
      note('Import both fonts from Google Fonts in index.html: Plus Jakarta Sans (400, 600, 700, 800) and Inter (400, 500). JetBrains Mono for monospace.'),

      spacer(120),
      h2('Component Tokens'),
      body('Define these as Tailwind config extensions in tailwind.config.js:'),
      spacer(40),
      codeBlock([
        '// tailwind.config.js',
        'theme: {',
        '  extend: {',
        "    borderRadius: { card: '12px', input: '8px', btn: '8px', badge: '999px' },",
        '    boxShadow: {',
        "      card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',",
        "      modal: '0 20px 60px rgba(0,0,0,0.15)',",
        '    },',
        "    spacing: { sidebar: '240px', header: '64px' },",
        '  }',
        '}'
      ]),

      spacer(160),
      new Paragraph({ children: [new PageBreak()] }),

      h1('File & Folder Structure'),
      body('Codex must create this exact structure before writing any component code:'),
      spacer(60),
      codeBlock([
        'trackit/',
        '├── public/',
        '│   └── logo.svg',
        '├── src/',
        '│   ├── mock/',
        '│   │   ├── products.json          # 10 sample products',
        '│   │   ├── sales.json             # 20 sample sales records',
        '│   │   └── insights.json          # AI forecast data per product',
        '│   ├── services/',
        '│   │   └── mockApi.js             # All async mock API functions',
        '│   ├── components/',
        '│   │   ├── layout/',
        '│   │   │   ├── Sidebar.jsx',
        '│   │   │   ├── Header.jsx',
        '│   │   │   └── MobileBottomNav.jsx',
        '│   │   ├── ui/',
        '│   │   │   ├── KPICard.jsx',
        '│   │   │   ├── Badge.jsx',
        '│   │   │   ├── Modal.jsx',
        '│   │   │   ├── Button.jsx',
        '│   │   │   ├── Input.jsx',
        '│   │   │   ├── Select.jsx',
        '│   │   │   ├── Table.jsx',
        '│   │   │   ├── Skeleton.jsx',
        '│   │   │   └── AlertBanner.jsx',
        '│   │   └── charts/',
        '│   │       ├── SalesTrendChart.jsx',
        '│   │       ├── TopProductsChart.jsx',
        '│   │       ├── ProfitForecastChart.jsx',
        '│   │       └── WeeklyBarChart.jsx',
        '│   ├── pages/',
        '│   │   ├── Landing.jsx',
        '│   │   ├── Login.jsx',
        '│   │   ├── Register.jsx',
        '│   │   ├── Dashboard.jsx',
        '│   │   ├── Inventory.jsx',
        '│   │   ├── Sales.jsx',
        '│   │   ├── Insights.jsx',
        '│   │   └── Reports.jsx',
        '│   ├── hooks/',
        '│   │   ├── useProducts.js',
        '│   │   ├── useSales.js',
        '│   │   └── useInsights.js',
        '│   ├── utils/',
        '│   │   ├── formatCurrency.js      # Format NGN amounts',
        '│   │   ├── exportCsv.js',
        '│   │   └── dateHelpers.js',
        '│   ├── App.jsx',
        '│   ├── main.jsx',
        '│   └── index.css                  # CSS variables, base styles',
        '├── index.html',
        '├── tailwind.config.js',
        '└── vite.config.js'
      ]),

      spacer(160),
      new Paragraph({ children: [new PageBreak()] }),

      phaseHeader(1, 'Project Scaffold & Design System', 'Day 1'),
      spacer(120),
      h2('Codex Prompt'),
      note('Run this as the very first Codex task before any UI work.'),
      spacer(60),
      codeBlock([
        "Scaffold a React + Vite + Tailwind CSS project named 'trackit'.",
        'Install dependencies: react-router-dom, recharts, lucide-react.',
        '',
        'Setup tasks:',
        '1. Configure tailwind.config.js with the design tokens (colors, borderRadius,',
        '   boxShadow, spacing) as documented in the design system.',
        '2. In index.css: import CSS variables for all color tokens.',
        '   Add Google Fonts import for Plus Jakarta Sans and Inter.',
        '3. In index.html: set <title>TrackIt</title> and add the Google Fonts link tag.',
        '4. Create App.jsx with React Router v6 routes:',
        '   / → Landing, /login → Login, /register → Register,',
        '   /dashboard → Dashboard, /inventory → Inventory,',
        '   /sales → Sales, /insights → Insights, /reports → Reports.',
        '5. Protected routes: wrap /dashboard, /inventory, /sales,',
        '   /insights, /reports in an AuthGuard component.',
        "   AuthGuard checks localStorage for 'trackit_user'; if absent,",
        '   redirects to /login.',
        '6. Create a persistent AppLayout component (sidebar + header + page content)',
        '   used by all protected routes.'
      ]),
      spacer(120),
      h2('Sidebar Spec'),
      bullet('Width: 240px, fixed left, full viewport height'),
      bullet('Background: white with a 1px right border (#E5E7EB)'),
      bullet("Top: TrackIt logo (green wordmark) + tagline 'Smart Sales Tracking'"),
      bullet('Nav links with Lucide icons: Dashboard (LayoutDashboard), Inventory (Package), Sales (ShoppingCart), AI Insights (Sparkles), Reports (FileText)'),
      bullet('Active link: green background chip (#E8F5EE), green text, green left bar indicator'),
      bullet("Bottom: User avatar chip with name + 'Logout' link"),
      bullet('On mobile (< 768px): sidebar hidden; show MobileBottomNav with icons + labels'),

      spacer(120),
      h2('Header Spec'),
      bullet('Height: 64px, sticky top, white background, bottom border'),
      bullet('Left: current page title (dynamic, changes per route)'),
      bullet('Right: notification bell icon (badge count from low-stock alerts) + user avatar'),
      bullet('On mobile: show hamburger menu icon on left'),

      spacer(160),
      new Paragraph({ children: [new PageBreak()] }),

      phaseHeader(2, 'Mock Data Layer', 'Day 1'),
      spacer(120),
      h2('Codex Prompt'),
      codeBlock([
        'Create the mock data layer in src/mock/ and src/services/mockApi.js.',
        '',
        'Step 1 — src/mock/products.json:',
        '10 products for a Nigerian boutique/general store. Fields per product:',
        '  { id, name, sku, category, cost_price, selling_price, stock, created_at }',
        'Categories: Apparel, Footwear, Accessories, Electronics, Food & Beverage.',
        'Prices in Nigerian Naira (NGN). Examples: T-shirt 1500/2500, Sneakers 8000/14000.',
        'Include 2 products with stock < 10 to trigger low-stock alerts.',
        '',
        'Step 2 — src/mock/sales.json:',
        '20 sales records spread across the last 30 days. Fields:',
        '  { id, product_id, quantity, sale_price, total_profit, timestamp }',
        '',
        'Step 3 — src/mock/insights.json:',
        'Array of AI insight objects, one per product:',
        '  { product_id, forecast_profit, predicted_low_stock_date,',
        '    recommended_reorder_qty, weekly_trend[] }',
        '',
        'Step 4 — src/services/mockApi.js:',
        'Export these async functions (300ms delay each to simulate network):',
        '  getProducts()           → returns products array',
        '  getProductById(id)      → returns single product',
        '  addProduct(data)        → adds product, returns { status, product }',
        '  updateProduct(id, data) → updates product, returns updated product',
        '  deleteProduct(id)       → removes product, returns { status }',
        '  getSales(filters)       → returns sales, accepts { startDate, endDate }',
        '  recordSale(data)        → records sale, decrements stock, returns',
        '                            { status, updated_stock, profit }',
        '                            Throws error if quantity > available stock.',
        '  getInsights()           → returns all insight objects',
        '  getInsightByProduct(id) → returns insight for one product',
        '',
        'IMPORTANT: Function signatures must match the API contracts in the PRD exactly.',
        'Use localStorage to persist state changes so edits survive page refresh.',
        'Seed localStorage from JSON if empty on first load.'
      ]),

      spacer(160),
      new Paragraph({ children: [new PageBreak()] }),

      phaseHeader(3, 'Landing Page  (Route: /)', 'Day 2'),
      spacer(120),
      body('The landing page is a public-facing marketing page. It must feel professional, Nigeria-aware, and trustworthy. It is the first impression for potential users.'),
      spacer(80),
      h2('Sections to Build'),

      spacer(60),
      h3('3.1 — Navbar'),
      bullet('Logo left (TrackIt wordmark in green)'),
      bullet('Links: Features, How It Works, Pricing'),
      bullet("Right: 'Log In' ghost button + 'Get Started Free' green filled button"),
      bullet('Sticky on scroll; add subtle shadow when scrolled'),
      bullet('Mobile: collapse to hamburger with a slide-down menu'),

      spacer(60),
      h3('3.2 — Hero Section'),
      bullet('Full-width, min-height 90vh'),
      bullet("Headline (h1): 'Run Your Business Smarter' — large, bold, Plus Jakarta Sans 800"),
      bullet("Subheadline: 'Track inventory, record sales, and get AI-powered insights built for Nigerian small businesses.'"),
      bullet("Two CTAs: 'Start for Free' (green filled) + 'See How It Works' (outline)"),
      bullet('Right side: a clean product screenshot mockup (build as a React/SVG mockup showing the dashboard — DO NOT use an img tag with a placeholder)'),
      bullet('Background: light green gradient mesh (#F0FBF4 → white), subtle grid pattern overlay'),
      bullet("Add a row of social proof beneath CTAs: '2,400+ businesses trust TrackIt' with avatar stack"),

      spacer(60),
      h3('3.3 — Problem/Solution Strip'),
      bullet("3-column layout with icons: 'Manual tracking is slow' → 'Stock-outs lose sales' → 'No visibility into profit'"),
      bullet('Each card: icon (Lucide), bold title, 1-line description'),
      bullet('Light gray background to create visual break from hero'),

      spacer(60),
      h3('3.4 — Features Section'),
      bullet("Section title: 'Everything you need to grow'"),
      bullet('6 feature cards in a 3x2 grid: Inventory Management, Sales Logging, AI Profit Forecasting, Low-Stock Alerts, Sales Trend Reports, CSV/PDF Export'),
      bullet('Each card: green icon (Lucide), bold title, 2-line description'),
      bullet('Card style: white, rounded-xl, subtle shadow, hover lift (translateY -4px)'),

      spacer(60),
      h3('3.5 — How It Works'),
      bullet('3-step process with large numbered circles in green'),
      bullet('Step 1: Add your products  |  Step 2: Record sales daily  |  Step 3: Get AI insights'),
      bullet('Alternating layout: left text / right visual for each step'),

      spacer(60),
      h3('3.6 — Testimonials'),
      bullet('3 testimonial cards: fictional Nigerian business owners (Adaeze, Emeka, Fatima)'),
      bullet('Each: quote text, name, business type, star rating'),
      bullet('Light green background section'),

      spacer(60),
      h3('3.7 — Pricing'),
      bullet('2 tiers: Free (basic inventory + sales) and Pro ₦2,499/month (AI insights + multi-user + export)'),
      bullet("Pro card: green border, 'Most Popular' badge, slightly elevated"),
      bullet('Feature checklist per plan using checkmark icons'),

      spacer(60),
      h3('3.8 — CTA Banner'),
      bullet('Full-width green background (#1A7A4A)'),
      bullet("Headline: 'Start tracking for free today'"),
      bullet("Single white button: 'Create Your Free Account'"),

      spacer(60),
      h3('3.9 — Footer'),
      bullet('4 columns: Brand (logo + tagline + social icons), Product (links), Company, Support'),
      bullet("Bottom bar: copyright + 'Made in Nigeria' note"),
      bullet('Dark background (#111827)'),

      spacer(160),
      new Paragraph({ children: [new PageBreak()] }),

      phaseHeader(4, 'Auth Screens (Login & Register)', 'Day 2'),
      spacer(120),
      body('These screens are mocked — no real backend. On submit, save a user object to localStorage and redirect to /dashboard.'),
      spacer(80),
      h2('Login Page Spec'),
      bullet('Split layout: left panel is a green gradient with a TrackIt tagline + feature bullets; right panel is the form'),
      bullet('Form fields: Email, Password, \'Remember me\' checkbox'),
      bullet("Primary button: 'Log In' (full width, green)"),
      bullet("Link: 'Don't have an account? Get started free'"),
      bullet("On submit: save { name: 'Demo User', email } to localStorage key 'trackit_user', redirect to /dashboard"),

      spacer(80),
      h2('Register Page Spec'),
      bullet('Same split layout as Login'),
      bullet('Form fields: Full Name, Business Name, Email, Password, Confirm Password'),
      bullet('Validation: all fields required, passwords must match, email format check'),
      bullet('On submit: save user to localStorage, redirect to /dashboard'),

      spacer(160),
      new Paragraph({ children: [new PageBreak()] }),

      phaseHeader(5, 'Dashboard Screen  (/dashboard)', 'Day 3'),
      spacer(120),
      h2('Codex Prompt'),
      codeBlock([
        'Build the /dashboard page. Pull all data from mockApi.js.',
        '',
        'Layout: AppLayout wrapper (sidebar + header).',
        '',
        'Section 1 — Alert Banner:',
        'If any product has stock < 10, show a yellow AlertBanner at top:',
        "'⚠️  3 products are running low on stock. View inventory →'",
        '',
        'Section 2 — KPI Cards (4 across):',
        '  • Total Products (from products array length)',
        "  • Sales Today (count sales with today's timestamp)",
        '  • Revenue This Month (sum of sale_price × quantity for current month)',
        '  • Total Profit This Month (sum of total_profit for current month)',
        'Each KPI card: large number, label, trend indicator (+12% vs last month),',
        'green icon top-right. Use the KPICard component.',
        '',
        'Section 3 — Charts (2-column grid):',
        '  Left: SalesTrendChart — Recharts LineChart, last 7 days sales volume.',
        '    X-axis: day labels (Mon, Tue...). Y-axis: NGN amount.',
        '    Green line (#1A7A4A), dot on each data point, tooltip.',
        '  Right: TopProductsChart — Recharts BarChart, top 5 products by units sold.',
        '    Horizontal bars, green fill, product names on Y-axis.',
        '',
        'Section 4 — Recent Sales Table:',
        'Last 5 sales: columns = Product, Qty, Sale Price, Profit, Time.',
        "Format prices as '₦2,500'. Times as relative ('2 hours ago').",
        "'View all sales →' link at bottom right.",
        '',
        'Section 5 — Low Stock Cards:',
        'Products with stock < 10 displayed as warning cards.',
        'Each card: product name, current stock badge (red), recommended reorder qty.',
        '',
        'Show Skeleton loading states for all sections while data resolves.'
      ]),

      spacer(160),
      new Paragraph({ children: [new PageBreak()] }),

      phaseHeader(6, 'Inventory Screen  (/inventory)', 'Day 3'),
      spacer(120),
      h2('Codex Prompt'),
      codeBlock([
        'Build the /inventory page.',
        '',
        'Top bar:',
        "  Left: page title 'Inventory' + product count badge",
        "  Right: search input (filter by name/SKU), category dropdown filter,",
        "         'Add Product' green button",
        '',
        'Products Table columns:',
        '  Product (name + SKU in monospace below), Category, Stock (badge —',
        '  red if < 10, amber if < 20, green otherwise), Cost Price, Selling Price,',
        '  Margin % (auto-calculated), Actions (Edit pencil icon, Delete trash icon)',
        '',
        'Row behavior:',
        '  • Rows with stock < 10 have a faint amber left border',
        '  • Hovering a row shows the action icons more prominently',
        '',
        'Add Product Modal:',
        '  Fields: Name*, Category (dropdown)*, SKU*, Cost Price (₦)*, Selling Price (₦)*,',
        '  Initial Stock*. Show live margin % below prices as user types.',
        '  Validation: no duplicate SKU, all prices > 0, stock >= 0.',
        '  On submit: call mockApi.addProduct(), close modal, refresh table.',
        '',
        'Edit Product Modal: pre-fill with existing data, same validation.',
        'Delete: show a confirm dialog before calling mockApi.deleteProduct().',
        '',
        "Empty state: if no products, show a centered illustration + 'Add your first product'.",
        'Loading state: show skeleton rows while data loads.'
      ]),

      spacer(160),
      new Paragraph({ children: [new PageBreak()] }),

      phaseHeader(7, 'Sales Log Screen  (/sales)', 'Day 4'),
      spacer(120),
      h2('Codex Prompt'),
      codeBlock([
        'Build the /sales page.',
        '',
        'Top section — Record New Sale form (card component):',
        '  1. Product dropdown: searchable, shows product name + stock in parentheses.',
        "     If selected product has stock < 5, show inline warning: 'Only N left in stock'.",
        '  2. Quantity input: number field, max = available stock.',
        '  3. Sale Price field: auto-filled with product.selling_price, user can override.',
        "  4. Live calculation row: 'Profit: ₦X,XXX' (selling_price - cost_price × qty).",
        '     Update in real-time as user types.',
        "  5. Submit button: 'Record Sale'. Disabled if form is invalid.",
        '',
        '  On submit:',
        '    - Validate quantity <= stock; if not, show inline error (do NOT submit).',
        "    - Call mockApi.recordSale(). Show success toast: 'Sale recorded. Stock updated.'",
        '    - Clear form. Refresh sales history.',
        '',
        'Bottom section — Sales History:',
        "  Filters row: date range picker (from/to), product filter dropdown, 'Export CSV' button.",
        '  Table columns: #, Product, Qty, Sale Price, Profit, Date & Time.',
        '  Show summary row at bottom: totals for Qty, Revenue, Profit.',
        "  If filtered results are empty, show 'No sales in this period' empty state.",
        '',
        'Format all currency as ₦X,XXX (NGN, Nigerian Naira).'
      ]),

      spacer(160),
      new Paragraph({ children: [new PageBreak()] }),

      phaseHeader(8, 'AI Insights Screen  (/insights)', 'Day 4'),
      spacer(120),
      h2('Codex Prompt'),
      codeBlock([
        'Build the /insights page. Use data from mockApi.getInsights().',
        '',
        'Top disclaimer banner (info style, blue):',
        "'Predictions are powered by AI and based on your sales history.",
        " Connect the backend to enable real-time forecasting.'",
        '',
        'Section 1 — Profit Forecast:',
        "  Heading: 'Projected Profit — Next 30 Days'",
        '  Recharts AreaChart: X-axis = next 30 dates, Y-axis = NGN profit.',
        '  Gradient fill (green to transparent). Tooltip showing date + profit.',
        '  Generate 30 data points by extrapolating from insights.forecast_profit',
        '  with slight random variance to look realistic.',
        '',
        'Section 2 — Low Stock Predictions:',
        '  Grid of product cards (3 per row). Show only products where',
        '  predicted_low_stock_date is within 14 days.',
        "  Each card: product name, current stock badge, 'Predicted stock-out:' date",
        "  in red, 'Reorder qty: N units' in green.",
        '  Card header background: amber (#FEF3C7). Border: amber.',
        '',
        'Section 3 — Sales Trend Analysis:',
        "  Toggle buttons: 'Weekly' / 'Monthly'.",
        '  Weekly: Recharts BarChart with last 8 weeks of sales grouped by week.',
        '  Monthly: Recharts BarChart with last 6 months.',
        "  Green bars. Tooltip: 'Week of [date]: ₦X,XXX revenue'.",
        '',
        'Section 4 — Top Performers:',
        '  Table of top 5 products by profit margin %.',
        '  Columns: Rank, Product, Revenue, Cost, Profit, Margin %.',
        '  #1 row highlighted with green background.'
      ]),

      spacer(160),
      new Paragraph({ children: [new PageBreak()] }),

      phaseHeader(9, 'Reports Screen  (/reports)', 'Day 5'),
      spacer(120),
      h2('Codex Prompt'),
      codeBlock([
        'Build the /reports page.',
        '',
        "Two report tabs: 'Inventory Report' and 'Sales Report'.",
        '',
        'Inventory Report:',
        '  Filters: Category dropdown, Stock status (All / In Stock / Low Stock / Out of Stock).',
        '  Preview table: all product columns (Name, SKU, Category, Stock, Cost, Price, Margin).',
        '  Summary row: total products, total stock value (sum of cost_price × stock).',
        '',
        'Sales Report:',
        '  Filters: Date range (from/to), Product dropdown.',
        '  Preview table: all sale columns + totals row.',
        '  Summary cards above table: Total Sales, Total Revenue, Total Profit.',
        '',
        'Export buttons:',
        "  'Export CSV': generate CSV string from filtered data using exportCsv.js util.",
        "   Trigger download via Blob + anchor click. Filename: 'trackit-[type]-[date].csv'.",
        "  'Print / Save PDF': call window.print(). Include a @media print CSS block",
        '   that hides sidebar, header, and buttons, and expands the table to full width.',
        '',
        'Loading: Skeleton table while data loads.',
        "Empty state: 'No data matches your filters' with a clear-filters link."
      ]),

      spacer(160),
      new Paragraph({ children: [new PageBreak()] }),

      phaseHeader(10, 'Polish, Mobile & QA', 'Day 5'),
      spacer(120),
      h2('Codex Prompt'),
      codeBlock([
        'Perform a full polish and responsiveness pass on all pages.',
        '',
        'Mobile Responsiveness (< 768px):',
        '  • Sidebar: hide completely. Show MobileBottomNav (fixed bottom, 5 icons).',
        '  • All data tables: wrap in overflow-x-auto container.',
        '  • KPI cards: 2x2 grid on mobile (2 columns).',
        '  • Chart containers: full width, min-height 240px.',
        '  • Modal forms: full screen on mobile (width 100vw, height 100vh).',
        '  • Landing page hero: stack to single column, hide dashboard mockup.',
        '  • Pricing cards: stack vertically.',
        '',
        'Loading States:',
        '  Every page must show Skeleton components while awaiting data.',
        '  Skeleton should match the shape of the real content (card skeletons,',
        '  table row skeletons, chart placeholder).',
        '',
        'Micro-interactions:',
        '  • Buttons: scale(0.97) on click, smooth color transition on hover.',
        '  • KPI cards: subtle hover shadow lift.',
        '  • Table rows: background fade on hover.',
        '  • Modal: fade + scale in (opacity 0→1, scale 0.95→1), 200ms ease.',
        "  • Toast notifications: slide in from top-right, auto-dismiss after 3s.",
        '  • Sidebar nav active: animated left bar that slides between items.',
        '',
        'Toast System:',
        '  Build a simple ToastContext with showToast(message, type) function.',
        '  Types: success (green), error (red), warning (amber), info (blue).',
        '  Toasts stack in top-right, each dismissible manually.',
        '',
        'Error Handling:',
        '  Wrap all mockApi calls in try/catch.',
        '  Show error toast if any call fails.',
        '  Show an error boundary fallback UI for unhandled component errors.',
        '',
        'Final check: run through every route and confirm no layout breaks,',
        'all data renders correctly, and all interactions feel smooth.'
      ]),

      spacer(160),
      new Paragraph({ children: [new PageBreak()] }),

      h1('Backend Integration Guide'),
      body('When the backend is ready, replacing mock data with real API calls requires only changes to src/services/mockApi.js. No component changes are needed.'),
      spacer(80),
      h2('Swap Pattern'),
      codeBlock([
        '// BEFORE (mock):',
        'export async function getProducts() {',
        '  await delay(300);',
        "  return JSON.parse(localStorage.getItem('products'));",
        '}',
        '',
        '// AFTER (real API):',
        'export async function getProducts() {',
        "  const res = await fetch('/api/products', {",
        '    headers: { Authorization: `Bearer ${getToken()}` }',
        '  });',
        '  return res.json();',
        '}'
      ]),
      spacer(80),
      h2('Auth Token'),
      note('Replace the localStorage-based AuthGuard with a real JWT check. The token should be stored in httpOnly cookies or memory — not localStorage — in production.'),

      spacer(80),
      h2('Environment Variables'),
      codeBlock([
        '# .env.local',
        'VITE_API_BASE_URL=https://api.trackit.ng/v1',
        'VITE_FIREBASE_PROJECT_ID=trackit-ng'
      ]),

      spacer(160),
      new Paragraph({ children: [new PageBreak()] }),

      h1('Execution Timeline'),
      spacer(40),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1440, 2520, 5400],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders,
                width: { size: 1440, type: WidthType.DXA },
                shading: { fill: BRAND_GREEN, type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 80 },
                children: [new Paragraph({ children: [new TextRun({ text: 'Day', bold: true, size: 20, color: WHITE, font: 'Arial' })] })]
              }),
              new TableCell({
                borders,
                width: { size: 2520, type: WidthType.DXA },
                shading: { fill: BRAND_GREEN, type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 80 },
                children: [new Paragraph({ children: [new TextRun({ text: 'Phases', bold: true, size: 20, color: WHITE, font: 'Arial' })] })]
              }),
              new TableCell({
                borders,
                width: { size: 5400, type: WidthType.DXA },
                shading: { fill: BRAND_GREEN, type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 80 },
                children: [new Paragraph({ children: [new TextRun({ text: 'Deliverable', bold: true, size: 20, color: WHITE, font: 'Arial' })] })]
              })
            ]
          }),
          ...[
            ['Day 1', 'Phases 1 & 2', 'Scaffold, design system, routing, mock data layer'],
            ['Day 2', 'Phases 3 & 4', 'Landing page (all 9 sections) + Auth screens'],
            ['Day 3', 'Phases 5 & 6', 'Dashboard + Inventory management'],
            ['Day 4', 'Phases 7 & 8', 'Sales log + AI Insights screen'],
            ['Day 5', 'Phases 9 & 10', 'Reports + Full polish, mobile QA, micro-interactions']
          ].map(([day, phases, deliverable], i) =>
            new TableRow({
              children: [
                new TableCell({
                  borders,
                  width: { size: 1440, type: WidthType.DXA },
                  shading: { fill: i % 2 === 0 ? WHITE : LIGHT_GRAY, type: ShadingType.CLEAR },
                  margins: { top: 80, bottom: 80, left: 120, right: 80 },
                  children: [new Paragraph({ children: [new TextRun({ text: day, bold: true, size: 20, color: BRAND_GREEN, font: 'Arial' })] })]
                }),
                new TableCell({
                  borders,
                  width: { size: 2520, type: WidthType.DXA },
                  shading: { fill: i % 2 === 0 ? WHITE : LIGHT_GRAY, type: ShadingType.CLEAR },
                  margins: { top: 80, bottom: 80, left: 120, right: 80 },
                  children: [new Paragraph({ children: [new TextRun({ text: phases, size: 20, color: DARK_TEXT, font: 'Arial' })] })]
                }),
                new TableCell({
                  borders,
                  width: { size: 5400, type: WidthType.DXA },
                  shading: { fill: i % 2 === 0 ? WHITE : LIGHT_GRAY, type: ShadingType.CLEAR },
                  margins: { top: 80, bottom: 80, left: 120, right: 80 },
                  children: [new Paragraph({ children: [new TextRun({ text: deliverable, size: 20, color: GRAY, font: 'Arial' })] })]
                })
              ]
            })
          )
        ]
      }),

      spacer(120),
      h2('Key Principles for Codex'),
      bullet('Always use mockApi.js — never hardcode data directly in components'),
      bullet('Name components exactly as shown in the file structure'),
      bullet('Use Tailwind utility classes only — no inline styles'),
      bullet('All currency must display as ₦X,XXX (Nigerian Naira format)'),
      bullet('All API function signatures must match the PRD API contracts exactly'),
      bullet('Every form must have validation before calling any API function'),
      bullet('Every page must have a loading skeleton state while awaiting data'),
      bullet('Run one phase fully before starting the next — do not skip ahead'),

      spacer(300),
      sectionDivider(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 60 },
        children: [new TextRun({ text: 'TrackIt  ·  Frontend Codex Plan  ·  Version 1.0', size: 18, color: GRAY, font: 'Arial' })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 0 },
        children: [new TextRun({ text: 'Backend integration document to follow upon API completion.', size: 16, color: 'AAAAAA', font: 'Arial', italics: true })]
      })
    ]
  }]
});

const outputPath = path.join(__dirname, 'TrackIt_Frontend_Codex_Plan.docx');

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outputPath, buffer);
  console.log(`Done! Wrote ${outputPath}`);
}).catch(err => {
  console.error(err);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * screenshot-slides.mjs
 * Renders HTML slide previews from resolved DS-ONT brand tokens and
 * captures screenshots using Playwright.
 *
 * Usage: node screenshot-slides.mjs
 * Output: /tmp/pptx-slides/<BRAND>-slide-<N>.png
 */
import { chromium } from 'playwright';
import { buildSlideTemplateTokens } from './ds-pptx-bridge.mjs';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const BRANDS = ['baiv', 'rcs', 'wwg', 'vhf'];
const OUT_DIR = '/tmp/pptx-slides';
mkdirSync(OUT_DIR, { recursive: true });

/** Generate HTML for 3 representative slide layouts using resolved tokens */
function buildSlideHTML(brand, T) {
  const slides = [
    // Slide 1: Title slide
    `<div class="slide" style="background:#${T['slide.background.fill']}">
      <div class="accent-bar" style="background:#${T['slide.heading.secondary.color']}"></div>
      <div class="brand-tag" style="color:#${T['slide.heading.secondary.color']};font-family:'${T['slide.heading.font.family']}',sans-serif">
        ${brand.toUpperCase()} · VE Strategy Deck
      </div>
      <div class="title" style="color:#${T['slide.heading.primary.color']};font-family:'${T['slide.heading.font.family']}',sans-serif">
        Value Engineering<br>Skill Chain
      </div>
      <div class="subtitle" style="color:#${T['slide.heading.highlight.color']};font-family:'${T['slide.heading.font.family']}',sans-serif">
        VSOM → OKR → KPI → VP → Kano → PMF
      </div>
      <div class="meta" style="color:#${T['slide.label.text.color']};font-family:'${T['slide.body.font.family']}',sans-serif">
        DS-ONT Token-Governed · PF-Core Platform · March 2026
      </div>
      <div class="caption" style="color:#${T['slide.caption.text.color']};font-family:'${T['slide.body.font.family']}',sans-serif">
        Unified Registry v11 · 56 Ontologies · 5 Series · 5 PFI Instances
      </div>
    </div>`,

    // Slide 2: Section divider
    `<div class="slide" style="background:#${T['slide.divider.background.fill']}">
      <div class="divider-number" style="color:#${T['slide.heading.secondary.color']};font-family:'${T['slide.heading.font.family']}',sans-serif">01</div>
      <div class="divider-title" style="color:#${T['slide.heading.primary.color']};font-family:'${T['slide.heading.font.family']}',sans-serif">
        Vision &amp; VSOM Cascade
      </div>
      <div class="divider-sub" style="color:#${T['slide.label.text.color']};font-family:'${T['slide.body.font.family']}',sans-serif">
        Strategic foundation for ${brand.toUpperCase()}
      </div>
      <div class="accent-rule" style="background:#${T['slide.accent.bar.fill']}"></div>
    </div>`,

    // Slide 3: Content slide with data series colours
    `<div class="slide" style="background:#${T['slide.background.fill']}">
      <div class="content-heading" style="color:#${T['slide.heading.secondary.color']};font-family:'${T['slide.heading.font.family']}',sans-serif">
        Token Palette Verification
      </div>
      <div class="content-body" style="color:#${T['slide.body.text.color']};font-family:'${T['slide.body.font.family']}',sans-serif">
        Component property cascade — all values resolved from DS-ONT semantic tokens
      </div>
      <div class="swatch-row">
        ${[
          ['slide.background.fill',           'Background'],
          ['slide.divider.background.fill',   'Divider bg'],
          ['slide.heading.secondary.color',   'Brand accent'],
          ['slide.heading.highlight.color',   'Highlight'],
          ['slide.heading.primary.color',     'Light text'],
          ['slide.label.text.color',          'Label text'],
          ['slide.caption.text.color',        'Caption'],
          ['slide.data.series.primary.fill',  'Series 1'],
          ['slide.data.series.secondary.fill','Series 2'],
          ['slide.status.success.fill',       'Success'],
          ['slide.status.error.fill',         'Error'],
          ['slide.status.info.fill',          'Info'],
        ].map(([prop, label]) => `
          <div class="swatch">
            <div class="swatch-block" style="background:#${T[prop]};border:1px solid rgba(255,255,255,0.15)"></div>
            <div class="swatch-hex" style="color:#${T['slide.label.text.color']};font-family:monospace">${T[prop]}</div>
            <div class="swatch-label" style="color:#${T['slide.caption.text.color']};font-family:'${T['slide.body.font.family']}',sans-serif">${label}</div>
          </div>`).join('')}
      </div>
    </div>`
  ];

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #111; display: flex; flex-direction: column; gap: 24px; padding: 24px; }
  .slide {
    width: 960px; height: 540px; position: relative;
    overflow: hidden; flex-shrink: 0;
    display: flex; flex-direction: column; justify-content: center;
    padding: 48px 60px;
  }
  .accent-bar { position: absolute; top: 0; left: 0; right: 0; height: 6px; }
  .accent-rule { position: absolute; bottom: 60px; left: 60px; width: 80px; height: 4px; }
  .brand-tag { font-size: 13px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 32px; }
  .title { font-size: 44px; font-weight: 700; line-height: 1.15; margin-bottom: 20px; }
  .subtitle { font-size: 18px; font-weight: 500; margin-bottom: 16px; }
  .meta { font-size: 13px; margin-bottom: 6px; }
  .caption { font-size: 11px; }
  .divider-number { font-size: 72px; font-weight: 800; opacity: 0.3; line-height: 1; margin-bottom: 12px; }
  .divider-title { font-size: 40px; font-weight: 700; margin-bottom: 12px; }
  .divider-sub { font-size: 16px; }
  .content-heading { font-size: 26px; font-weight: 700; margin-bottom: 10px; }
  .content-body { font-size: 13px; margin-bottom: 24px; }
  .swatch-row { display: flex; flex-wrap: wrap; gap: 10px; }
  .swatch { display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .swatch-block { width: 56px; height: 42px; border-radius: 4px; }
  .swatch-hex { font-size: 9px; }
  .swatch-label { font-size: 9px; text-align: center; max-width: 56px; }
</style>
</head>
<body>
  ${slides.join('\n')}
</body>
</html>`;
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1008, height: 1800 });

  for (const brand of BRANDS) {
    console.log(`Screenshotting ${brand.toUpperCase()}...`);
    const T = buildSlideTemplateTokens(brand);
    const html = buildSlideHTML(brand, T);

    const htmlPath = join(OUT_DIR, `${brand}-preview.html`);
    writeFileSync(htmlPath, html, 'utf8');

    await page.goto(`file://${htmlPath}`);
    await page.waitForTimeout(300);

    // Full page (all 3 slides stacked)
    await page.screenshot({
      path: join(OUT_DIR, `${brand.toUpperCase()}-all-slides.png`),
      fullPage: true
    });

    // Individual slide crops
    const slides = await page.locator('.slide').all();
    for (let i = 0; i < slides.length; i++) {
      await slides[i].screenshot({
        path: join(OUT_DIR, `${brand.toUpperCase()}-slide-${i + 1}.png`)
      });
    }

    console.log(`  → ${OUT_DIR}/${brand.toUpperCase()}-slide-{1,2,3}.png`);
  }

  await browser.close();
  console.log('\nDone. Screenshots in', OUT_DIR);
}

main().catch(e => { console.error(e); process.exit(1); });

/**
 * OAA v7.0.0 compliance panel rendering.
 */

import { state } from './state.js';

export function renderCompletenessScore(score) {
  const el = document.getElementById('completeness-score');
  if (!el) return;

  const color = score.totalScore >= 80 ? '#86efac' : score.totalScore >= 60 ? '#ffb48e' : '#fca5a5';
  const bgColor = score.totalScore >= 80 ? 'rgba(22,101,52,0.2)' : score.totalScore >= 60 ? 'rgba(85,48,22,0.2)' : 'rgba(127,29,29,0.2)';

  let html = `<div class="completeness-gauge" style="background:${bgColor}; border-radius:8px; padding:12px; margin-bottom:12px;">`;
  html += `<div style="display:flex; align-items:center; gap:12px;">`;

  // CSS-only circular gauge
  const pct = score.totalScore;
  const deg = Math.round(pct * 3.6);
  const gradientBg = deg > 180
    ? `conic-gradient(${color} 0deg, ${color} ${deg}deg, #333 ${deg}deg, #333 360deg)`
    : `conic-gradient(${color} 0deg, ${color} ${deg}deg, #333 ${deg}deg, #333 360deg)`;
  html += `<div style="position:relative; width:56px; height:56px; border-radius:50%; background:${gradientBg}; flex-shrink:0;">`;
  html += `<div style="position:absolute; inset:6px; border-radius:50%; background:#1a1b26; display:flex; align-items:center; justify-content:center;">`;
  html += `<span style="color:${color}; font-size:14px; font-weight:700;">${pct}%</span>`;
  html += `</div></div>`;

  html += `<div><div style="font-weight:600; color:${color}; font-size:14px;">${score.totalLabel}</div>`;
  html += `<div style="font-size:11px; color:#888;">Completeness Score</div></div>`;
  html += `</div>`;

  // Category breakdown
  html += `<div style="margin-top:10px; font-size:11px;">`;
  score.categories.forEach(cat => {
    const catColor = cat.score >= 80 ? '#86efac' : cat.score >= 60 ? '#ffb48e' : '#fca5a5';
    const barWidth = Math.max(cat.score, 2);
    html += `<div style="display:flex; align-items:center; gap:6px; margin:3px 0;">`;
    html += `<span style="width:85px; color:#aaa;">${cat.name}</span>`;
    html += `<div style="flex:1; height:6px; background:#333; border-radius:3px; overflow:hidden;">`;
    html += `<div style="width:${barWidth}%; height:100%; background:${catColor}; border-radius:3px;"></div></div>`;
    html += `<span style="width:28px; text-align:right; color:${catColor};">${cat.score}%</span>`;
    html += `</div>`;
  });
  html += `</div></div>`;

  el.innerHTML = html;
}

export function renderOAACompliancePanel(validation) {
  const el = document.getElementById('oaa-compliance-content');
  let html = '';

  const statusText = validation.overall === 'pass' ? 'Compliant' :
                     validation.overall === 'warn' ? 'Warnings' : 'Non-Compliant';
  html += `<div style="margin-bottom:12px; padding:10px; border-radius:6px; background:${
    validation.overall === 'pass' ? 'rgba(22,101,52,0.2)' :
    validation.overall === 'warn' ? 'rgba(85,48,22,0.2)' : 'rgba(127,29,29,0.2)'
  };">`;
  html += `<div style="font-weight:600; color:${
    validation.overall === 'pass' ? '#86efac' :
    validation.overall === 'warn' ? '#ffb48e' : '#fca5a5'
  };">${statusText}</div>`;
  html += `<div style="font-size:11px; color:#888; margin-top:4px;">Core gates (G1-G4): ${validation.summary.pass} pass | ${validation.summary.warn} warn | ${validation.summary.fail} fail</div>`;
  html += '</div>';

  html += '<div style="margin-bottom:8px; font-size:11px; color:#888; text-transform:uppercase; letter-spacing:0.5px;">Core Gates (Required)</div>';

  validation.gates.forEach(g => {
    if (g.skipped || g.advisory) return;

    html += `<div class="gate-result ${g.status}">`;
    html += `<div class="gate-name">${g.gate} <span class="audit-badge ${g.status}">${g.status.toUpperCase()}</span></div>`;
    html += `<div class="gate-detail">${g.detail}</div>`;

    if (g.issues && g.issues.length > 0) {
      html += '<div class="gate-items">';
      g.issues.slice(0, 3).forEach(issue => {
        html += `<div style="color:#fca5a5;">\u2022 ${issue}</div>`;
      });
      if (g.issues.length > 3) html += `<div style="color:#888;">... and ${g.issues.length - 3} more</div>`;
      html += '</div>';
    }

    if (g.warnings && g.warnings.length > 0) {
      html += '<div class="gate-items">';
      g.warnings.slice(0, 3).forEach(warn => {
        html += `<div style="color:#ffb48e;">\u2022 ${warn}</div>`;
      });
      if (g.warnings.length > 3) html += `<div style="color:#888;">... and ${g.warnings.length - 3} more</div>`;
      html += '</div>';
    }

    html += '</div>';
  });

  const advisoryGates = validation.gates.filter(g => g.advisory && !g.skipped);
  if (advisoryGates.length > 0) {
    html += '<div style="margin-top:16px; margin-bottom:8px; font-size:11px; color:#888; text-transform:uppercase; letter-spacing:0.5px;">Advisory Gates (Recommendations)</div>';

    advisoryGates.forEach(g => {
      html += `<div class="gate-result ${g.status}" style="opacity:0.7;">`;
      html += `<div class="gate-name">${g.gate} <span style="font-size:10px; color:#666;">ADVISORY</span></div>`;
      html += `<div class="gate-detail">${g.detail}</div>`;

      if (g.warnings && g.warnings.length > 0) {
        html += '<div class="gate-items">';
        g.warnings.slice(0, 2).forEach(warn => {
          html += `<div style="color:#888;">\u2022 ${warn}</div>`;
        });
        html += '</div>';
      }

      html += '</div>';
    });
  }

  el.innerHTML = html;

  const badge = document.getElementById('compliance-status');
  badge.className = `compliance-badge ${validation.overall}`;
  document.getElementById('compliance-text').textContent = `OAA v7.0.0 ${statusText}`;
  badge.style.display = 'inline-flex';

  const upgradeBtn = document.getElementById('btn-run-oaa');
  if (upgradeBtn) {
    upgradeBtn.style.display = 'inline-block';
    upgradeBtn.textContent = validation.overall === 'pass'
      ? 'Regenerate with OAA v7'
      : 'Upgrade with OAA v7';
  }

  const saveBtn = document.getElementById('btn-save-library');
  if (saveBtn) {
    saveBtn.style.display = validation.overall === 'pass' ? 'inline-block' : 'none';
  }

  const exportBtn = document.getElementById('btn-export-audit');
  if (exportBtn) {
    exportBtn.style.display = 'inline-block';
  }

  state.lastValidation = validation;
}

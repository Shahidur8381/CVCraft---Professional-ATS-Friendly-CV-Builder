import { resumeState } from '../state.js';
import { analyzeATS } from './atsChecker.js';

export function renderToolbar(containerEl, onPrint, onZoomChange) {
  const data = resumeState.getData();
  const atsResult = analyzeATS(data);

  const html = `
    <header class="app-toolbar">
      <!-- Left: Logo & Presets -->
      <div class="toolbar-left">
        <div class="app-brand">
          <img src="/logo.png" alt="CVCraft Logo" class="brand-logo-img" />
          <div class="brand-text-wrap">
            <div class="brand-title">CVCraft</div>
            <div class="brand-subtitle">Professional CV Builder</div>
          </div>
        </div>

        <div class="toolbar-divider"></div>

        <div class="dropdown-group">
          <button type="button" class="btn-sm btn-secondary" id="btn-load-shahidur" title="Load the improved ATS resume for Md. Shahidur Rahman">
            ✨ Load Improved CV
          </button>
          <button type="button" class="btn-sm btn-ghost" id="btn-load-blank" title="Start with a blank canvas">
            Blank
          </button>
        </div>
      </div>

      <!-- Center: ATS Score Indicator -->
      <div class="toolbar-center">
        <button type="button" class="ats-badge-btn" id="btn-open-ats-modal" title="Click to view full ATS Score breakdown and recommendations">
          <div class="ats-score-circle" style="border-color: ${atsResult.badgeColor}; color: ${atsResult.badgeColor};">
            ${atsResult.score}
          </div>
          <div class="ats-badge-text">
            <span class="ats-rating" style="color: ${atsResult.badgeColor};">${atsResult.rating}</span>
            <span class="ats-label">ATS Match Score ▾</span>
          </div>
        </button>
      </div>

      <!-- Right: Customizer & Actions -->
      <div class="toolbar-right">
        <!-- Spacing / Page density control -->
        <div class="toolbar-control">
          <label class="control-label">Density</label>
          <select id="select-spacing" class="form-select select-sm">
            <option value="compact" ${data.settings.lineSpacing === 'compact' ? 'selected' : ''}>Compact (1-Page)</option>
            <option value="normal" ${data.settings.lineSpacing === 'normal' ? 'selected' : ''}>Standard</option>
            <option value="relaxed" ${data.settings.lineSpacing === 'relaxed' ? 'selected' : ''}>Relaxed (2-Page)</option>
          </select>
        </div>

        <!-- Font Family control -->
        <div class="toolbar-control">
          <label class="control-label">Font</label>
          <select id="select-font" class="form-select select-sm">
            <option value="serif" ${data.settings.fontFamily === 'serif' ? 'selected' : ''}>Classic Serif</option>
            <option value="sans" ${data.settings.fontFamily === 'sans' ? 'selected' : ''}>Modern Sans</option>
            <option value="modern" ${data.settings.fontFamily === 'modern' ? 'selected' : ''}>Editorial</option>
          </select>
        </div>

        <!-- Color Palette -->
        <div class="toolbar-control">
          <label class="control-label">Accent</label>
          <div class="color-presets">
            <button type="button" class="color-dot ${data.settings.accentColor === '#111827' ? 'active' : ''}" data-color="#111827" style="background:#111827" title="Classic Charcoal"></button>
            <button type="button" class="color-dot ${data.settings.accentColor === '#881337' ? 'active' : ''}" data-color="#881337" style="background:#881337" title="KUET Crimson"></button>
            <button type="button" class="color-dot ${data.settings.accentColor === '#1e3a8a' ? 'active' : ''}" data-color="#1e3a8a" style="background:#1e3a8a" title="Deep Navy"></button>
            <button type="button" class="color-dot ${data.settings.accentColor === '#065f46' ? 'active' : ''}" data-color="#065f46" style="background:#065f46" title="Forest Emerald"></button>
          </div>
        </div>

        <div class="toolbar-divider"></div>

        <!-- Data Export / Import -->
        <div class="btn-group">
          <button type="button" class="btn-sm btn-ghost" id="btn-export-json" title="Download CV backup as JSON">
            <span class="icon">💾</span> JSON
          </button>
          <label class="btn-sm btn-ghost cursor-pointer" title="Import CV from JSON file">
            <span class="icon">📂</span> Import
            <input type="file" id="file-import-json" accept=".json" style="display:none;" />
          </label>
        </div>

        <!-- Primary Action: PDF Print -->
        <button type="button" class="btn-sm btn-primary" id="btn-print-pdf">
          <span class="icon">🖨️</span> Print / PDF
        </button>
      </div>
    </header>

    <!-- ATS AUDIT MODAL / SLIDEOUT -->
    <div id="ats-modal" class="modal-overlay hidden">
      <div class="modal-card">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <span class="modal-icon">🎯</span>
            <div>
              <h3 class="modal-title">ATS Resume Audit & Optimization</h3>
              <p class="modal-subtitle">Real-time analysis against automated tracking systems & tech recruiter standards</p>
            </div>
          </div>
          <button type="button" class="modal-close" id="btn-close-ats-modal">×</button>
        </div>

        <div class="modal-body">
          <div class="ats-score-hero" style="border-left: 4px solid ${atsResult.badgeColor};">
            <div class="ats-hero-number" style="color: ${atsResult.badgeColor};">${atsResult.score}<span class="ats-hero-total">/100</span></div>
            <div>
              <h4 class="ats-hero-rating">${atsResult.rating}</h4>
              <p class="ats-hero-desc">
                ${atsResult.score >= 90
                  ? 'Outstanding! Your resume has clear contact information, strong Google XYZ bullet points, measurable metrics, and clean single-column ATS formatting.'
                  : 'Good foundation. Follow the tips below to boost keyword match rates and recruiter response rates.'}
              </p>
            </div>
          </div>

          <div class="ats-metrics-row">
            <div class="ats-stat-box">
              <span class="stat-num">${atsResult.actionVerbsCount} / ${atsResult.totalBullets}</span>
              <span class="stat-lbl">Action Verbs in Bullets</span>
            </div>
            <div class="ats-stat-box">
              <span class="stat-num">${atsResult.metricsCount} / ${atsResult.totalBullets}</span>
              <span class="stat-lbl">Quantified Impact Metrics</span>
            </div>
            <div class="ats-stat-box">
              <span class="stat-num">${data.skillStacks.length} Stacks</span>
              <span class="stat-lbl">Technical Categories</span>
            </div>
          </div>

          <!-- Strengths -->
          <div class="ats-feedback-section">
            <h5 class="ats-subhead text-success">✓ Verified ATS Strengths</h5>
            <ul class="ats-list">
              ${atsResult.strengths.map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>

          <!-- Actionable Improvements -->
          ${atsResult.feedback.length > 0 ? `
            <div class="ats-feedback-section">
              <h5 class="ats-subhead text-warning">⚠ Recommended Improvements</h5>
              <ul class="ats-list">
                ${atsResult.feedback.map(f => `<li class="feedback-${f.type}">${f.text}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <!-- Google XYZ Formula Cheat Sheet -->
          <div class="ats-guide-box">
            <h6>💡 Google's X-Y-Z Resume Formula</h6>
            <p>Write every accomplishment as: <em>"Accomplished <strong>[X]</strong> as measured by <strong>[Y]</strong>, by doing <strong>[Z]</strong>"</em>.</p>
            <div class="formula-example">
              <span class="bad">❌ Before:</span> "Contributed to web development and fixed bugs."<br/>
              <span class="good">✓ Improved:</span> "Architected RESTful APIs with Node.js and React, reducing query latency by 32% across 20+ production services."
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-sm btn-primary" id="btn-close-ats-modal-footer">Done</button>
        </div>
      </div>
    </div>
  `;

  containerEl.innerHTML = html;
  attachToolbarListeners(containerEl, onPrint, onZoomChange);
}

function attachToolbarListeners(containerEl, onPrint, onZoomChange) {
  // Preset: Load Improved Shahidur CV
  const btnLoadShahidur = containerEl.querySelector('#btn-load-shahidur');
  if (btnLoadShahidur) {
    btnLoadShahidur.addEventListener('click', () => {
      if (confirm('Load the improved ATS resume for Md. Shahidur Rahman? Any unsaved edits will be replaced.')) {
        resumeState.resetToShahidur();
      }
    });
  }

  // Preset: Blank
  const btnLoadBlank = containerEl.querySelector('#btn-load-blank');
  if (btnLoadBlank) {
    btnLoadBlank.addEventListener('click', () => {
      if (confirm('Clear fields and start with a blank template?')) {
        resumeState.resetToBlank();
      }
    });
  }

  // Print PDF
  const btnPrint = containerEl.querySelector('#btn-print-pdf');
  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      if (onPrint) onPrint();
      else window.print();
    });
  }

  // ATS Modal Open / Close
  const btnOpenAts = containerEl.querySelector('#btn-open-ats-modal');
  const modal = containerEl.querySelector('#ats-modal');
  const btnCloseAts = containerEl.querySelector('#btn-close-ats-modal');
  const btnCloseAtsFooter = containerEl.querySelector('#btn-close-ats-modal-footer');

  const openModal = () => modal?.classList.remove('hidden');
  const closeModal = () => modal?.classList.add('hidden');

  btnOpenAts?.addEventListener('click', openModal);
  btnCloseAts?.addEventListener('click', closeModal);
  btnCloseAtsFooter?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Settings change: Spacing
  const selectSpacing = containerEl.querySelector('#select-spacing');
  selectSpacing?.addEventListener('change', (e) => {
    resumeState.updateSetting('lineSpacing', e.target.value);
  });

  // Settings change: Font
  const selectFont = containerEl.querySelector('#select-font');
  selectFont?.addEventListener('change', (e) => {
    resumeState.updateSetting('fontFamily', e.target.value);
  });

  // Settings change: Color
  containerEl.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const color = dot.dataset.color;
      resumeState.updateSetting('accentColor', color);
      containerEl.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
    });
  });

  // Export JSON
  const btnExport = containerEl.querySelector('#btn-export-json');
  btnExport?.addEventListener('click', () => {
    const data = resumeState.getData();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanName = (data.personalInfo.fullName || 'resume').toLowerCase().replace(/[^a-z0-9]/g, '_');
    a.download = `${cleanName}_cv.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Import JSON
  const fileImport = containerEl.querySelector('#file-import-json');
  fileImport?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const result = resumeState.importData(parsed);
        if (result.success) {
          alert('CV imported successfully!');
        } else {
          alert('Failed to import CV: ' + result.error);
        }
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });
}

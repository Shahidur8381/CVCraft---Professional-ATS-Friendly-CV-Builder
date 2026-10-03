import './style.css';
import { resumeState } from './state.js';
import { renderToolbar } from './components/toolbar.js';
import { renderEditor } from './components/editor.js';
import { renderPreview } from './components/preview.js';
import { analyzeATS } from './components/atsChecker.js';
import { openCertModal } from './components/certModal.js';

let currentZoom = 0.95;

function initApp() {
  const appEl = document.querySelector('#app');
  if (!appEl) return;

  appEl.innerHTML = `
    <div id="toolbar-root"></div>
    <div class="mobile-view-tabs" id="mobile-tabs">
      <button type="button" class="mobile-tab-btn active" id="tab-btn-editor">✏️ Edit CV</button>
      <button type="button" class="mobile-tab-btn" id="tab-btn-preview">👁️ Live Preview</button>
    </div>
    <div class="app-workspace show-editor" id="app-workspace">
      <aside class="editor-pane" id="editor-root"></aside>
      <main class="preview-pane" id="preview-pane">
        <!-- Floating zoom controls -->
        <div class="preview-toolbar-floating">
          <button type="button" class="btn-xs btn-ghost" id="btn-zoom-out" title="Zoom Out">−</button>
          <span class="zoom-level-text" id="zoom-text">95%</span>
          <button type="button" class="btn-xs btn-ghost" id="btn-zoom-in" title="Zoom In">+</button>
          <button type="button" class="btn-xs btn-secondary" id="btn-zoom-fit" title="Fit to Screen">Fit</button>
          <button type="button" class="btn-xs btn-ghost" id="btn-zoom-100" title="100% Real Size">100%</button>
        </div>

        <div class="cv-document-wrapper" id="cv-wrapper" style="transform: scale(${currentZoom});">
          <div id="preview-root"></div>
        </div>
      </main>
    </div>
  `;

  const toolbarRoot = document.querySelector('#toolbar-root');
  const editorRoot = document.querySelector('#editor-root');
  const previewRoot = document.querySelector('#preview-root');
  const cvWrapper = document.querySelector('#cv-wrapper');
  const zoomText = document.querySelector('#zoom-text');
  const appWorkspace = document.querySelector('#app-workspace');
  const tabBtnEditor = document.querySelector('#tab-btn-editor');
  const tabBtnPreview = document.querySelector('#tab-btn-preview');

  // Initial renders
  renderToolbar(toolbarRoot, handlePrint);
  renderEditor(editorRoot);
  renderPreview(resumeState.getData(), previewRoot);

  // Zoom handlers
  const updateZoom = (newZoom) => {
    currentZoom = Math.max(0.35, Math.min(1.5, Math.round(newZoom * 100) / 100));
    if (cvWrapper) cvWrapper.style.transform = `scale(${currentZoom})`;
    if (zoomText) zoomText.textContent = `${Math.round(currentZoom * 100)}%`;
  };

  const fitToScreen = () => {
    const pane = document.querySelector('#preview-pane');
    if (pane) {
      const availableWidth = pane.clientWidth - 32;
      const a4WidthPx = 794; // approx 210mm in standard 96dpi
      const fitScale = Math.max(0.35, Math.min(1.2, availableWidth / a4WidthPx));
      updateZoom(fitScale);
    }
  };

  // Mobile Tab switching
  tabBtnEditor?.addEventListener('click', () => {
    tabBtnEditor.classList.add('active');
    tabBtnPreview.classList.remove('active');
    appWorkspace?.classList.add('show-editor');
    appWorkspace?.classList.remove('show-preview');
  });

  tabBtnPreview?.addEventListener('click', () => {
    tabBtnPreview.classList.add('active');
    tabBtnEditor.classList.remove('active');
    appWorkspace?.classList.add('show-preview');
    appWorkspace?.classList.remove('show-editor');
    setTimeout(fitToScreen, 60);
  });

  document.querySelector('#btn-zoom-in')?.addEventListener('click', () => updateZoom(currentZoom + 0.1));
  document.querySelector('#btn-zoom-out')?.addEventListener('click', () => updateZoom(currentZoom - 0.1));
  document.querySelector('#btn-zoom-100')?.addEventListener('click', () => updateZoom(1.0));
  document.querySelector('#btn-zoom-fit')?.addEventListener('click', fitToScreen);

  // Initial fit on mobile screens
  if (window.innerWidth <= 960) {
    fitToScreen();
  }
  window.addEventListener('resize', () => {
    if (window.innerWidth <= 960 && appWorkspace?.classList.contains('show-preview')) {
      fitToScreen();
    }
  });

  // Print handler
  function handlePrint() {
    window.print();
  }

  // Reactive subscription: Update preview & ATS score badge whenever data updates
  resumeState.subscribe((newData) => {
    renderPreview(newData, previewRoot);

    // Update ATS Score in toolbar without rerendering entire toolbar DOM (avoids closing modals)
    const atsResult = analyzeATS(newData);
    const scoreCircle = document.querySelector('.ats-score-circle');
    const scoreRating = document.querySelector('.ats-rating');
    if (scoreCircle) {
      scoreCircle.textContent = atsResult.score;
      scoreCircle.style.borderColor = atsResult.badgeColor;
      scoreCircle.style.color = atsResult.badgeColor;
    }
    if (scoreRating) {
      scoreRating.textContent = atsResult.rating;
      scoreRating.style.color = atsResult.badgeColor;
    }
  });

  // Global click delegate for Show Certificate buttons
  document.addEventListener('click', (e) => {
    const certBtn = e.target.closest('.cv-btn-cert, .cv-cert-show, .btn-editor-show-cert');
    if (certBtn) {
      e.preventDefault();
      const url = certBtn.dataset.certUrl || certBtn.dataset.url;
      const title = certBtn.dataset.certName || certBtn.dataset.name;
      const issuer = certBtn.dataset.certIssuer || certBtn.dataset.issuer;
      const certId = certBtn.dataset.certId || certBtn.dataset.id;
      const date = certBtn.dataset.certDate || certBtn.dataset.date;
      if (url) {
        openCertModal({ title, issuer, date, certId, url });
      }
    }
  });

  // Auto-fit on initial load if screen is smaller
  setTimeout(() => {
    const pane = document.querySelector('#preview-pane');
    if (pane && pane.clientWidth < 850) {
      const fitScale = (pane.clientWidth - 40) / 794;
      updateZoom(fitScale);
    }
  }, 100);
}

initApp();

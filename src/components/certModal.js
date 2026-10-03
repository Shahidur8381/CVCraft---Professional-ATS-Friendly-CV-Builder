// Certificate Viewer Modal Component

export function openCertModal({ title, issuer, date, certId, url }) {
  // Remove existing modal if any
  closeCertModal();

  if (!url) return;

  const isPdf = url.toLowerCase().includes('.pdf');

  const modalHtml = `
    <div id="cert-modal-overlay" class="modal-overlay cert-modal-overlay">
      <div class="modal-dialog cert-modal-dialog">
        <div class="modal-header">
          <div class="cert-modal-title-wrap">
            <span class="cert-modal-badge">📜 Verified Credential</span>
            <h3 class="modal-title">${escapeHtml(title || 'Certificate')}</h3>
            <div class="cert-modal-meta">
              ${issuer ? `<span class="cert-modal-issuer">${escapeHtml(issuer)}</span>` : ''}
              ${date ? `<span class="cert-modal-date">• ${escapeHtml(date)}</span>` : ''}
              ${certId ? `<span class="cert-modal-id-badge">ID: ${escapeHtml(certId)}</span>` : ''}
            </div>
          </div>
          <button type="button" class="btn-icon modal-close" id="btn-close-cert-modal" title="Close (Esc)">×</button>
        </div>

        <div class="modal-body cert-modal-body">
          ${isPdf ? `
            <div class="cert-frame-container">
              <iframe src="${url}" class="cert-pdf-frame" title="Certificate Document"></iframe>
            </div>
          ` : `
            <div class="cert-img-container">
              <img src="${url}" alt="${escapeHtml(title)}" class="cert-full-image" />
            </div>
          `}
        </div>

        <div class="modal-footer cert-modal-footer">
          <div class="cert-modal-footer-left">
            ${certId ? `
              <button type="button" class="btn-sm btn-ghost" id="btn-copy-cert-id" data-copy="${escapeHtml(certId)}">
                📋 Copy Credential ID
              </button>
            ` : ''}
          </div>
          <div class="cert-modal-footer-right">
            <a href="${url}" target="_blank" rel="noopener noreferrer" class="btn-sm btn-outline">
              Open Original ↗
            </a>
            <a href="${url}" download class="btn-sm btn-primary">
              ⬇ Download
            </a>
            <button type="button" class="btn-sm btn-ghost" id="btn-cert-modal-close-footer">Close</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  document.body.style.overflow = 'hidden';

  const overlay = document.getElementById('cert-modal-overlay');
  
  // Close handlers
  const closeBtn = document.getElementById('btn-close-cert-modal');
  const closeFooterBtn = document.getElementById('btn-cert-modal-close-footer');
  
  if (closeBtn) closeBtn.addEventListener('click', closeCertModal);
  if (closeFooterBtn) closeFooterBtn.addEventListener('click', closeCertModal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeCertModal();
  });

  const onKeydown = (e) => {
    if (e.key === 'Escape') {
      closeCertModal();
      document.removeEventListener('keydown', onKeydown);
    }
  };
  document.addEventListener('keydown', onKeydown);

  // Copy ID button
  const copyBtn = document.getElementById('btn-copy-cert-id');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(certId);
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = '✅ Copied to Clipboard!';
      setTimeout(() => {
        copyBtn.innerHTML = originalText;
      }, 2000);
    });
  }
}

export function closeCertModal() {
  const existing = document.getElementById('cert-modal-overlay');
  if (existing) {
    existing.remove();
  }
  document.body.style.overflow = '';
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

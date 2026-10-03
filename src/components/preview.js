// Resume Preview Renderer

export function renderPreview(data, containerEl) {
  const { personalInfo, settings, sectionOrder } = data;
  const hiddenSections = settings.hiddenSections || [];

  const fontClass = `font-${settings.fontFamily || 'serif'}`;
  const spacingClass = `spacing-${settings.lineSpacing || 'compact'}`;
  const sizeClass = `size-${settings.fontSize || 'medium'}`;

  // Helper to format clean links
  const formatUrl = (url) => {
    if (!url) return '';
    return url.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '');
  };

  // Build Contact Header
  const contactItems = [];
  if (personalInfo.phone) {
    contactItems.push(`<span>${personalInfo.phone}</span>`);
  }

  if (personalInfo.emails && personalInfo.emails.length > 0) {
    const visibleEmails = personalInfo.emails.filter(e => e.email && (e.showOnCv !== false));
    visibleEmails.forEach(e => {
      contactItems.push(
        `<a href="mailto:${e.email}" class="cv-link">${e.email}</a>`
      );
    });
  }

  if (personalInfo.location) {
    contactItems.push(`<span>${personalInfo.location}</span>`);
  }

  const socialItems = [];
  if (personalInfo.website && personalInfo.showWebsite !== false) {
    socialItems.push(
      `<a href="${personalInfo.website}" target="_blank" rel="noopener noreferrer" class="cv-link cv-bold">${formatUrl(personalInfo.website)}</a>`
    );
  }

  if (personalInfo.github && personalInfo.showGithub !== false) {
    socialItems.push(
      `<a href="${personalInfo.github}" target="_blank" rel="noopener noreferrer" class="cv-link">${formatUrl(personalInfo.github)}</a>`
    );
  }

  if (personalInfo.linkedin && personalInfo.showLinkedin !== false) {
    socialItems.push(
      `<a href="${personalInfo.linkedin}" target="_blank" rel="noopener noreferrer" class="cv-link">${formatUrl(personalInfo.linkedin)}</a>`
    );
  }

  if (personalInfo.otherLinks && personalInfo.otherLinks.length > 0) {
    personalInfo.otherLinks
      .filter(l => l.url && l.showOnCv !== false)
      .forEach(l => {
        socialItems.push(
          `<a href="${l.url}" target="_blank" rel="noopener noreferrer" class="cv-link">${l.label ? `${l.label}: ` : ''}${formatUrl(l.url)}</a>`
        );
      });
  }

  // Section renderers
  const sectionRenderers = {
    education: () => {
      const visibleEdu = (data.education || []).filter(e => e.showOnCv !== false);
      if (visibleEdu.length === 0) return '';
      return `
        <section class="cv-section" data-section="education">
          <h2 class="cv-section-title">EDUCATION</h2>
          <hr class="cv-section-hr" />
          <div class="cv-entries">
            ${visibleEdu.map(edu => `
              <div class="cv-entry">
                <div class="cv-row">
                  <span class="cv-bold text-lg">${edu.institution || ''}</span>
                  <span class="cv-right text-gray">${edu.location || ''}</span>
                </div>
                <div class="cv-row">
                  <span class="cv-italic">${edu.degree || ''}${edu.grade ? ` — <span class="cv-grade">${edu.grade}</span>` : ''}</span>
                  <span class="cv-right cv-italic text-gray">${edu.startDate || ''} ${edu.startDate && edu.endDate ? '–' : ''} ${edu.endDate || ''}</span>
                </div>
                ${edu.coursework ? `
                  <ul class="cv-bullets">
                    <li><span class="cv-semibold">Relevant Coursework:</span> ${edu.coursework}</li>
                  </ul>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </section>
      `;
    },

    skills: () => {
      const visibleStacks = (data.skillStacks || []).filter(s => s.showOnCv !== false);
      if (visibleStacks.length === 0) return '';
      return `
        <section class="cv-section" data-section="skills">
          <h2 class="cv-section-title">TECHNICAL SKILLS</h2>
          <hr class="cv-section-hr" />
          <div class="cv-skills-list">
            ${visibleStacks.map(stack => `
              <div class="cv-skill-row">
                <span class="cv-bold">${stack.categoryName}:</span>
                <span class="cv-skill-content">${stack.skills}</span>
              </div>
            `).join('')}
          </div>
        </section>
      `;
    },

    experience: () => {
      const visibleExp = (data.experience || []).filter(e => e.showOnCv !== false);
      if (visibleExp.length === 0) return '';
      return `
        <section class="cv-section" data-section="experience">
          <h2 class="cv-section-title">EXPERIENCE</h2>
          <hr class="cv-section-hr" />
          <div class="cv-entries">
            ${visibleExp.map(exp => `
              <div class="cv-entry">
                <div class="cv-row">
                  <span class="cv-bold text-lg">${exp.company || ''}</span>
                  <span class="cv-right text-gray">${exp.location || ''}</span>
                </div>
                <div class="cv-row">
                  <span class="cv-italic">${exp.role || ''}</span>
                  <span class="cv-right cv-italic text-gray">${exp.startDate || ''} ${exp.startDate && exp.endDate ? '–' : ''} ${exp.endDate || ''}</span>
                </div>
                ${exp.bullets && exp.bullets.length > 0 ? `
                  <ul class="cv-bullets">
                    ${exp.bullets.filter(b => b && b.trim()).map(b => `<li>${b}</li>`).join('')}
                  </ul>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </section>
      `;
    },

    projects: () => {
      const visibleProjects = (data.projects || []).filter(p => p.showOnCv !== false);
      if (visibleProjects.length === 0) return '';
      return `
        <section class="cv-section" data-section="projects">
          <h2 class="cv-section-title">PROJECTS</h2>
          <hr class="cv-section-hr" />
          <div class="cv-entries">
            ${visibleProjects.map(proj => {
              const links = [];
              if (proj.githubUrl && proj.showGithub !== false && proj.githubUrl.trim() !== '' && proj.githubUrl.trim() !== 'https://...') {
                links.push(`<a href="${proj.githubUrl.trim()}" target="_blank" rel="noopener noreferrer" class="cv-link">GitHub</a>`);
              }
              if (proj.liveUrl && proj.showLive !== false && proj.liveUrl.trim() !== '' && proj.liveUrl.trim() !== 'https://...') {
                links.push(`<a href="${proj.liveUrl.trim()}" target="_blank" rel="noopener noreferrer" class="cv-link">Live Demo</a>`);
              }

              return `
                <div class="cv-entry">
                  <div class="cv-row">
                    <span class="cv-bold text-lg">${proj.title || ''}</span>
                    ${links.length > 0 ? `<span class="cv-right cv-links-inline">${links.join(' | ')}</span>` : ''}
                  </div>
                  ${proj.technologies ? `
                    <div class="cv-tech-row">
                      <span class="cv-semibold">Technologies:</span> ${proj.technologies}
                    </div>
                  ` : ''}
                  ${proj.bullets && proj.bullets.length > 0 ? `
                    <ul class="cv-bullets">
                      ${proj.bullets.filter(b => b && b.trim()).map(b => `<li>${b}</li>`).join('')}
                    </ul>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </section>
      `;
    },

    publications: () => {
      const visiblePubs = (data.publications || []).filter(p => p.showOnCv !== false);
      if (visiblePubs.length === 0) return '';
      return `
        <section class="cv-section" data-section="publications">
          <h2 class="cv-section-title">PUBLICATIONS & RESEARCH</h2>
          <hr class="cv-section-hr" />
          <div class="cv-entries">
            ${visiblePubs.map(pub => `
              <div class="cv-entry">
                <div class="cv-row">
                  <span class="cv-bold">${pub.title}</span>
                  <span class="cv-right cv-italic text-gray">${pub.year || ''}</span>
                </div>
                <div class="cv-row">
                  <span class="cv-italic text-gray">${pub.authors || ''}</span>
                  ${pub.link ? `<span class="cv-right"><a href="${pub.link}" target="_blank" rel="noopener noreferrer" class="cv-link">View Paper</a></span>` : ''}
                </div>
                ${pub.venue ? `<div class="cv-pub-venue">${pub.venue}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </section>
      `;
    },

    certificates: () => {
      const visibleCerts = (data.certificates || []).filter(c => c.showOnCv !== false);
      if (visibleCerts.length === 0) return '';
      return `
        <section class="cv-section" data-section="certificates">
          <h2 class="cv-section-title">CERTIFICATIONS</h2>
          <hr class="cv-section-hr" />
          <div class="cv-entries">
            ${visibleCerts.map(cert => {
              const viewUrl = cert.certificateUrl || cert.credentialUrl;
              const cleanUrl = (viewUrl && viewUrl.trim() && viewUrl.trim() !== 'https://...') ? viewUrl.trim() : '';

              return `
                <div class="cv-entry cv-cert-entry">
                  <div class="cv-row">
                    <span>
                      <span class="cv-bold">${cert.name}</span>${cert.issuer ? ` — ${cert.issuer}` : ''}
                    </span>
                    <span class="cv-right cv-italic text-gray">${cert.date || ''}</span>
                  </div>
                  ${cleanUrl ? `
                    <div class="cv-cert-subline">
                      <a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="cv-link">Credential</a>
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </section>
      `;
    },

    awards: () => {
      const visibleAwards = (data.awards || []).filter(a => a.showOnCv !== false);
      if (visibleAwards.length === 0) return '';
      return `
        <section class="cv-section" data-section="awards">
          <h2 class="cv-section-title">AWARDS & ACHIEVEMENTS</h2>
          <hr class="cv-section-hr" />
          <div class="cv-entries">
            ${visibleAwards.map(award => `
              <div class="cv-entry cv-award-entry">
                <div class="cv-row">
                  <span class="cv-bold">${award.title}</span>
                  <span class="cv-right cv-italic text-gray">${award.year || ''}</span>
                </div>
                <div class="cv-award-desc">
                  ${award.organization ? `<span class="cv-italic">${award.organization}: </span>` : ''}
                  ${award.description || ''}
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      `;
    },

    custom: () => {
      const visibleSections = (data.customSections || []).filter(s => s.showOnCv !== false);
      if (visibleSections.length === 0) return '';
      return visibleSections.map(sec => `
        <section class="cv-section" data-section="custom-${sec.id}">
          <h2 class="cv-section-title">${sec.title || 'ADDITIONAL SECTION'}</h2>
          <hr class="cv-section-hr" />
          <div class="cv-entries">
            ${sec.items.map(item => `
              <div class="cv-entry">
                <div class="cv-row">
                  <span class="cv-bold">${item.heading}</span>
                  <span class="cv-right cv-italic text-gray">${item.date || ''}</span>
                </div>
                ${item.subHeading ? `<div class="cv-italic text-gray">${item.subHeading}</div>` : ''}
                ${item.description ? `<p class="cv-custom-desc">${item.description}</p>` : ''}
              </div>
            `).join('')}
          </div>
        </section>
      `).join('');
    }
  };

  // Render ordered sections (skip hidden sections)
  const renderedSections = sectionOrder
    .map(key => {
      if (hiddenSections.includes(key)) return '';
      if (sectionRenderers[key]) {
        return sectionRenderers[key]();
      }
      return '';
    })
    .join('');

  const html = `
    <div id="cv-document" class="cv-document ${fontClass} ${spacingClass} ${sizeClass}" style="--cv-accent: ${settings.accentColor || '#111827'};">
      <header class="cv-header">
        <h1 class="cv-name">${personalInfo.fullName || 'YOUR NAME'}</h1>
        ${personalInfo.headline ? `<div class="cv-headline">${personalInfo.headline}</div>` : ''}
        <div class="cv-contact-line">
          ${contactItems.join(' <span class="cv-separator">|</span> ')}
        </div>
        ${socialItems.length > 0 ? `
          <div class="cv-contact-line cv-social-line">
            ${socialItems.join(' <span class="cv-separator">|</span> ')}
          </div>
        ` : ''}
      </header>

      <main class="cv-body">
        ${renderedSections}
      </main>
    </div>
  `;

  containerEl.innerHTML = html;
}

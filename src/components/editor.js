import { resumeState } from '../state.js';

const SECTION_LABELS = {
  education: '🎓 Education',
  skills: '⚡ Skills',
  experience: '💼 Experience',
  projects: '🚀 Projects',
  certificates: '📜 Certifications',
  awards: '🏆 Awards',
  publications: '📄 Publications',
  custom: '🧩 Extracurricular'
};

const activeOpenAccordions = new Set(['personal']);
let _editorListenerController = null;

export function renderEditor(containerEl, focusTargetId = null) {
  // Capture currently open accordions from existing DOM if any
  const existingAccordions = containerEl.querySelectorAll('.accordion-item');
  if (existingAccordions.length > 0) {
    existingAccordions.forEach(el => {
      const key = el.dataset.accordion;
      if (key) {
        if (el.classList.contains('open')) {
          activeOpenAccordions.add(key);
        } else {
          activeOpenAccordions.delete(key);
        }
      }
    });
  }

  // Preserve scroll position
  const savedScrollTop = containerEl.scrollTop;

  const data = resumeState.getData();
  const hiddenSections = data.settings.hiddenSections || [];
  const isOpen = (key) => activeOpenAccordions.has(key) ? 'open' : '';

  const html = `
    <div class="editor-container">
      <!-- Section Reordering & Layout Quick Bar -->
      <div class="editor-quickbar">
        <span class="quickbar-title">Resume Editor & Controls</span>
        <button type="button" class="btn-sm btn-ghost" id="btn-toggle-all-accordions" title="Expand/Collapse All">
          Toggle All
        </button>
      </div>

      <!-- Section Reorder Draggable Bar -->
      <div class="section-reorder-bar">
        <div class="reorder-bar-header">
          <span>⠿ Section Order on CV (Drag pills to reorder sections):</span>
        </div>
        <div id="section-pills-list" class="section-pills-list sortable-sections">
          ${(data.sectionOrder || []).map(secKey => {
            const isHidden = hiddenSections.includes(secKey);
            const secName = SECTION_LABELS[secKey] || secKey.toUpperCase();
            return `
              <div class="section-pill ${isHidden ? 'is-hidden-pill' : ''}" data-sec-key="${secKey}" draggable="true" title="Drag to reorder section on CV">
                <span class="drag-pill-handle">⠿</span>
                <span class="pill-name">${secName}</span>
                ${isHidden ? '<span class="pill-hidden-dot" title="Hidden on CV">🚫</span>' : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 1. PERSONAL INFO ACCORDION -->
      <div class="accordion-item ${isOpen('personal')}" data-accordion="personal">
        <div class="accordion-header">
          <div class="accordion-title">
            <span class="accordion-icon">👤</span>
            <span>Personal Information</span>
          </div>
          <span class="accordion-chevron">▾</span>
        </div>
        <div class="accordion-content">
          <div class="form-grid">
            <div class="form-group full-width">
              <label>Full Name</label>
              <input type="text" class="form-input" data-bind="personalInfo.fullName" value="${escapeHtml(data.personalInfo.fullName || '')}" placeholder="e.g. MD. SHAHIDUR RAHMAN" />
            </div>
            <div class="form-group full-width">
              <label>Professional Headline / Title</label>
              <input type="text" class="form-input" data-bind="personalInfo.headline" value="${escapeHtml(data.personalInfo.headline || '')}" placeholder="e.g. Full-Stack Software Engineer & Systems Developer" />
            </div>
            <div class="form-group">
              <label>Phone Number</label>
              <input type="text" class="form-input" data-bind="personalInfo.phone" value="${escapeHtml(data.personalInfo.phone || '')}" placeholder="e.g. +880 1735 838381" />
            </div>
            <div class="form-group">
              <label>Location</label>
              <input type="text" class="form-input" data-bind="personalInfo.location" value="${escapeHtml(data.personalInfo.location || '')}" placeholder="e.g. Khulna, Bangladesh" />
            </div>
          </div>

          <!-- Multiple Emails Section -->
          <div class="sub-section">
            <div class="sub-section-header">
              <label class="sub-section-label">Email Addresses (Toggle which appear on CV)</label>
              <button type="button" class="btn-xs btn-outline" id="btn-add-email">+ Add Email</button>
            </div>
            <div id="emails-list" class="dynamic-list">
              ${(data.personalInfo.emails || []).map(emailItem => `
                <div class="multi-row-item email-row-item" data-email-id="${emailItem.id}">
                  <label class="checkbox-badge" title="Include this email on CV">
                    <input type="checkbox" class="email-toggle-cv" ${emailItem.showOnCv !== false ? 'checked' : ''} />
                    <span>On CV</span>
                  </label>
                  <input type="text" class="form-input input-label email-label-input" value="${escapeHtml(emailItem.label || '')}" placeholder="Label (e.g. Primary)" />
                  <input type="email" class="form-input email-value-input" value="${escapeHtml(emailItem.email || '')}" placeholder="email@address.com" />
                  <button type="button" class="btn-icon btn-danger btn-delete-email" title="Remove Email">×</button>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Online Profiles & Social Links -->
          <div class="form-grid mt-3">
            <div class="form-group">
              <div class="field-header-row">
                <label>Portfolio / Website</label>
                <label class="checkbox-mini" title="Show on CV">
                  <input type="checkbox" class="profile-toggle" data-field="showWebsite" ${data.personalInfo.showWebsite !== false ? 'checked' : ''} />
                  <span>On CV</span>
                </label>
              </div>
              <input type="url" class="form-input" data-bind="personalInfo.website" value="${escapeHtml(data.personalInfo.website || '')}" placeholder="https://shahidur.dev" />
            </div>
            <div class="form-group">
              <div class="field-header-row">
                <label>LinkedIn Profile</label>
                <label class="checkbox-mini" title="Show on CV">
                  <input type="checkbox" class="profile-toggle" data-field="showLinkedin" ${data.personalInfo.showLinkedin !== false ? 'checked' : ''} />
                  <span>On CV</span>
                </label>
              </div>
              <input type="url" class="form-input" data-bind="personalInfo.linkedin" value="${escapeHtml(data.personalInfo.linkedin || '')}" placeholder="https://www.linkedin.com/in/shahidur8381" />
            </div>
            <div class="form-group">
              <div class="field-header-row">
                <label>GitHub Profile</label>
                <label class="checkbox-mini" title="Show on CV">
                  <input type="checkbox" class="profile-toggle" data-field="showGithub" ${data.personalInfo.showGithub !== false ? 'checked' : ''} />
                  <span>On CV</span>
                </label>
              </div>
              <input type="url" class="form-input" data-bind="personalInfo.github" value="${escapeHtml(data.personalInfo.github || '')}" placeholder="https://github.com/shahidur8381" />
            </div>
          </div>

          <!-- Other Custom Links (LeetCode, Codeforces, etc.) -->
          <div class="sub-section mt-3">
            <div class="sub-section-header">
              <label class="sub-section-label">Additional Profiles (LeetCode, Codeforces, etc.)</label>
              <button type="button" class="btn-xs btn-outline" id="btn-add-other-link">+ Add Link</button>
            </div>
            <div id="other-links-list" class="dynamic-list">
              ${(data.personalInfo.otherLinks || []).map(l => `
                <div class="multi-row-item" data-link-id="${l.id}">
                  <label class="checkbox-badge" title="Include this link on CV">
                    <input type="checkbox" class="link-toggle-cv" ${l.showOnCv !== false ? 'checked' : ''} />
                    <span>On CV</span>
                  </label>
                  <input type="text" class="form-input input-label link-label-input" value="${escapeHtml(l.label || '')}" placeholder="Label (e.g. LeetCode)" />
                  <input type="url" class="form-input link-url-input" value="${escapeHtml(l.url || '')}" placeholder="https://..." />
                  <button type="button" class="btn-icon btn-danger btn-delete-link" title="Remove Link">×</button>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- 2. EDUCATION ACCORDION -->
      <div class="accordion-item ${isOpen('education')} ${hiddenSections.includes('education') ? 'sec-hidden' : ''}" data-accordion="education">
        <div class="accordion-header">
          <div class="accordion-title">
            <span class="accordion-icon">🎓</span>
            <span>Education (${(data.education || []).length})</span>
            ${hiddenSections.includes('education') ? '<span class="sec-hidden-badge">Hidden on CV</span>' : ''}
          </div>
          <div class="accordion-actions-right">
            <button type="button" class="btn-sec-toggle ${hiddenSections.includes('education') ? 'is-off' : 'is-on'}" data-sec-key="education" title="Toggle Education Section On/Off on CV">
              ${hiddenSections.includes('education') ? '🚫 Hidden' : '👁️ Shown'}
            </button>
            <span class="accordion-chevron">▾</span>
          </div>
        </div>
        <div class="accordion-content">
          <div id="education-list" class="cards-list sortable-list" data-collection="education">
            ${(data.education || []).map(edu => `
              <div class="card-item ${edu.showOnCv === false ? 'item-disabled' : ''}" data-edu-id="${edu.id}">
                <div class="card-item-header">
                  <div class="card-item-title-wrap">
                    <span class="card-drag-handle" title="Drag to reorder education">⠿</span>
                    <span class="card-item-title">${escapeHtml(edu.institution || 'New Institution')}</span>
                  </div>
                  <div class="card-item-actions">
                    <label class="checkbox-badge">
                      <input type="checkbox" class="item-toggle-cv" data-collection="education" ${edu.showOnCv !== false ? 'checked' : ''} />
                      <span>On CV</span>
                    </label>
                    <button type="button" class="btn-xs btn-danger btn-delete-edu">Delete</button>
                  </div>
                </div>
                <div class="form-grid">
                  <div class="form-group">
                    <label>Institution Name</label>
                    <input type="text" class="form-input edu-input" data-field="institution" value="${escapeHtml(edu.institution || '')}" placeholder="KUET" />
                  </div>
                  <div class="form-group">
                    <label>Location</label>
                    <input type="text" class="form-input edu-input" data-field="location" value="${escapeHtml(edu.location || '')}" placeholder="Khulna, Bangladesh" />
                  </div>
                  <div class="form-group full-width">
                    <label>Degree / Certificate Title</label>
                    <input type="text" class="form-input edu-input" data-field="degree" value="${escapeHtml(edu.degree || '')}" placeholder="B.Sc. in Computer Science and Engineering" />
                  </div>
                  <div class="form-group">
                    <label>Start Year</label>
                    <input type="text" class="form-input edu-input" data-field="startDate" value="${escapeHtml(edu.startDate || '')}" placeholder="2023" />
                  </div>
                  <div class="form-group">
                    <label>End Year / Expected</label>
                    <input type="text" class="form-input edu-input" data-field="endDate" value="${escapeHtml(edu.endDate || '')}" placeholder="Present (Exp. 2027)" />
                  </div>
                  <div class="form-group full-width">
                    <label>Standing / Grade</label>
                    <input type="text" class="form-input edu-input" data-field="grade" value="${escapeHtml(edu.grade || '')}" placeholder="3rd Year Undergraduate / GPA 5.00" />
                  </div>
                  <div class="form-group full-width">
                    <label>Relevant Coursework (Comma separated)</label>
                    <textarea class="form-textarea edu-input" data-field="coursework" rows="2" placeholder="Data Structures, Algorithms...">${escapeHtml(edu.coursework || '')}</textarea>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
          <button type="button" class="btn-sm btn-outline mt-3" id="btn-add-education">+ Add Degree / Education</button>
        </div>
      </div>

      <!-- 3. TECHNICAL SKILLS STACKS ACCORDION -->
      <div class="accordion-item ${isOpen('skills')} ${hiddenSections.includes('skills') ? 'sec-hidden' : ''}" data-accordion="skills">
        <div class="accordion-header">
          <div class="accordion-title">
            <span class="accordion-icon">⚡</span>
            <span>Technical Skills & Stacks (${(data.skillStacks || []).length})</span>
            ${hiddenSections.includes('skills') ? '<span class="sec-hidden-badge">Hidden on CV</span>' : ''}
          </div>
          <div class="accordion-actions-right">
            <button type="button" class="btn-sec-toggle ${hiddenSections.includes('skills') ? 'is-off' : 'is-on'}" data-sec-key="skills" title="Toggle Skills Section On/Off on CV">
              ${hiddenSections.includes('skills') ? '🚫 Hidden' : '👁️ Shown'}
            </button>
            <span class="accordion-chevron">▾</span>
          </div>
        </div>
        <div class="accordion-content">
          <div id="skills-stacks-list" class="cards-list sortable-list" data-collection="skillStacks">
            ${(data.skillStacks || []).map(stack => `
              <div class="card-item ${stack.showOnCv === false ? 'item-disabled' : ''}" data-stack-id="${stack.id}">
                <div class="card-item-header">
                  <div class="card-item-title-wrap">
                    <span class="card-drag-handle" title="Drag to reorder skill stack">⠿</span>
                    <span class="card-item-title">${escapeHtml(stack.categoryName || 'New Skill Stack')}</span>
                  </div>
                  <div class="card-item-actions">
                    <label class="checkbox-badge">
                      <input type="checkbox" class="item-toggle-cv" data-collection="skillStacks" ${stack.showOnCv !== false ? 'checked' : ''} />
                      <span>On CV</span>
                    </label>
                    <button type="button" class="btn-xs btn-danger btn-delete-stack">Delete</button>
                  </div>
                </div>
                <div class="form-grid">
                  <div class="form-group">
                    <label>Stack Category Name</label>
                    <input type="text" class="form-input stack-input" data-field="categoryName" value="${escapeHtml(stack.categoryName || '')}" placeholder="e.g. Languages" />
                  </div>
                  <div class="form-group full-width">
                    <label>Skills / Tools (Comma-separated)</label>
                    <input type="text" class="form-input stack-input" data-field="skills" value="${escapeHtml(stack.skills || '')}" placeholder="React, Node.js..." />
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
          <button type="button" class="btn-sm btn-outline mt-3" id="btn-add-skill-stack">+ Add Skill Stack Category</button>
        </div>
      </div>

      <!-- 4. WORK EXPERIENCE ACCORDION -->
      <div class="accordion-item ${isOpen('experience')} ${hiddenSections.includes('experience') ? 'sec-hidden' : ''}" data-accordion="experience">
        <div class="accordion-header">
          <div class="accordion-title">
            <span class="accordion-icon">💼</span>
            <span>Work Experience (${(data.experience || []).length})</span>
            ${hiddenSections.includes('experience') ? '<span class="sec-hidden-badge">Hidden on CV</span>' : ''}
          </div>
          <div class="accordion-actions-right">
            <button type="button" class="btn-sec-toggle ${hiddenSections.includes('experience') ? 'is-off' : 'is-on'}" data-sec-key="experience" title="Toggle Experience Section On/Off on CV">
              ${hiddenSections.includes('experience') ? '🚫 Hidden' : '👁️ Shown'}
            </button>
            <span class="accordion-chevron">▾</span>
          </div>
        </div>
        <div class="accordion-content">
          <div id="experience-list" class="cards-list sortable-list" data-collection="experience">
            ${(data.experience || []).map(exp => `
              <div class="card-item ${exp.showOnCv === false ? 'item-disabled' : ''}" data-exp-id="${exp.id}">
                <div class="card-item-header">
                  <div class="card-item-title-wrap">
                    <span class="card-drag-handle" title="Drag to reorder experience">⠿</span>
                    <span class="card-item-title">${escapeHtml(exp.role || 'Role')} @ ${escapeHtml(exp.company || 'Company')}</span>
                  </div>
                  <div class="card-item-actions">
                    <label class="checkbox-badge">
                      <input type="checkbox" class="item-toggle-cv" data-collection="experience" ${exp.showOnCv !== false ? 'checked' : ''} />
                      <span>On CV</span>
                    </label>
                    <button type="button" class="btn-xs btn-danger btn-delete-exp">Delete</button>
                  </div>
                </div>
                <div class="form-grid">
                  <div class="form-group">
                    <label>Company / Organization</label>
                    <input type="text" class="form-input exp-input" data-field="company" value="${escapeHtml(exp.company || '')}" placeholder="FlyRank AI / DecodeLab" />
                  </div>
                  <div class="form-group">
                    <label>Job Title / Role</label>
                    <input type="text" class="form-input exp-input" data-field="role" value="${escapeHtml(exp.role || '')}" placeholder="Backend AI Engineer Intern" />
                  </div>
                  <div class="form-group">
                    <label>Location</label>
                    <input type="text" class="form-input exp-input" data-field="location" value="${escapeHtml(exp.location || '')}" placeholder="Remote / Khulna" />
                  </div>
                  <div class="form-group">
                    <label>Dates (Start – End)</label>
                    <div class="dual-inputs">
                      <input type="text" class="form-input exp-input" data-field="startDate" value="${escapeHtml(exp.startDate || '')}" placeholder="Jul 2026" />
                      <input type="text" class="form-input exp-input" data-field="endDate" value="${escapeHtml(exp.endDate || '')}" placeholder="Oct 2026 / Present" />
                    </div>
                  </div>
                </div>

                <!-- Bullets list -->
                <div class="bullets-manager mt-3">
                  <label class="sub-section-label">Impact Bullet Points</label>
                  <div class="bullets-container">
                    ${(exp.bullets || []).map((b, bIdx) => `
                      <div class="bullet-row" data-bullet-idx="${bIdx}">
                        <textarea class="form-textarea exp-bullet-input" rows="2" placeholder="Engineered scalable backend...">${escapeHtml(b)}</textarea>
                        <button type="button" class="btn-icon btn-danger btn-delete-exp-bullet" title="Remove Bullet">×</button>
                      </div>
                    `).join('')}
                  </div>
                  <button type="button" class="btn-xs btn-outline btn-add-exp-bullet mt-2">+ Add Bullet Point</button>
                </div>
              </div>
            `).join('')}
          </div>
          <button type="button" class="btn-sm btn-outline mt-3" id="btn-add-experience">+ Add Work Experience</button>
        </div>
      </div>

      <!-- 5. PROJECTS ACCORDION -->
      <div class="accordion-item ${isOpen('projects')} ${hiddenSections.includes('projects') ? 'sec-hidden' : ''}" data-accordion="projects">
        <div class="accordion-header">
          <div class="accordion-title">
            <span class="accordion-icon">🚀</span>
            <span>Projects (${(data.projects || []).length})</span>
            ${hiddenSections.includes('projects') ? '<span class="sec-hidden-badge">Hidden on CV</span>' : ''}
          </div>
          <div class="accordion-actions-right">
            <button type="button" class="btn-sec-toggle ${hiddenSections.includes('projects') ? 'is-off' : 'is-on'}" data-sec-key="projects" title="Toggle Projects Section On/Off on CV">
              ${hiddenSections.includes('projects') ? '🚫 Hidden' : '👁️ Shown'}
            </button>
            <span class="accordion-chevron">▾</span>
          </div>
        </div>
        <div class="accordion-content">
          <div class="help-box mb-3">
            💡 <strong>Link Toggles:</strong> Live demo deploy kora na thakle <strong>"Live Demo Link"</strong> er pashe <em>"Include Link"</em> uncheck kore din. Tahole CV-te sudhu GitHub link thakbe, broken/unavailable demo link show korbe na!
          </div>
          <div id="projects-list" class="cards-list sortable-list" data-collection="projects">
            ${(data.projects || []).map(proj => `
              <div class="card-item ${proj.showOnCv === false ? 'item-disabled' : ''}" data-proj-id="${proj.id}">
                <div class="card-item-header">
                  <div class="card-item-title-wrap">
                    <span class="card-drag-handle" title="Drag to reorder project">⠿</span>
                    <span class="card-item-title">${escapeHtml(proj.title || 'Project Name')}</span>
                  </div>
                  <div class="card-item-actions">
                    <label class="checkbox-badge" title="Show or hide this project on CV">
                      <input type="checkbox" class="item-toggle-cv" data-collection="projects" ${proj.showOnCv !== false ? 'checked' : ''} />
                      <span>On CV</span>
                    </label>
                    <button type="button" class="btn-xs btn-danger btn-delete-proj">Delete</button>
                  </div>
                </div>
                <div class="form-grid">
                  <div class="form-group full-width">
                    <label>Project Title</label>
                    <input type="text" class="form-input proj-input" data-field="title" value="${escapeHtml(proj.title || '')}" placeholder="OmniRoute..." />
                  </div>
                  <div class="form-group full-width">
                    <label>Technologies Used</label>
                    <input type="text" class="form-input proj-input" data-field="technologies" value="${escapeHtml(proj.technologies || '')}" placeholder="TypeScript, Node.js..." />
                  </div>
                  <div class="form-group">
                    <div class="field-header-row">
                      <label>GitHub Repository URL</label>
                      <label class="checkbox-mini" title="Enable or disable GitHub link on CV">
                        <input type="checkbox" class="proj-toggle-field" data-field="showGithub" ${proj.showGithub !== false ? 'checked' : ''} />
                        <span>Include</span>
                      </label>
                    </div>
                    <input type="url" class="form-input proj-input" data-field="githubUrl" value="${escapeHtml(proj.githubUrl || '')}" placeholder="https://github.com/..." />
                  </div>
                  <div class="form-group">
                    <div class="field-header-row">
                      <label>Live Demo URL</label>
                      <label class="checkbox-mini" title="Enable or disable Live Demo link on CV">
                        <input type="checkbox" class="proj-toggle-field" data-field="showLive" ${proj.showLive !== false ? 'checked' : ''} />
                        <span>Include</span>
                      </label>
                    </div>
                    <input type="url" class="form-input proj-input" data-field="liveUrl" value="${escapeHtml(proj.liveUrl || '')}" placeholder="https://..." />
                  </div>
                </div>

                <!-- Bullets list -->
                <div class="bullets-manager mt-3">
                  <label class="sub-section-label">Accomplishments & Metrics</label>
                  <div class="bullets-container">
                    ${(proj.bullets || []).map((b, bIdx) => `
                      <div class="bullet-row" data-bullet-idx="${bIdx}">
                        <textarea class="form-textarea proj-bullet-input" rows="2" placeholder="Developed product-level features...">${escapeHtml(b)}</textarea>
                        <button type="button" class="btn-icon btn-danger btn-delete-proj-bullet" title="Remove Bullet">×</button>
                      </div>
                    `).join('')}
                  </div>
                  <button type="button" class="btn-xs btn-outline btn-add-proj-bullet mt-2">+ Add Bullet Point</button>
                </div>
              </div>
            `).join('')}
          </div>
          <button type="button" class="btn-sm btn-outline mt-3" id="btn-add-project">+ Add Project</button>
        </div>
      </div>

      <!-- 6. PUBLICATIONS & RESEARCH ACCORDION -->
      <div class="accordion-item ${isOpen('publications')} ${hiddenSections.includes('publications') ? 'sec-hidden' : ''}" data-accordion="publications">
        <div class="accordion-header">
          <div class="accordion-title">
            <span class="accordion-icon">📚</span>
            <span>Publications & Research (${(data.publications || []).length})</span>
            ${hiddenSections.includes('publications') ? '<span class="sec-hidden-badge">Hidden on CV</span>' : ''}
          </div>
          <div class="accordion-actions-right">
            <button type="button" class="btn-sec-toggle ${hiddenSections.includes('publications') ? 'is-off' : 'is-on'}" data-sec-key="publications" title="Toggle Publications Section On/Off on CV">
              ${hiddenSections.includes('publications') ? '🚫 Hidden' : '👁️ Shown'}
            </button>
            <span class="accordion-chevron">▾</span>
          </div>
        </div>
        <div class="accordion-content">
          ${(data.publications || []).length === 0 ? `
            <div class="help-box mb-3">
              ℹ️ Apnar kono published research paper na thakle ei section-ti CV theke hide kora thakbe. Shudhu jodi future-e kono conference ba journal paper thake, tokhon add korte parben.
            </div>
          ` : ''}
          <div id="publications-list" class="cards-list sortable-list" data-collection="publications">
            ${(data.publications || []).map(pub => `
              <div class="card-item ${pub.showOnCv === false ? 'item-disabled' : ''}" data-pub-id="${pub.id}">
                <div class="card-item-header">
                  <div class="card-item-title-wrap">
                    <span class="card-drag-handle" title="Drag to reorder publication">⠿</span>
                    <span class="card-item-title">${escapeHtml(pub.title || 'Paper Title')}</span>
                  </div>
                  <div class="card-item-actions">
                    <label class="checkbox-badge">
                      <input type="checkbox" class="item-toggle-cv" data-collection="publications" ${pub.showOnCv !== false ? 'checked' : ''} />
                      <span>On CV</span>
                    </label>
                    <button type="button" class="btn-xs btn-danger btn-delete-pub">Delete</button>
                  </div>
                </div>
                <div class="form-grid">
                  <div class="form-group full-width">
                    <label>Paper Title</label>
                    <input type="text" class="form-input pub-input" data-field="title" value="${escapeHtml(pub.title || '')}" />
                  </div>
                  <div class="form-group">
                    <label>Authors</label>
                    <input type="text" class="form-input pub-input" data-field="authors" value="${escapeHtml(pub.authors || '')}" />
                  </div>
                  <div class="form-group">
                    <label>Year</label>
                    <input type="text" class="form-input pub-input" data-field="year" value="${escapeHtml(pub.year || '')}" />
                  </div>
                  <div class="form-group full-width">
                    <label>Venue</label>
                    <input type="text" class="form-input pub-input" data-field="venue" value="${escapeHtml(pub.venue || '')}" />
                  </div>
                  <div class="form-group full-width">
                    <label>Link / DOI</label>
                    <input type="url" class="form-input pub-input" data-field="link" value="${escapeHtml(pub.link || '')}" />
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
          <button type="button" class="btn-sm btn-outline mt-3" id="btn-add-publication">+ Add Publication</button>
        </div>
      </div>

      <!-- 7. CERTIFICATIONS ACCORDION -->
      <div class="accordion-item ${isOpen('certificates')} ${hiddenSections.includes('certificates') ? 'sec-hidden' : ''}" data-accordion="certificates">
        <div class="accordion-header">
          <div class="accordion-title">
            <span class="accordion-icon">📜</span>
            <span>Certifications (${(data.certificates || []).length})</span>
            ${hiddenSections.includes('certificates') ? '<span class="sec-hidden-badge">Hidden on CV</span>' : ''}
          </div>
          <div class="accordion-actions-right">
            <button type="button" class="btn-sec-toggle ${hiddenSections.includes('certificates') ? 'is-off' : 'is-on'}" data-sec-key="certificates" title="Toggle Certifications Section On/Off on CV">
              ${hiddenSections.includes('certificates') ? '🚫 Hidden' : '👁️ Shown'}
            </button>
            <span class="accordion-chevron">▾</span>
          </div>
        </div>
        <div class="accordion-content">
          <div id="certificates-list" class="cards-list sortable-list" data-collection="certificates">
            ${(data.certificates || []).map(cert => `
              <div class="card-item ${cert.showOnCv === false ? 'item-disabled' : ''}" data-cert-id="${cert.id}">
                <div class="card-item-header">
                  <div class="card-item-title-wrap">
                    <span class="card-drag-handle" title="Drag to reorder certificate">⠿</span>
                    <span class="card-item-title">${escapeHtml(cert.name || 'Certificate Name')}</span>
                  </div>
                  <div class="card-item-actions">
                    ${(cert.certificateUrl || cert.credentialUrl) ? `
                      <button type="button" class="btn-xs btn-cert-preview btn-editor-show-cert" data-url="${cert.certificateUrl || cert.credentialUrl}" data-name="${escapeHtml(cert.name || 'Certificate')}" data-issuer="${escapeHtml(cert.issuer || '')}" data-id="${escapeHtml(cert.certificateId || '')}" data-date="${escapeHtml(cert.date || '')}" title="Preview Certificate Document">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg>
                        <span>View Document</span>
                      </button>
                    ` : ''}
                    <label class="checkbox-badge">
                      <input type="checkbox" class="item-toggle-cv" data-collection="certificates" ${cert.showOnCv !== false ? 'checked' : ''} />
                      <span>On CV</span>
                    </label>
                    <button type="button" class="btn-xs btn-danger btn-delete-cert">Delete</button>
                  </div>
                </div>
                <div class="form-grid">
                  <div class="form-group full-width">
                    <label>Certificate Name</label>
                    <input type="text" class="form-input cert-input" data-field="name" value="${escapeHtml(cert.name || '')}" placeholder="Data Science Certification" />
                  </div>
                  <div class="form-group">
                    <label>Issuing Body</label>
                    <input type="text" class="form-input cert-input" data-field="issuer" value="${escapeHtml(cert.issuer || '')}" placeholder="Academic / Professional" />
                  </div>
                  <div class="form-group">
                    <label>Date / Year</label>
                    <input type="text" class="form-input cert-input" data-field="date" value="${escapeHtml(cert.date || '')}" placeholder="2024" />
                  </div>
                  <div class="form-group">
                    <label>Certificate ID / Student ID (Optional)</label>
                    <input type="text" class="form-input cert-input" data-field="certificateId" value="${escapeHtml(cert.certificateId || '')}" placeholder="e.g. CWH-123 / DA032662" />
                  </div>
                  <div class="form-group full-width">
                    <label>Certificate Document / Image File URL</label>
                    <div class="input-with-button">
                      <input type="text" class="form-input cert-input" data-field="certificateUrl" value="${escapeHtml(cert.certificateUrl || '')}" placeholder="e.g. /certificates/codewithharry_data_science.png or https://..." />
                      ${(cert.certificateUrl || cert.credentialUrl) ? `
                        <button type="button" class="btn-input-action btn-editor-show-cert" data-url="${cert.certificateUrl || cert.credentialUrl}" data-name="${escapeHtml(cert.name || 'Certificate')}" data-issuer="${escapeHtml(cert.issuer || '')}" data-id="${escapeHtml(cert.certificateId || '')}" data-date="${escapeHtml(cert.date || '')}" title="Preview Document">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                          <span>Preview</span>
                        </button>
                      ` : ''}
                    </div>
                  </div>
                  <div class="form-group full-width">
                    <label>Credential Verification URL (Optional)</label>
                    <input type="url" class="form-input cert-input" data-field="credentialUrl" value="${escapeHtml(cert.credentialUrl || '')}" placeholder="https://..." />
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
          <button type="button" class="btn-sm btn-outline mt-3" id="btn-add-certificate">+ Add Certification</button>
        </div>
      </div>

      <!-- 8. AWARDS & ACHIEVEMENTS ACCORDION -->
      <div class="accordion-item ${isOpen('awards')} ${hiddenSections.includes('awards') ? 'sec-hidden' : ''}" data-accordion="awards">
        <div class="accordion-header">
          <div class="accordion-title">
            <span class="accordion-icon">🏆</span>
            <span>Awards & Achievements (${(data.awards || []).length})</span>
            ${hiddenSections.includes('awards') ? '<span class="sec-hidden-badge">Hidden on CV</span>' : ''}
          </div>
          <div class="accordion-actions-right">
            <button type="button" class="btn-sec-toggle ${hiddenSections.includes('awards') ? 'is-off' : 'is-on'}" data-sec-key="awards" title="Toggle Awards Section On/Off on CV">
              ${hiddenSections.includes('awards') ? '🚫 Hidden' : '👁️ Shown'}
            </button>
            <span class="accordion-chevron">▾</span>
          </div>
        </div>
        <div class="accordion-content">
          <div id="awards-list" class="cards-list sortable-list" data-collection="awards">
            ${(data.awards || []).map(award => `
              <div class="card-item ${award.showOnCv === false ? 'item-disabled' : ''}" data-award-id="${award.id}">
                <div class="card-item-header">
                  <div class="card-item-title-wrap">
                    <span class="card-drag-handle" title="Drag to reorder award">⠿</span>
                    <span class="card-item-title">${escapeHtml(award.title || 'Award Title')}</span>
                  </div>
                  <div class="card-item-actions">
                    <label class="checkbox-badge">
                      <input type="checkbox" class="item-toggle-cv" data-collection="awards" ${award.showOnCv !== false ? 'checked' : ''} />
                      <span>On CV</span>
                    </label>
                    <button type="button" class="btn-xs btn-danger btn-delete-award">Delete</button>
                  </div>
                </div>
                <div class="form-grid">
                  <div class="form-group full-width">
                    <label>Award Title</label>
                    <input type="text" class="form-input award-input" data-field="title" value="${escapeHtml(award.title || '')}" placeholder="Bitfest KUET Winner" />
                  </div>
                  <div class="form-group">
                    <label>Organization / Event</label>
                    <input type="text" class="form-input award-input" data-field="organization" value="${escapeHtml(award.organization || '')}" placeholder="KUET CSE Department" />
                  </div>
                  <div class="form-group">
                    <label>Year</label>
                    <input type="text" class="form-input award-input" data-field="year" value="${escapeHtml(award.year || '')}" placeholder="2025" />
                  </div>
                  <div class="form-group full-width">
                    <label>Description / Context</label>
                    <textarea class="form-textarea award-input" data-field="description" rows="2" placeholder="Awarded 1st place in hackathon...">${escapeHtml(award.description || '')}</textarea>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
          <button type="button" class="btn-sm btn-outline mt-3" id="btn-add-award">+ Add Award / Honor</button>
        </div>
      </div>

      <!-- 9. CUSTOM SECTIONS ACCORDION -->
      <div class="accordion-item ${isOpen('custom')} ${hiddenSections.includes('custom') ? 'sec-hidden' : ''}" data-accordion="custom">
        <div class="accordion-header">
          <div class="accordion-title">
            <span class="accordion-icon">✨</span>
            <span>Custom Sections (${(data.customSections || []).length})</span>
            ${hiddenSections.includes('custom') ? '<span class="sec-hidden-badge">Hidden on CV</span>' : ''}
          </div>
          <div class="accordion-actions-right">
            <button type="button" class="btn-sec-toggle ${hiddenSections.includes('custom') ? 'is-off' : 'is-on'}" data-sec-key="custom" title="Toggle Custom Section On/Off on CV">
              ${hiddenSections.includes('custom') ? '🚫 Hidden' : '👁️ Shown'}
            </button>
            <span class="accordion-chevron">▾</span>
          </div>
        </div>
        <div class="accordion-content">
          <div id="custom-sections-list" class="cards-list sortable-list" data-collection="customSections">
            ${(data.customSections || []).map(sec => `
              <div class="card-item ${sec.showOnCv === false ? 'item-disabled' : ''}" data-custom-sec-id="${sec.id}">
                <div class="card-item-header">
                  <div class="card-item-title-wrap">
                    <span class="card-drag-handle" title="Drag to reorder section">⠿</span>
                    <span class="card-item-title">${escapeHtml(sec.title || 'Custom Section')}</span>
                  </div>
                  <div class="card-item-actions">
                    <label class="checkbox-badge">
                      <input type="checkbox" class="item-toggle-cv" data-collection="customSections" ${sec.showOnCv !== false ? 'checked' : ''} />
                      <span>On CV</span>
                    </label>
                    <button type="button" class="btn-xs btn-danger btn-delete-custom-sec">Delete Section</button>
                  </div>
                </div>
                <div class="form-group mb-3">
                  <label>Section Title (e.g. LEADERSHIP & EXTRACURRICULAR)</label>
                  <input type="text" class="form-input custom-sec-title-input" value="${escapeHtml(sec.title || '')}" />
                </div>
                <div class="sub-section">
                  <div class="sub-section-header">
                    <label class="sub-section-label">Section Entries</label>
                    <button type="button" class="btn-xs btn-outline btn-add-custom-item">+ Add Entry</button>
                  </div>
                  <div class="cards-list custom-items-container">
                    ${(sec.items || []).map(item => `
                      <div class="card-item sub-card" data-custom-item-id="${item.id}">
                        <div class="card-item-header">
                          <span class="card-item-title">${escapeHtml(item.heading || 'Entry')}</span>
                          <button type="button" class="btn-xs btn-danger btn-delete-custom-item">Delete</button>
                        </div>
                        <div class="form-grid">
                          <div class="form-group">
                            <label>Heading</label>
                            <input type="text" class="form-input custom-item-input" data-field="heading" value="${escapeHtml(item.heading || '')}" />
                          </div>
                          <div class="form-group">
                            <label>Role / Subheading</label>
                            <input type="text" class="form-input custom-item-input" data-field="subHeading" value="${escapeHtml(item.subHeading || '')}" />
                          </div>
                          <div class="form-group">
                            <label>Date / Period</label>
                            <input type="text" class="form-input custom-item-input" data-field="date" value="${escapeHtml(item.date || '')}" />
                          </div>
                          <div class="form-group full-width">
                            <label>Description</label>
                            <textarea class="form-textarea custom-item-input" data-field="description" rows="2">${escapeHtml(item.description || '')}</textarea>
                          </div>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
          <button type="button" class="btn-sm btn-outline mt-3" id="btn-add-custom-section">+ Add Custom Section</button>
        </div>
      </div>

      <!-- 10. SECTION ORDERING ACCORDION -->
      <div class="accordion-item ${isOpen('order')}" data-accordion="order">
        <div class="accordion-header">
          <div class="accordion-title">
            <span class="accordion-icon">⇅</span>
            <span>Section Order & Visibility</span>
          </div>
          <span class="accordion-chevron">▾</span>
        </div>
        <div class="accordion-content">
          <p class="section-order-help">Toggle visibility or reorder any section on your CV:</p>
          <div class="order-list">
            ${(data.sectionOrder || []).map((secKey, idx) => `
              <div class="order-row ${hiddenSections.includes(secKey) ? 'sec-row-hidden' : ''}" data-sec-idx="${idx}">
                <div class="order-left">
                  <span class="order-name">${formatSectionName(secKey)}</span>
                  ${hiddenSections.includes(secKey) ? '<span class="pill-hidden">Hidden</span>' : ''}
                </div>
                <div class="order-actions">
                  <button type="button" class="btn-xs btn-sec-toggle ${hiddenSections.includes(secKey) ? 'is-off' : 'is-on'}" data-sec-key="${secKey}">
                    ${hiddenSections.includes(secKey) ? '🚫 Hidden' : '👁️ Visible'}
                  </button>
                  <button type="button" class="btn-icon btn-move-up" ${idx === 0 ? 'disabled' : ''} title="Move Up">▲</button>
                  <button type="button" class="btn-icon btn-move-down" ${idx === data.sectionOrder.length - 1 ? 'disabled' : ''} title="Move Down">▼</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

    </div>
  `;

  containerEl.innerHTML = html;
  attachEditorListeners(containerEl);

  // Restore scroll position
  containerEl.scrollTop = savedScrollTop;

  // Auto-scroll and focus newly added item
  if (focusTargetId) {
    setTimeout(() => {
      const target = containerEl.querySelector(
        `[data-proj-id="${focusTargetId}"], [data-cert-id="${focusTargetId}"], [data-edu-id="${focusTargetId}"], [data-exp-id="${focusTargetId}"], [data-stack-id="${focusTargetId}"], [data-award-id="${focusTargetId}"], [data-pub-id="${focusTargetId}"], [data-custom-sec-id="${focusTargetId}"], [data-custom-item-id="${focusTargetId}"], [data-email-id="${focusTargetId}"], [data-link-id="${focusTargetId}"]`
      );
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        const input = target.querySelector('input:not([type="checkbox"]):not([disabled]), textarea:not([disabled])');
        if (input) input.focus();
      }
    }, 60);
  }
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatSectionName(key) {
  const map = {
    education: 'Education',
    skills: 'Technical Skills',
    experience: 'Work Experience',
    projects: 'Projects',
    publications: 'Publications & Research',
    certificates: 'Certifications',
    awards: 'Awards & Achievements',
    custom: 'Custom Sections'
  };
  return map[key] || key;
}

function attachEditorListeners(containerEl) {
  // Abort any previous listeners to prevent accumulation across re-renders
  if (_editorListenerController) {
    _editorListenerController.abort();
  }
  _editorListenerController = new AbortController();
  const signal = _editorListenerController.signal;

  // Accordion toggle (don't toggle if clicking on section visibility button)
  containerEl.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', (e) => {
      if (e.target.closest('.btn-sec-toggle')) return;
      const item = header.closest('.accordion-item');
      item.classList.toggle('open');
      const key = item.dataset.accordion;
      if (key) {
        if (item.classList.contains('open')) {
          activeOpenAccordions.add(key);
        } else {
          activeOpenAccordions.delete(key);
        }
      }
    });
  });

  // Toggle All accordions
  const btnToggleAll = containerEl.querySelector('#btn-toggle-all-accordions');
  if (btnToggleAll) {
    btnToggleAll.addEventListener('click', () => {
      const items = containerEl.querySelectorAll('.accordion-item');
      const anyOpen = Array.from(items).some(i => i.classList.contains('open'));
      items.forEach(i => {
        const key = i.dataset.accordion;
        if (anyOpen) {
          i.classList.remove('open');
          if (key) activeOpenAccordions.delete(key);
        } else {
          i.classList.add('open');
          if (key) activeOpenAccordions.add(key);
        }
      });
    });
  }

  // Section level visibility toggle
  containerEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-sec-toggle');
    if (btn) {
      const secKey = btn.dataset.secKey;
      resumeState.toggleSectionVisibility(secKey);
      renderEditor(containerEl);
    }
  }, { signal });

  // Generic Item on-CV toggle (projects, experience, education, skills, awards, etc.)
  containerEl.addEventListener('change', (e) => {
    if (e.target.matches('.item-toggle-cv')) {
      const coll = e.target.dataset.collection;
      const card = e.target.closest('.card-item');
      let id = null;
      if (coll === 'projects') id = card?.dataset.projId;
      else if (coll === 'experience') id = card?.dataset.expId;
      else if (coll === 'education') id = card?.dataset.eduId;
      else if (coll === 'skillStacks') id = card?.dataset.stackId;
      else if (coll === 'publications') id = card?.dataset.pubId;
      else if (coll === 'certificates') id = card?.dataset.certId;
      else if (coll === 'awards') id = card?.dataset.awardId;
      else if (coll === 'customSections') id = card?.dataset.customSecId;

      if (coll && id) {
        resumeState.toggleItemField(coll, id, 'showOnCv', e.target.checked);
        if (card) {
          if (!e.target.checked) card.classList.add('item-disabled');
          else card.classList.remove('item-disabled');
        }
      }
    }

    // Project field toggles: showGithub, showLive
    if (e.target.matches('.proj-toggle-field')) {
      const card = e.target.closest('[data-proj-id]');
      const field = e.target.dataset.field;
      if (card && field) {
        resumeState.toggleItemField('projects', card.dataset.projId, field, e.target.checked);
      }
    }

    // Profile field toggles: showWebsite, showLinkedin, showGithub
    if (e.target.matches('.profile-toggle')) {
      const field = e.target.dataset.field;
      if (field) {
        resumeState.updatePersonalInfo(field, e.target.checked);
      }
    }
  }, { signal });

  // Bind direct inputs in personal info
  containerEl.querySelectorAll('input[data-bind]').forEach(input => {
    input.addEventListener('input', (e) => {
      const bind = e.target.dataset.bind;
      const [obj, field] = bind.split('.');
      if (obj === 'personalInfo') {
        resumeState.updatePersonalInfo(field, e.target.value);
      }
    });
  });

  // Emails handling
  const btnAddEmail = containerEl.querySelector('#btn-add-email');
  if (btnAddEmail) {
    btnAddEmail.addEventListener('click', () => {
      activeOpenAccordions.add('personal');
      const newItem = resumeState.addEmail();
      renderEditor(containerEl, newItem?.id);
    });
  }

  containerEl.addEventListener('click', (e) => {
    if (e.target.matches('.btn-delete-email')) {
      const row = e.target.closest('[data-email-id]');
      if (row) {
        activeOpenAccordions.add('personal');
        resumeState.removeEmail(row.dataset.emailId);
        renderEditor(containerEl);
      }
    }
  }, { signal });

  containerEl.addEventListener('input', (e) => {
    if (e.target.matches('.email-label-input')) {
      const row = e.target.closest('[data-email-id]');
      if (row) resumeState.updateEmail(row.dataset.emailId, 'label', e.target.value);
    }
    if (e.target.matches('.email-value-input')) {
      const row = e.target.closest('[data-email-id]');
      if (row) resumeState.updateEmail(row.dataset.emailId, 'email', e.target.value);
    }
  }, { signal });

  containerEl.addEventListener('change', (e) => {
    if (e.target.matches('.email-toggle-cv')) {
      const row = e.target.closest('[data-email-id]');
      if (row) resumeState.updateEmailToggle(row.dataset.emailId, e.target.checked);
    }
    if (e.target.matches('.link-toggle-cv')) {
      const row = e.target.closest('[data-link-id]');
      if (row) {
        const link = resumeState.getData().personalInfo.otherLinks.find(l => l.id === row.dataset.linkId);
        if (link) {
          link.showOnCv = e.target.checked;
          resumeState.notify();
        }
      }
    }
  }, { signal });

  // Other links handling
  const btnAddOtherLink = containerEl.querySelector('#btn-add-other-link');
  if (btnAddOtherLink) {
    btnAddOtherLink.addEventListener('click', () => {
      activeOpenAccordions.add('personal');
      const newItem = resumeState.addOtherLink();
      renderEditor(containerEl, newItem?.id);
    });
  }

  containerEl.addEventListener('click', (e) => {
    if (e.target.matches('.btn-delete-link')) {
      const row = e.target.closest('[data-link-id]');
      if (row) {
        activeOpenAccordions.add('personal');
        resumeState.removeOtherLink(row.dataset.linkId);
        renderEditor(containerEl);
      }
    }
  }, { signal });

  containerEl.addEventListener('input', (e) => {
    if (e.target.matches('.link-label-input')) {
      const row = e.target.closest('[data-link-id]');
      if (row) resumeState.updateOtherLink(row.dataset.linkId, 'label', e.target.value);
    }
    if (e.target.matches('.link-url-input')) {
      const row = e.target.closest('[data-link-id]');
      if (row) resumeState.updateOtherLink(row.dataset.linkId, 'url', e.target.value);
    }
  }, { signal });

  // Education Handling
  const btnAddEducation = containerEl.querySelector('#btn-add-education');
  if (btnAddEducation) {
    btnAddEducation.addEventListener('click', () => {
      activeOpenAccordions.add('education');
      const newItem = resumeState.addEducation();
      renderEditor(containerEl, newItem?.id);
    });
  }

  containerEl.addEventListener('click', (e) => {
    if (e.target.matches('.btn-delete-edu')) {
      const card = e.target.closest('[data-edu-id]');
      if (card) {
        activeOpenAccordions.add('education');
        resumeState.removeEducation(card.dataset.eduId);
        renderEditor(containerEl);
      }
    }
  }, { signal });

  containerEl.addEventListener('input', (e) => {
    if (e.target.matches('.edu-input')) {
      const card = e.target.closest('[data-edu-id]');
      if (card) {
        resumeState.updateEducation(card.dataset.eduId, e.target.dataset.field, e.target.value);
        if (e.target.dataset.field === 'institution') {
          const title = card.querySelector('.card-item-title');
          if (title) title.textContent = e.target.value || 'New Institution';
        }
      }
    }
  }, { signal });

  // Skill Stacks Handling
  const btnAddSkillStack = containerEl.querySelector('#btn-add-skill-stack');
  if (btnAddSkillStack) {
    btnAddSkillStack.addEventListener('click', () => {
      activeOpenAccordions.add('skills');
      const newItem = resumeState.addSkillStack();
      renderEditor(containerEl, newItem?.id);
    });
  }

  containerEl.addEventListener('click', (e) => {
    if (e.target.matches('.btn-delete-stack')) {
      const card = e.target.closest('[data-stack-id]');
      if (card) {
        activeOpenAccordions.add('skills');
        resumeState.removeSkillStack(card.dataset.stackId);
        renderEditor(containerEl);
      }
    }
  }, { signal });

  containerEl.addEventListener('input', (e) => {
    if (e.target.matches('.stack-input')) {
      const card = e.target.closest('[data-stack-id]');
      if (card) {
        resumeState.updateSkillStack(card.dataset.stackId, e.target.dataset.field, e.target.value);
        if (e.target.dataset.field === 'categoryName') {
          const title = card.querySelector('.card-item-title');
          if (title) title.textContent = e.target.value || 'New Skill Stack';
        }
      }
    }
  }, { signal });

  // Experience Handling
  const btnAddExperience = containerEl.querySelector('#btn-add-experience');
  if (btnAddExperience) {
    btnAddExperience.addEventListener('click', () => {
      activeOpenAccordions.add('experience');
      const newItem = resumeState.addExperience();
      renderEditor(containerEl, newItem?.id);
    });
  }

  containerEl.addEventListener('click', (e) => {
    if (e.target.matches('.btn-delete-exp')) {
      const card = e.target.closest('[data-exp-id]');
      if (card) {
        activeOpenAccordions.add('experience');
        resumeState.removeExperience(card.dataset.expId);
        renderEditor(containerEl);
      }
    }
    if (e.target.matches('.btn-add-exp-bullet')) {
      const card = e.target.closest('[data-exp-id]');
      if (card) {
        activeOpenAccordions.add('experience');
        resumeState.addExperienceBullet(card.dataset.expId);
        renderEditor(containerEl, card.dataset.expId);
      }
    }
    if (e.target.matches('.btn-delete-exp-bullet')) {
      const card = e.target.closest('[data-exp-id]');
      const bulletRow = e.target.closest('[data-bullet-idx]');
      if (card && bulletRow) {
        activeOpenAccordions.add('experience');
        resumeState.removeExperienceBullet(card.dataset.expId, parseInt(bulletRow.dataset.bulletIdx, 10));
        renderEditor(containerEl, card.dataset.expId);
      }
    }
  }, { signal });

  containerEl.addEventListener('input', (e) => {
    if (e.target.matches('.exp-input')) {
      const card = e.target.closest('[data-exp-id]');
      if (card) {
        resumeState.updateExperience(card.dataset.expId, e.target.dataset.field, e.target.value);
      }
    }
    if (e.target.matches('.exp-bullet-input')) {
      const card = e.target.closest('[data-exp-id]');
      const bulletRow = e.target.closest('[data-bullet-idx]');
      if (card && bulletRow) {
        resumeState.updateExperienceBullet(card.dataset.expId, parseInt(bulletRow.dataset.bulletIdx, 10), e.target.value);
      }
    }
  }, { signal });

  // Projects Handling
  const btnAddProject = containerEl.querySelector('#btn-add-project');
  if (btnAddProject) {
    btnAddProject.addEventListener('click', () => {
      activeOpenAccordions.add('projects');
      const newItem = resumeState.addProject();
      renderEditor(containerEl, newItem?.id);
    });
  }

  containerEl.addEventListener('click', (e) => {
    if (e.target.matches('.btn-delete-proj')) {
      const card = e.target.closest('[data-proj-id]');
      if (card) {
        activeOpenAccordions.add('projects');
        resumeState.removeProject(card.dataset.projId);
        renderEditor(containerEl);
      }
    }
    if (e.target.matches('.btn-add-proj-bullet')) {
      const card = e.target.closest('[data-proj-id]');
      if (card) {
        activeOpenAccordions.add('projects');
        resumeState.addProjectBullet(card.dataset.projId);
        renderEditor(containerEl, card.dataset.projId);
      }
    }
    if (e.target.matches('.btn-delete-proj-bullet')) {
      const card = e.target.closest('[data-proj-id]');
      const bulletRow = e.target.closest('[data-bullet-idx]');
      if (card && bulletRow) {
        activeOpenAccordions.add('projects');
        resumeState.removeProjectBullet(card.dataset.projId, parseInt(bulletRow.dataset.bulletIdx, 10));
        renderEditor(containerEl, card.dataset.projId);
      }
    }
  }, { signal });

  containerEl.addEventListener('input', (e) => {
    if (e.target.matches('.proj-input')) {
      const card = e.target.closest('[data-proj-id]');
      if (card) {
        resumeState.updateProject(card.dataset.projId, e.target.dataset.field, e.target.value);
        if (e.target.dataset.field === 'title') {
          const title = card.querySelector('.card-item-title');
          if (title) title.textContent = e.target.value || 'Project Name';
        }
      }
    }
    if (e.target.matches('.proj-bullet-input')) {
      const card = e.target.closest('[data-proj-id]');
      const bulletRow = e.target.closest('[data-bullet-idx]');
      if (card && bulletRow) {
        resumeState.updateProjectBullet(card.dataset.projId, parseInt(bulletRow.dataset.bulletIdx, 10), e.target.value);
      }
    }
  }, { signal });

  // Publications Handling
  const btnAddPub = containerEl.querySelector('#btn-add-publication');
  if (btnAddPub) {
    btnAddPub.addEventListener('click', () => {
      activeOpenAccordions.add('publications');
      const newItem = resumeState.addPublication();
      renderEditor(containerEl, newItem?.id);
    });
  }

  containerEl.addEventListener('click', (e) => {
    if (e.target.matches('.btn-delete-pub')) {
      const card = e.target.closest('[data-pub-id]');
      if (card) {
        activeOpenAccordions.add('publications');
        resumeState.removePublication(card.dataset.pubId);
        renderEditor(containerEl);
      }
    }
  }, { signal });

  containerEl.addEventListener('input', (e) => {
    if (e.target.matches('.pub-input')) {
      const card = e.target.closest('[data-pub-id]');
      if (card) {
        resumeState.updatePublication(card.dataset.pubId, e.target.dataset.field, e.target.value);
        if (e.target.dataset.field === 'title') {
          const title = card.querySelector('.card-item-title');
          if (title) title.textContent = e.target.value || 'Paper Title';
        }
      }
    }
  }, { signal });

  // Certificates Handling
  const btnAddCert = containerEl.querySelector('#btn-add-certificate');
  if (btnAddCert) {
    btnAddCert.addEventListener('click', () => {
      activeOpenAccordions.add('certificates');
      const newItem = resumeState.addCertificate();
      renderEditor(containerEl, newItem?.id);
    });
  }

  containerEl.addEventListener('click', (e) => {
    if (e.target.matches('.btn-delete-cert')) {
      const card = e.target.closest('[data-cert-id]');
      if (card) {
        activeOpenAccordions.add('certificates');
        resumeState.removeCertificate(card.dataset.certId);
        renderEditor(containerEl);
      }
    }
  }, { signal });

  containerEl.addEventListener('input', (e) => {
    if (e.target.matches('.cert-input')) {
      const card = e.target.closest('[data-cert-id]');
      if (card) {
        resumeState.updateCertificate(card.dataset.certId, e.target.dataset.field, e.target.value);
        if (e.target.dataset.field === 'name') {
          const title = card.querySelector('.card-item-title');
          if (title) title.textContent = e.target.value || 'Certificate Name';
        }
      }
    }
  }, { signal });

  // Awards Handling
  const btnAddAward = containerEl.querySelector('#btn-add-award');
  if (btnAddAward) {
    btnAddAward.addEventListener('click', () => {
      activeOpenAccordions.add('awards');
      const newItem = resumeState.addAward();
      renderEditor(containerEl, newItem?.id);
    });
  }

  containerEl.addEventListener('click', (e) => {
    if (e.target.matches('.btn-delete-award')) {
      const card = e.target.closest('[data-award-id]');
      if (card) {
        activeOpenAccordions.add('awards');
        resumeState.removeAward(card.dataset.awardId);
        renderEditor(containerEl);
      }
    }
  }, { signal });

  containerEl.addEventListener('input', (e) => {
    if (e.target.matches('.award-input')) {
      const card = e.target.closest('[data-award-id]');
      if (card) {
        resumeState.updateAward(card.dataset.awardId, e.target.dataset.field, e.target.value);
        if (e.target.dataset.field === 'title') {
          const title = card.querySelector('.card-item-title');
          if (title) title.textContent = e.target.value || 'Award Title';
        }
      }
    }
  }, { signal });

  // Custom Sections Handling
  const btnAddCustomSec = containerEl.querySelector('#btn-add-custom-section');
  if (btnAddCustomSec) {
    btnAddCustomSec.addEventListener('click', () => {
      activeOpenAccordions.add('custom');
      const newItem = resumeState.addCustomSection();
      renderEditor(containerEl, newItem?.id);
    });
  }

  containerEl.addEventListener('click', (e) => {
    if (e.target.matches('.btn-delete-custom-sec')) {
      const card = e.target.closest('[data-custom-sec-id]');
      if (card) {
        activeOpenAccordions.add('custom');
        resumeState.removeCustomSection(card.dataset.customSecId);
        renderEditor(containerEl);
      }
    }
    if (e.target.matches('.btn-add-custom-item')) {
      const card = e.target.closest('[data-custom-sec-id]');
      if (card) {
        activeOpenAccordions.add('custom');
        const newItem = resumeState.addCustomItem(card.dataset.customSecId);
        renderEditor(containerEl, newItem?.id || card.dataset.customSecId);
      }
    }
    if (e.target.matches('.btn-delete-custom-item')) {
      const secCard = e.target.closest('[data-custom-sec-id]');
      const itemCard = e.target.closest('[data-custom-item-id]');
      if (secCard && itemCard) {
        activeOpenAccordions.add('custom');
        resumeState.removeCustomItem(secCard.dataset.customSecId, itemCard.dataset.customItemId);
        renderEditor(containerEl, secCard.dataset.customSecId);
      }
    }
  }, { signal });

  containerEl.addEventListener('input', (e) => {
    if (e.target.matches('.custom-sec-title-input')) {
      const card = e.target.closest('[data-custom-sec-id]');
      if (card) {
        resumeState.updateCustomSection(card.dataset.customSecId, 'title', e.target.value);
      }
    }
    if (e.target.matches('.custom-item-input')) {
      const secCard = e.target.closest('[data-custom-sec-id]');
      const itemCard = e.target.closest('[data-custom-item-id]');
      if (secCard && itemCard) {
        resumeState.updateCustomItem(secCard.dataset.customSecId, itemCard.dataset.customItemId, e.target.dataset.field, e.target.value);
      }
    }
  }, { signal });

  // Reorder Sections Handling
  containerEl.addEventListener('click', (e) => {
    if (e.target.matches('.btn-move-up')) {
      const row = e.target.closest('[data-sec-idx]');
      if (row) {
        resumeState.moveSection(parseInt(row.dataset.secIdx, 10), -1);
        renderEditor(containerEl);
      }
    }
    if (e.target.matches('.btn-move-down')) {
      const row = e.target.closest('[data-sec-idx]');
      if (row) {
        resumeState.moveSection(parseInt(row.dataset.secIdx, 10), 1);
        renderEditor(containerEl);
      }
    }
  }, { signal });

  // Initialize Drag and Drop sorting
  initDragAndDrop(containerEl);
}

function initDragAndDrop(containerEl) {
  // 1. Item-level sorting within collections (education, projects, experience, skills, certs, awards)
  const sortableLists = containerEl.querySelectorAll('.sortable-list');

  sortableLists.forEach(list => {
    const collection = list.dataset.collection;
    let draggedCard = null;

    // Enable draggable only when mouse is pressed down on .card-drag-handle
    list.addEventListener('mousedown', (e) => {
      const handle = e.target.closest('.card-drag-handle');
      if (handle) {
        const card = handle.closest('.card-item');
        if (card) {
          card.setAttribute('draggable', 'true');
        }
      }
    });

    list.addEventListener('mouseup', () => {
      list.querySelectorAll('.card-item[draggable="true"]').forEach(c => {
        c.removeAttribute('draggable');
      });
    });

    list.addEventListener('dragstart', (e) => {
      const card = e.target.closest('.card-item');
      if (!card) return;
      draggedCard = card;
      card.classList.add('is-dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', card.dataset.id || '');
    });

    list.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const targetCard = e.target.closest('.card-item');
      if (!targetCard || targetCard === draggedCard) return;

      const rect = targetCard.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      if (e.clientY < midpoint) {
        list.insertBefore(draggedCard, targetCard);
      } else {
        list.insertBefore(draggedCard, targetCard.nextSibling);
      }
    });

    list.addEventListener('dragend', () => {
      if (draggedCard) {
        draggedCard.classList.remove('is-dragging');
        draggedCard.removeAttribute('draggable');
        draggedCard = null;

        // Collect new ordered IDs
        const cards = Array.from(list.querySelectorAll('.card-item'));
        const orderedIds = cards.map(c => 
          c.dataset.eduId || 
          c.dataset.projId || 
          c.dataset.expId || 
          c.dataset.stackId || 
          c.dataset.certId || 
          c.dataset.awardId || 
          c.dataset.customSecId ||
          c.dataset.pubId
        ).filter(Boolean);

        if (orderedIds.length > 0 && collection) {
          resumeState.reorderCollectionByIds(collection, orderedIds);
        }
      }
    });
  });

  // 2. Section-level sorting (Education, Projects, Experience, etc.)
  const pillsList = containerEl.querySelector('#section-pills-list');
  if (pillsList) {
    let draggedPill = null;

    pillsList.addEventListener('dragstart', (e) => {
      const pill = e.target.closest('.section-pill');
      if (!pill) return;
      draggedPill = pill;
      pill.classList.add('is-dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', pill.dataset.secKey || '');
    });

    pillsList.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const targetPill = e.target.closest('.section-pill');
      if (!targetPill || targetPill === draggedPill) return;

      const rect = targetPill.getBoundingClientRect();
      const midpoint = rect.left + rect.width / 2;
      if (e.clientX < midpoint) {
        pillsList.insertBefore(draggedPill, targetPill);
      } else {
        pillsList.insertBefore(draggedPill, targetPill.nextSibling);
      }
    });

    pillsList.addEventListener('dragend', () => {
      if (draggedPill) {
        draggedPill.classList.remove('is-dragging');
        draggedPill = null;

        const pills = Array.from(pillsList.querySelectorAll('.section-pill'));
        const newOrder = pills.map(p => p.dataset.secKey).filter(Boolean);
        if (newOrder.length > 0) {
          resumeState.reorderSectionOrder(newOrder);
        }
      }
    });
  }
}

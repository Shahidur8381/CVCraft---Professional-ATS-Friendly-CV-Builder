import { improvedShahidurCV, blankCV } from './data/defaultData.js';

const STORAGE_KEY = 'cvbuilder_data_v13';

class ResumeState {
  constructor() {
    this.listeners = [];
    this.data = this.loadInitialData();
  }

  loadInitialData() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return this.sanitizeData(parsed);
      }
    } catch (e) {
      console.warn('Failed to load saved CV data, using default:', e);
    }
    return JSON.parse(JSON.stringify(improvedShahidurCV));
  }

  sanitizeData(data) {
    const defaultCopy = JSON.parse(JSON.stringify(improvedShahidurCV));
    return {
      personalInfo: { ...defaultCopy.personalInfo, ...(data.personalInfo || {}) },
      settings: {
        ...defaultCopy.settings,
        ...(data.settings || {}),
        hiddenSections: (data.settings && Array.isArray(data.settings.hiddenSections))
          ? data.settings.hiddenSections
          : defaultCopy.settings.hiddenSections
      },
      sectionOrder: data.sectionOrder || defaultCopy.sectionOrder,
      education: data.education || [],
      skillStacks: data.skillStacks || [],
      experience: data.experience || [],
      projects: data.projects || [],
      publications: (data.publications || []).map(p => ({
        showOnCv: true,
        ...p
      })),
      certificates: data.certificates || [],
      awards: data.awards || [],
      customSections: (data.customSections || []).map(sec => ({
        showOnCv: true,
        ...sec
      }))
    };

  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
    this.listeners.forEach(fn => fn(this.data));
  }

  getData() {
    return this.data;
  }

  // Preset operations
  resetToShahidur() {
    this.data = JSON.parse(JSON.stringify(improvedShahidurCV));
    this.notify();
  }

  resetToBlank() {
    this.data = JSON.parse(JSON.stringify(blankCV));
    this.notify();
  }

  importData(jsonData) {
    try {
      const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      this.data = this.sanitizeData(parsed);
      this.notify();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // Generic item field toggle (e.g. showOnCv, showLive, showGithub)
  toggleItemField(collectionName, id, field, value) {
    const coll = this.data[collectionName];
    if (Array.isArray(coll)) {
      const item = coll.find(x => x.id === id);
      if (item) {
        item[field] = value !== undefined ? value : !item[field];
        this.notify();
      }
    }
  }

  // Section visibility toggle
  toggleSectionVisibility(sectionKey) {
    if (!this.data.settings.hiddenSections) {
      this.data.settings.hiddenSections = [];
    }
    const idx = this.data.settings.hiddenSections.indexOf(sectionKey);
    const willBeShown = idx >= 0;

    if (willBeShown) {
      // Unhiding section
      this.data.settings.hiddenSections.splice(idx, 1);

      // 1. If it's custom section, make sure customSections exist and showOnCv = true
      if (sectionKey === 'custom') {
        if (!this.data.customSections || this.data.customSections.length === 0) {
          this.data.customSections = [
            {
              id: `custom-${Date.now()}`,
              title: 'LEADERSHIP & EXTRACURRICULAR',
              showOnCv: true,
              items: [
                {
                  id: `ci-${Date.now()}`,
                  heading: 'KUET Computer Club (KUETCC)',
                  subHeading: 'Executive Member & Workshop Mentor',
                  date: '2024 – Present',
                  description: 'Conducted hands-on workshops on Git, GitHub, and Modern Web Development for 120+ freshman engineering students.'
                }
              ]
            }
          ];
        } else {
          this.data.customSections.forEach(sec => {
            sec.showOnCv = true;
          });
        }
      }

      // 2. If it's publications, make sure at least one publication exists and showOnCv = true
      if (sectionKey === 'publications') {
        if (!this.data.publications || this.data.publications.length === 0) {
          this.data.publications = [
            {
              id: `pub-${Date.now()}`,
              title: 'A High-Throughput Streaming API Architecture for LLM Query Processing',
              authors: 'Md. Shahidur Rahman',
              venue: 'KUET Technical Proceedings',
              year: '2026',
              link: 'https://shahidur.dev',
              showOnCv: true
            }
          ];
        } else {
          this.data.publications.forEach(p => {
            p.showOnCv = true;
          });
        }
      }

      // 3. For all other sections, make sure items are enabled if they were all disabled
      const collMap = {
        education: 'education',
        skills: 'skillStacks',
        experience: 'experience',
        projects: 'projects',
        awards: 'awards',
        certificates: 'certificates'
      };
      const collName = collMap[sectionKey];
      if (collName && Array.isArray(this.data[collName])) {
        const allDisabled = this.data[collName].every(item => item.showOnCv === false);
        if (allDisabled && this.data[collName].length > 0) {
          this.data[collName].forEach(item => { item.showOnCv = true; });
        }
      }
    } else {
      // Hiding section
      this.data.settings.hiddenSections.push(sectionKey);
    }
    this.notify();
    return willBeShown;
  }

  // Reorder items in any collection by list of IDs
  reorderCollectionByIds(collectionName, orderedIds) {
    if (!this.data[collectionName] || !Array.isArray(this.data[collectionName])) return;
    const currentList = this.data[collectionName];
    const itemMap = new Map();
    currentList.forEach(item => itemMap.set(item.id, item));
    const reordered = [];
    orderedIds.forEach(id => {
      if (itemMap.has(id)) {
        reordered.push(itemMap.get(id));
      }
    });
    // Add any remaining items that were not in orderedIds
    currentList.forEach(item => {
      if (!reordered.includes(item)) reordered.push(item);
    });
    this.data[collectionName] = reordered;
    this.notify();
  }

  // Reorder section order
  reorderSectionOrder(newSectionOrder) {
    if (Array.isArray(newSectionOrder)) {
      this.data.sectionOrder = newSectionOrder;
      this.notify();
    }
  }

  // Personal Info
  updatePersonalInfo(field, value) {
    this.data.personalInfo[field] = value;
    this.notify();
  }

  addEmail() {
    const item = {
      id: `email-${Date.now()}`,
      label: 'Secondary',
      email: '',
      showOnCv: true
    };
    if (!this.data.personalInfo.emails) this.data.personalInfo.emails = [];
    this.data.personalInfo.emails.push(item);
    this.notify();
    return item;
  }

  updateEmail(id, key, value) {
    const item = this.data.personalInfo.emails.find(e => e.id === id);
    if (item) {
      item[key] = value;
      this.notify();
    }
  }

  updateEmailToggle(id, showOnCv) {
    const item = this.data.personalInfo.emails.find(e => e.id === id);
    if (item) {
      item.showOnCv = showOnCv;
      this.notify();
    }
  }

  removeEmail(id) {
    this.data.personalInfo.emails = this.data.personalInfo.emails.filter(e => e.id !== id);
    this.notify();
  }

  addOtherLink() {
    if (!this.data.personalInfo.otherLinks) this.data.personalInfo.otherLinks = [];
    const item = {
      id: `link-${Date.now()}`,
      label: 'Link',
      url: '',
      showOnCv: true
    };
    this.data.personalInfo.otherLinks.push(item);
    this.notify();
    return item;
  }

  updateOtherLink(id, key, value) {
    const link = this.data.personalInfo.otherLinks.find(l => l.id === id);
    if (link) {
      link[key] = value;
      this.notify();
    }
  }

  removeOtherLink(id) {
    this.data.personalInfo.otherLinks = this.data.personalInfo.otherLinks.filter(l => l.id !== id);
    this.notify();
  }

  // Settings
  updateSetting(key, value) {
    this.data.settings[key] = value;
    this.notify();
  }

  // Section Ordering
  moveSection(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= this.data.sectionOrder.length) return;
    const item = this.data.sectionOrder[index];
    this.data.sectionOrder.splice(index, 1);
    this.data.sectionOrder.splice(target, 0, item);
    this.notify();
  }

  // Education
  addEducation() {
    const item = {
      id: `edu-${Date.now()}`,
      institution: '',
      location: '',
      degree: '',
      startDate: '',
      endDate: '',
      grade: '',
      coursework: ''
    };
    this.data.education.push(item);
    this.notify();
    return item;
  }

  updateEducation(id, field, value) {
    const edu = this.data.education.find(e => e.id === id);
    if (edu) {
      edu[field] = value;
      this.notify();
    }
  }

  removeEducation(id) {
    this.data.education = this.data.education.filter(e => e.id !== id);
    this.notify();
  }

  // Skill Stacks
  addSkillStack() {
    const item = {
      id: `stack-${Date.now()}`,
      categoryName: 'New Category',
      skills: ''
    };
    this.data.skillStacks.push(item);
    this.notify();
    return item;
  }

  updateSkillStack(id, field, value) {
    const stack = this.data.skillStacks.find(s => s.id === id);
    if (stack) {
      stack[field] = value;
      this.notify();
    }
  }

  removeSkillStack(id) {
    this.data.skillStacks = this.data.skillStacks.filter(s => s.id !== id);
    this.notify();
  }

  // Experience
  addExperience() {
    const item = {
      id: `exp-${Date.now()}`,
      company: '',
      role: '',
      location: '',
      startDate: '',
      endDate: '',
      bullets: ['Architected...']
    };
    this.data.experience.push(item);
    this.notify();
    return item;
  }

  updateExperience(id, field, value) {
    const exp = this.data.experience.find(e => e.id === id);
    if (exp) {
      exp[field] = value;
      this.notify();
    }
  }

  removeExperience(id) {
    this.data.experience = this.data.experience.filter(e => e.id !== id);
    this.notify();
  }

  addExperienceBullet(expId) {
    const exp = this.data.experience.find(e => e.id === expId);
    if (exp) {
      if (!exp.bullets) exp.bullets = [];
      exp.bullets.push('');
      this.notify();
    }
  }

  updateExperienceBullet(expId, index, text) {
    const exp = this.data.experience.find(e => e.id === expId);
    if (exp && exp.bullets) {
      exp.bullets[index] = text;
      this.notify();
    }
  }

  removeExperienceBullet(expId, index) {
    const exp = this.data.experience.find(e => e.id === expId);
    if (exp && exp.bullets) {
      exp.bullets.splice(index, 1);
      this.notify();
    }
  }

  // Projects
  addProject() {
    const item = {
      id: `proj-${Date.now()}`,
      title: '',
      technologies: '',
      githubUrl: '',
      liveUrl: '',
      bullets: ['Developed...']
    };
    this.data.projects.push(item);
    this.notify();
    return item;
  }

  updateProject(id, field, value) {
    const proj = this.data.projects.find(p => p.id === id);
    if (proj) {
      proj[field] = value;
      this.notify();
    }
  }

  removeProject(id) {
    this.data.projects = this.data.projects.filter(p => p.id !== id);
    this.notify();
  }

  addProjectBullet(projId) {
    const proj = this.data.projects.find(p => p.id === projId);
    if (proj) {
      if (!proj.bullets) proj.bullets = [];
      proj.bullets.push('');
      this.notify();
    }
  }

  updateProjectBullet(projId, index, text) {
    const proj = this.data.projects.find(p => p.id === projId);
    if (proj && proj.bullets) {
      proj.bullets[index] = text;
      this.notify();
    }
  }

  removeProjectBullet(projId, index) {
    const proj = this.data.projects.find(p => p.id === projId);
    if (proj && proj.bullets) {
      proj.bullets.splice(index, 1);
      this.notify();
    }
  }

  // Publications
  addPublication() {
    const item = {
      id: `pub-${Date.now()}`,
      title: '',
      authors: '',
      venue: '',
      year: '',
      link: ''
    };
    this.data.publications.push(item);
    this.notify();
    return item;
  }

  updatePublication(id, field, value) {
    const pub = this.data.publications.find(p => p.id === id);
    if (pub) {
      pub[field] = value;
      this.notify();
    }
  }

  removePublication(id) {
    this.data.publications = this.data.publications.filter(p => p.id !== id);
    this.notify();
  }

  // Certificates
  addCertificate() {
    const item = {
      id: `cert-${Date.now()}`,
      name: '',
      issuer: '',
      date: '',
      certificateId: '',
      credentialUrl: '',
      showOnCv: true
    };
    this.data.certificates.push(item);
    this.notify();
    return item;
  }

  updateCertificate(id, field, value) {
    const cert = this.data.certificates.find(c => c.id === id);
    if (cert) {
      cert[field] = value;
      this.notify();
    }
  }

  removeCertificate(id) {
    this.data.certificates = this.data.certificates.filter(c => c.id !== id);
    this.notify();
  }

  // Awards
  addAward() {
    const item = {
      id: `award-${Date.now()}`,
      title: '',
      organization: '',
      year: '',
      description: ''
    };
    this.data.awards.push(item);
    this.notify();
    return item;
  }

  updateAward(id, field, value) {
    const award = this.data.awards.find(a => a.id === id);
    if (award) {
      award[field] = value;
      this.notify();
    }
  }

  removeAward(id) {
    this.data.awards = this.data.awards.filter(a => a.id !== id);
    this.notify();
  }

  // Custom Sections
  addCustomSection() {
    const item = {
      id: `custom-${Date.now()}`,
      title: 'ADDITIONAL SECTION',
      showOnCv: true,
      items: [
        {
          id: `ci-${Date.now()}`,
          heading: '',
          subHeading: '',
          date: '',
          description: ''
        }
      ]
    };
    this.data.customSections.push(item);
    this.notify();
    return item;
  }

  updateCustomSection(secId, field, value) {
    const sec = this.data.customSections.find(s => s.id === secId);
    if (sec) {
      sec[field] = value;
      this.notify();
    }
  }

  removeCustomSection(secId) {
    this.data.customSections = this.data.customSections.filter(s => s.id !== secId);
    this.notify();
  }

  addCustomItem(secId) {
    const sec = this.data.customSections.find(s => s.id === secId);
    if (sec) {
      const item = {
        id: `ci-${Date.now()}`,
        heading: '',
        subHeading: '',
        date: '',
        description: ''
      };
      sec.items.push(item);
      this.notify();
      return item;
    }
    return null;
  }

  updateCustomItem(secId, itemId, field, value) {
    const sec = this.data.customSections.find(s => s.id === secId);
    if (sec) {
      const item = sec.items.find(i => i.id === itemId);
      if (item) {
        item[field] = value;
        this.notify();
      }
    }
  }

  removeCustomItem(secId, itemId) {
    const sec = this.data.customSections.find(s => s.id === secId);
    if (sec) {
      sec.items = sec.items.filter(i => i.id !== itemId);
      this.notify();
    }
  }
}

export const resumeState = new ResumeState();

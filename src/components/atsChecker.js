// ATS Scoring & Content Analysis Engine

const POWER_ACTION_VERBS = [
  'architected', 'engineered', 'developed', 'spearheaded', 'built', 'designed',
  'implemented', 'optimized', 'automated', 'accelerated', 'deployed', 'authored',
  'refactored', 'integrated', 'reduced', 'boosted', 'scaled', 'orchestrated',
  'executed', 'constructed', 'delivered', 'formulated', 'standardized', 'resolved',
  'conducted', 'led', 'configured', 'established', 'created'
];

const WEAK_VERBS = [
  'responsible for', 'worked on', 'helped with', 'contributed to', 'handled',
  'assisted', 'participated in', 'attempted', 'supported'
];

export function analyzeATS(cvData) {
  let score = 0;
  const maxScore = 100;
  const feedback = [];
  const strengths = [];

  // 1. Contact Info Analysis (20 points max)
  let contactScore = 0;
  const { personalInfo } = cvData;
  if (personalInfo.fullName && personalInfo.fullName.trim().length > 2) {
    contactScore += 4;
  } else {
    feedback.push({ type: 'warning', text: 'Full Name is missing or too short.' });
  }

  if (personalInfo.emails && personalInfo.emails.length > 0 && personalInfo.emails[0].email) {
    contactScore += 4;
    strengths.push(`Included ${personalInfo.emails.length} contact email(s) for academic/professional routing.`);
  } else {
    feedback.push({ type: 'error', text: 'Primary email address is missing.' });
  }

  if (personalInfo.phone && personalInfo.phone.trim().length > 6) {
    contactScore += 4;
  } else {
    feedback.push({ type: 'warning', text: 'Phone number is missing.' });
  }

  if (personalInfo.location && personalInfo.location.trim().length > 2) {
    contactScore += 3;
  } else {
    feedback.push({ type: 'info', text: 'Location (City, Country) is recommended for location-based ATS filtering.' });
  }

  if (personalInfo.linkedin && personalInfo.linkedin.includes('linkedin.com')) {
    contactScore += 3;
    strengths.push('LinkedIn profile link detected — highly favored by technical recruiters.');
  } else {
    feedback.push({ type: 'warning', text: 'Add a LinkedIn profile link. 85%+ of recruiters cross-check LinkedIn.' });
  }

  if (personalInfo.github && personalInfo.github.includes('github.com')) {
    contactScore += 2;
    strengths.push('GitHub profile link included for code verification.');
  }

  score += Math.min(20, contactScore);

  // 2. Education Analysis (15 points max)
  let eduScore = 0;
  if (cvData.education && cvData.education.length > 0) {
    eduScore += 10;
    const hasCoursework = cvData.education.some(e => e.coursework && e.coursework.length > 20);
    if (hasCoursework) {
      eduScore += 5;
      strengths.push('Relevant technical coursework included for ATS keyword matching.');
    } else {
      feedback.push({ type: 'info', text: 'Adding relevant coursework (Algorithms, Systems, DBMS) boosts student ATS scores.' });
    }
  } else {
    feedback.push({ type: 'error', text: 'No education entries found.' });
  }
  score += Math.min(15, eduScore);

  // 3. Technical Skills Stack Analysis (15 points max)
  let skillsScore = 0;
  if (cvData.skillStacks && cvData.skillStacks.length > 0) {
    const totalCategories = cvData.skillStacks.length;
    if (totalCategories >= 3) {
      skillsScore += 10;
      strengths.push(`Organized into ${totalCategories} distinct technical categories (Languages, Frameworks, Cloud, ML).`);
    } else {
      skillsScore += 5;
      feedback.push({ type: 'info', text: 'Categorizing skills into 3+ distinct stacks (e.g. Languages, Backend, Tools) improves parseability.' });
    }

    const totalSkillsLength = cvData.skillStacks.reduce((acc, curr) => acc + (curr.skills ? curr.skills.length : 0), 0);
    if (totalSkillsLength > 50) {
      skillsScore += 5;
    }
  } else {
    feedback.push({ type: 'error', text: 'Skills section is empty.' });
  }
  score += Math.min(15, skillsScore);

  // 4. Experience & Bullet Points Quality (25 points max)
  let expScore = 0;
  const allBullets = [];

  if (cvData.experience && cvData.experience.length > 0) {
    expScore += 8;
    cvData.experience.forEach(exp => {
      if (exp.bullets) allBullets.push(...exp.bullets);
    });
  }

  if (cvData.projects && cvData.projects.length > 0) {
    cvData.projects.forEach(proj => {
      if (proj.bullets) allBullets.push(...proj.bullets);
    });
  }

  // Analyze bullets for action verbs & metrics
  let bulletsWithActionVerbs = 0;
  let bulletsWithMetrics = 0;
  let weakVerbsFound = 0;

  const metricRegex = /(\d+[\d,.]*%?|\$\d+[\d,.]*|\b\d+\+\b|\b\d+x\b|\b\d+\s*(hours|users|requests|queries|clients|teams))/i;

  allBullets.forEach(bullet => {
    const lower = bullet.toLowerCase().trim();
    // Check first 3 words for power action verbs
    const words = lower.split(/\s+/).slice(0, 3);
    const hasPowerVerb = words.some(w => POWER_ACTION_VERBS.some(pv => w.startsWith(pv)));
    if (hasPowerVerb) bulletsWithActionVerbs++;

    // Check for weak verbs
    if (WEAK_VERBS.some(wv => lower.includes(wv))) {
      weakVerbsFound++;
    }

    // Check for metrics
    if (metricRegex.test(bullet)) {
      bulletsWithMetrics++;
    }
  });

  if (allBullets.length > 0) {
    const actionVerbRatio = bulletsWithActionVerbs / allBullets.length;
    const metricRatio = bulletsWithMetrics / allBullets.length;

    if (actionVerbRatio >= 0.6) {
      expScore += 9;
      strengths.push(`${Math.round(actionVerbRatio * 100)}% of bullets start with strong power action verbs.`);
    } else {
      expScore += Math.round(actionVerbRatio * 9);
      feedback.push({
        type: 'warning',
        text: 'Begin bullets with strong action verbs (e.g. "Architected", "Engineered", "Optimized") instead of passive words.'
      });
    }

    if (metricRatio >= 0.5) {
      expScore += 8;
      strengths.push(`Strong quantitative impact: ${bulletsWithMetrics} bullet(s) contain measurable metrics (%, $, numbers).`);
    } else {
      expScore += Math.round(metricRatio * 8);
      feedback.push({
        type: 'warning',
        text: 'Add quantifiable metrics (e.g. "reduced latency by 35%", "serving 500+ users") following Google\'s XYZ formula.'
      });
    }

    if (weakVerbsFound > 0) {
      feedback.push({
        type: 'info',
        text: `Found ${weakVerbsFound} instance(s) of passive phrasing (e.g. "contributed to", "worked on"). Replace with high-ownership verbs.`
      });
    }
  }
  score += Math.min(25, expScore);

  // 5. Projects & Practical Evidence (15 points max)
  let projScore = 0;
  if (cvData.projects && cvData.projects.length >= 2) {
    projScore += 9;
    const hasLiveLinks = cvData.projects.some(p => p.liveUrl || p.githubUrl);
    if (hasLiveLinks) {
      projScore += 6;
      strengths.push('Projects include verifiable GitHub repository and live demonstration links.');
    } else {
      feedback.push({ type: 'warning', text: 'Include GitHub and Live Demo links for your featured projects.' });
    }
  } else if (cvData.projects && cvData.projects.length === 1) {
    projScore += 6;
    feedback.push({ type: 'info', text: 'Having at least 2-3 substantial technical projects is recommended for software engineering roles.' });
  } else {
    feedback.push({ type: 'error', text: 'No technical projects listed.' });
  }
  score += Math.min(15, projScore);

  // 6. Bonus Credentials: Extracurricular, Certifications, Awards & Publications (10 points max)
  let bonusScore = 0;
  if (cvData.awards && cvData.awards.length > 0) {
    bonusScore += 4;
    strengths.push('Competitive hackathon awards and achievements highlighted.');
  }
  if (cvData.certificates && cvData.certificates.length > 0) {
    bonusScore += 3;
    strengths.push('Professional/Industry certifications included.');
  }
  if (cvData.customSections && cvData.customSections.length > 0) {
    bonusScore += 3;
    strengths.push('Extracurricular leadership & mentoring experience included.');
  } else if (cvData.publications && cvData.publications.length > 0) {
    bonusScore += 3;
    strengths.push('Peer-reviewed publication or research entry included.');
  }
  score += Math.min(10, bonusScore);

  // Ensure score is bounded [0, 100]
  score = Math.max(10, Math.min(100, Math.round(score)));

  let rating = 'Good';
  let badgeColor = '#10b981'; // Green
  if (score >= 90) {
    rating = 'Elite ATS Match';
    badgeColor = '#10b981';
  } else if (score >= 75) {
    rating = 'Strong Candidate';
    badgeColor = '#0284c7';
  } else if (score >= 60) {
    rating = 'Moderate (Needs Metrics)';
    badgeColor = '#f59e0b';
  } else {
    rating = 'Needs Optimization';
    badgeColor = '#ef4444';
  }

  return {
    score,
    rating,
    badgeColor,
    feedback,
    strengths,
    metricsCount: bulletsWithMetrics,
    totalBullets: allBullets.length,
    actionVerbsCount: bulletsWithActionVerbs
  };
}

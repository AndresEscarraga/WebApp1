const storageKey = 'pmo-projects-v1';

const healthOrder = ['green', 'amber', 'red'];

const sampleProjects = [
  {
    id: 'p-001',
    name: 'ERP Stabilisation & Rollout',
    manager: 'Naomi Glenn',
    quarter: 'Q3',
    priority: 1,
    status: 'In Progress',
    health: 'amber',
    progress: 62,
    budget: 58,
    startDate: '2024-03-04',
    endDate: '2024-09-30',
    tags: ['ERP', 'Finance', 'Operations'],
    risks: [
      {
        id: 'r-001',
        summary: 'Data migration defect rate may delay go-live by two weeks.',
        mitigation: 'Add weekend QA sprints and engage vendor specialists for triage.',
        owner: 'Naomi Glenn',
        dueDate: '2024-08-30',
        status: 'Monitoring',
      },
    ],
  },
  {
    id: 'p-002',
    name: 'Customer Portal Modernisation',
    manager: 'Priyanka Iyer',
    quarter: 'Q4',
    priority: 2,
    status: 'At Risk',
    health: 'red',
    progress: 38,
    budget: 64,
    startDate: '2024-05-13',
    endDate: '2024-12-06',
    tags: ['Customer Experience', 'Web'],
    risks: [
      {
        id: 'r-002',
        summary: 'Vendor API contract changes blocked integration sprint.',
        mitigation: 'Escalated change request; working on interim stub service.',
        owner: 'Priyanka Iyer',
        dueDate: '2024-07-26',
        status: 'Action Required',
      },
      {
        id: 'r-003',
        summary: 'UAT resource availability limited due to fiscal year end.',
        mitigation: 'Securing temporary contractors and shifting non-critical scope.',
        owner: 'PMO Office',
        dueDate: '2024-08-09',
        status: 'Mitigating',
      },
    ],
  },
  {
    id: 'p-003',
    name: 'Data Governance Operating Model',
    manager: 'Chris Ortega',
    quarter: 'Q2',
    priority: 3,
    status: 'In Progress',
    health: 'green',
    progress: 81,
    budget: 48,
    startDate: '2024-02-05',
    endDate: '2024-07-19',
    tags: ['Data', 'Compliance'],
    risks: [
      {
        id: 'r-004',
        summary: 'Change champion engagement dropping in APAC region.',
        mitigation: 'Schedule executive townhall and add weekly checkpoints.',
        owner: 'Chris Ortega',
        dueDate: '2024-07-05',
        status: 'In Progress',
      },
    ],
  },
  {
    id: 'p-004',
    name: 'AI Assisted Support Pilot',
    manager: 'Lana Petrov',
    quarter: 'Q3',
    priority: 2,
    status: 'Not Started',
    health: 'amber',
    progress: 12,
    budget: 15,
    startDate: '2024-06-10',
    endDate: '2024-10-18',
    tags: ['AI', 'Service Desk'],
    risks: [],
  },
];

const state = {
  projects: loadProjects(),
};

const elements = {
  projectList: document.querySelector('#projectList'),
  projectCount: document.querySelector('#projectCount'),
  riskList: document.querySelector('#riskList'),
  riskCount: document.querySelector('#riskCount'),
  timeline: document.querySelector('#timeline'),
  statusFilter: document.querySelector('#statusFilter'),
  quarterFilter: document.querySelector('#quarterFilter'),
  searchInput: document.querySelector('#searchInput'),
  sortSelect: document.querySelector('#sortSelect'),
  addProjectBtn: document.querySelector('#addProjectBtn'),
  exportBtn: document.querySelector('#exportBtn'),
  summary: {
    active: document.querySelector('#activeProjects'),
    activeFootnote: document.querySelector('#activeProjectsChange'),
    onTrack: document.querySelector('#onTrackProjects'),
    onTrackPercent: document.querySelector('#onTrackPercent'),
    atRisk: document.querySelector('#atRiskProjects'),
    atRiskPercent: document.querySelector('#atRiskPercent'),
    milestones: document.querySelector('#upcomingMilestones'),
    nextMilestone: document.querySelector('#nextMilestone'),
  },
  dialog: document.querySelector('#projectDialog'),
  form: document.querySelector('#projectForm'),
  closeDialog: document.querySelector('#closeDialog'),
};

const projectTemplate = document.querySelector('#projectCardTemplate');
const riskTemplate = document.querySelector('#riskItemTemplate');

document.addEventListener('DOMContentLoaded', () => {
  render();
  setupEventListeners();
});

function loadProjects() {
  const raw = localStorage.getItem(storageKey);
  if (!raw) {
    return sampleProjects;
  }
  try {
    const stored = JSON.parse(raw);
    if (Array.isArray(stored) && stored.length) {
      return stored;
    }
    return sampleProjects;
  } catch (error) {
    console.warn('Failed to parse stored projects, resetting data.', error);
    return sampleProjects;
  }
}

function saveProjects() {
  localStorage.setItem(storageKey, JSON.stringify(state.projects));
}

function setupEventListeners() {
  [elements.statusFilter, elements.quarterFilter, elements.sortSelect].forEach((el) =>
    el.addEventListener('change', render)
  );
  elements.searchInput.addEventListener('input', debounce(render, 200));
  elements.addProjectBtn.addEventListener('click', () => {
    elements.form.reset();
    elements.dialog.showModal();
  });
  elements.closeDialog.addEventListener('click', () => elements.dialog.close());
  elements.form.addEventListener('submit', handleAddProject);
  elements.exportBtn.addEventListener('click', exportSummary);
}

function render() {
  const filtered = applyFilters(structuredClone(state.projects));
  renderSummary(filtered);
  renderProjects(filtered);
  renderRisks(filtered);
  renderTimeline(filtered);
}

function applyFilters(projects) {
  const status = elements.statusFilter.value;
  const quarter = elements.quarterFilter.value;
  const search = elements.searchInput.value.trim().toLowerCase();
  const sort = elements.sortSelect.value;

  let result = projects;
  if (status !== 'all') {
    result = result.filter((project) => project.status === status);
  }
  if (quarter !== 'all') {
    result = result.filter((project) => project.quarter === quarter);
  }
  if (search) {
    result = result.filter((project) => {
      const haystack = [project.name, project.manager, project.tags?.join(' ')].join(' ').toLowerCase();
      return haystack.includes(search);
    });
  }

  const sorters = {
    priority: (a, b) => a.priority - b.priority,
    health: (a, b) => healthOrder.indexOf(a.health) - healthOrder.indexOf(b.health),
    progress: (a, b) => b.progress - a.progress,
    endDate: (a, b) => new Date(a.endDate) - new Date(b.endDate),
  };

  return result.sort(sorters[sort]);
}

function renderSummary(projects) {
  const activeProjects = state.projects.filter((project) => project.status !== 'Completed');
  const completed = state.projects.length - activeProjects.length;
  const onTrack = state.projects.filter((project) => project.health === 'green' && project.status !== 'Completed');
  const atRisk = state.projects.filter(
    (project) => project.status === 'At Risk' || project.health === 'red'
  );

  elements.summary.active.textContent = activeProjects.length;
  elements.summary.activeFootnote.textContent = `${completed} completed`;
  elements.summary.onTrack.textContent = onTrack.length;
  elements.summary.onTrackPercent.textContent = `${Math.round(
    (onTrack.length / Math.max(activeProjects.length, 1)) * 100
  )}% of active`;
  elements.summary.atRisk.textContent = atRisk.length;
  elements.summary.atRiskPercent.textContent = `${Math.round(
    (atRisk.length / Math.max(state.projects.length, 1)) * 100
  )}% of total`;

  const upcoming = projects
    .filter((project) => project.status !== 'Completed')
    .map((project) => ({
      ...project,
      endDateObj: new Date(project.endDate),
    }))
    .filter((project) => !Number.isNaN(project.endDateObj.getTime()))
    .sort((a, b) => a.endDateObj - b.endDateObj);

  const upcomingWindow = upcoming.filter((project) => project.endDateObj >= new Date());
  elements.summary.milestones.textContent = upcomingWindow.length;
  if (upcomingWindow.length) {
    const next = upcomingWindow[0];
    elements.summary.nextMilestone.textContent = `${next.name} • ${formatDate(next.endDate)}`;
  } else {
    elements.summary.nextMilestone.textContent = 'No future milestones';
  }
}

function renderProjects(projects) {
  elements.projectList.replaceChildren();
  elements.projectCount.textContent = `${projects.length} project${projects.length === 1 ? '' : 's'}`;

  projects.forEach((project) => {
    const fragment = projectTemplate.content.cloneNode(true);
    const card = fragment.querySelector('.project-card');
    card.dataset.id = project.id;

    fragment.querySelector('.project-name').textContent = project.name;
    fragment.querySelector('.project-meta').textContent = `${project.manager} • ${project.quarter} • Priority ${project.priority}`;
    fragment.querySelector('.health-indicator').style.background =
      project.health === 'green' ? 'var(--green)' : project.health === 'amber' ? 'var(--amber)' : 'var(--red)';
    fragment.querySelector('.project-status').textContent = project.status;
    fragment.querySelector('.project-progress').textContent = project.progress;
    fragment.querySelector('.project-budget').textContent = project.budget;
    fragment.querySelector('.project-dates').textContent = `${formatDate(project.startDate)} – ${formatDate(
      project.endDate
    )}`;
    fragment.querySelector('.progress-fill').style.width = `${project.progress}%`;

    const tagList = fragment.querySelector('.tag-list');
    (project.tags || []).forEach((tag) => {
      const tagEl = document.createElement('span');
      tagEl.textContent = tag;
      tagList.appendChild(tagEl);
    });

    fragment.querySelector('.action-view').addEventListener('click', () => showProjectDetails(project));
    fragment.querySelector('.action-risk').addEventListener('click', () => logRisk(project.id));
    fragment.querySelector('.action-complete').addEventListener('click', () => markComplete(project.id));

    elements.projectList.appendChild(fragment);
  });
}

function renderRisks(projects) {
  elements.riskList.replaceChildren();
  const risks = projects
    .flatMap((project) => (project.risks || []).map((risk) => ({ ...risk, project })))
    .filter((risk) => risk.status !== 'Closed');

  elements.riskCount.textContent = `${risks.length} open risk${risks.length === 1 ? '' : 's'}`;

  if (!risks.length) {
    const empty = document.createElement('p');
    empty.textContent = 'All clear! No open portfolio risks.';
    empty.className = 'empty-state';
    elements.riskList.appendChild(empty);
    return;
  }

  risks
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .forEach((risk) => {
      const fragment = riskTemplate.content.cloneNode(true);
      fragment.querySelector('.risk-title').textContent = risk.summary;
      fragment.querySelector('.risk-detail').textContent = risk.mitigation;
      fragment.querySelector('.risk-meta').textContent = `${risk.project.name} • Owner: ${risk.owner} • Due ${formatDate(
        risk.dueDate
      )}`;
      elements.riskList.appendChild(fragment);
    });
}

function renderTimeline(projects) {
  elements.timeline.replaceChildren();
  const milestones = projects
    .filter((project) => project.status !== 'Completed')
    .map((project) => ({
      id: project.id,
      name: project.name,
      manager: project.manager,
      endDate: project.endDate,
      status: project.status,
      health: project.health,
    }))
    .filter((item) => !Number.isNaN(new Date(item.endDate).getTime()))
    .sort((a, b) => new Date(a.endDate) - new Date(b.endDate));

  if (!milestones.length) {
    const empty = document.createElement('p');
    empty.textContent = 'No upcoming milestones. Add projects to populate the timeline.';
    empty.className = 'empty-state';
    elements.timeline.appendChild(empty);
    return;
  }

  milestones.forEach((milestone) => {
    const item = document.createElement('div');
    item.className = 'timeline-item';
    item.innerHTML = `
      <h4>${milestone.name}</h4>
      <p>${formatDate(milestone.endDate)} • ${milestone.manager}</p>
      <p>Status: ${milestone.status} • Health: ${milestone.health.toUpperCase()}</p>
    `;
    elements.timeline.appendChild(item);
  });
}

function handleAddProject(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const project = {
    id: crypto.randomUUID ? crypto.randomUUID() : `p-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: formData.get('name').trim(),
    manager: formData.get('manager').trim(),
    quarter: formData.get('quarter'),
    priority: Number(formData.get('priority')),
    status: formData.get('status'),
    health: formData.get('health'),
    progress: Number(formData.get('progress')),
    budget: Number(formData.get('budget')),
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate'),
    tags: formData
      .get('tags')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    risks: [],
  };

  const riskNote = formData.get('risks').trim();
  if (riskNote) {
    project.risks.push({
      id: `r-${Date.now()}`,
      summary: riskNote,
      mitigation: 'Owner to define mitigation plan.',
      owner: project.manager,
      dueDate: project.endDate,
      status: 'New',
    });
  }

  state.projects.push(project);
  saveProjects();
  elements.dialog.close();
  render();
}

function showProjectDetails(project) {
  const risks = project.risks?.length
    ? project.risks
        .map((risk) => `• ${risk.summary}\n  Mitigation: ${risk.mitigation}\n  Owner: ${risk.owner} • Due ${formatDate(risk.dueDate)}\n`)
        .join('\n')
    : 'No logged risks.';

  const detail = `Project: ${project.name}\nManager: ${project.manager}\nQuarter: ${project.quarter}\nStatus: ${project.status}\nProgress: ${project.progress}%\nBudget Used: ${project.budget}%\nTimeline: ${formatDate(project.startDate)} – ${formatDate(project.endDate)}\nTags: ${project.tags.join(', ') || 'None'}\n\nRisks:\n${risks}`;
  window.alert(detail);
}

function logRisk(projectId) {
  const project = state.projects.find((item) => item.id === projectId);
  if (!project) return;

  const summary = window.prompt('Describe the risk or issue:');
  if (!summary) return;
  const mitigation = window.prompt('Describe the mitigation or next action:') || 'Mitigation plan TBD.';
  const dueDate = window.prompt('Target mitigation date (YYYY-MM-DD):', project.endDate) || project.endDate;

  project.risks = project.risks || [];
  project.risks.push({
    id: `r-${Date.now()}`,
    summary,
    mitigation,
    owner: project.manager,
    dueDate,
    status: 'Action Required',
  });

  saveProjects();
  render();
}

function markComplete(projectId) {
  const project = state.projects.find((item) => item.id === projectId);
  if (!project) return;
  if (!window.confirm(`Mark ${project.name} as complete?`)) {
    return;
  }
  project.status = 'Completed';
  project.health = 'green';
  project.progress = 100;
  saveProjects();
  render();
}

function exportSummary() {
  const header = 'Portfolio Summary';
  const lines = [header, '='.repeat(header.length), ''];

  state.projects.forEach((project) => {
    lines.push(
      `${project.name} (${project.status})\nManager: ${project.manager}\nProgress: ${project.progress}% | Budget Used: ${project.budget}%\nTimeline: ${formatDate(project.startDate)} – ${formatDate(project.endDate)}\nTags: ${project.tags.join(', ') || 'None'}\nRisks:`
    );
    if (!project.risks?.length) {
      lines.push('  - None');
    } else {
      project.risks.forEach((risk) => {
        lines.push(
          `  - ${risk.summary} (Owner: ${risk.owner}, Due: ${formatDate(risk.dueDate)}, Status: ${risk.status})`
        );
      });
    }
    lines.push('');
  });

  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const anchor = Object.assign(document.createElement('a'), {
    href: url,
    download: `portfolio-summary-${new Date().toISOString().slice(0, 10)}.txt`,
  });
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function formatDate(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return 'TBD';
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function debounce(fn, wait = 200) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(null, args), wait);
  };
}

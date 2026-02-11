const baseUrlInput = document.getElementById('baseUrl');
const apiKeyInput = document.getElementById('apiKey');
const responseOutput = document.getElementById('responseOutput');
const responseMeta = document.getElementById('responseMeta');
const responseActions = document.getElementById('responseActions');
const learningStatusesWrap = document.getElementById('learningStatusesWrap');
const learningStatusesTable = document.getElementById('learningStatusesTable');
const curriculaListWrap = document.getElementById('curriculaListWrap');
const curriculaListTable = document.getElementById('curriculaListTable');
const activityLogsWrap = document.getElementById('activityLogsWrap');
const activityLogsTable = document.getElementById('activityLogsTable');
const auditLogsWrap = document.getElementById('auditLogsWrap');
const auditLogsTable = document.getElementById('auditLogsTable');

/** Get display text from multilingual object (e.g. { en: "x", nl: "y" }) */
function getDisplayTitle(obj) {
  if (obj == null || typeof obj !== 'object') return '-';
  return obj.en || obj.nl || Object.values(obj)[0] || '-';
}

/** Format ISO date for display */
function formatDate(iso) {
  if (!iso) return '-';
  try {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? iso : d.toLocaleDateString(undefined, { dateStyle: 'short' }) + ' ' + d.toLocaleTimeString(undefined, { timeStyle: 'short' });
  } catch (_) {
    return iso;
  }
}

/** Render Learning statuses table from results API response (array of user objects) */
function renderLearningStatuses(data) {
  if (!Array.isArray(data) || data.length === 0) {
    learningStatusesTable.innerHTML = '<p class="no-data">No users in response.</p>';
    learningStatusesWrap.hidden = false;
    return;
  }

  let html = `
    <div class="ls-curriculum-header ls-header-row">
      <span class="ls-toggle"></span>
      <span class="ls-name">Name</span>
      <span class="ls-curriculum">Curriculum</span>
      <span class="ls-updated">Updated</span>
      <span class="ls-completion">Completion %</span>
      <span class="ls-certification">Certification</span>
      <span class="ls-actions">Actions</span>
    </div>`;
  data.forEach((user, userIndex) => {
    const curriculums = user.curriculums || [];
    curriculums.forEach((curr, currIndex) => {
      const rowId = `ls-u${userIndex}-c${currIndex}`;
      const certStatus = curr.certification_status ?? 'not_certified';
      const updated = curr.updated_last ? formatDate(curr.updated_last) : '-';
      const name = user.immosurance_user_name || user.name || `User ${user.user_id || userIndex}`;
      const curriculumName = getDisplayTitle(curr.course_name);
      const completionPct = curr.total_completion_percentage != null ? curr.total_completion_percentage + '%' : '-';
      const trainings = curr.trainings || [];

      html += `
        <div class="ls-curriculum-row" data-row="${rowId}">
          <div class="ls-curriculum-header" role="button" tabindex="0" aria-expanded="false" aria-controls="${rowId}-body">
            <span class="ls-toggle" aria-hidden="true">▶</span>
            <span class="ls-name">${escapeHtml(name)}</span>
            <span class="ls-curriculum">${escapeHtml(curriculumName)}</span>
            <span class="ls-updated">${escapeHtml(updated)}</span>
            <span class="ls-completion">${escapeHtml(String(completionPct))}</span>
            <span class="ls-certification">${escapeHtml(certStatus)}</span>
            <span class="ls-actions"><button type="button" class="icon-btn" title="Refresh">↻</button></span>
          </div>
          <div id="${rowId}-body" class="ls-trainings-body" hidden>
            <table class="ls-trainings-table">
              <thead>
                <tr>
                  <th title="display_id: training id or FA-{assessment_id} for standalone assessments">Display ID</th>
                  <th>Training</th>
                  <th>Completion</th>
                  <th>Score %</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${trainings.map((t) => {
                  // API returns display_id: string (training id for trainings, FA-{assessment_id} for standalone)
                  const tid = t.display_id != null ? String(t.display_id) : (t.training_id != null ? String(t.training_id) : 'FA');
                  const isFa = tid.startsWith('FA-');
                  const tName = getDisplayTitle(t.training_name);
                  const comp = t.completion_status ?? 'not_started';
                  const score = t.latest_score_percent != null ? t.latest_score_percent : 0;
                  const date = formatDate(t.date_last_completion);
                  return `
                    <tr>
                      <td class="${isFa ? 'ls-display-id-fa' : ''}">${escapeHtml(String(tid))}</td>
                      <td>${escapeHtml(tName)}</td>
                      <td>${escapeHtml(comp)}</td>
                      <td>${escapeHtml(String(score))}</td>
                      <td>${escapeHtml(date)}</td>
                      <td><button type="button" class="icon-btn" title="Refresh">↻</button></td>
                    </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>`;
    });
  });

  learningStatusesTable.innerHTML = html || '<p class="no-data">No curricula in response.</p>';

  learningStatusesTable.querySelectorAll('.ls-curriculum-row .ls-curriculum-header').forEach((header) => {
    header.addEventListener('click', () => {
      const body = header.closest('.ls-curriculum-row').querySelector('.ls-trainings-body');
      const toggle = header.querySelector('.ls-toggle');
      const isOpen = !body.hidden;
      body.hidden = isOpen;
      header.setAttribute('aria-expanded', !isOpen);
      toggle.textContent = isOpen ? '▶' : '▼';
    });
  });

  learningStatusesWrap.hidden = false;

  const refreshBtn = document.getElementById('learningStatusesRefresh');
  if (refreshBtn) {
    refreshBtn.onclick = () => {
      const form = document.getElementById('resultsForm');
      if (form) form.requestSubmit();
    };
  }
}

/** Render Active curriculums table from Curricula List API response ({ data: [...] }) */
function renderCurriculaList(payload) {
  const data = payload && payload.data;
  if (!Array.isArray(data) || data.length === 0) {
    curriculaListTable.innerHTML = '<p class="no-data">No curricula in response.</p>';
    curriculaListWrap.hidden = false;
    return;
  }

  let html = `
    <div class="cl-row cl-header-row">
      <span class="cl-chevron"></span>
      <span class="cl-id">ID</span>
      <span class="cl-title">Title</span>
      <span class="cl-actions">Actions</span>
    </div>`;

  data.forEach((curr, idx) => {
    const rowId = `cl-curriculum-${idx}`;
    const title = getDisplayTitle(curr.title);
    const isGlobal = curr.is_global === true;
    const employees = curr.active_employees || [];
    const chevron = '▶';

    html += `
      <div class="cl-curriculum-row" data-row="${rowId}">
        <div class="cl-row cl-curriculum-header" role="button" tabindex="0" aria-expanded="false" aria-controls="${rowId}-body">
          <span class="cl-chevron" aria-hidden="true">${chevron}</span>
          <span class="cl-id">${escapeHtml(String(curr.id))}</span>
          <span class="cl-title">
            ${escapeHtml(title)}
            ${isGlobal ? '<span class="cl-badge cl-badge-global">Global</span>' : ''}
          </span>
          <span class="cl-actions"><span class="cl-kebab" aria-hidden="true">⋮</span></span>
        </div>
        <div id="${rowId}-body" class="cl-curriculum-body" hidden>
          <table class="cl-users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Office</th>
                <th>Created</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${employees.length === 0
                ? '<tr><td colspan="6" class="no-data">No employees</td></tr>'
                : employees.map((emp) => {
                    const name = emp.immosurance_user_name || emp.name || `User ${emp.user_id || ''}`.trim() || '-';
                    return `
                      <tr>
                        <td>${escapeHtml(name)}</td>
                        <td>−</td>
                        <td>−</td>
                        <td>−</td>
                        <td><span class="cl-status-active">Active</span></td>
                        <td><span class="cl-toggle" aria-hidden="true" title="Active (read-only)">●</span></td>
                      </tr>`;
                  }).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  });

  curriculaListTable.innerHTML = html;

  curriculaListTable.querySelectorAll('.cl-curriculum-row .cl-curriculum-header').forEach((header) => {
    header.addEventListener('click', () => {
      const body = header.closest('.cl-curriculum-row').querySelector('.cl-curriculum-body');
      const chevron = header.querySelector('.cl-chevron');
      const isOpen = !body.hidden;
      body.hidden = isOpen;
      header.setAttribute('aria-expanded', !isOpen);
      chevron.textContent = isOpen ? '▶' : '▼';
    });
  });

  curriculaListWrap.hidden = false;

  const refreshBtn = document.getElementById('curriculaListRefresh');
  if (refreshBtn) {
    refreshBtn.onclick = () => {
      const form = document.querySelector('form[data-endpoint="curriculaList"]');
      if (form) form.requestSubmit();
    };
  }
}

/** Render User Activity Logs table from API response (array) */
function renderUserActivityLogs(data) {
  if (!Array.isArray(data) || data.length === 0) {
    activityLogsTable.innerHTML = '<p class="no-data">No activity logs in response.</p>';
    activityLogsWrap.hidden = false;
    return;
  }

  let html = `
    <table class="log-table activity-logs-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Event Type</th>
          <th>Description</th>
          <th>Status</th>
          <th>Created</th>
          <th></th>
        </tr>
      </thead>
      <tbody>`;

  data.forEach((log) => {
    const eventType = log.event_type_translated ?? log.event_type ?? '-';
    const desc = log.description || '-';
    const statusDisplay = log.status_translated ?? log.status ?? '-';
    const statusRaw = log.status || '';
    const created = formatDate(log.created_at);
    const statusClass = statusRaw === 'success' ? 'log-badge-success' : statusRaw === 'error' || statusRaw === 'failed' ? 'log-badge-error' : 'log-badge-default';
    const hasMeta = log.metadata && Object.keys(log.metadata).length > 0;

    html += `
      <tr class="log-row ${hasMeta ? 'log-row-expandable' : ''}" data-log-id="${log.id}">
        <td class="log-id">${escapeHtml(String(log.id))}</td>
        <td><span class="log-badge log-badge-event">${escapeHtml(eventType)}</span></td>
        <td class="log-desc">${escapeHtml(desc)}</td>
        <td><span class="log-badge ${statusClass}">${escapeHtml(statusDisplay)}</span></td>
        <td class="log-date">${escapeHtml(created)}</td>
        <td>${hasMeta ? '<button type="button" class="icon-btn log-expand-btn" title="Toggle metadata">⊕</button>' : ''}</td>
      </tr>`;
    if (hasMeta) {
      html += `
      <tr class="log-meta-row" data-meta-for="${log.id}" hidden>
        <td colspan="6" class="log-meta-cell">
          <pre class="log-meta-pre">${escapeHtml(JSON.stringify(log.metadata, null, 2))}</pre>
        </td>
      </tr>`;
    }
  });

  html += '</tbody></table>';
  activityLogsTable.innerHTML = html;

  activityLogsTable.querySelectorAll('.log-expand-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const row = btn.closest('.log-row');
      const logId = row.dataset.logId;
      const metaRow = activityLogsTable.querySelector(`tr[data-meta-for="${logId}"]`);
      if (metaRow) {
        metaRow.hidden = !metaRow.hidden;
        btn.textContent = metaRow.hidden ? '⊕' : '⊖';
      }
    });
  });

  activityLogsWrap.hidden = false;

  const refreshBtn = document.getElementById('activityLogsRefresh');
  if (refreshBtn) {
    refreshBtn.onclick = () => {
      const form = document.querySelector('form[data-endpoint="userActivityLogs"]');
      if (form) form.requestSubmit();
    };
  }
}

/** Render Curriculum Audit Logs table from API response (array) */
function renderCurriculumAuditLogs(data) {
  if (!Array.isArray(data) || data.length === 0) {
    auditLogsTable.innerHTML = '<p class="no-data">No audit logs in response.</p>';
    auditLogsWrap.hidden = false;
    return;
  }

  let html = `
    <table class="log-table audit-logs-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Entity</th>
          <th>Action</th>
          <th>Description</th>
          <th>IDs</th>
          <th>Created</th>
          <th></th>
        </tr>
      </thead>
      <tbody>`;

  data.forEach((log) => {
    const entityType = log.entity_type_translated ?? log.entity_type ?? '-';
    const actionDisplay = log.action_translated ?? log.action ?? '-';
    const actionRaw = log.action || '';
    const desc = log.description || '-';
    const created = formatDate(log.created_at);
    const actionClass = actionRaw === 'created' ? 'log-badge-created' : actionRaw === 'updated' ? 'log-badge-updated' : actionRaw === 'deleted' ? 'log-badge-deleted' : 'log-badge-default';
    const ids = [];
    if (log.user_id != null) ids.push(`user:${log.user_id}`);
    if (log.curriculum_id != null) ids.push(`curr:${log.curriculum_id}`);
    if (log.training_id != null) ids.push(`train:${log.training_id}`);
    if (log.assessment_id != null) ids.push(`assess:${log.assessment_id}`);
    const idsStr = ids.length ? ids.join(', ') : '-';
    const hasMeta = log.metadata && Object.keys(log.metadata).length > 0;

    html += `
      <tr class="log-row ${hasMeta ? 'log-row-expandable' : ''}" data-log-id="${log.id}">
        <td class="log-id">${escapeHtml(String(log.id))}</td>
        <td><span class="log-badge log-badge-entity">${escapeHtml(entityType)}</span></td>
        <td><span class="log-badge ${actionClass}">${escapeHtml(actionDisplay)}</span></td>
        <td class="log-desc">${escapeHtml(desc)}</td>
        <td class="log-ids">${escapeHtml(idsStr)}</td>
        <td class="log-date">${escapeHtml(created)}</td>
        <td>${hasMeta ? '<button type="button" class="icon-btn log-expand-btn" title="Toggle metadata">⊕</button>' : ''}</td>
      </tr>`;
    if (hasMeta) {
      html += `
      <tr class="log-meta-row" data-meta-for="${log.id}" hidden>
        <td colspan="7" class="log-meta-cell">
          <pre class="log-meta-pre">${escapeHtml(JSON.stringify(log.metadata, null, 2))}</pre>
        </td>
      </tr>`;
    }
  });

  html += '</tbody></table>';
  auditLogsTable.innerHTML = html;

  auditLogsTable.querySelectorAll('.log-expand-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const row = btn.closest('.log-row');
      const logId = row.dataset.logId;
      const metaRow = auditLogsTable.querySelector(`tr[data-meta-for="${logId}"]`);
      if (metaRow) {
        metaRow.hidden = !metaRow.hidden;
        btn.textContent = metaRow.hidden ? '⊕' : '⊖';
      }
    });
  });

  auditLogsWrap.hidden = false;

  const refreshBtn = document.getElementById('auditLogsRefresh');
  if (refreshBtn) {
    refreshBtn.onclick = () => {
      const form = document.querySelector('form[data-endpoint="curriculumAuditLogs"]');
      if (form) form.requestSubmit();
    };
  }
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

const getOptionalValue = (form, name) => {
  const field = (form.elements && form.elements[name]) || form[name];
  if (!field) {
    return undefined;
  }
  const value = field.value;
  return value ? value : undefined;
};

const endpoints = {
  adminsSync: {
    method: 'POST',
    path: () => '/api/immosurance/admins/sync',
    body: (form) => ({
      immosurance_user_id: form.immosurance_user_id.value,
      immosurance_org_id: form.immosurance_org_id.value,
      email: form.email.value,
      name: form.name.value,
      organization_name: form.organization_name.value,
      is_admin: form.is_admin.value === 'true',
    }),
  },
  userExists: {
    method: 'GET',
    path: () => '/api/immosurance/users/exists',
    query: (form) => ({
      immosurance_user_id: form.immosurance_user_id.value,
    }),
  },
  userStatusToggle: {
    method: 'PATCH',
    path: () => '/api/immosurance/users/status',
    body: (form) => ({
      immosurance_user_id: form.immosurance_user_id.value,
      is_active: form.is_active.value === 'true',
    }),
  },
  userDelete: {
    method: 'DELETE',
    path: () => '/api/immosurance/users',
    body: (form) => ({
      immosurance_user_id: form.immosurance_user_id.value,
      language: getOptionalValue(form, 'language'),
    }),
  },
  curriculaList: {
    method: 'GET',
    path: () => '/api/immosurance/curricula',
    query: (form) => ({
      immosurance_org_id: form.immosurance_org_id.value,
      status: form.status.value || undefined,
    }),
  },
  curriculumStatus: {
    method: 'PATCH',
    path: (form) => `/api/immosurance/curricula/${form.curriculum_id.value}/status`,
    body: (form) => ({
      immosurance_org_id: form.immosurance_org_id.value,
      is_active: form.is_active.value === 'true',
    }),
  },
  startCourse: {
    method: 'POST',
    path: (form) => `/api/immosurance/curricula/${form.curriculum_id.value}/start`,
    body: (form) => ({
      immosurance_user_id: form.immosurance_user_id.value,
      language: getOptionalValue(form, 'language'),
    }),
  },
  addCurriculumRedirect: {
    method: 'POST',
    path: () => '/api/immosurance/curricula/add',
    body: (form) => ({
      immosurance_admin_user_id: form.immosurance_admin_user_id.value,
      language: getOptionalValue(form, 'language'),
    }),
  },
  editCurriculumRedirect: {
    method: 'POST',
    path: (form) => `/api/immosurance/curricula/${form.curriculum_id.value}/edit`,
    body: (form) => ({
      immosurance_admin_user_id: form.immosurance_admin_user_id.value,
      language: getOptionalValue(form, 'language'),
    }),
  },
  userStatus: {
    method: 'PATCH',
    path: (form) => `/api/immosurance/curricula/${form.curriculum_id.value}/users/status`,
    body: (form) => ({
      immosurance_user_id: form.immosurance_user_id.value,
      is_active: form.is_active.value === 'true',
    }),
  },
  allUsersStatus: {
    method: 'PATCH',
    path: (form) => `/api/immosurance/curricula/${form.curriculum_id.value}/users/status/all`,
    body: (form) => ({
      immosurance_org_id: form.immosurance_org_id.value,
      is_active: form.is_active.value === 'true',
    }),
  },
  results: {
    method: 'GET',
    path: () => '/api/immosurance/results',
    query: (form) => {
      const scope = form.scope.value || undefined;
      const q = {};
      if (scope === 'global') {
        q.scope = 'global';
        const orgId = form.immosurance_org_id.value || undefined;
        if (orgId) q.immosurance_org_id = orgId;
      } else {
        const userId = form.immosurance_user_id.value || undefined;
        if (userId) q.immosurance_user_id = userId;
      }
      return q;
    },
  },
  userActivityLogs: {
    method: 'GET',
    path: () => '/api/immosurance/user-activity-logs',
    query: (form) => ({
      immosurance_user_id: form.immosurance_user_id.value,
      date_from: getOptionalValue(form, 'date_from'),
      date_to: getOptionalValue(form, 'date_to'),
      event_type: getOptionalValue(form, 'event_type'),
      limit: getOptionalValue(form, 'limit'),
      lang: getOptionalValue(form, 'lang'),
    }),
  },
  curriculumAuditLogs: {
    method: 'GET',
    path: () => '/api/immosurance/curriculum-audit-logs',
    query: (form) => {
      const scope = form.scope.value || undefined;
      const q = {};
      if (scope === 'global') {
        q.scope = 'global';
      } else {
        const orgId = form.immosurance_org_id.value || undefined;
        if (orgId) q.immosurance_org_id = orgId;
      }
      q.date_from = getOptionalValue(form, 'date_from');
      q.date_to = getOptionalValue(form, 'date_to');
      q.entity_type = getOptionalValue(form, 'entity_type');
      q.limit = getOptionalValue(form, 'limit');
      q.lang = getOptionalValue(form, 'lang');
      return q;
    },
  },
};

function buildUrl(baseUrl, path, queryParams) {
  const url = new URL(path, baseUrl);
  if (apiKeyInput.value) {
    url.searchParams.set('api_key', apiKeyInput.value);
  }
  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, value);
      }
    });
  }
  return url.toString();
}

async function sendRequest(endpointKey, config, form) {
  const baseUrl = baseUrlInput.value || 'https://edu.immosurance.net';
  const path = typeof config.path === 'function' ? config.path(form) : config.path;
  const query = config.query ? config.query(form) : undefined;
  const url = buildUrl(baseUrl, path, query);

  const options = {
    method: config.method,
    headers: {
      'Accept': 'application/json',
    },
  };

  if (config.body) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(config.body(form));
  }

  responseMeta.textContent = `Request: ${config.method} ${url}`;
  responseOutput.textContent = 'Loading...';

  try {
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type') || '';
    let payload;
    if (contentType.includes('application/json')) {
      payload = await response.json();
    } else {
      payload = await response.text();
    }

    responseMeta.textContent = `Response: ${response.status} ${response.statusText}`;
    responseOutput.textContent = JSON.stringify(payload, null, 2);

    // Overview tables: show only for relevant endpoints
    const hideAllOverviews = () => {
      if (learningStatusesWrap) learningStatusesWrap.hidden = true;
      if (curriculaListWrap) curriculaListWrap.hidden = true;
      if (activityLogsWrap) activityLogsWrap.hidden = true;
      if (auditLogsWrap) auditLogsWrap.hidden = true;
    };

    if (endpointKey === 'results' && Array.isArray(payload) && response.ok) {
      hideAllOverviews();
      renderLearningStatuses(payload);
    } else if (endpointKey === 'curriculaList' && response.ok && payload && Array.isArray(payload.data)) {
      hideAllOverviews();
      renderCurriculaList(payload);
    } else if (endpointKey === 'userActivityLogs' && Array.isArray(payload) && response.ok) {
      hideAllOverviews();
      renderUserActivityLogs(payload);
    } else if (endpointKey === 'curriculumAuditLogs' && Array.isArray(payload) && response.ok) {
      hideAllOverviews();
      renderCurriculumAuditLogs(payload);
    } else {
      hideAllOverviews();
    }

    // If response contains redirect_url, add a button to open it
    responseActions.innerHTML = ''; // Clear previous actions
    
    if (payload && typeof payload === 'object' && payload.redirect_url) {
      const redirectButton = document.createElement('button');
      redirectButton.textContent = '🔗 Open Redirect URL (Auto-Login)';
      redirectButton.className = 'redirect-button';
      redirectButton.onclick = () => {
        window.open(payload.redirect_url, '_blank');
      };
      responseActions.appendChild(redirectButton);
      
      // Also show a copy URL button
      const copyButton = document.createElement('button');
      copyButton.textContent = '📋 Copy Redirect URL';
      copyButton.className = 'redirect-button';
      copyButton.style.background = '#6366f1';
      copyButton.style.marginLeft = '10px';
      copyButton.onclick = () => {
        navigator.clipboard.writeText(payload.redirect_url).then(() => {
          copyButton.textContent = '✓ Copied!';
          setTimeout(() => {
            copyButton.textContent = '📋 Copy Redirect URL';
          }, 2000);
        });
      };
      responseActions.appendChild(copyButton);
    }
  } catch (error) {
    responseMeta.textContent = 'Request failed';
    responseOutput.textContent = error.message || String(error);
    
    // Remove redirect button on error
    const existingButton = responseMeta.parentElement.querySelector('.redirect-button');
    if (existingButton) {
      existingButton.remove();
    }
  }
}

document.querySelectorAll('form[data-endpoint]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const key = form.getAttribute('data-endpoint');
    const config = endpoints[key];
    if (!config) {
      return;
    }
    sendRequest(key, config, form);
  });
});

(function () {
  'use strict';

  var driverFn = null;
  if (window.driver && window.driver.js && typeof window.driver.js.driver === 'function') {
    driverFn = window.driver.js.driver;
  } else if (window['driver.js'] && typeof window['driver.js'].driver === 'function') {
    driverFn = window['driver.js'].driver;
  } else if (window.driverJs && typeof window.driverJs.driver === 'function') {
    driverFn = window.driverJs.driver;
  } else if (typeof window.driver === 'function') {
    driverFn = window.driver;
  }
  if (!driverFn) return;

  var driverObj = driverFn({
    animate: true,
    showProgress: true,
    allowClose: true,
    smoothScroll: true,
    overlayColor: 'rgba(15, 23, 42, 0.85)',
    overlayOpacity: 0.85,
    stagePadding: 14,
    stageRadius: 12,
    popoverOffset: 16,
    popoverClass: 'driver-tour-popover',
    progressText: '{{current}} / {{total}}',
    steps: [
      {
        element: '.site-header',
        popover: {
          title: 'Welcome to EDU Immosurance API Tester',
          description: 'This tool lets you call EDU Immosurance APIs from the browser. Use "Next" to walk through each section, or "Start Tour" anytime to repeat.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#tour-global-settings',
        popover: {
          title: 'Global Settings',
          description: 'Set the Base URL and your API key here. The key is sent as a query parameter. Keep it secret and never commit it to version control.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#tour-admins-sync',
        popover: {
          title: 'Admin + Organization Sync',
          description: 'Sync an admin user and their organization. Use this to create or update an admin and link them to an organization.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#tour-user-exists',
        popover: {
          title: 'User Exists',
          description: 'Check whether a user exists in the system by immosurance_user_id.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#tour-user-status-toggle',
        popover: {
          title: 'User Deactivate / Reactivate',
          description: 'Deactivate or reactivate a user. Deactivation keeps curricula and learning data; reactivation restores access.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#tour-user-delete',
        popover: {
          title: 'User Delete (Permanent)',
          description: 'Permanently delete a user. This revokes curricula assignments and learning data. Use with care.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#tour-curricula-list',
        popover: {
          title: 'Curricula List',
          description: 'List curricula for an organization. The response includes active_employees per curriculum. Optionally filter by status (active/inactive).',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#tour-curriculum-status',
        popover: {
          title: 'Curriculum Active/Inactive (Org)',
          description: 'Enable or disable a curriculum at the organization level.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#tour-start-course',
        popover: {
          title: 'Start Course (Redirect with Auto-Login)',
          description: 'Get a redirect URL with auto-login token so a user can start a course. Optional language parameter for the UI.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#tour-add-curriculum',
        popover: {
          title: 'Redirect Admin to Add Curriculum',
          description: 'Get a redirect URL so an admin is auto-logged in and sent to the curriculum creation page.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#tour-edit-curriculum',
        popover: {
          title: 'Redirect Admin to Edit Curriculum',
          description: 'Get a redirect URL to the EDU curriculum edit page for a specific curriculum. Admin only. Token valid 5 minutes, single use.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#tour-user-status',
        popover: {
          title: 'Curriculum Active/Inactive (Single User)',
          description: 'Activate or deactivate a specific curriculum for one user.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#tour-all-users-status',
        popover: {
          title: 'Curriculum Active/Inactive (All Users in Org)',
          description: 'Set curriculum active/inactive for all users in an organization in one call.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#tour-results',
        popover: {
          title: 'Learning Statuses (Results)',
          description: 'Fetch learning results. Admins get org-wide data; users get their own. Use scope=global with a global API key for cross-org data. Response can show a table above the raw JSON.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#tour-user-activity-logs',
        popover: {
          title: 'User Activity Logs',
          description: 'Returns activity logs for a user (login, logout, training complete, assessment submit, certificate issued, etc.). Filter by date range and event type.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#tour-curriculum-audit-logs',
        popover: {
          title: 'Curriculum Audit Logs',
          description: 'Returns audit logs for curriculum-related changes (CRUD on curricula, trainings, assessments, user assignments, Vimeo uploads). Use scope=global for cross-org access.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#tour-response',
        popover: {
          title: 'Response',
          description: 'API responses appear here: status, headers, and JSON body. For Learning Statuses, a summary table is shown when applicable.',
          side: 'top',
          align: 'start'
        }
      }
    ]
  });

  var startBtn = document.getElementById('startTour');
  if (startBtn) {
    startBtn.addEventListener('click', function () {
      driverObj.drive();
    });
  }
})();

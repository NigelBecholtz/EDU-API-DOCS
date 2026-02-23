# EDU Immosurance API

All endpoints are server-to-server. AML is the client, EDU is the server.
Authentication is via query parameter `api_key`.

Base URL: `https://edu.immosurance.net`

## Authentication

Include the API key as a query parameter:

```
?api_key=YOUR_API_KEY
```

Use HTTPS only. Do not log or expose the API key.

## Common Errors

- `401` API key required or invalid
  - `{"message":"API key is required."}`
  - `{"message":"Invalid API key."}`
- `404` Resource not found
  - `{"message":"User not found."}`
  - `{"message":"Organization not found."}`
- `422` Validation error

---

## 1) Create or Update Admin + Organization

Create or update an organization and its admin user. If they do not exist, they will be created.

**Endpoint**

`POST /api/immosurance/admins/sync?api_key=YOUR_API_KEY`

**Request Body**

```json
{
  "immosurance_user_id": "user-123",
  "immosurance_org_id": "org-456",
  "email": "admin@example.com",
  "name": "First Last",
  "organization_name": "Fiscal Business Name",
  "is_admin": true
}
```

**Success Response (200)**

```json
{
  "organization": {
    "id": 10,
    "immosurance_org_id": "org-456",
    "name": "Fiscal Business Name"
  },
  "user": {
    "id": 99,
    "immosurance_user_id": "user-123",
    "email": "admin@example.com",
    "name": "First Last",
    "is_admin": true
  }
}
```

---

## 1a) Check User Exists

Checks whether a user exists in EDU for a given `immosurance_user_id`.

**Endpoint**

`GET /api/immosurance/users/exists?immosurance_user_id=user-123&api_key=YOUR_API_KEY`

**Success Response (200)**

```json
{
  "exists": true,
  "is_active": true,
  "user_id": 99
}
```

---

## 1b) Deactivate or Reactivate User

Marks a user as inactive/active. Deactivation does **not** delete curricula assignments or learning data, so reactivation restores access to existing data.

**Endpoint**

`PATCH /api/immosurance/users/status?api_key=YOUR_API_KEY`

**Request Body**

```json
{
  "immosurance_user_id": "user-123",
  "is_active": false
}
```

**Success Response (200)**

```json
{
  "user_id": 99,
  "immosurance_user_id": "user-123",
  "is_active": false,
  "deactivated_at": "2026-01-27T10:15:00.000000Z",
  "reactivated_at": null
}
```

---

## 1c) Delete User Permanently

Deletes a user and revokes all curricula assignments and learning data. Uses query parameters (no request body) for compatibility with API testing tools and HTTP standards.

**Endpoint**

`DELETE /api/immosurance/users?immosurance_user_id=user-123&api_key=YOUR_API_KEY`

**Query Parameters**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `immosurance_user_id` | yes | The user to delete |
| `api_key` | yes | API authentication |

**Success Response (200)**

```json
{
  "user_id": 99,
  "immosurance_user_id": "user-123",
  "deleted": true,
  "revoked": {
    "curricula_detached": 3,
    "user_progress_deleted": 12,
    "assessment_answers_deleted": 24,
    "assessment_attempts_deleted": 6,
    "certificates_deleted": 2
  }
}
```

---

## 2) List Curricula for Organization

List curricula for an organization. Filters by active status if provided.

**Endpoint**

`GET /api/immosurance/curricula?immosurance_org_id=org-456&api_key=YOUR_API_KEY`

Optional: `status=active|inactive`

**Success Response (200)**

```json
{
  "data": [
    {
      "id": 1,
      "title": { "en": "Wwft Basics" },
      "description": { "en": "..." },
      "is_global": false,
      "is_active": true,
      "base_is_active": true,
      "org_is_active": true,
      "active_employees": [
        {
          "user_id": 10,
          "immosurance_user_id": "user-2",
          "immosurance_user_name": "John Doe",
          "name": "John Doe",
          "email": "john@example.com"
        }
      ]
    }
  ]
}
```

---

## 3) Set Curriculum Active/Inactive

Toggle curriculum active state for an organization.

**Endpoint**

`PATCH /api/immosurance/curricula/{curriculum}/status?api_key=YOUR_API_KEY`

**Request Body**

```json
{
  "immosurance_org_id": "org-456",
  "is_active": false
}
```

**Success Response (200)**

```json
{
  "id": 1,
  "is_active": false
}
```

---

## 4) Start Course (Redirect with Auto-Login)

Returns a redirect URL to the selected curriculum with automatic login.

**Endpoint**

`POST /api/immosurance/curricula/{curriculum}/start?api_key=YOUR_API_KEY`

**Request Body**

```json
{
  "immosurance_user_id": "user-123",
  "language": "nl"
}
```

Optional `language`: EDU language code (e.g. `en`, `nl`, `de`). When provided, the user's interface language is set to this after login (same as the language selector in the nav). AML codes like `gr` (Greek), `al` (Albanian), `es_AR` (Spanish) are normalized.

**Success Response (200)**

```json
{
  "curriculum_id": 1,
  "redirect_path": "/my/curricula/1",
  "redirect_url": "https://edu.immosurance.net/auth/immosurance-login?token=..."
}
```

**Note:** The `redirect_url` includes an automatic login token. The token is valid for 5 minutes and can only be used once. If `language` was sent, the platform applies it after login (no URL parameter).

---

## 4b) Redirect Admin to Add Curriculum (Auto-Login)

Returns a redirect URL to the EDU curriculum creation page with automatic login.

**Endpoint**

`POST /api/immosurance/curricula/add?api_key=YOUR_API_KEY`

**Request Body**

```json
{
  "immosurance_admin_user_id": "user-123",
  "language": "nl"
}
```

Optional `language`: EDU language code. When provided, the admin's interface language is set after login (same as the language selector in the nav).

**Success Response (200)**

```json
{
  "redirect_path": "/curricula/create",
  "redirect_url": "https://edu.immosurance.net/auth/immosurance-login?token=..."
}
```

**Note:** The `redirect_url` includes an automatic login token. The token is valid for 5 minutes and can only be used once. If `language` was sent, the platform applies it after login (no URL parameter).

---

## 4b2) Redirect Admin to Curriculum (Auto-Login)

Returns a redirect URL to the EDU **curriculum page** for a specific curriculum with automatic login. **Admin only.** Use this when redirecting from AML to EDU so the admin lands directly on the curriculum view page (e.g. `https://edu.immosurance.net/curricula/7`).

**Endpoint**

`POST /api/immosurance/curricula/{curriculum}/edit?api_key=YOUR_API_KEY`

Replace `{curriculum}` with the curriculum ID (e.g. `3` for AML Compliance Training).

**Request Body**

```json
{
  "immosurance_admin_user_id": "user-123",
  "language": "nl"
}
```

- `immosurance_admin_user_id`: required. The admin user in EDU (must be admin or super admin).
- `language`: optional. EDU language code; sets interface language after login.

**Success Response (200)**

```json
{
  "curriculum_id": 3,
  "redirect_path": "/curricula/3",
  "redirect_url": "https://edu.immosurance.net/auth/immosurance-login?token=..."
}
```

**Errors**

- `403` User is not an admin, or curriculum is not available for the admin's organization (org admins can only view curricula belonging to their org or global curricula assigned to their org; super admins can view any).
- `404` User not found.

**Note:** The `redirect_url` includes an automatic login token. The token is valid for 5 minutes and can only be used once. After login, the admin is taken to `/curricula/{id}` (the curriculum view page).

---

## 4c) Set Curriculum Active/Inactive for Single User

**Endpoint**

`PATCH /api/immosurance/curricula/{curriculum}/users/status?api_key=YOUR_API_KEY`

**Request Body**

```json
{
  "immosurance_user_id": "user-123",
  "is_active": false
}
```

**Success Response (200)**

```json
{
  "curriculum_id": 1,
  "user_id": 99,
  "immosurance_user_id": "user-123",
  "is_active_for_user": false
}
```

---

## 4d) Set Curriculum Active/Inactive for All Users (Organization)

**Endpoint**

`PATCH /api/immosurance/curricula/{curriculum}/users/status/all?api_key=YOUR_API_KEY`

**Request Body**

```json
{
  "immosurance_org_id": "org-456",
  "is_active": false
}
```

**Success Response (200)**

```json
{
  "curriculum_id": 1,
  "organization_id": 5,
  "immosurance_org_id": "org-456",
  "is_active_for_user": false,
  "updated_count": 30,
  "created_count": 12,
  "total_affected": 42
}
```

---

## 5) Learning Statuses (Results)

Returns learning progress and statuses. Behavior depends on the requesting user:

- **ADMIN**: returns all employees in the organization (admins + users)
- **USER**: returns only that user's data
- **GLOBAL (scope=global)**: returns all employees across all organizations (requires API key with `scope=global`)

**Endpoint**

`GET /api/immosurance/results?immosurance_user_id=user-123&api_key=YOUR_API_KEY`

**Global Endpoint (optional org filter)**

`GET /api/immosurance/results?scope=global&immosurance_org_id=org-123&api_key=YOUR_API_KEY`

**Success Response (200)**

```json
[
  {
    "user_id": 99,
    "immosurance_user_id": "user-123",
    "immosurance_user_name": "John Doe",
    "curriculums": [
      {
        "course_id": 1,
        "course_name": { "en": "Basic Safety" },
        "updated_last": "2026-01-26T10:15:00.000000Z",
        "total_completion_percentage": 50,
        "status": "active",
        "certification_status": "certified",
        "trainings": [
          {
            "training_id": 10,
            "training_name": { "en": "Intro Training" },
            "completion_status": "completed",
            "latest_score_percent": 100,
            "date_last_completion": "2026-01-26T10:15:00.000000Z"
          }
        ]
      }
    ]
  }
]
```

**Per-training fields**

- `training_id`: numeric for a training, `null` for standalone (final) assessments
- `display_id`: string ID for the UI — same as `training_id` for trainings, or `FA-{assessment_id}` for final/standalone assessments
- `date_last_completion`: date of the last completed assessment (test); uses `completed_at` or `updated_at` on the attempt

**Status values**

- `completion_status` (per training): `not_started`, `in_progress`, `completed`, `passed`, `failed`
- `certification_status` (per curriculum): `not_certified`, `certified`, `expired`

---

## 6) User Activity Logs

Returns activity logs for a user identified by `immosurance_user_id` (e.g. login, logout, training complete, assessment submit, certificate issued).

**Endpoint**

`GET /api/immosurance/user-activity-logs?immosurance_user_id=user-123&api_key=YOUR_API_KEY`

**Query Parameters**

| Parameter | Required | Description |
|-----------|----------|-------------|
| immosurance_user_id | Yes | User identifier from AML |
| date_from | No | Filter from date (YYYY-MM-DD) |
| date_to | No | Filter to date (YYYY-MM-DD) |
| event_type | No | Filter by event type (login, logout, training_complete, assessment_submit, certificate_issued, module_start, training_start) |
| limit | No | Max results (1–500, default 100) |
| lang | No | Language code for translated descriptions. When set, `description`, `event_type_translated`, and `status_translated` are returned in the requested language. Supported: `en`, `es`, `de`, `fr`, `it`, `nl`, `ro`, `el`, `sq`, `sk`, `lv`, `bg`, `fi`, `ca` |

**Success Response (200)**

Without `lang`:

```json
[
  {
    "id": 1,
    "event_type": "training_complete",
    "description": "activity_log.desc.training_complete",
    "description_key": "activity_log.desc.training_complete",
    "status": "success",
    "created_at": "2026-02-11T10:15:00.000000Z",
    "metadata": { "training_id": 10, "training_title": "Intro Training" }
  }
]
```

With `lang=nl`:

```json
[
  {
    "id": 1,
    "event_type": "training_complete",
    "description": "Training voltooid",
    "description_key": "activity_log.desc.training_complete",
    "event_type_translated": "Training voltooid",
    "status_translated": "Succes",
    "status": "success",
    "created_at": "2026-02-11T10:15:00.000000Z",
    "metadata": { "training_id": 10, "training_title": "Intro Training" }
  }
]
```

---

## 7) Curriculum Audit Logs

Returns audit logs for curriculum-related changes (CRUD on curricula, trainings, assessments, user assignments, Vimeo uploads).

**Endpoint (org-scoped)**

`GET /api/immosurance/curriculum-audit-logs?immosurance_org_id=org-456&api_key=YOUR_API_KEY`

**Endpoint (global, requires scope=global API key)**

`GET /api/immosurance/curriculum-audit-logs?scope=global&api_key=YOUR_API_KEY`

**Query Parameters**

| Parameter | Required | Description |
|-----------|----------|-------------|
| immosurance_org_id | Yes (unless scope=global) | Organization identifier from AML |
| scope | No | Set to `global` for cross-org access (requires API key with scope=global) |
| date_from | No | Filter from date (YYYY-MM-DD) |
| date_to | No | Filter to date (YYYY-MM-DD) |
| entity_type | No | Filter by type (curriculum, training, assessment, curriculum_user_assignment, vimeo) |
| limit | No | Max results (1–500, default 100) |
| lang | No | Language code for translated entity_type, action, and description. Supported: `en`, `es`, `de`, `fr`, `it`, `nl`, `ro`, `el`, `sq`, `sk`, `lv`, `bg`, `fi`, `ca` |

**Success Response (200)**

Without `lang`:

```json
[
  {
    "id": 1,
    "entity_type": "training",
    "action": "updated",
    "description": "training #10 updated",
    "user_id": 99,
    "curriculum_id": 1,
    "training_id": 10,
    "assessment_id": null,
    "metadata": {},
    "created_at": "2026-02-11T10:15:00.000000Z"
  }
]
```

With `lang=nl`:

```json
[
  {
    "id": 1,
    "entity_type": "training",
    "entity_type_translated": "Training",
    "action": "updated",
    "action_translated": "Bijgewerkt",
    "description": "Training #10 Bijgewerkt",
    "user_id": 99,
    "curriculum_id": 1,
    "training_id": 10,
    "assessment_id": null,
    "metadata": {},
    "created_at": "2026-02-11T10:15:00.000000Z"
  }
]
```

---

## Zudoku Documentation

The `docs/` folder contains a **Zudoku**-powered documentation site with:

- Interactive API reference (from OpenAPI spec)
- MDX documentation pages
- Search, dark mode, and modern UI

### Running the docs

```bash
cd docs
npm install
npm run dev
```

Visit **http://localhost:3000** for the documentation site.

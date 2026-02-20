# Mirror Feature — Appwrite Schema Reference

## Collection: `work_sessions`

Create this collection in your Appwrite console:
**Databases → [your database] → Create Collection**
- Collection ID: `work_sessions`
- Name: `work_sessions`

### Attributes

| Attribute Key | Type | Required | Size / Range | Notes |
|---|---|---|---|---|
| `user_id` | String | ✅ Yes | 36 | Appwrite user `$id` |
| `started_at` | String | ✅ Yes | 30 | ISO 8601 datetime, e.g. `2026-02-19T13:00:00.000Z` |
| `ended_at` | String | ✅ Yes | 30 | ISO 8601 datetime |
| `duration_min` | Integer | ✅ Yes | min: 0, max: 1440 | Rounded minutes |
| `task_type` | String | ✅ Yes | 20 | Enum: `creative`, `analytical`, `admin`, `learning`, `maintenance` |
| `environment` | String | ✅ Yes | 20 | Enum: `silent`, `ambient_music`, `content_audio`, `noisy`, `variable` |
| `energy_in` | Integer | ✅ Yes | min: 1, max: 5 | How the user felt going in |
| `quality_out` | Integer | ✅ Yes | min: 1, max: 5 | How the session went |
| `was_planned` | Boolean | ✅ Yes | — | Was the session scheduled in advance? |
| `was_interrupted` | Boolean | ✅ Yes | — | Was the session interrupted? |
| `notes` | String | ❌ No | 200 | Optional free-text note |

### Permissions

After creating the collection, go to **Settings → Permissions** and add:

| Role | Create | Read | Update | Delete |
|---|---|---|---|---|
| `users` | ✅ | ✅ | — | ✅ |

> This lets any authenticated user create, read, and delete their own sessions.
> Appwrite's document-level security will scope reads to the `user_id` filter in code.

### Index (optional but recommended for perf)

Add an **Index** on `started_at` (type: Key, order: DESC) so the `getWorkSessions` query sorts efficiently.

### Required Index for Query

Appwrite requires an index for any attribute used in `Query.greaterThanEqual`. Add:
- Attribute: `started_at`, Type: Key, Order: ASC

### Environment Variable

Add to your `.env` after creating the collection:

```
VITE_APPWRITE_COLLECTION_WORK_SESSIONS=work_sessions
```

---

> **Note for Insights Mode (Prompt 2):** `getWorkSessions` defaults to 30 days. Pattern detection may need a higher default (60–90 days). Plan to make `limitDays` a parameter you can override per call-site.

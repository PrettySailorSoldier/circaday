# Sleep Tracker — Appwrite Schema Reference

## Collection: `sleep_logs`

Create in: **Databases → [your database] → Create Collection**
- Collection ID: `sleep_logs`
- Name: `sleep_logs`

### Attributes

| `Attribute Key` | `Type` | `Required` | `Size / Range` | `Notes` |
| --- | --- | --- | --- | --- |
| `user_id` | String | ✅ Yes | 36 | Appwrite user `$id` |
| `log_date` | String | ✅ Yes | 10 | YYYY-MM-DD |
| `bedtime` | String | ✅ Yes | 5 | HH:MM (24h), e.g. `23:30` |
| `wake_time` | String | ✅ Yes | 5 | HH:MM (24h), e.g. `07:15` |
| `duration_min` | Integer | ✅ Yes | — | Total minutes of sleep |
| `used_alarm` | Boolean | ✅ Yes | — | |
| `is_free_day` | Boolean | ✅ Yes | — | No obligations, slept naturally |
| `sleep_quality` | Integer | ✅ Yes | min: 1, max: 5 | |
| `morning_feel` | Integer | ✅ Yes | min: 1, max: 5 | How they felt 1 hour after waking |
| `notes` | String | ❌ No | 150 | Optional |

### Permissions

**Settings → Permissions** → `users` role:

| Create | Read | Update | Delete |
| --- | --- | --- | --- |
| ✅ | ✅ | ✅ | ✅ |

### Index (required for query)

Add index on `log_date` (type: Key, order: DESC) — needed for `Query.orderDesc`.
Also add index on `user_id` (type: Key) for filtering.

### Environment Variable

```bash
VITE_APPWRITE_COLLECTION_SLEEP_LOGS=sleep_logs
```

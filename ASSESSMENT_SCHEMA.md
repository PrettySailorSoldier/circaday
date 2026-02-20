# Assessment Schema — `profiles` Collection Additions

These fields should be added to the existing **`profiles`** Appwrite collection.
Navigate to: **Database → profiles → Attributes → Create Attribute**

---

## New Attributes

| Attribute Key | Type | Required | Size / Range | Notes |
| --- | --- | --- | --- | --- |
| `chronotype_score` | Integer | ❌ No | 0–100 | Higher = more evening/Wolf leaning |
| `productivity_style` | String | ❌ No | 30 | `prioritizer` / `planner` / `arranger` / `visualizer` |
| `procrastination_type` | String | ❌ No | 30 | `perfectionist` / `thrill_seeker` / `overwhelmed` / `interest_blocked` / `anxious` / `rebellious` |
| `habit_tendency` | String | ❌ No | 20 | `upholder` / `questioner` / `obliger` / `rebel` |
| `social_jetlag` | Integer | ❌ No | 0–300 | Estimated minutes of social jetlag |
| `demand_avoidance` | Integer | ❌ No | 0–10 | |
| `initiation_difficulty` | Integer | ❌ No | 0–10 | |
| `hyperfocus_tendency` | Integer | ❌ No | 0–10 | |
| `sensory_sensitivity` | Integer | ❌ No | 0–10 | |
| `structure_preference` | String | ❌ No | 20 | `rigid` / `thematic` / `fluid` |

---

## All Attributes Are Optional

These are derived from the quiz scoring engine and written to the profile on completion. They are all optional so that existing users without dimensional scores are not broken.

---

## Existing Attributes (Keep As-Is)

| Attribute Key | Type | Notes |
| --- | --- | --- |
| `archetype_id` | String | e.g. `wandering_wolf` |
| `quiz_answers` | String | JSON string of raw answers |
| `user_id` | String | Appwrite user `$id` |

---

## Index (Optional — for future analytics)

If you want to query users by type in the future, add a key index on:

- `productivity_style`
- `procrastination_type`
- `habit_tendency`

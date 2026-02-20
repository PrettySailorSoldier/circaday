import { Client, Account, Databases, ID, Query } from 'appwrite'

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID)

export const account = new Account(client)
export const databases = new Databases(client)
export const ID_GEN = ID

export const DB = import.meta.env.VITE_APPWRITE_DATABASE_ID

export const COL = {
  profiles:     import.meta.env.VITE_APPWRITE_COLLECTION_PROFILES,
  intentions:   import.meta.env.VITE_APPWRITE_COLLECTION_INTENTIONS,
  habits:       import.meta.env.VITE_APPWRITE_COLLECTION_HABITS,
  habitLogs:    import.meta.env.VITE_APPWRITE_COLLECTION_HABIT_LOGS,
  systems:      import.meta.env.VITE_APPWRITE_COLLECTION_SYSTEMS,
  workSessions: import.meta.env.VITE_APPWRITE_COLLECTION_WORK_SESSIONS,
  sleepLogs:    import.meta.env.VITE_APPWRITE_COLLECTION_SLEEP_LOGS,
}

export { Query }

export type StorageDriver = "local" | "session"

const STORAGE_TEST_KEY = "__storage_test__"
const STORAGE_MAX_BYTES = 5_000_000

interface StoredPayload<T> {
  version: number
  expiresAt: number | null
  data: T
}

function getStorageDriver(area: StorageDriver = "local"): Storage | null {
  if (typeof window === "undefined") {
    return null
  }

  return area === "session" ? window.sessionStorage : window.localStorage
}

function buildStorageKey(key: string, namespace?: string): string {
  const formattedNamespace = namespace?.toString().trim()
  return formattedNamespace ? `${formattedNamespace}_${key}` : key
}

function getSizeInBytes(value: string): number {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(value).length
  }

  return value.length * 2
}

export function isStorageAvailable(area: StorageDriver = "local"): boolean {
  const driver = getStorageDriver(area)
  if (!driver) {
    return false
  }

  try {
    driver.setItem(STORAGE_TEST_KEY, "1")
    driver.removeItem(STORAGE_TEST_KEY)
    return true
  } catch {
    return false
  }
}

export function setStorageItem<T>(
  key: string,
  data: T,
  options?: {
    namespace?: string
    area?: StorageDriver
    expiresInMinutes?: number
  }
): boolean {
  const driver = getStorageDriver(options?.area)
  if (!driver || !isStorageAvailable(options?.area)) {
    return false
  }

  try {
    const expiresAt = options?.expiresInMinutes
      ? Date.now() + options.expiresInMinutes * 60_000
      : null

    const payload: StoredPayload<T> = {
      version: 1,
      expiresAt,
      data,
    }

    const serialized = JSON.stringify(payload)
    if (getSizeInBytes(serialized) > STORAGE_MAX_BYTES) {
      console.warn(
        "Storage item exceeds browser storage limits and will not be saved."
      )
      return false
    }

    const storageKey = buildStorageKey(key, options?.namespace)
    driver.setItem(storageKey, serialized)
    return true
  } catch (err) {
    console.error("Failed to save storage item.", err)
    return false
  }
}

export function getStorageItem<T>(
  key: string,
  options?: {
    namespace?: string
    area?: StorageDriver
    rawKey?: boolean
  }
): T | null {
  const driver = getStorageDriver(options?.area)
  if (!driver || !isStorageAvailable(options?.area)) {
    return null
  }

  try {
    const storageKey = options?.rawKey
      ? key
      : buildStorageKey(key, options?.namespace)

    const raw = driver.getItem(storageKey)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as StoredPayload<T>
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
      driver.removeItem(storageKey)
      return null
    }

    return parsed.data
  } catch (err) {
    console.error("Failed to read storage item.", err)
    return null
  }
}

export function removeStorageItem(
  key: string,
  options?: {
    namespace?: string
    area?: StorageDriver
    rawKey?: boolean
  }
): boolean {
  const driver = getStorageDriver(options?.area)
  if (!driver || !isStorageAvailable(options?.area)) {
    return false
  }

  try {
    const storageKey = options?.rawKey
      ? key
      : buildStorageKey(key, options?.namespace)
    driver.removeItem(storageKey)
    return true
  } catch (err) {
    console.error("Failed to remove storage item.", err)
    return false
  }
}

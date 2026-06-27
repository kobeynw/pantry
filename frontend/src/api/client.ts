const apiUrl = import.meta.env.VITE_API_URL;

export default async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const url = apiUrl + path
  const res = await fetch(url, init)

  if (!res.ok) {
    let detail = res.statusText
    try {
      const body = await res.json()
      if (body?.detail) detail = body.detail
    } catch {}
    throw new Error(`API ${res.status}: ${detail}`)
  }

  return res.json() as Promise<T>
}

const BASE = "/api";

async function req(path, opts = {}) {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    const msg = await res.json().catch(() => ({}));
    throw new Error(msg.error || `Request failed (${res.status})`);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  list: () => req("/notes"),
  get: (id) => req(`/notes/${id}`),
  create: (data) => req("/notes", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => req(`/notes/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id) => req(`/notes/${id}`, { method: "DELETE" }),
};

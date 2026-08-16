const BASE = "/api";

async function req(path, opts = {}) {
  const token = localStorage.getItem("notely-token");
  const res = await fetch(BASE + path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
  });
  if (!res.ok) {
    const msg = await res.json().catch(() => ({}));
    throw new Error(msg.error || `Request failed (${res.status})`);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  register: (details) => req("/auth/register", { method: "POST", body: JSON.stringify(details) }),
  login: (email, password) => req("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  me: () => req("/auth/me"),
  list: () => req("/notes"),
  get: (id) => req(`/notes/${id}`),
  create: (data) => req("/notes", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => req(`/notes/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id) => req(`/notes/${id}`, { method: "DELETE" }),
};

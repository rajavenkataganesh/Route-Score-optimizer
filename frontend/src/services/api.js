// API Service for communicating with the FastAPI backend
const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://127.0.0.1:8000' : '');

async function handleResponse(response) {
  if (!response.ok) {
    let errorDetail = 'API request failed';
    try {
      const errJson = await response.json();
      if (errJson.detail) {
        if (typeof errJson.detail === 'string') {
          errorDetail = errJson.detail;
        } else if (Array.isArray(errJson.detail)) {
          errorDetail = errJson.detail.map(d => d.msg || JSON.stringify(d)).join(', ');
        }
      }
    } catch {
      errorDetail = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }
  return response.json();
}

export const api = {
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/`);
      return await handleResponse(res);
    } catch (e) {
      // Also try relative path for proxy
      try {
        await fetch(`/api/stats`);
        return { status: 'healthy', viaProxy: true };
      } catch {
        throw e;
      }
    }
  },

  async searchScore(scores, target) {
    const res = await fetch(`${API_BASE}/api/score-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scores, target: Number(target) })
    });
    return handleResponse(res);
  },

  async searchRoute(routes, target) {
    const res = await fetch(`${API_BASE}/api/route-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ routes, target: Number(target) })
    });
    return handleResponse(res);
  },

  async optimizeResources(tasks, workers) {
    const res = await fetch(`${API_BASE}/api/resource-optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks, workers: Number(workers) })
    });
    return handleResponse(res);
  },

  async getHistory() {
    const res = await fetch(`${API_BASE}/api/history`);
    return handleResponse(res);
  },

  async clearHistory() {
    const res = await fetch(`${API_BASE}/api/history`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  },

  async getStats() {
    const res = await fetch(`${API_BASE}/api/stats`);
    return handleResponse(res);
  },

  getCsvExportUrl() {
    return `${API_BASE}/api/export-csv`;
  }
};

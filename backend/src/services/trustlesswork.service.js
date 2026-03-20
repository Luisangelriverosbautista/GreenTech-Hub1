const TRUSTLESSWORK_API_BASE_URL = process.env.TRUSTLESSWORK_API_BASE_URL || 'https://dev.api.trustlesswork.com';

class TrustlessWorkService {
  constructor() {
    this.baseUrl = TRUSTLESSWORK_API_BASE_URL.replace(/\/$/, '');
    this.apiKey = process.env.TRUSTLESSWORK_API_KEY || '';
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.apiKey) {
      headers.Authorization = `Bearer ${this.apiKey}`;
      headers['x-api-key'] = this.apiKey;
    }

    return headers;
  }

  async request(path, options = {}) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...(options.headers || {})
      }
    });

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const details = typeof payload === 'string' ? payload : JSON.stringify(payload);
      throw new Error(`TrustlessWork API error (${response.status}): ${details}`);
    }

    return payload;
  }

  async fundSingleReleaseEscrow(payload) {
    return this.request('/escrow/single-release/fund-escrow', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async approveSingleReleaseEscrow(payload) {
    return this.request('/escrow/single-release/approve-milestone', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async releaseSingleReleaseFunds(payload) {
    return this.request('/escrow/single-release/release-funds', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async approveMultiReleaseMilestone(payload) {
    return this.request('/escrow/multi-release/approve-milestone', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async releaseMultiReleaseMilestoneFunds(payload) {
    return this.request('/escrow/multi-release/release-milestone-funds', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getEscrowsByRole(role, address) {
    const query = new URLSearchParams();
    if (role) query.append('role', role);
    if (address) query.append('address', address);

    const queryString = query.toString();
    const suffix = queryString ? `?${queryString}` : '';

    return this.request(`/helper/get-escrows-by-role${suffix}`, {
      method: 'GET'
    });
  }
}

module.exports = new TrustlessWorkService();

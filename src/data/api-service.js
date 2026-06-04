class ApiService {
  static BASE_URL = 'https://story-api.dicoding.dev/v1';

  static async _fetchJson(url, options = {}) {
    try {
      const response = await fetch(url, options);
      const responseJson = await response.json();
      
      if (!response.ok) {
        throw new Error(responseJson.message || 'Something went wrong');
      }
      
      return responseJson;
    } catch (error) {
      throw new Error(error.message || 'Network error occurred');
    }
  }

  static async register({ name, email, password }) {
    return this._fetchJson(`${this.BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });
  }

  static async login({ email, password }) {
    return this._fetchJson(`${this.BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
  }

  static async getStories(token, { page, size, location = 1 } = {}) {
    let url = `${this.BASE_URL}/stories?location=${location}`;
    if (page) url += `&page=${page}`;
    if (size) url += `&size=${size}`;

    return this._fetchJson(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  static async addStory(token, { description, photoFile, lat, lon }) {
    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photoFile);
    
    if (lat !== undefined && lat !== null && lat !== '') {
      formData.append('lat', lat.toString());
    }
    if (lon !== undefined && lon !== null && lon !== '') {
      formData.append('lon', lon.toString());
    }

    return this._fetchJson(`${this.BASE_URL}/stories`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        // Note: Do not set Content-Type header when sending FormData,
        // the browser will set it automatically with the correct boundary
      },
      body: formData,
    });
  }
  static async subscribePush(token, pushSubscription) {
    const pushData = pushSubscription.toJSON();
    return this._fetchJson(`${this.BASE_URL}/notifications/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        endpoint: pushData.endpoint,
        keys: {
          p256dh: pushData.keys.p256dh,
          auth: pushData.keys.auth,
        },
      }),
    });
  }

  static async unsubscribePush(token, pushSubscription) {
    const pushData = pushSubscription.toJSON();
    return this._fetchJson(`${this.BASE_URL}/notifications/subscribe`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        endpoint: pushData.endpoint,
      }),
    });
  }
}

export default ApiService;

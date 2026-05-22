const TOKEN_KEY = 'dicoding_story_token';
const USER_KEY = 'dicoding_story_user';

class AuthRepository {
  static saveToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  static getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  static saveUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  static getUser() {
    const userStr = localStorage.getItem(USER_KEY);
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  static isAuthenticated() {
    return !!this.getToken();
  }

  static clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

export default AuthRepository;

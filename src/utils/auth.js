// Utility to get login token from localStorage
export function getLoginToken() {
  return localStorage.getItem('cms_auth_token');
}

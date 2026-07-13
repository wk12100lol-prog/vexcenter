const API_BASE_URL = 'https://vexcenter1.vercel.app/api';
const SERVER_URL = 'https://vexcenter1.vercel.app';

function img(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  if (path.startsWith('db:')) return API_BASE_URL + '/image?id=' + path.slice(3);
  return SERVER_URL + '/' + path.replace(/^\/+/, '');
}

import axios from 'axios';

/**
 * @param {string} query
 * @param {number} page
 * @returns {Promise<Object>} response.data
 */

export async function getImagesByQuery(query, page = 1) {
  const API_KEY = '53391690-3e647f595737bbf778d07baf8';
  const BASE_URL = 'https://pixabay.com/api/';

  const params = {
    key: API_KEY,
    q: query,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: 15,
    page,
  };

  try {
    const response = await axios.get(BASE_URL, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
}

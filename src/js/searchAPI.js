import axios from 'axios';

export class SearchAPI {
  #BASE_URL = 'https://pixabay.com/api/';
  #API_KEY = '35142474-9ab0342e5503fc668189498b3';

  page = 1;
  query = null;
  per_page = 40;

  async searchImages() {
    const data = await axios.get(`${this.#BASE_URL}`, {
      params: {
        key: this.#API_KEY,
        q: this.query,
        page: this.page,
        per_page: this.per_page,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
      },
    });
    return data;
  }
}

import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import './css/styles.css';

import { getImagesByQuery } from './js/pixabay-api.js';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
  refs,
} from './js/render-functions.js';

let query = '';
let page = 1;
let totalPages = 0;

refs.loadMoreBtn.addEventListener('click', onLoadMore);
document.querySelector('.form').addEventListener('submit', onSearch);

async function onSearch(e) {
  e.preventDefault();
  const input = e.target.elements['search-text'];
  query = input.value.trim();
  if (!query) return;

  page = 1;
  clearGallery();
  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(query, page);

    if (!data.hits.length) {
      iziToast.error({ message: 'No images found for your query.' });
      return;
    }

    createGallery(data.hits);

    totalPages = Math.ceil(data.totalHits / 15);

    if (page < totalPages) showLoadMoreButton();
  } catch (err) {
    iziToast.error({ message: 'Error fetching images.' });
  } finally {
    hideLoader();
  }
}

async function onLoadMore() {
  page += 1;
  showLoader();

  try {
    const data = await getImagesByQuery(query, page);
    createGallery(data.hits);

    smoothScroll();

    if (page >= totalPages) {
      hideLoadMoreButton();
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
      });
    }
  } catch (err) {
    iziToast.error({ message: 'Error fetching images.' });
  } finally {
    hideLoader();
  }
}

function smoothScroll() {
  const cardHeight =
    refs.galleryContainer
      .querySelector('.gallery__item')
      ?.getBoundingClientRect().height || 0;

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

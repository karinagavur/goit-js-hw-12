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

const form = document.querySelector('.form');
const loadMoreBtn = refs.loadMoreBtn;
const galleryEl = refs.galleryContainer;

let query = '';
let page = 1;
let totalPages = 0;
const PER_PAGE = 15;
let isLoading = false;

form.addEventListener('submit', onSearch);
if (loadMoreBtn) loadMoreBtn.addEventListener('click', onLoadMore);

async function onSearch(e) {
  e.preventDefault();
  const input = e.target.elements['search-text'];
  query = input.value.trim();

  if (!query) {
    iziToast.warning({
      title: 'Warning',
      message: 'Please enter a search query!',
      position: 'topRight',
    });
    return;
  }

  page = 1;
  clearGallery();
  hideLoadMoreButton();
  showLoader();

  try {
    isLoading = true;
    const data = await getImagesByQuery(query, page);

    if (!data || !Array.isArray(data.hits) || data.hits.length === 0) {
      hideLoader();
      iziToast.info({
        title: 'No results',
        message:
          'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
      });
      return;
    }

    createGallery(data.hits);
    totalPages = Math.ceil((data.totalHits || 0) / PER_PAGE);

    if (page < totalPages) {
      showLoadMoreButton();
    } else {
      hideLoadMoreButton();
    }
  } catch (err) {
    console.error(err);
    iziToast.error({
      title: 'Error',
      message: 'Something went wrong while fetching images.',
      position: 'topRight',
    });
  } finally {
    hideLoader();
    isLoading = false;
  }
}

async function onLoadMore() {
  if (isLoading) return;
  page += 1;
  showLoader();

  try {
    isLoading = true;
    const data = await getImagesByQuery(query, page);

    if (!data || !Array.isArray(data.hits)) {
      iziToast.error({
        title: 'Error',
        message: 'Unexpected response from server',
        position: 'topRight',
      });
      return;
    }

    createGallery(data.hits);

    await waitForImagesLoaded(galleryEl);

    smoothScroll();

    if (page >= Math.ceil((data.totalHits || 0) / PER_PAGE)) {
      hideLoadMoreButton();
      iziToast.info({
        title: 'End',
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
    }
  } catch (err) {
    console.error(err);
    iziToast.error({
      title: 'Error',
      message: 'Something went wrong while loading more images.',
      position: 'topRight',
    });
  } finally {
    hideLoader();
    isLoading = false;
  }
}

function waitForImagesLoaded(container, timeout = 5000) {
  const images = Array.from(container.querySelectorAll('img'));
  if (images.length === 0) return Promise.resolve();

  return new Promise(resolve => {
    let loaded = 0;
    const total = images.length;
    let resolved = false;
    const onDone = () => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timer);
      resolve();
    };

    const check = () => {
      loaded += 1;
      if (loaded >= total) onDone();
    };

    images.forEach(img => {
      if (img.complete) {
        check();
      } else {
        img.addEventListener('load', check, { once: true });
        img.addEventListener('error', check, { once: true });
      }
    });

    const timer = setTimeout(() => {
      onDone();
    }, timeout);
  });
}

function smoothScroll() {
  const firstCard = galleryEl.querySelector('.gallery-item');
  if (!firstCard) return;
  const { height } = firstCard.getBoundingClientRect();

  window.scrollBy({
    top: height * 2,
    left: 0,
    behavior: 'smooth',
  });
}

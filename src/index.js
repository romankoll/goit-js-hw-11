import { SearchAPI } from './js/searchAPI';

import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchApi = new SearchAPI();

const gallarySection = document.querySelector('.gallery');
const searchQuery = document.querySelector('.search-form');
const btnLoadMore = document.querySelector('.load-more');

let gallery = new SimpleLightbox('.gallery a', {
  captions: true,
  captionSelector: 'img',
  captionType: 'attr',
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
  overlayOpacity: 0.9,
  widthRatio: 0.9,
});

searchQuery.addEventListener('submit', handleSearch);
btnLoadMore.addEventListener('click', handleLoadMore);

async function handleSearch(e) {
  e.preventDefault();
  resetGallery();
  const {
    elements: { searchQuery },
  } = e.currentTarget;
  if (searchQuery.value === '') {
    return Notify.warning('Please, enter your search request');
  }
  searchApi.query = searchQuery.value.trim();
  try {
    const images = await searchApi.searchImages().then(data => {
      const items = data.data.hits;
      const totalItems = data.data.totalHits;
      if (items.length === 0) {
        return Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }
      Notify.success(`Hooray! We found ${totalItems} images.`);
      const markup = renderGallery(items);
      if (markup !== undefined) {
        gallarySection.innerHTML = markup;
        gallery.on('show.simplelightbox');
        gallery.refresh();
        btnLoadMore.classList.remove('is-hidden');
      }
    });
  } catch {
    error => console.error(error);
  }
}

function handleLoadMore() {
  searchApi.page += 1;
  searchApi
    .searchImages()
    .then(data => {
      const items = data.data.hits;
      if (data.data.totalHits <= searchApi.page * searchApi.per_page) {
        btnLoadMore.classList.add('is-hidden');

        searchQuery.reset();
        Notify.failure(
          "We're sorry, but you've reached the end of search results."
        );
        return;
      }
      const newMarkup = renderGallery(items);
      gallarySection.insertAdjacentHTML('beforeend', newMarkup);
      gallery.refresh();
    })
    .catch(error => console.error(error));
}

function resetGallery() {
  // add some resets
  searchApi.page = 1;
  gallarySection.innerHTML = '';

  btnLoadMore.classList.add('is-hidden');
}

function renderGallery(items) {
  return items
    .map(
      ({
        comments,
        downloads,
        largeImageURL,
        likes,
        tags,
        views,
        webformatURL,
      }) =>
        `<div class="photo-card">
        <a class="gallery__item" href="${largeImageURL}">
        <img class="gallery__image" src="${webformatURL}", alt="${tags} "loading="lazy" />
        </a>
        <div class="info">
    <p class="info-item">
      <b>Likes</b> ${likes}
    </p>
    <p class="info-item">
      <b>Views</b> ${views}
    </p>
    <p class="info-item">
      <b>Comments</b> ${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b> ${downloads}
    </p>
  </div>
</div>`
    )
    .join(' ');
}

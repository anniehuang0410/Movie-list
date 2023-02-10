// URLs
const BASE_URL = "https://webdev.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/movies/"
const IMG_URL = BASE_URL + "/posters/"
const MOVIES_PER_PAGE = 12

// 定義變數
const movies = JSON.parse(localStorage.getItem('favoriteMovies'))

// 查找 DOM 節點
const dataPanel = document.querySelector('#data-panel')

// 函式：渲染電影清單
function renderMovieList(data) {
  let rawHTML = ''

  data.forEach((item) => {
    rawHTML += `
     <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img src="${IMG_URL + item.image}" class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer text-muted">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-danger btn-remove-movie" data-id="${item.id}">X</button>
            </div>
          </div>
        </div>
      </div>
    `
  })

  dataPanel.innerHTML = rawHTML
}

function renderPages(amount) {
  const numberOfPage = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPage; page++) {
    rawHTML += `
        <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `
  }

  paginator.innerHTML = rawHTML
}

function getMoviesByPage(page) {
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  
  return movies.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

// 函式：DOM 跳出 Modal windows
function showMovieModal(id) {
  const movieTitle = document.querySelector('#movie-modal-title')
  const movieImage = document.querySelector('#movie-modal-image')
  const movieDate = document.querySelector('#movie-modal-date')
  const movieDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id)
  .then(response => {
    const data = response.data.results
    
    movieTitle.innerText = data.title
    movieDate.innerText = 'Release Date: ' + data.release_date
    movieDescription.innerText = data.description
    movieImage.innerHTML = `
     <img src=${IMG_URL +  data.image} alt="movie-poster" class="img-fluid">
    `
  })
}

// 函式：移除收藏清單
function removeFromFavorite(id) {
  const movieIndex = movies.findIndex(movie => movie.id === id)
  
  movies.splice(movieIndex, 1)
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  renderPages(movies.length)
  renderMovieList(getMoviesByPage(1))
}

// dataPanel 監聽器
dataPanel.addEventListener('click', function onPanelClicked(event){
  const eventTarget = event.target
  if (eventTarget.matches('.btn-show-movie')){
    showMovieModal(Number(eventTarget.dataset.id))
  } else if (eventTarget.matches('.btn-remove-movie')){
    removeFromFavorite(Number(eventTarget.dataset.id))
  }
})

// paginator 監聽器
paginator.addEventListener('click', function paginatorOnClicked(event) {
  if (event.target.tagName !== 'A') return

  const page = Number(event.target.dataset.page) // dataset 裡出來的資訊會是 str
  renderMovieList(getMoviesByPage(page))
})

renderPages(movies.length)
renderMovieList(getMoviesByPage(1))

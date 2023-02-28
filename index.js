// URLs & requirements
const BASE_URL = "https://webdev.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/movies/"
const IMG_URL = BASE_URL + "/posters/"
const MOVIES_PER_PAGE = 12

// 定義變數
const movies = []
let filteredMovies = []
let currentPage = 1

// 查找 DOM 節點
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const reset = document.querySelector('#reset-button')
const paginator = document.querySelector('#paginator')
const switchMode = document.querySelector('#mode-switch-button')

// 函式：渲染電影清單(卡片模式)
function renderMovieList(data) {
  if (dataPanel.dataset.mode === 'card-mode') {
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
              <button class="btn btn-info btn-add-movie" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
    `})
    dataPanel.innerHTML = rawHTML
  } else if (dataPanel.dataset.mode === 'list-mode') {
    let rawHTML = `<ul class="list-group">`
    data.forEach((item) => { 
      rawHTML += `
      <li class="list-group-item d-flex justify-content-between border-end-0 border-start-0 rounded-0">
       <div class="title-container p-2">
        <h5 class="list-title">${item.title}</h5>
       </div>
       <div class="button-container p-2">
        <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
        <button class="btn btn-info btn-add-movie" data-id="${item.id}">+</button>
       </div>
      </li>
    `
    })
    rawHTML += '</ul>'
    dataPanel.innerHTML = rawHTML
  }
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

// 函式：分頁渲染器
function getMoviesByPage(page) {
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  const data = filteredMovies.length ? filteredMovies : movies 

  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
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

// 函式：加入收藏清單
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const favoriteMovies = movies.find(movie => movie.id === id)
  
  if (list.some(movie => movie.id ===id)) {
    return alert(`This movie is already on your favorite list!`)
  }
  
  list.push(favoriteMovies)
  localStorage.setItem('favoriteMovies' ,JSON.stringify(list))

}

// dataPanel 監聽器
dataPanel.addEventListener('click', function onPanelClicked(event){
  const eventTarget = event.target
  if (eventTarget.matches('.btn-show-movie')){
    showMovieModal(Number(eventTarget.dataset.id))
  } else if (eventTarget.matches('.btn-add-movie')){
    addToFavorite(Number(eventTarget.dataset.id))
  }
})

// paginator 監聽器
paginator.addEventListener('click', function paginatorOnClicked(event){
  if (event.target.tagName !== 'A') return

  const page = Number(event.target.dataset.page)
  currentPage = page // dataset 裡出來的資訊會是 str
  renderMovieList(getMoviesByPage(currentPage))
})

// Search Form
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  
  filteredMovies = movies.filter((movie) => 
   movie.title.toLowerCase().includes(keyword)
  )

  if(filteredMovies.length === 0) {
    return alert('Please insert a valid keyword!')
  }

  currentPage = 1
  renderPages(filteredMovies.length) 
  renderMovieList(getMoviesByPage(currentPage))
})

reset.addEventListener('click', function reset(event){
  filteredMovies = [] // 先清空陣列，在 getMoviesByPage 中的條件才會正確
  renderPages(movies.length)
  renderMovieList(getMoviesByPage(1))
})

// 切換呈現模式
function changeDisplayMode(displayMode){
  if (dataPanel.dataset.mode === displayMode) return
  dataPanel.dataset.mode = displayMode
}

// 切換模式監聽器
switchMode.addEventListener('click', function onSwitchModeClicked(event){
  if(event.target.matches('#card-mode-button')){
    changeDisplayMode('card-mode')
    renderMovieList(getMoviesByPage(currentPage))  
  } else if(event.target.matches('#list-mode-button')){
    changeDisplayMode('list-mode')
    renderMovieList(getMoviesByPage(currentPage))
  }
})

// 非同步處理獲取電影資料
axios.get(INDEX_URL)
.then(response => {
  movies.push(...response.data.results)
  renderPages(movies.length)
  renderMovieList(getMoviesByPage(currentPage))
})
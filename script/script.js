const nextUrl = {
  "url": "http://localhost:8000/api/v1/titles/?sort_by=-imdb_score"
}

let tabUrl = []
let tabResultApi = []
let currentPosition = 0
let maxPosition = 19

async function xhrApiMovie(url) {
  if (tabUrl.includes(url)) {
    return false
  }
  tabUrl.push(url)
  let response = await fetch(url)
  let apiMovie = await response.json()
  nextUrl["url"] = apiMovie['next']
  return apiMovie['results']
}

let moviesDiv1 = document.querySelector(".moviesDiv1")
let moviesDiv2 = document.querySelector(".moviesDiv2")
let moviesDiv3 = document.querySelector(".moviesDiv3")
let moviesDiv4 = document.querySelector(".moviesDiv4")
let moviesDiv5 = document.querySelector(".moviesDiv5")
let categories_movies_nbr_columns = 2

function refreshVarNbr() {
  categories_movies_columns = window.getComputedStyle(moviesDiv3).getPropertyValue('grid-template-columns')
  categories_movies_nbr_columns = categories_movies_columns.split('px').length - 1
}

async function addDivInHtml(i, tabDiv) {
  for (let elem of tabDiv) {
    if (elem.querySelector('img')) {
      elem.querySelector('img').remove()
    }
  }
  let j = 0
  console.log(i)
  while (j < tabDiv.length) {
    let tab = []
    let boocle = i + j > maxPosition ? i + j - maxPosition - 1 : i + j
    if (Array.isArray(tabResultApi) && tabResultApi.length === 0 || tabResultApi.length <= boocle && tabResultApi.length <= maxPosition) {
      tab = await xhrApiMovie(nextUrl["url"]).then()
    }
    if (tab) {
      tabResultApi.push(...tab)
    }
    if (tabResultApi[boocle]) {
      let img = document.createElement('img')
      img.setAttribute('src', tabResultApi[boocle]['image_url'])
      img.classList.add(`${boocle}`)
      tabDiv[j].insertAdjacentHTML('beforeend', img.outerHTML)
    }
    j++
  }
}

function calcPos(nbr) {
  currentPosition = currentPosition >= maxPosition ? currentPosition - maxPosition - 1 : currentPosition
  currentPosition = 0 > currentPosition ? maxPosition + 1 + currentPosition : currentPosition
  nbr = 0 > nbr ? maxPosition + nbr + 1 : nbr
  if (nbr + currentPosition > maxPosition) {
    return (nbr + currentPosition - maxPosition - 1)
  }
  return (nbr + currentPosition)
}

function replaceImg() {
  moviesDiv1.innerHTML = moviesDiv3.innerHTML
  moviesDiv2.innerHTML = moviesDiv3.innerHTML
  moviesDiv4.innerHTML = moviesDiv3.innerHTML
  moviesDiv5.innerHTML = moviesDiv3.innerHTML
  let tabDiv1 = moviesDiv1.querySelectorAll('div')
  let tabDiv2 = moviesDiv2.querySelectorAll('div')
  let tabDiv3 = moviesDiv3.querySelectorAll('div')
  let tabDiv4 = moviesDiv4.querySelectorAll('div')
  let tabDiv5 = moviesDiv5.querySelectorAll('div')
  addDivInHtml(calcPos(0), tabDiv3)
  addDivInHtml(calcPos(-(2 * tabDiv3.length)), tabDiv1)
  addDivInHtml(calcPos(-tabDiv3.length), tabDiv2)
  addDivInHtml(calcPos(tabDiv3.length), tabDiv4)
  addDivInHtml(calcPos((2 * tabDiv3.length)), tabDiv5)
}

function replaceCssGrid(categories_movies_nbr_columns) {
  moviesDiv1.style.gridTemplateColumns = `repeat(${categories_movies_nbr_columns}, 1fr)`
  moviesDiv2.style.gridTemplateColumns = `repeat(${categories_movies_nbr_columns}, 1fr)`
  moviesDiv3.style.gridTemplateColumns = `repeat(${categories_movies_nbr_columns}, 1fr)`
  moviesDiv4.style.gridTemplateColumns = `repeat(${categories_movies_nbr_columns}, 1fr)`
  moviesDiv5.style.gridTemplateColumns = `repeat(${categories_movies_nbr_columns}, 1fr)`
}

function resizeDivMovies() {
  let i = moviesDiv3.querySelectorAll('div').length
  let div = moviesDiv3.querySelector('div')
  if (div.getBoundingClientRect().width > 250) {
    while (div.getBoundingClientRect().width > 250) {
      categories_movies_nbr_columns = i + 1
      replaceCssGrid(categories_movies_nbr_columns)
      let newDiv = document.createElement('div')
      newDiv.classList.add('movie')
      moviesDiv3.insertAdjacentHTML('beforeend', newDiv.outerHTML)
      i++
    }
    replaceImg()
  }
  if (div.getBoundingClientRect().width < 150) {
    while (div.getBoundingClientRect().width < 150) {
      let tabMoviesDiv = moviesDiv3.querySelectorAll('div')
      categories_movies_nbr_columns = tabMoviesDiv.length
      tabMoviesDiv[categories_movies_nbr_columns - 1].remove()
      replaceCssGrid(categories_movies_nbr_columns - 1)
    }
    replaceImg()
  }
}

buttonRight = document.querySelector("body > main > section:nth-child(1) > div > button.right")
buttonLeft = document.querySelector("body > main > section:nth-child(1) > div > button.left")
let categoriesDiv = document.querySelector("#best-rated")

function remouveClass() {
  replaceImg()
  categoriesDiv.classList.remove("carousel-active-right")
  categoriesDiv.classList.remove("carousel-active-left")
}
buttonRight.addEventListener('click', function () {
  if (!((categoriesDiv.classList.contains("carousel-active-right") || categoriesDiv.classList.contains("carousel-active-left")))) {
    console.log("eeeeeeee")
    categoriesDiv.classList.add("carousel-active-right")
    currentPosition += moviesDiv3.querySelectorAll('div').length
    const myTimeout2 = setTimeout(remouveClass, 800);
  }
})

buttonLeft.addEventListener('click', function () {
  if (!(categoriesDiv.classList.contains("carousel-active-right") || categoriesDiv.classList.contains("carousel-active-left"))) {
    categoriesDiv.classList.add("carousel-active-left")
    currentPosition -= moviesDiv3.querySelectorAll('div').length
    const myTimeout2 = setTimeout(remouveClass, 800);
  }
})

resizeDivMovies()
window.addEventListener('resize', function () {
  resizeDivMovies()
})
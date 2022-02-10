class Carousel {
  constructor() {
    this.nextUrl = {
      "url": "http://localhost:8000/api/v1/titles/?sort_by=-imdb_score"
    }
    this.buttonRight = document.querySelector("body > main > section:nth-child(1) > div > button.right")
    this.buttonLeft = document.querySelector("body > main > section:nth-child(1) > div > button.left")
    this.categoriesDiv = document.querySelector("body > main > section:nth-child(1) .categories-movies")
    this.tabUrl = []
    this.tabResultApi = []
    this.currentPosition = 0
    this.maxPosition = 19
    this.moviesDiv1 = document.querySelector("body > main > section:nth-child(1) > div .moviesDiv1")
    this.moviesDiv2 = document.querySelector("body > main > section:nth-child(1) > div .moviesDiv2")
    this.moviesDiv3 = document.querySelector("body > main > section:nth-child(1) > div .moviesDiv3")
    this.moviesDiv4 = document.querySelector("body > main > section:nth-child(1) > div .moviesDiv4")
    this.moviesDiv5 = document.querySelector("body > main > section:nth-child(1) > div .moviesDiv5")
    this.categories_movies_nbr_columns = 2
  }
  async xhrApiMovie(url) {
    if (this.tabUrl.includes(url)) {
      return false
    }
    this.tabUrl.push(url)
    let response = await fetch(url)
    let apiMovie = await response.json()
    this.nextUrl["url"] = apiMovie['next']
    return apiMovie['results']
  }

  async addDivInHtml(i, tabDiv) {
    for (let elem of tabDiv) {
      if (elem.querySelector('img')) {
        elem.querySelector('img').remove()
      }
    }
    let j = 0
    while (j < tabDiv.length) {
      let tab = []
      let boocle = i + j > this.maxPosition ? i + j - this.maxPosition - 1 : i + j
      if (Array.isArray(this.tabResultApi) && this.tabResultApi.length === 0 || this.tabResultApi.length <= boocle && this.tabResultApi.length <= this.maxPosition) {
        tab = await this.xhrApiMovie(this.nextUrl["url"]).then()
      }
      if (tab) {
        this.tabResultApi.push(...tab)
      }
      if (this.tabResultApi[boocle]) {
        let img = document.createElement('img')
        img.setAttribute('src', this.tabResultApi[boocle]['image_url'])
        img.classList.add(`${boocle}`)
        tabDiv[j].insertAdjacentHTML('beforeend', img.outerHTML)
      }
      j++
    }
  }

  calcPos(nbr) {
    this.currentPosition = this.currentPosition >= this.maxPosition ? this.currentPosition - this.maxPosition - 1 : this.currentPosition
    this.currentPosition = 0 > this.currentPosition ? this.maxPosition + 1 + this.currentPosition : this.currentPosition
    nbr = 0 > nbr ? this.maxPosition + nbr + 1 : nbr
    if (nbr + this.currentPosition > this.maxPosition) {
      return (nbr + this.currentPosition - this.maxPosition - 1)
    }
    return (nbr + this.currentPosition)
  }

  replaceImg() {
    this.moviesDiv1.innerHTML = this.moviesDiv3.innerHTML
    this.moviesDiv2.innerHTML = this.moviesDiv3.innerHTML
    this.moviesDiv4.innerHTML = this.moviesDiv3.innerHTML
    this.moviesDiv5.innerHTML = this.moviesDiv3.innerHTML
    let tabDiv1 = this.moviesDiv1.querySelectorAll('div')
    let tabDiv2 = this.moviesDiv2.querySelectorAll('div')
    let tabDiv3 = this.moviesDiv3.querySelectorAll('div')
    let tabDiv4 = this.moviesDiv4.querySelectorAll('div')
    let tabDiv5 = this.moviesDiv5.querySelectorAll('div')
    this.addDivInHtml(this.calcPos(0), tabDiv3)
    this.addDivInHtml(this.calcPos(-(2 * tabDiv3.length)), tabDiv1)
    this.addDivInHtml(this.calcPos(-tabDiv3.length), tabDiv2)
    this.addDivInHtml(this.calcPos(tabDiv3.length), tabDiv4)
    this.addDivInHtml(this.calcPos((2 * tabDiv3.length)), tabDiv5)
  }

  replaceCssGrid(categories_movies_nbr_columns) {
    this.moviesDiv1.style.gridTemplateColumns = `repeat(${categories_movies_nbr_columns}, 1fr)`
    this.moviesDiv2.style.gridTemplateColumns = `repeat(${categories_movies_nbr_columns}, 1fr)`
    this.moviesDiv3.style.gridTemplateColumns = `repeat(${categories_movies_nbr_columns}, 1fr)`
    this.moviesDiv4.style.gridTemplateColumns = `repeat(${categories_movies_nbr_columns}, 1fr)`
    this.moviesDiv5.style.gridTemplateColumns = `repeat(${categories_movies_nbr_columns}, 1fr)`
  }

  resizeDivMovies() {
    let i = this.moviesDiv3.querySelectorAll('div').length
    let div = this.moviesDiv3.querySelector('div')
    if (div.getBoundingClientRect().width > 250) {
      while (div.getBoundingClientRect().width > 250) {
        this.categories_movies_nbr_columns = i + 1
        this.replaceCssGrid(this.categories_movies_nbr_columns)
        let newDiv = document.createElement('div')
        newDiv.classList.add('movie')
        this.moviesDiv3.insertAdjacentHTML('beforeend', newDiv.outerHTML)
        i++
      }
      this.replaceImg()
    }
    if (div.getBoundingClientRect().width < 150) {
      while (div.getBoundingClientRect().width <= 150) {
        let tabMoviesDiv = this.moviesDiv3.querySelectorAll('div')
        this.categories_movies_nbr_columns = tabMoviesDiv.length
        console.log(tabMoviesDiv[this.categories_movies_nbr_columns - 1])
        tabMoviesDiv[this.categories_movies_nbr_columns - 1].remove()
        this.replaceCssGrid(this.categories_movies_nbr_columns - 1)
      }
      this.replaceImg()
    }
  }

  remouveClass() {
    this.replaceImg()
    this.categoriesDiv.classList.remove("carousel-active-right")
    this.categoriesDiv.classList.remove("carousel-active-left")
  }

  waitAnimation(){
    const mmm = setTimeout(() => test1.remouveClass(), 800)
  }

  eventCarrossel = () => {
    test1.buttonRight.addEventListener('click', function () {
      if (!((test1.categoriesDiv.classList.contains("carousel-active-right") || test1.categoriesDiv.classList.contains("carousel-active-left")))) {
        test1.categoriesDiv.classList.add("carousel-active-right")
        test1.currentPosition += test1.moviesDiv3.querySelectorAll('div').length
        test1.waitAnimation()
      }
    })
    
    test1.buttonLeft.addEventListener('click', function () {
      if (!((test1.categoriesDiv.classList.contains("carousel-active-right") || test1.categoriesDiv.classList.contains("carousel-active-left")))) {
        test1.categoriesDiv.classList.add("carousel-active-left")
        test1.currentPosition -= test1.moviesDiv3.querySelectorAll('div').length
        test1.waitAnimation()
      }
    })
    test1.resizeDivMovies()
    window.addEventListener('resize', function () {
      test1.resizeDivMovies()
    })
  }
}

test1 = new Carousel()
test1.eventCarrossel()
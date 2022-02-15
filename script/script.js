class Carousel {
  constructor(nbr, url) {
    this.nextUrl = {
      "url": url
    }
    this.buttonRight = document.querySelector(`body > main > section:nth-child(${nbr}) > div > button.right`)
    this.buttonLeft = document.querySelector(`body > main > section:nth-child(${nbr}) > div > button.left`)
    this.categoriesDiv = document.querySelector(`body > main > section:nth-child(${nbr}) .categories-movies`)
    this.tabUrl = []
    this.tabResultApi = []
    this.currentPosition = 0
    this.maxPosition = 19
    this.moviesDiv1 = document.querySelector(`body > main > section:nth-child(${nbr}) > div .moviesDiv1`)
    this.moviesDiv2 = document.querySelector(`body > main > section:nth-child(${nbr}) > div .moviesDiv2`)
    this.moviesDiv3 = document.querySelector(`body > main > section:nth-child(${nbr}) > div .moviesDiv3`)
    this.moviesDiv4 = document.querySelector(`body > main > section:nth-child(${nbr}) > div .moviesDiv4`)
    this.moviesDiv5 = document.querySelector(`body > main > section:nth-child(${nbr}) > div .moviesDiv5`)
    this.categories_movies_nbr_columns = 2
  }
  async xhrApiMovie(url) {
    if (this.tabUrl.includes(url)) {
      return false
    }
    this.tabUrl.push(url)
    let response = await fetch(url).then()
    let apiMovie = await response.json()
    this.nextUrl["url"] = apiMovie['next']
    return apiMovie['results']
  }

  async addText(elem, modal_container) {
    let tab = ["title", "year", "duration", "imdb_score", "votes", "original_title", "countries", "genres", "actors", "description", "directors", "writers", "company", "languages"]
    await fetch(`http://localhost:8000/api/v1/titles/${elem.dataset["movie"]}`).then(dataJson => {
      dataJson.json().then(data => {
        console.log(data)
        for (let classs of tab) {
          let element = modal_container.querySelector(`.modal .${classs}`)
          element.innerText = data[classs]
        }
        modal_container.querySelector(`img`).setAttribute('src', data["image_url"])
      })
    })
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
        img.setAttribute('data-movie', this.tabResultApi[boocle]['id'])
        img.classList.add('moldal-trigger')
        let modal_container = document.querySelector(".modal-container")
        img.addEventListener("click", (e) => {
          this.addText(e.target, modal_container)
          modal_container.classList.toggle("active")
        })
        tabDiv[j].insertAdjacentElement('beforeend', img)
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

  waitAnimation() {
    const mmm = setTimeout(() => this.remouveClass(), 800)
  }

  eventCarrossel = () => {
    this.buttonRight.addEventListener('click', () => {
      if (!((this.categoriesDiv.classList.contains("carousel-active-right") || this.categoriesDiv.classList.contains("carousel-active-left")))) {
        this.categoriesDiv.classList.add("carousel-active-right")
        this.currentPosition += this.moviesDiv3.querySelectorAll('div').length
        this.waitAnimation()
      }
    })

    this.buttonLeft.addEventListener('click', () => {
      if (!((this.categoriesDiv.classList.contains("carousel-active-right") || this.categoriesDiv.classList.contains("carousel-active-left")))) {
        this.categoriesDiv.classList.add("carousel-active-left")
        this.currentPosition -= this.moviesDiv3.querySelectorAll('div').length
        this.waitAnimation()
      }
    })
    this.resizeDivMovies()
    window.addEventListener('resize', () => {
      this.resizeDivMovies()
    })
  }
}

let modal_container = document.querySelector(".modal-container")
let modal_trigger = document.querySelectorAll(".modal-trigger")
modal_trigger.forEach(elem => elem.addEventListener("click", () => {
  modal_container.classList.toggle("active")
}))

categoriesAll = document.querySelectorAll(".categories-movies")
let i = 1
for (let elem of categoriesAll) {
  let sliderMovies
  if (i === 1) {
    sliderMovies = new Carousel(i, "http://localhost:8000/api/v1/titles/?sort_by=-imdb_score")
  } else {
    sliderMovies = new Carousel(i, `http://localhost:8000/api/v1/titles/?genre=${elem.id}&min_year=2015`)
  }
  sliderMovies.eventCarrossel()
  i++
}
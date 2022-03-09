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

  /*
  Transforme le json de l'API en objet
  Stoque la nouvelle URL dans nextUrl
  Ajoute chaque résultats de l'API dans le tableau tabResultApi si elle est differente à image du film en couverture
  */
  async jsonData(response) {
    let apiMovie = await response.json()
    this.nextUrl["url"] = apiMovie['next']
    for (let elem of apiMovie['results']) {
      if (elem['id'] !== 1508669) {
        this.tabResultApi.push(elem)
      }
    }
    return true
  }

  /*
  Lance une requête Get à l'API si URL n'est pas dans le tabUrl
  */
  async xhrApiMovie(url) {
    if (this.tabUrl.includes(url)) {
      return false
    }
    this.tabUrl.push(url)
    await fetch(url).then(response => {
      return this.jsonData(response)
    })
  }

  /*
  Fait un appel API de élément passé en paramettre
  Les informations retournées par l'API ont les mêmes noms que les classes de la modale
  Les noms dans le tableau tab servent d'abord à rechercher les classe de la modale, puis à les compléter
  */
  async addText(elem, modal_container) {
    let tab = ["title", "year", "duration", "imdb_score", "votes", "original_title", "countries", "genres", "actors", "description", "directors", "writers", "company", "languages"]
    await fetch(`http://localhost:8000/api/v1/titles/${elem.dataset["movie"]}`).then(dataJson => {
      dataJson.json().then(data => {
        for (let classs of tab) {
          let element = modal_container.querySelector(`.modal .${classs}`)
          if (classs === "duration") {
            element.innerText = `${parseInt(data[classs] / 60)}h${data[classs] % 60 > 9 ? data[classs] % 60: `0${data[classs] % 60}`}`
          } else if (Array.isArray(data[classs])) {
            element.innerText = data[classs].toString().replaceAll(',', ', ')
          } else {
            element.innerText = data[classs]
          }
        }
        modal_container.querySelector(`img`).setAttribute('src', data["image_url"])
      })
    })
  }

  /*
  prendre en paramettre un tableau elements html et un index
  les div qui sont dans le tableau seront complétés par une image provenant de tabResultApi
  à partir de l'index i
  */
  async addDivInHtml(i, tabDiv) {
    for (let elem of tabDiv) {
      if (elem.querySelector('img')) {
        elem.querySelector('img').remove()
      }
    }
    let j = 0
    while (j < tabDiv.length) {
      let boocle = i + j > this.maxPosition ? i + j - this.maxPosition - 1 : i + j
      if (Array.isArray(this.tabResultApi) && this.tabResultApi.length === 0 || this.tabResultApi.length <= boocle && this.tabResultApi.length <= this.maxPosition) {
        await this.xhrApiMovie(this.nextUrl["url"])
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

  /*
  Calcule et retourne la possition du premier élément
  */
  calcPos(nbr) {
    this.currentPosition = this.currentPosition >= this.maxPosition ? this.currentPosition - this.maxPosition - 1 : this.currentPosition
    this.currentPosition = 0 > this.currentPosition ? this.maxPosition + 1 + this.currentPosition : this.currentPosition
    nbr = 0 > nbr ? this.maxPosition + nbr + 1 : nbr
    if (nbr + this.currentPosition > this.maxPosition) {
      return (nbr + this.currentPosition - this.maxPosition - 1)
    }
    return (nbr + this.currentPosition)
  }


  /*
  moviesDiv3 qui est la div du centrale du carroussel, et qui est remplit en par des div en fonction de la taille
  de l'ecran, copie sont contenue dans les 4 autre div du carrousel afin d'avoir le meme nombre de div partout.
  Puis la position de la la premiere image de la div principale est envoyer à addDivInHtml.
  */
  async replaceImg() {
    this.moviesDiv1.innerHTML = this.moviesDiv3.innerHTML
    this.moviesDiv2.innerHTML = this.moviesDiv3.innerHTML
    this.moviesDiv4.innerHTML = this.moviesDiv3.innerHTML
    this.moviesDiv5.innerHTML = this.moviesDiv3.innerHTML
    let tabDiv1 = this.moviesDiv1.querySelectorAll('div')
    let tabDiv2 = this.moviesDiv2.querySelectorAll('div')
    let tabDiv3 = this.moviesDiv3.querySelectorAll('div')
    let tabDiv4 = this.moviesDiv4.querySelectorAll('div')
    let tabDiv5 = this.moviesDiv5.querySelectorAll('div')
    await this.addDivInHtml(this.calcPos(0), tabDiv3)
    await this.addDivInHtml(this.calcPos(tabDiv3.length), tabDiv4)
    this.addDivInHtml(this.calcPos(-tabDiv3.length), tabDiv2)
    this.addDivInHtml(this.calcPos((2 * tabDiv3.length)), tabDiv5)
    this.addDivInHtml(this.calcPos(-(2 * tabDiv3.length)), tabDiv1)
  }

  /*
  Change le nombre de collone de la grid des 5 div qui compose le carrousel
  */
  replaceCssGrid(categories_movies_nbr_columns) {
    this.moviesDiv1.style.gridTemplateColumns = `repeat(${categories_movies_nbr_columns}, 1fr)`
    this.moviesDiv2.style.gridTemplateColumns = `repeat(${categories_movies_nbr_columns}, 1fr)`
    this.moviesDiv3.style.gridTemplateColumns = `repeat(${categories_movies_nbr_columns}, 1fr)`
    this.moviesDiv4.style.gridTemplateColumns = `repeat(${categories_movies_nbr_columns}, 1fr)`
    this.moviesDiv5.style.gridTemplateColumns = `repeat(${categories_movies_nbr_columns}, 1fr)`
  }

  /*
  change le nombre de div dans moviesDiv3 en fonction de la taille de l'ecran
  tant que les div sont plus grandes que 250px une div est ajouté,
  tant que les div sont plus petite que 150px une div est supprimé
  Puis replaceImg est appellé
  */
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

  buttonLeftVisible() {
    this.categoriesDiv.parentElement.querySelector(".left").style.visibility = "visible"
    this.moviesDiv2.querySelector("div:last-child").style.visibility = "visible"
  }

  waitAnimation() {
    const mmm = setTimeout(() => this.remouveClass(), 800)
  }

  /*
  initialise les evenements et appel la methode resizeDivMovies()
  */
  eventCarrossel = () => {
    this.buttonRight.addEventListener('click', () => {
      if (!((this.categoriesDiv.classList.contains("carousel-active-right") || this.categoriesDiv.classList.contains("carousel-active-left")))) {
        this.categoriesDiv.classList.add("carousel-active-right")
        this.currentPosition += this.moviesDiv3.querySelectorAll('div').length
        this.waitAnimation()
        this.buttonLeftVisible()
      }
    })
    this.buttonLeft.addEventListener('click', () => {
      if (!((this.categoriesDiv.classList.contains("carousel-active-right") || this.categoriesDiv.classList.contains("carousel-active-left")))) {
        this.categoriesDiv.classList.add("carousel-active-left")
        this.currentPosition -= this.moviesDiv3.querySelectorAll('div').length
        this.waitAnimation()
        this.buttonLeftVisible()
      }
    })
    this.resizeDivMovies()
    window.addEventListener('resize', () => {
      this.resizeDivMovies()
      this.buttonLeftVisible()
    })
    this.moviesDiv2.querySelector("div:last-child").style.visibility = "hidden"
  }
}

let tabEventHeader = document.querySelectorAll(".modal-info")
tabEventHeader.forEach(elem => elem.addEventListener("click", () => {
  addText(elem, modal_container)
  modal_container.classList.toggle("active")
}))

/*
  change les informations de la modale en fonction des paramettre
*/
async function addText(elem, modal_container) {
  let tab = ["title", "year", "duration", "imdb_score", "votes", "original_title", "countries", "genres", "actors", "description", "directors", "writers", "company", "languages"]
  await fetch(`http://localhost:8000/api/v1/titles/${elem.dataset["movie"]}`).then(dataJson => {
    dataJson.json().then(data => {
      for (let classs of tab) {
        let element = modal_container.querySelector(`.modal .${classs}`)
        if (classs === "duration") {
          element.innerText = `${parseInt(data[classs] / 60)}h${data[classs] % 60 > 9 ? data[classs] % 60: `0${data[classs] % 60}`}`
        } else {
          element.innerText = data[classs]
        }
      }
      modal_container.querySelector(`img`).setAttribute('src', data["image_url"])
    })
  })
}

let modal_container = document.querySelector(".modal-container")
let modal_trigger = document.querySelectorAll(".modal-trigger:not(body > header > div.movie > img)")
modal_trigger.forEach(elem => elem.addEventListener("click", (e) => {
  modal_container.classList.toggle("active")
}))


/*
cree une instance de la class Carousel pour chaque element du tableau categoriesAll
*/
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
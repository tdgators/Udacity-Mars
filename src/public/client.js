// Immutable = require('immutable')
//import Immutable from 'immutable'

let store = Immutable.Map({
    user: Immutable.Map({ name: "Student" }),
    apod: '',
    rovers: Immutable.List(['Curiosity', 'Opportunity', 'Spirit'])
})

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (state, newState) => {
    store = state.merge(newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}


// create content
const App = (state) => {
    console.log(state)
    let rovers = state.get('rovers')
    let apod = state.get('apod')
    console.log(rovers);

    if ((state.getIn(['rovers'])) && (state.getIn(['rovers']).length > 0)) {
      return `
          <header></header>
          <nav>
              <a href="/">Astronomy PotD</a> |
              <a href="/rovers">Mars Rover</a>
          </nav>
          <main>
              ${Greeting(state.getIn(['user', 'name']))}
              <section>
                  <h3>Put things on the page!</h3>
                  <p>Here is an example section.</p>
                  <p>
                      One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
                      the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                      This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                      applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                      explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                      but generally help with discoverability of relevant imagery.
                  </p>
                  ${ImageOfTheDay(apod)}
              </section>
          </main>
          <footer></footer>
      `
    }

    return `
        <header></header>
        <main>
            ${Greeting(state.getIn(['user', 'name']))}
            <section>
                <h3>Put things on the page!</h3>
                <p>Here is an example section.</p>
                <p>
                    One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
                    the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                    This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                    applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                    explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                    but generally help with discoverability of relevant imagery.
                </p>
                ${ImageOfTheDay(apod)}
            </section>
        </main>
        <footer></footer>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    if (name) {
        return `
            <h1>Welcome, ${name}!</h1>
        `
    }

    return `
        <h1>Hello!</h1>
    `
}

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {
    // If image does not already exist, or it is not from today -- request it again
    console.log(apod)
    console.log(apod.image)
    const today = new Date()

    console.log(today.getDate())

    //console.log(photodate.getDate() === today.getDate());
    if (!apod ) {//apod.date is undefined? === today.getDate() ) {
        getImageOfTheDay(store)
    } else {
        const imageDate = new Date(apod.image.date)
        if (imageDate.getDate() !== today.getDate()) {
            getImageOfTheDay(store)
        }
        // check if the photo of the day is actually type video!
        if (apod.media_type === "video") {
            return (`
                <p>See today's featured video <a href="${apod.get('url')}">here</a></p>
                <p>${apod.title}</p>
                <p>${apod.explanation}</p>
            `)
        } else {
            return (`
                <img src="${apod.image.url}" height="350px" width="100%" />
                <p>${apod.image.explanation}</p>
            `)
        }
    }
}

const RoversOverview = (rovers) => {

    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    const formatToday = today.getFullYear() + '-' + today.getMonth() + '-' + today.getDate()

    if (!rovers || rovers.date === today.getDate() ) {
        getRoverData(store, formatToday)
    }

    // check if the photo of the day is actually type video!
    if (rovers.media_type === "video") {
        return (`
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `)
    } else {
        return (`
            <img src="${apod.image.url}" height="350px" width="100%" />
            <p>${apod.image.explanation}</p>
        `)
    }
}

const RoverOne = (rover) => {

    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    const formatToday = today.getFullYear() + '-' + today.getMonth() + '-' + today.getDate()

    if (!rovers ) {//apod.date is undefined? === today.getDate() ) {
        getRoverData(store)
    } else {
        const imageDate = new Date(rovers.image.date)
        if (imageDate.getDate() !== today.getDate()) {
            getImageOfTheDay(store)
        }
        // check if the photo of the day is actually type video!
        if (apod.media_type === "video") {
            return (`
                <p>See today's featured video <a href="${apod.get('url')}">here</a></p>
                <p>${apod.title}</p>
                <p>${apod.explanation}</p>
            `)
        } else {
            return (`
                <img src="${apod.image.url}" height="350px" width="100%" />
                <p>${apod.image.explanation}</p>
            `)
        }
    }
}

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = (state) => {
    console.log(state);
    let { apod } = state

    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => updateStore(store, { apod }))

    return ;
}

const getRoverData = (state) => {
    let rovers = state.get('rovers');
    let roverMenu = rovers.map((element, index, array) => {
        let tempObj = {}
        roverData = fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${element}/photos?earth_date=${req.params.date}&camera=navcam&api_key=${process.env.API_KEY}`)
        .then(res = res.json())
        //  .then(res => res.json())
        //console.log(roverJson);
        if ((res) && (res.photos) && (res.photos.length > 0)) {
          //console.log(roverData.photos[0])
          tempObj[element] = res.photos[0]
          console.log(tempObj);
        }
        return tempObj;
    })
    fetch(`http://localhost:3000/rovers`)
        .then(res => res.json())
        .then(rovers => updateStore(store, { rovers }))

    return ;
}

const getRovers = (state) => {
    let rovers = state.get('rovers');
    let roverMenu = rovers.map((element, index, array) => {
        let tempObj = {}
        roverData = fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${element}/photos?earth_date=${req.params.date}&camera=navcam&api_key=${process.env.API_KEY}`)
        .then(res = res.json())
        //  .then(res => res.json())
        //console.log(roverJson);
        if ((res) && (res.photos) && (res.photos.length > 0)) {
          //console.log(roverData.photos[0])
          tempObj[element] = res.photos[0]
          console.log(tempObj);
        }
        return tempObj;
    })
    fetch(`http://localhost:3000/rovers`)
        .then(res => res.json())
        .then(rovers => updateStore(store, { rovers }))

    return ;
}

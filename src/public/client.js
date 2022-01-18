// Immutable = require('immutable')
//import Immutable from 'immutable'

let store = Immutable.Map({
    today: '',
    rover: '',
    photos: '',
    user: Immutable.Map({ name: "Student" }),
    apod: '',
    rovers: Immutable.List(['Curiosity', 'Opportunity', 'Spirit'])
})

let current = 0
let stop = 5

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (state, newState) => {
    store = state.merge(newState)
    console.log(store);
    if(current < stop) {

    }

    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}


// create content
const App = (state) => {
    //console.log(state)
    let rover = state.get('rover')
    let rovers = state.get('rovers')
    let apod = state.get('apod')
    //console.log(rovers);

    return `
        <header></header>
        <main>
            ${Greeting(state.getIn(['user', 'name']))}
            <section>
                ${RoverComponent(rover)}
            </section>
        </main>
        <footer>By Tom Donnelly for Udacity Intermediate Javascript Course</footer>
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

const RoverComponent = (rover) => {

    // If image does not already exist, or it is not from today -- request it again
    const roverName = store.getIn(['rover', 'name'])
    const roverData = store.getIn(['rover', 'data'])
    const today = dateString(new Date());
    //console.log(store.get('today'))
    //console.log(today)
    if (store.get('today') !== today) {
      updateStore(store, { "today": today });
    }

    console.log("roverName: " + roverName);
    console.log("roverData: " + roverData);

    if (roverName && (roverName !== '') && (!roverData || (roverData == ''))) {
      getRoverManifest(roverName);
    }

    if (roverName && roverData && (roverName !== '') && (roverData !== '') && (roverData.photo_manifest)) {
        // check if the photo of the day is actually type video!
        return (`
            <h3>See the latest pictures from a Mars Rover by selecting the rover:</h3>
            <button onclick="updateRoverName(this)" value="">Back</button>
            <dl>
              <dt>Rover Name</dt>
              <dd>${roverName}</dt>

              <dt>Launch Date</dt>
              <dd>${roverData.photo_manifest.launch_date}</dt>

              <dt>Status</dt>
              <dd>${roverData.photo_manifest.status}</dt>

              <dt>Most recently available photos</dt>
              <dd>${roverData.photo_manifest.total_photos}</dt>

              <dt>Date the most recent photos were taken</dt>
              <dd>${roverData.photo_manifest.max_date}</dt>
            </dl>

        `)
    } else {
      return (`
          <p>
          This API is designed to collect image data gathered by NASA's Curiosity, Opportunity, and Spirit rovers on Mars and make it more easily available to other developers, educators, and citizen scientists. This API is maintained by Chris Cerami.

          Each rover has its own set of photos stored in the database, which can be queried separately. There are several possible queries that can be made against the API. Photos are organized by the sol (Martian rotation or day) on which they were taken, counting up from the rover's landing date. A photo taken on Curiosity's 1000th Martian sol exploring Mars, for example, will have a sol attribute of 1000. If instead you prefer to search by the Earth date on which a photo was taken, you can do that, too.

          Along with querying by date, results can also be filtered by the camera with which it was taken and responses will be limited to 25 photos per call. Queries that should return more than 25 photos will be split onto several pages, which can be accessed by adding a 'page' param to the query.

          Each camera has a unique function and perspective
          </p>
          <hr>
          <h3>See the latest pictures from a Mars Rover by selecting the rover:</h3>
          <div>
            <button onclick="updateRoverName(this)" value="Curiosity">Curiosity</button>
            <button onclick="updateRoverName(this)" value="Opportunity">Opportunity</button>
            <button onclick="updateRoverName(this)" value="Spirit">Spirit</button>
          </ul>
          <hr>
      `)
    }
}

const RoverPhotos = (rover) => {

    // If image does not already exist, or it is not from today -- request it again
    const roverName = store.getIn(['rover', 'name'])
    const roverData = store.getIn(['rover', 'data'])
    const roverPhotos = store.getIn(['photos', 'photos'])

    console.log("roverName: " + roverName);
    console.log("roverData: " + roverData);

    let photosArray = []

    if (roverName && (roverName !== '') && roverData && roverData.photo_manifest && roverData.photo_manifest.max_date && (!roverPhotos)) {
      const getDate = roverData.photo_manifest.max_date
      getRoverPhotos(roverName, getDate);
    }

    if (roverPhotos && roverPhotos.rover && roverPhotos.rover.name && (roverPhotos.rover.name[0] == roverName)) {
      photosArray = roverPhotos;
    } else {
      updateStore(store, { "photos" : '' });
    }

    let photosHtml = `<h3>Rover Photos</h3>`

    if (photosArray.length > 0) {
      const tempHtml = photosArray.map(x => `<img src="${x.img_src}" alt="${x.camera.full_name}">`)
      photosHtml = photosHtml + tempHtml;
    } else {
      photosHtml = photosHtml + `<p>No Photos Available</p>`
    }

    return photosHtml;

}

// ------------------------------------------------------  HELPERS

// PURE FUNCTION
const dateString = (dateObject) => {
    const todayString = dateObject.getFullYear() + '-' + dateObject.getMonth()+1 + '-' + dateObject.getDate();
    console.log(todayString);
    return todayString;
}

const updateRoverName = (btn) => {
    console.log(btn);
    updateStore(store, { "rover": { "name" : btn.value }, "photos" : ''});
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

const getRoverManifest = (name) => {
    fetch(`http://localhost:3000/rover/${name}/manifest`)
        .then(res => res.json())
        .then(rover => {
          updateStore(store, { "rover": { "name": name, "data": rover }})
          return rover;
        })
}

const getRoverPhotos = (name, dateString="null") => {
    fetch(`http://localhost:3000/rover/${name}/${dateString}`)
        .then(res => res.json())
        .then(rover => updateStore(store, { "photos": rover }))
    return ;
}

const getRovers = (state) => {
    let rovers = state.get('rovers');
    let roverMenu = rovers.map((element, index, array) => {
        let tempObj = {}
        fetch(`http://localhost:3000/rovers`)
            .then(res => res.json())
            .then(rovers => updateStore(store, { rovers }))
        if ((res) && (res.photos) && (res.photos.length > 0)) {
          //console.log(roverData.photos[0])
          tempObj[element] = res.photos[0]
          console.log(tempObj);
        }
        return tempObj;
    })

    return ;
}

let store = Immutable.Map({
    today: '',
    rover: '',
    photos: '',
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
    return `
        <header></header>
        <main>
            ${Greeting()}
            <section>
                ${RoverComponent()}
            </section>
        </main>
        <hr>
        <footer>By Tom Donnelly for Udacity Intermediate Javascript Course</footer>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information
const Greeting = () => {
    return `
        <h1>Welcome to the Mars Rover Photo Gallery</h1>
    `
}

// Example of a pure function that renders infomation requested from the backend
const RoverComponent = () => {

    const roverName = store.getIn(['rover', 'name'])
    const roverData = store.getIn(['rover', 'data'])
    const today = dateString(new Date());

    if (store.get('today') !== today) {
      updateStore(store, { "today": today });
    }

    if (roverName && (roverName !== '') && (!roverData || (roverData == ''))) {
      getRoverManifest(roverName);
    }

    if (roverName && roverData && (roverName !== '') && (roverData !== '') && (roverData.photo_manifest)) {
        // check if the photo of the day is actually type video!
        return (`
            <button onclick="updateRoverName(this)" value="">Back</button>
            <dl>
              <dt>Rover Name:</dt>
              <dd>${roverName}</dt>

              <dt>Launch Date:</dt>
              <dd>${roverData.photo_manifest.launch_date}</dt>

              <dt>Status:</dt>
              <dd>${roverData.photo_manifest.status}</dt>

              <dt>Most recently available photos:</dt>
              <dd>${roverData.photo_manifest.photos[roverData.photo_manifest.photos.length - 1].total_photos.toLocaleString()}</dt>

              <dt>Date the most recent photos were taken:</dt>
              <dd>${roverData.photo_manifest.max_date}</dt>
            </dl>
            ${RoverPhotos(roverName)}
            <br><br><button onclick="updateRoverName(this)" value="">Back</button>
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
          <br><br>
      `)
    }
}

const RoverPhotos = (rover) => {
    const roverName = store.getIn(['rover', 'name'])
    const roverData = store.getIn(['rover', 'data'])
    const roverPhotos = store.get('photos')

    //console.log("roverName: " + roverName);
    //console.log("roverData: " + roverData);
    //console.log("roverPhotos: " + roverPhotos);

    let photosArray = []

    if (roverName && (roverName !== '') && roverData && roverData.photo_manifest && roverData.photo_manifest.max_date && (!roverPhotos)) {
        const getDate = roverData.photo_manifest.max_date
        getRoverPhotos(roverName, getDate);
    }

    let photosHtml = `<h3>Rover ${roverName}'s Most Recent Photos (${roverData.photo_manifest.photos[roverData.photo_manifest.photos.length - 1].total_photos}):</h3>`

    if (roverPhotos && (roverPhotos.photos) && (roverPhotos.photos.length > 0) && roverPhotos.photos[0].rover && roverPhotos.photos[0].rover.name && (roverPhotos.photos[0].rover.name == roverName)) {
        photosHtml = photosHtml + roverPhotos.photos.map(x => `<img src="${x.img_src}" alt="${x.camera.full_name}">`)
    } else if (roverPhotos && (roverPhotos.photos) && (roverPhotos.photos.length > 0) && roverPhotos.photos[0].rover && roverPhotos.photos[0].rover.name && (roverPhotos.photos[0].rover.name !== roverName)) {
        updateStore(store, { "photos" : '' });
    } else {
        photosHtml = photosHtml + `<p>No Photos Available</p>`
    }

    return photosHtml;
}

// ------------------------------------------------------  HELPERS

// PURE FUNCTION - Higher Order Functions
const dateString = (dateObject) => {
    const todayString = dateObject.getFullYear() + '-' + dateObject.getMonth()+1 + '-' + dateObject.getDate();
    return todayString;
}

const updateRoverName = (btn) => {
    updateStore(store, { "rover": { "name" : btn.value }, "photos": ''});
}

// ------------------------------------------------------  API CALLS

// Example API call
const getRoverManifest = (name) => {
    fetch(`http://localhost:3000/rover/${name}/manifest`)
        .then(res => res.json())
        .then(rover => updateStore(store, { "rover": { "name": name, "data": rover }}))
}

const getRoverPhotos = (name, dateString="null") => {
    fetch(`http://localhost:3000/rover/${name}/${dateString}`)
        .then(res => res.json())
        .then(photos => updateStore(store, { "photos": photos }))
}

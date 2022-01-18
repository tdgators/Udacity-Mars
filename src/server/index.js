require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')

const app = express()
const port = 3000

let count = 1;

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/immutable', express.static(path.join(__dirname + '../../../node_modules/immutable/dist')));
app.use('/', express.static(path.join(__dirname, '../public')))

// API calls

app.get('/rover/:rovername/manifest', async (req, res) => {
    try {
        console.log("Fetching via NASA API - Count: " + count)
        count++
        const date = req.params.date;
        let manifest = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${req.params.rovername}?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send(manifest)

    } catch (err) {
        console.log('error:', err);
    }
})

app.get('/rover/:rovername/:date', async (req, res) => {
    try {
        console.log("Fetching via NASA API - Count: " + count)
        count++
        const date = req.params.date;
        const roverName = req.params.rovername;
        if (date == "null") {
            let image = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${roverName}/photos?api_key=${process.env.API_KEY}`)
                .then(res => res.json())
            res.send(image)
        } else {
            let image = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${roverName}/photos?earth_date=${date}&api_key=${process.env.API_KEY}`)
                .then(res => res.json())
            res.send(image)
        }
    } catch (err) {
        console.log('error:', err);
    }
})

// needed to specify ipv4, so added "0.0.0.0",
app.listen(port, "0.0.0.0", () => console.log(`Mars Rover Photo App listening on port ${port}!`))

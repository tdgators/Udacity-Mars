require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')
const Immutable = require('immutable')

const app = express()
const port = 3000
const serverIp = process.env.SERVER_IP || "localhost"

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/immutable', express.static(path.join(__dirname + '../../../node_modules/immutable/dist')));
app.use('/', express.static(path.join(__dirname, '../public')))


// your API calls

// example API call
//console.log(`${process.env.API_KEY}`)
app.get('/apod', async (req, res) => {
    try {
        let image = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send({ image })
    } catch (err) {
        console.log('error:', err);
    }
})

app.get('/rover/:rovername/manifest', async (req, res) => {
    try {
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
        const date = req.params.date;
        if (date == "null") {
            let image = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${req.params.rovername}/photos?api_key=${process.env.API_KEY}`)
                .then(res => res.json())
            res.send({ image })
        } else {
            let image = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${req.params.rovername}/photos?earth_date=${date}&api_key=${process.env.API_KEY}`)
                .then(res => res.json())
            res.send({ image })
        }
    } catch (err) {
        console.log('error:', err);
    }
})




app.get('/rovers/:date', async (req, res) => {
    try {
        const roverArray = ['Curiosity', 'Opportunity', 'Spirit']
        let roverMenu = await roverArray.map(async (element, index, array) => {
            let tempObj = {}
            const roverData = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${element}/photos?api_key=${process.env.API_KEY}`)
            const roverJson = await roverData.json()
            //  .then(res => res.json())
            //console.log(roverJson);
            if ((roverJson) && (roverJson.photos) && (roverJson.photos.length > 0)) {
              //console.log(roverData.photos[0])
              tempObj.name = element
              tempObj.photo = roverJson.photos[0]
              console.log(tempObj);
            }
            return await tempObj;
        })
        //console.log(roverMenu)
        return await res.send({ roverMenu })
    } catch (err) {
        console.log('error:', err);
    }
})




// needed to specify ipv4, so added "0.0.0.0",
app.listen(port, "0.0.0.0", () => console.log(`Example app listening on port ${port}!`))

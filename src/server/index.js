// Configure the environment variable to hide API_KEY from public
const dotenv =  require('dotenv');
dotenv.config();

var path = require('path')
const express = require('express')   //express to run server and routes
const cors = require('cors')    //cors for cross-origin allowance
const bodyParser = require('body-parser')   //express to use body-parser as middleware
const mockAPIResponse = require('./mockAPI')
const axios = require('axios');

const app = express();
// app.use(express.static('../src/views/index.html'));
app.use(express.static(path.resolve(__dirname, "../src/views/index.html")));
app.use(cors());
app.use(express.json())
app.use(bodyParser.urlencoded({extended: true}));

console.log(__dirname);

// server setup
const port = process.env.PORT || 8000;
const server = app.listen(port, function listener(){
    console.log("Server is working at port: " + port)
})

// homepage setup
app.get('/', (req, res) => {
    res.sendFile(path.resolve("src/client/views/index.html"))
});


// receive the request from client side and make an api call 
app.post('/trip', createTripData);

const GEONAMES_APIKEY = 'rolandexplore93';
const WEATHERBIT_APIKEY = '363a618d9ba64b35a0d136457f32956f';
const PIXABAY_APIKEY = '25980875-6c6d122a3737d279b8daf3a97';

async function createTripData(req, res){
    // Get all api keys
    const callToGeonames = GEONAMES_APIKEY;
    const callToWeatherbit = WEATHERBIT_APIKEY;
    const callToPixabay = PIXABAY_APIKEY;

    // create an empty object to store the final data
    const tripDataInformation = {};
    // validate the data from the request body
    const location = req.body.location;
    const departDate = req.body.departDate;
    const returnDate = req.body.returnDate;
	const daysLeftToTheTrip = req.body.daysLeftToTheTrip;
    const tripDuration = req.body.tripDuration;
    console.log(location, departDate, returnDate, daysLeftToTheTrip, tripDuration);

    // check if the location, departDate and returnDate are not empty
    // Otherwise, return an error message
    if (!location || !departDate || !returnDate){
        console.log(res.status(400).send({error: 'Invalid input'}))
        return res.status(400).send({error: 'Invalid input'})
    }

    // GeoNamesAPI = get the countryname, latitude and longitude of user's destination
    try {
        const dataFromGeoNames = await getDataFromGeoNames(callToGeonames, location);

        // get weather forecast from weatherbit api
        const weatherInfo = await getWeather(
			dataFromGeoNames.lat,
			dataFromGeoNames.lon,
			callToWeatherbit,
			daysLeftToTheTrip,
            
		);

        // Get location image
        let imageUrlPath = await getImage(callToPixabay, location, dataFromGeoNames.country);

        // assigning the data to the object that is sent in response
		tripDataInformation.weatherInfo = weatherInfo;
		tripDataInformation.imageUrlPath = imageUrlPath;
		tripDataInformation.country = dataFromGeoNames.country;
        // tripDataInformation.tripDuration = tripDuration;
		res.send(tripDataInformation);
		console.log(tripDataInformation);

    } catch (error){
        console.log(error);
		return res.status(500).send({ error: 'Internal server error!' });
    }
}

// get country name, lat and lon from Geonames
async function getDataFromGeoNames(username, location) {
	const url = `http://api.geonames.org/searchJSON?q=${location}&maxRows=1&username=${username}`;
	const res = await axios.get(url);
    // console.log(res.data);
	const geoNamesData = {
		lat: res.data.geonames[0]?.lat,
		lon: res.data.geonames[0]?.lng,
		country: res.data.geonames[0]?.countryName,
	};
    console.log(geoNamesData)
	return geoNamesData;
}

// Get whether forecast from weatherbit
async function getWeather(lat, lon, apiKey, day) {
	const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&key=${apiKey}`;
	console.log(lat, lon);
	if (day >= 15) {
		day = 15;
	}

	const res = await axios.get(url);
	// console.log(res.data);
	// console.log(res.data.data[day]);
	const weatherData = {
		temperature: res.data.data[day]?.temp,
		description: res.data.data[day]?.weather.description,
	};
	return weatherData;
}

// Generate location image from pixabay api

async function getImage(apiKey, searchWord, searchWord2) {
	const firstUrlCall = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(
		searchWord
	)}&image_type=photo`;
	const secondUrlCall = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(
		searchWord2
	)}&image_type=photo`;

	const res = await axios.get(firstUrlCall);
    // console.log(res.data)
	let photoUrl = res.data.hits[0]?.webformatURL;
	if (!photoUrl) {
		const res = await axios.get(secondUrlCall);
		photoUrl = res.data.hits[0]?.webformatURL;
	}
	return photoUrl;
}
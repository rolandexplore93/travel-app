import { form, loader } from './elements'
import { trips } from './loadApp'
import { wait } from './helpers'

// import DOMpurify library
import DOMPurify from 'dompurify';

//show and hide the loader while processing request
export function hideLoader() {
	loader.classList.add('hidden');
}

export function showLoader() {
	loader.classList.remove('hidden');
}

// Determine the number of days between today and start of the trip
export function checkHowFar(dateInputValue){
    const currentDate = new Date();
    // Create a date object from the html input value
    const departingDate = new Date(dateInputValue);
    // convert to dates to milliseconds, subtract and then convert back to days and round up using Math.ceil()
	const daysRemaining = Math.ceil(
		(departingDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24)
	);
    console.log("Days left to start trip: " + daysRemaining + " days");
	if (daysRemaining < 0) {
		alert('Departure date cannot be in the past!');
	}
	return daysRemaining;
}

// Determine the number of days between start and end of the trip
export function checkTripDuration(){
    const departDate = form.querySelector('#departing').value;
    const returnDate = form.querySelector('#returnDate').value;
    // Create a date object from the html input value
    const departingDate = new Date(departDate);
    const returningDate = new Date(returnDate);
    // convert to dates to milliseconds, subtract and then convert back to days and round up using Math.ceil()
	const tripDuration = Math.ceil(
		(returningDate.getTime() - departingDate.getTime()) / (1000 * 3600 * 24) + 1
	);
    console.log("Trip duration: " + tripDuration + " days");
	if (tripDuration < 1) {
		alert('Your return date cannot be before your start date!');
	}
	return tripDuration;
}

// Generate trip data and post() to the server to generate data from api
export const TripData = async (userDestination, departDate, returnDate) => {
    const daysLeftToTheTrip = checkHowFar(departDate) 
    const tripDuration = checkTripDuration()
    // make a POST request to the server
    const retrievedTripData = await postData('http://localhost:8000/trip', {
        location: encodeURIComponent(userDestination),
		departDate: departDate,
        returnDate: returnDate,
		daysLeftToTheTrip: daysLeftToTheTrip,
        tripDuration: tripDuration
    });
    const trip = {
        id: Date.now(),     //create an iduserDestination,
        userDestination,
        departDate,
        returnDate,
        daysLeftToTheTrip,
        tripDuration,
        country: retrievedTripData.country,
        imageUrlPath: retrievedTripData.imageUrlPath,
        weatherInfo: {
            temperature: retrievedTripData.weatherInfo.temperature,
            weatherDescription: retrievedTripData.weatherInfo.description,
        }
    };

    trips.push(trip);
    saveTripsDataToLocalStorage(trips);
	return trip;
}

const postData = async(url = '', data = {}) => {
    // display a loader on fetching data request
    showLoader();

    try {
		const response = await fetch(url, {
			method: 'POST',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
			},
			// Body data type must match "Content-Type" header
			body: JSON.stringify(data),
		});
		const newData = await response.json();
		console.log(newData);
		return newData;
	} catch (error) {
		//Appropriately handles the error;
		console.log('error', error);
		return error;
	}
}

// update the UI with the data received from the server
export async function createTripCard(tripData) {
	const showUpcomingTrip = document.querySelector('.my-trips');
	const customHtml = `
	<div class="trip-card">
		<img class="js-destination-image" src="${tripData.imageUrlPath}" alt="destination photo">
		<div class="trip-details">
			<h2 class="heading2">Upcoming trip to <span class="js-location-display">${tripData.userDestination}, ${tripData.country}</span></h2>
			<p class="leave-date">Departure: <span class="js-dep-date-display">${tripData.departDate}</span></p>
            <p class="return-date">Return Date: <span class="js-ret-date-display">${tripData.returnDate}</span></p>
			<p class="departure-countdown js-departure-countdown">${tripData.daysLeftToTheTrip} days left until your trip to ${tripData.userDestination}!</p>
            <p class="duration-estimate js-duration-estimate">Your trip to ${tripData.userDestination},${tripData.country} will last for ${tripData.tripDuration} days</p>
			<p class="subheading">Weather forecast for the time of your stay:</p>
			<p class="js-weather-display">${tripData.weatherInfo.weatherDescription} and ${tripData.weatherInfo.temperature} degress</p>
			<button class="button button--secondary js-remove-button" value="${tripData.id}">Remove trip</button>
		</div>
	</div>
	`;
	// sanitizing the html string to prevent XSS
	const sanitizedcustomHtml = DOMPurify.sanitize(customHtml);
	const htmlFragment = document
		.createRange()
		.createContextualFragment(sanitizedcustomHtml);

        showUpcomingTrip.appendChild(htmlFragment);
}

// error handling
export function errorHandling(error){
    alert('This request cannot be processed. Please, check if you entered the correct input', error);
    console.log("error", error)
}

// Reset the form using async function
// Let this hides the loader
export async function formReset(resetTripFrom){
    await wait();
    hideLoader()
    resetTripFrom.reset();
}

// store trip data in local storage
export function saveTripsDataToLocalStorage(items) {
	localStorage.setItem('items', JSON.stringify(items));
}

// get data from local storage
export function restoreFromLocalStorage(items) {
	console.info('Restoring data from local storage');
	// pull the items from localstorage
	const existingItems = JSON.parse(localStorage.getItem('items'));
	if (existingItems.length) {
		items.push(...existingItems);
		items.map((item) => createTripCard(item));
	}
}

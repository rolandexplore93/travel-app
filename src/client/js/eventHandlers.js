import { form } from './elements'
import { checkHowFar, checkTripDuration, createTripCard, TripData, errorHandling, formReset, saveTripsDataToLocalStorage } from './library'

export async function handleSubmit(e){
    e.preventDefault();
    // Get the trip input details from the user
    const userDestination = form.querySelector('#location').value.trim();
    const departDate = form.querySelector('#departing').value;
    const returnDate = form.querySelector('#returnDate').value;

    //confirm user entry 
    console.log(userDestination, departDate, returnDate)
    checkHowFar(departDate)
    checkTripDuration()
    TripData(userDestination, departDate, returnDate)
        .then(trip => {
            console.log(trip);
            createTripCard(trip);
        })
        .catch(error => errorHandling(error))
        .then(() => formReset(form))
}

// function to remove trip from the user interface
export function deleteTrip(event, items){
    	//console.log('DELETING ITEM with ID: ', parseInt(e.target.value));
	if (!event.target.matches('.js-remove-button')) return;
	event.target.closest('.trip-card').remove();
	//find the trip and delete it from the trips data array
	// console.log(items.length);

	items = items.filter((trip) => {
		return trip.id !== parseInt(event.target.value);
	});
	// items.map(item => createTripCard(item));
	// console.log(items.length);
	saveTripsDataToLocalStorage(items);
}
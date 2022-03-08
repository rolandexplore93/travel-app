import { handleSubmit, deleteTrip } from './eventHandlers'
import { showUpcomingTrip, form } from './elements'
import { checkHowFar, restoreFromLocalStorage } from './library'

export const trips = [];

export function loadApp(){
    console.log(Date.now())
	form.addEventListener('submit', handleSubmit);
    showUpcomingTrip.addEventListener('click', (event) => deleteTrip(event, trips));
    restoreFromLocalStorage(trips)
}
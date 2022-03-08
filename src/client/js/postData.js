// import { showLoader } from './library/js';

export async function postData(url = '', data = {}){
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



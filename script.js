const GOOGLE_KEY="AIzaSyDm4G3TqfGgBdEH3qn-LcInoMRxi-Zr3fU"

const body = document.body
const text = document.querySelector('h1')

const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by your browser"));
        } else {
            navigator.geolocation.getCurrentPosition(position => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            }, () => {
                reject(new Error("Location permission denied"));
            });
        }
    });  
}

async function geocodeCoordinates(lat, lng) {
    try {
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_KEY}`)  ;
        const data = await response.json();
        if (data.status === 'OK') {
            return data.results[0].address_components.find((component) =>
                component.types.includes("locality")
              ).long_name;
        } else {
            throw new Error('Geocoding failed: ' + data.status);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function getCity() {
    try {
        const { lat, lng } = await getCurrentLocation();
        const city = await geocodeCoordinates(lat, lng);
        return city
    } catch (error) {
        console.error('Error:', error);
    }
}

async function getForecastInfoForLocation() {
	try {
        const city = await getCity() || 'Doorn'
		const response = await fetch(
			`https://api.weatherapi.com/v1/forecast.json?key=52b1149f972d4a12843142300242606 &q=${city}&days=3`,
			{ mode: "cors" }
		);
        const data = await response.json()
		if (response.ok) {
            displayData(data, city)
		}
	} catch (error) {
        console.error('Error:', error);
    }
}

const displayData = (data, city) => {
    try{
        const date = new Date()
        const thisHour = date.getHours()
        const thisDate = date.getDate()
        const hours = data.forecast.forecastday.map(day => day.hour).flat()
        const temperatures = hours.map(hour => hour.temp_c)
        const hottestIndex = temperatures.reduce((maxIndex, currentValue, currentIndex, array) => currentValue > array[maxIndex] && currentValue > thisHour ? currentIndex : maxIndex, 0)
        const hottestDay = parseInt(hours[hottestIndex].time.split(' ')[0].split('-').pop())
        const hottestHour = parseInt(hours[hottestIndex].time.split(' ').pop().split(':')[0])
        if (+temperatures[hottestIndex] > 20.5) {
            const daysTillWarm = hottestDay - thisDate
            const hoursOfDayTillWarm = hottestHour - thisHour
            const daysString = daysTillWarm > 1 ? ` ${daysTillWarm} dagen ` : daysTillWarm < 1 ? '' : ` 1 dag `
            const hoursString = hoursOfDayTillWarm > 0 ? `en ${hoursOfDayTillWarm} uur ` : ''
            text.textContent = hottestIndex <= thisHour ? `Het is warm in ${city}!` : `Het wordt over${daysString} ${hoursString} warm in ${city}!`
            body.classList.add('warm')
        } else {
            text.textContent = `Het wordt de komende dagen niet warm in ${city}.`
            body.classList.add('not-warm')
        }
    } catch (err) {
        console.log(err)
    }
}

setTimeout(() => {
    getForecastInfoForLocation()
}, 0)
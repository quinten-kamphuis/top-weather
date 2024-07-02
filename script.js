const GOOGLE_KEY=""

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


async function displayCity() {
    try {
        const { lat, lng } = await getCurrentLocation();
        const city = await geocodeCoordinates(lat, lng);
        console.log('City is:', city);
    } catch (error) {
        console.error('Error:', error);
    }
}

displayCity()
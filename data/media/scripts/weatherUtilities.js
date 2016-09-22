//Get language from url
function getLanguage() {
	var url = decodeURIComponent(window.location.search.substring(1));
	return url.split("=")[1];
}

//Different functions which are needed accross API files should be put here   
function getDay(date) {
    return new Date(date * 1000).toLocaleString(navigator.language, {weekday: 'short'}).substring(0, 3);
}

function getDayFromDateString(date) {
    return new Date(date).toLocaleString(navigator.language, {weekday: 'short'}).substring(0, 3);
}

//Calculate temperature based on local selection of measurement and api provided
function getTemperature(temperature, unit) {
    var localUnit = localStorage.cumulus_measurement;
    if ( localUnit == "c" && unit == "f" ) {
        return fahrenheitToCelsius(temperature);
    }
    else if ( localUnit == "c" && unit == "k" ) {
        return kelvinToCelsius(temperature);
    }
    else if ( localUnit == "k" && unit == "f" ) {
        return fahrenheitToKelvin(temperature);
    }
    else if ( localUnit == "k" && unit == "c" ) {
        return celsiusToKelvin(temperature);
    }
    else if ( localUnit == "f" && unit == "c" ) {
        return celsiusToFahrenheit(temperature);
    }
    else if ( localUnit == "f" && unit == "k" ) {
        return kelvinToFahrenheit(temperature);
    }
    else {
        return Math.round(temperature);
    }
}

//Calculate speed based on local selection of speed unit and api provided
function getSpeed(speed, unit) {
    var localUnit = localStorage.cumulus_speed;
    if ( localUnit == "ms" && unit == "kph" ) {
        return kphToMs(speed);
    }
    else if ( localUnit == "ms" && unit == "mph" ) {
        return mphToMs(speed);
    }
    else if ( localUnit == "kph" && unit == "ms" ) {
        return msToKph(speed);
    }
    else if ( localUnit == "kph" && unit == "mph" ) {
        return mphToKph(speed);
    }
    else if ( localUnit == "mph" && unit == "ms" ) {
        return msToMph(speed);
    }
    else if ( localUnit == "mph" && unit == "kph" ) {
        return kphToMph(speed);
    }
    else {
        return Math.round(speed);
    }
}

function kelvinToCelsius(temperature) {
    return Math.round(temperature - 272.15);
}

function fahrenheitToCelsius(temperature) {
    return Math.round((temperature - 32) * 5 / 9);
}

function celsiusToKelvin(temperature) {
    return Math.round(temperature + 273.15);
}

function celsiusToFahrenheit(temperature) {
    return Math.round((temperature * 9 / 5) + 32);
}

function kelvinToFahrenheit(temperature) {
    return Math.round(celsiusToFahrenheit(kelvinToCelsius(temperature)));
}

function fahrenheitToKelvin(temperature) {
    return Math.round(celsiusToKelvin(fahrenheitToCelsius(temperature)));
}

function msToMph(speed) {
    return Math.round(speed / 0.44704);
}

function msToKph(speed) {
    return Math.round(speed * 3.6);
}

function mphToKph(speed) {
    return Math.round(speed * 1.609344);
}

function mphToMs(speed) {
    return Math.round(kphToMs(mphToKph(speed)));
}

function kphToMph(speed) {
    return Math.round(msToMph(kphToMs(speed)));
}

function kphToMs(speed) {
    return Math.round(speed * 0.27);
}

//Get background image based on yahoo codes 
function getBackgroundFromCode(code) {    
    var images = { 0: "tornado.jpg", 1: "", 2: "hurricane.jpg", 3: "thunderstorm.jpg", 4: "thunderstorm.jpg", 5: "snow-rain.jpg", 6: "snow-rain.jpg", 7:"sleet.jpg", 8: "drizzle-night.jpg", 9: "drizzle-night.jpg", 10: "freezing-rain.jpg",
            11: "rain-night.jpg", 12: "rain-night.jpg", 13: "snow-night.jpg", 14: "snow-night.jpg", 15: "snow-night.jpg", 16: "snow-night.jpg", 17: "hail.jpg", 18: "sleet.jpg", 19: "dust.jpg", 20: "mist.jpg", 21: "fog.jpeg", 22: "fog.jpeg",
            23: "windy.jpg", 24: "windy.jpg", 25: "cold", 26: "cloudy-day.jpg", 27: "cloudy-night.jpg", 28: "cloudy-day.jpg", 29: "partly-cloudy-night.jpg", 30: "partly-cloudy-day.jpg", 31: "clear-night.jpg", 32: "clear-day.jpg", 
            33: "fair-night.jpg", 34: "fair-day.jpg", 35: "hail.jpg", 36: "hot-clear-day.jpeg", 37: "thunderstorm.jpg", 38: "thunderstorm-with-rain.jpg", 39: "thunderstorm-with-rain.jpg", 40: "light-rain.jpg", 41: "snow.jpg", 42: "snow.jpg",
            43: "snow.jpg", 44: "partly-cloudy-day.jpg", 45: "thunderstorm-with-heavy-rain.jpg", 46: "snow-rain.jpg", 47: "thunderstorm-with-heavy-rain.jpg", 3200: "fair-day.jpg" 
            };
    return images[code];    
}

function typeOfJson() {
    if ( localStorage.api == "wund" ) {
        return "jsonp";
    }
    else {
        return "json";
    }
}
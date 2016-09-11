function savelocationFromInput(inputLocation, callback) {
    $.ajax({
        type : "GET",
        dataType : typeOfJson(),
        url : locationRequestUrl(inputLocation),
        success : function(data) {
        	hideError();
            saveLocationLocally(data);
            callback(localStorage.cumulus);
        }
    });
}

function getWeatherData(callback) {	
    $.ajax({
        type : "GET",
        dataType : typeOfJson(),
        url : dataRequestUrl(),
        success: function(data) {
        	hideError();
            saveWeather(data, function() {
                callback();
            });            
        }
    });    
}

function saveWeather(data, callback) {
    if ( localStorage.api == "owm" ) {
        saveOpenWeatherStats(data, function(weather) {
            callback();
        });
    }
    else if ( localStorage.api == "wund" ) {
        saveWeatherUndergroundStats(data, function(weather) {
            callback();
        });
    }
    else {
        saveYahooStats(data, function(weather) {
            callback();
        });
    }    
}

function saveYahooStats(data, callback) {
    //Weather Object
    weather = {};
    
    var channel = data.query.results.channel;
    var location = data.query.results.channel.location;
    var units = data.query.results.channel.units;
    var item = data.query.results.channel.item;
    var wind = data.query.results.channel.wind;
    var atmosphere = data.query.results.channel.atmosphere;
    
    localStorage.cumulus_location = location.city;
    localStorage.cumulus_country = location.country;
    localStorage.cumulus_link = channel.link;
    localStorage.weather_temp = getTemperature(item.condition.temp, units.temperature.toLowerCase());
    localStorage.weather_wind_speed = getSpeed(wind.speed, units.speed.toLowerCase());
    localStorage.weather_humidity = atmosphere.humidity;
    localStorage.weather_desc = item.condition.text;
    
    //Weekly Weather
    weekArr = item.forecast;    
    for (var i = 0; i < 5; i++) {
        localStorage.setItem('forecast' + i + '_day', $(weekArr[i]).attr("day"));
        localStorage.setItem('forecast' + i + '_code', $(weekArr[i]).attr("code"));
        localStorage.setItem('forecast' + i + '_high', getTemperature($(weekArr[i]).attr("high"), units.temperature.toLowerCase()));
        localStorage.setItem('forecast' + i + '_low', getTemperature($(weekArr[i]).attr("low"), units.temperature.toLowerCase()));
    }

    //Current Weather 
    localStorage.weather_code = item.condition.code;
    if (localStorage.weather_code == "3200") {
        localStorage.weather_code = weather.week[0].code;
    }
    
    callback();
}

function saveOpenWeatherStats(data, callback) {
    //Weather Object
    weather = {};    
    localStorage.weather_code = yahooCodeFromOwm(data.weather[0].id);
    localStorage.cumulus_country = data.sys.country;
    localStorage.cumulus_link = "http://openweathermap.org/city/" + data.id;
    localStorage.weather_temp = getTemperature(data.main.temp, "k");
    localStorage.weather_wind_speed = getSpeed(data.wind.speed, "mph");
    localStorage.weather_humidity = data.main.humidity;    
    localStorage.weather_desc = data.weather[0].description;
    openWeatherForecast(data, function() {
        callback();
    });
}

function openWeatherForecast(data, callback) {
    $.ajax({
        type : "GET",
        dataType : "json",
        url : "http://api.openweathermap.org/data/2.5/forecast/daily?id=" + data.id + "&appid=6cfbd805297a2ab8fe60cfc1fbcf8278&lang=" + navigator.language,
        success : function(data) {
            weekArr = data.list;
            var j = 0;
            for (var i = 0; i < 5; i++) {    
                localStorage.setItem('forecast' + i + '_day', getDay(weekArr[i].dt));
                localStorage.setItem('forecast' + i + '_code', yahooCodeFromOwm(weekArr[i].weather[0].id));
                localStorage.setItem('forecast' + i + '_high', getTemperature(weekArr[i].temp.max, "k"));
                localStorage.setItem('forecast' + i + '_low', getTemperature(weekArr[i].temp.min, "k"));
            } 
            
            if (localStorage.weather_code == "3200") {
                localStorage.weather_code = $(weekArr[0]).attr("code");
            }
            
            if (callback) {
                callback();
            } 
        }
    });
}


function saveWeatherUndergroundStats(data, callback) {
    //Weather Object
    weather = {};
    
    var location = data.current_observation.display_location;
    
    localStorage.cumulus_location = location.city;
    localStorage.cumulus_country = location.country;
    localStorage.cumulus_link = "http://www.wunderground.com/q/zmw:" + localStorage.cumulus;
    localStorage.weather_temp = getTemperature(data.current_observation.temp_c, "c");
    localStorage.weather_wind_speed = getSpeed(data.current_observation.wind_mph, "mph");
    localStorage.weather_humidity = data.current_observation.relative_humidity.replace('%', '');
    localStorage.weather_desc = data.current_observation.weather;
    var strSplit = data.current_observation.icon_url.split("/");
    var iconFromUrl = strSplit[strSplit.length - 1].replace(".gif", "");
    localStorage.weather_code = yahooCodeFromWund(iconFromUrl);
    weatherUndergroundForecast(localStorage.cumulus, function() {
        callback();
    });
}

function weatherUndergroundForecast(zmw, callback) {
    $.ajax({
        type : "GET",
        dataType : typeOfJson() ,
        url : "http://api.wunderground.com/api/30be6723cf95f92c/forecast10day/q/zmw:" + zmw + ".json",
        success : function(data) {
            weekArr = data.forecast.simpleforecast.forecastday;
            for (var i = 0; i < 5; i++) {    
                localStorage.setItem('forecast' + i + '_day', weekArr[i].date.weekday_short);
                localStorage.setItem('forecast' + i + '_code', yahooCodeFromWund(weekArr[i].icon));
                localStorage.setItem('forecast' + i + '_high', getTemperature(weekArr[i].high.celsius, "c"));
                localStorage.setItem('forecast' + i + '_low', getTemperature(weekArr[i].low.celsius, "c"));
            }            
            callback();
        }
    });
}

function saveLocationLocally(data) {
    if ( localStorage.api == "owm" ) {
        localStorage.cumulus = data.id;
        localStorage.cumulus_location = data.name;
    }
    else if ( localStorage.api == "wund" ) {
        localStorage.cumulus = data.RESULTS[0].zmw;
        localStorage.cumulus_location = data.RESULTS[0].name;
    }
    else{
        localStorage.cumulus = data.query.results.place.woeid;
        localStorage.cumulus_location = data.query.results.place.name;
    }
}

//Get url for location id request
function locationRequestUrl(inputLocation) {
    var api = localStorage.api;
    if ( localStorage.api == "owm" ) {
        return "http://api.openweathermap.org/data/2.5/weather?q=" + inputLocation + "&appid=6cfbd805297a2ab8fe60cfc1fbcf8278&lang=" + navigator.language;
    }
    else if ( localStorage.api == "wund" ) {
        return "http://autocomplete.wunderground.com/aq?query=" + inputLocation + "&cb=?";
    }
    else {
        return "https://query.yahooapis.com/v1/public/yql?q=select woeid, name from geo.places(1) where text='" + inputLocation + "'&format=json";
    }
}

//Get url for location id request
function dataRequestUrl() {
    var api = localStorage.api;
    if ( localStorage.api == "owm" ) {
        return "http://api.openweathermap.org/data/2.5/weather?id=" + localStorage.cumulus + "&appid=6cfbd805297a2ab8fe60cfc1fbcf8278&lang=" + navigator.language;
    }
    else if ( localStorage.api == "wund" ) {
        return "http://api.wunderground.com/api/30be6723cf95f92c/conditions/lang:" + navigator.language.toUpperCase() + "/q/zmw:" + localStorage.cumulus + ".json";
    }
    else {
        return "https://query.yahooapis.com/v1/public/yql?q=select * from weather.forecast where woeid=" + localStorage.cumulus + "&format=json";
    }
}

//Converts Yahoo weather to icon font
function weather_code(a){
  var b={0:"(",1:"z",2:"(",3:"z",4:"z",5:"e",6:"e",7:"o",8:"3",9:"3",10:"9",11:"9",12:"9",13:"o",14:"o",15:"o",16:"o",17:"e",18:"e",19:"s",20:"s",21:"s",22:"s",23:"l",24:"l",25:"`",26:"`",27:"2",28:"1",29:"2",30:"1",31:"/",32:"v",33:"/",34:"v",35:"e",36:"v",37:"z",38:"z",39:"z",40:"3",41:"o",42:"o",43:"o",44:"`",45:"z",46:"o",47:"z",3200:"`"};
  return b[a];
}

//Converts OpenWeatherMap Code to Yahoo code
function yahooCodeFromOwm(owmCode){    
  var yCode= {200: "37", 201: "38", 202: "45", 210: "45", 211: "4", 212: "3", 221: "39", 230: "47", 231: "47", 232: "47", 300: "9", 301: "9", 302: "9", 310: "9", 311: "9", 312: "9", 313: "40", 314: "40", 321: "40", 500: "11",
          501: "11", 502: "11", 503: "11", 504: "11", 511: "10", 520: "12", 521: "12", 522: "12", 531: "12", 600: "14", 601: "16", 602: "41", 611: "18", 612: "7", 615: "5", 616: "5", 620: "13", 621: "15", 622: "46", 701: "20", 711: "22",
          721: "21", 731: "19", 741: "20", 751: "19", 761: "19", 762: "3200", 771: "24", 781: "0", 800: "34", 900: "0", 901: "1", 902: "2", 903: "25", 904: "36", 905: "24", 906: "17", 951: "34", 952: "30", 953: "30", 954: "30", 955: "30",
          956: "30", 957: "24", 958: "24", 959: "24", 960: "23", 961: "23", 962: "2", 3200: "3200", 801: "30", 802: "30", 803: "28", 804: "26",};
  return yCode[owmCode];
}

//Converts Weather Underground icons names to Yahoo code
function yahooCodeFromWund(input) {
    var result = 3200;
    var wundData = [ {"iconName": "chanceflurries", "ycode" : 26}, {"iconName": "chancerain", "ycode" : 26} , {"iconName": "chancerain", "ycode" : 26},
                     {"iconName": "chancesleet", "ycode" : 26}, {"iconName": "chancesnow", "ycode" : 26}, {"iconName": "chancesnow", "ycode" : 26}, {"iconName": "chancetstorms", "ycode" : 37},
                     {"iconName": "clear", "ycode" : 32}, {"iconName": "cloudy", "ycode" : 26}, {"iconName": "flurries", "ycode" : 43}, {"iconName": "fog", "ycode" : 21}, {"iconName": "hazy", "ycode" : 22},
                     {"iconName": "mostlycloudy", "ycode" : 26}, {"iconName": "mostlysunny", "ycode" : 34}, {"iconName": "partlycloudy", "ycode" : 30}, {"iconName": "partlysunny", "ycode" : 30}, 
                     {"iconName": "sleet", "ycode" : 7}, {"iconName": "rain", "ycode" : 11}, {"iconName": "snow", "ycode" : 16 }, {"iconName": "sunny", "ycode" : 32 }, {"iconName": "tstorms", "ycode" : 37 },
                     //night time icons
                     {"iconName": "nt_chanceflurries", "ycode" : 27}, {"iconName": "nt_chancerain", "ycode" : 27} , {"iconName": "nt_chancerain", "ycode" : 27},
                     {"iconName": "nt_chancesleet", "ycode" : 27}, {"iconName": "nt_chancesnow", "ycode" : 27}, {"iconName": "nt_chancesnow", "ycode" : 27}, {"iconName": "nt_chancetstorms", "ycode" : 37},
                     {"iconName": "nt_clear", "ycode" : 31}, {"iconName": "nt_cloudy", "ycode" : 27}, {"iconName": "nt_flurries", "ycode" : 43}, {"iconName": "nt_fog", "ycode" : 21}, {"iconName": "nt_hazy", "ycode" : 22},
                     {"iconName": "nt_mostlycloudy", "ycode" : 27}, {"iconName": "nt_mostlysunny", "ycode" : 33}, {"iconName": "nt_partlycloudy", "ycode" : 29}, {"iconName": "nt_partlysunny", "ycode" : 29}, 
                     {"iconName": "nt_sleet", "ycode" : 7}, {"iconName": "nt_rain", "ycode" : 11}, {"iconName": "nt_snow", "ycode" : 16 }, {"iconName": "nt_sunny", "ycode" : 31 }, {"iconName": "nt_tstorms", "ycode" : 37 },
                     
                     {"iconName": "unknown", "ycode" : 3200}
                     ]; 
    for (var i = 0; i < wundData.length; i++) {
        if (wundData[i].iconName == input) {
            result = wundData[i].ycode;
            return result;
        }
    } 
    return result;
}

function getDay(date) {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(date * 1000).getDay()];
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
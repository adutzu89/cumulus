function savelocationFromInput(inputLocation, callback) {
    $.ajax({
        type : "GET",
        dataType : "json",
        url : locationRequestUrl(inputLocation),
        success : function(data) {
            saveLocationLocally(data);
            callback(localStorage.cumulus);
        },
        error: function(data) {
            if (data.status === 0) {
                showError('network');
            }
        }
    });
}

function getWeatherData(callback) {
    $.ajax({
        type : "GET",
        dataType : "json",
        url : dataRequestUrl(),
        success: function(data) {
            $('#errorMessage').fadeOut(350);
            saveWeather(data, function() {
                callback();
            });
        },
        error: function(data) {
            if (data.status === 0) {
                showError('network');
            }
        }
    });    
}

function saveWeather(data, callback) {
    if ( localStorage.api == "owm" ) {
        saveOpenWeatherStats(data, function(weather) {
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
    openWeatherForecast(data, function() {
        callback();
    });
}

function openWeatherForecast(data, callback) {
    $.ajax({
        type : "GET",
        dataType : "json",
        url : "http://api.openweathermap.org/data/2.5/forecast/daily?id=" + data.id + "&appid=6cfbd805297a2ab8fe60cfc1fbcf8278&lang=" + weather.country,
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
        },
        error: function(data) {
            if (data.status === 0) {
                showError('network');
            }
        }
    });
       
    function setWeekArray(arrayObject, position) {        
        weather.week[position] = arrayObject;
    }
}


function saveLocationLocally(data) {
    if ( localStorage.api == "owm" ) {
        localStorage.cumulus = data.id;
        localStorage.cumulus_location = data.name;
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
        return "http://api.openweathermap.org/data/2.5/weather?q=" + inputLocation + "&appid=6cfbd805297a2ab8fe60cfc1fbcf8278";
    }
    else {
        return "https://query.yahooapis.com/v1/public/yql?q=select woeid, name from geo.places(1) where text='" + inputLocation + "'&format=json";
    }
}

//Get url for location id request
function dataRequestUrl() {
    var api = localStorage.api;
    if ( localStorage.api == "owm" ) {
        return "http://api.openweathermap.org/data/2.5/weather?id=" + localStorage.cumulus + "&appid=6cfbd805297a2ab8fe60cfc1fbcf8278";
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



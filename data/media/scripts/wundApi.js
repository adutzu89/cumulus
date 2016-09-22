//Weather Underground API

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
        url : "http://api.wunderground.com/api/30be6723cf95f92c/forecast10day/lang:" + navigator.language.toUpperCase() + "/q/zmw:" + zmw + ".json",
        success : function(data) {
            weekArr = data.forecast.simpleforecast.forecastday;
            for (var i = 0; i < 5; i++) {    
                localStorage.setItem('forecast' + i + '_day', weekArr[i].date.weekday_short.substring(0, 3));
                localStorage.setItem('forecast' + i + '_code', yahooCodeFromWund(weekArr[i].icon));
                localStorage.setItem('forecast' + i + '_high', getTemperature(weekArr[i].high.celsius, "c"));
                localStorage.setItem('forecast' + i + '_low', getTemperature(weekArr[i].low.celsius, "c"));
            }            
            callback();
        }
    });
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
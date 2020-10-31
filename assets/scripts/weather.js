var apikey;

/*
*/
function setWeatherApiKey(key) {
    apikey = key;
}

/*
*/
function getWeatherFormatted(query) {
    return new Promise(function(resolve, reject) {
        getWeatherCurrent(query).then(current => {
            getWeatherForecast(current.coord.lat, current.coord.lon).then(forecast => {
                resolve({
                    loc: current.name,
                    cache: {
                        
                    }
                });
            });
        });
    });
}

/*
*/
function getWeatherCurrent(query) {
    return $.ajax({
        method: "get",
        url: `http://api.openweathermap.org/data/2.5/weather?appid=${apikey}&units=imperial&q=${query}`
    });
}

/*
*/
function getWeatherForecast(lat, lon) {
    return $.ajax({
        method: "get",
        url: `https://api.openweathermap.org/data/2.5/onecall?appid=${apikey}&units=imperial&exclude=current,minutely,hourly,alerts&lat=${lat}&lon=${lon}`
    });
}

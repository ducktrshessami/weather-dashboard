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
        Promise.all([getWeatherCurrent(query), getWeatherForecast(query)]).then(responses => {
            let current = responses[0];
            let future = responses[1];
            resolve({
                //stuff
            });
        });
    });
}

/*
*/
function getWeatherCurrent(query) {
    return $.ajax({
        method: "get",
        url: `https://api.openweathermap.org/data/2.5/weather?appid=${apikey}&q=${query}`
    });
}

/*
*/
function getWeatherForecast(query) {
    return $.ajax({
        method: "get",
        url: `https://api.openweathermap.org/data/2.5/forecast/daily?appid=${apikey}&cnt=5&q=${query}`
    });
}

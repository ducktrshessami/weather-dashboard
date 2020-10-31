var apikey;

/*
Set your OpenWeather API key
@params:
key - a string containing your key
*/
function setWeatherApiKey(key) {
    apikey = key;
}

/*
Get UVI severity color hex
@params:
uvi - a number containing the UVI
@returns:
a string containing the color hex
*/
function getUVSeverityColor(uvi) {
    if (uvi < 3) {
        return "#52e735";
    }
    else if (uvi < 6) {
        return "#DCE42F";
    }
    else if (uvi < 8) {
        return "#CEA237";
    }
    else if (uvi < 11) {
        return "#C42440";
    }
    else {
        return "#C126E2";
    }
}

/*
Interfaces wtih OpenWeather's Current Weather and One Call APIs to get current and future weather
conditions. Then, format the data into a single object to be displayed.
@params:
query - a string containing the location to get data for
@returns:
a Promise that resolves in an object containing the formatted data
*/
function getWeatherFormatted(query) {
    return new Promise(function(resolve, reject) {
        getWeatherCurrent(query, reject).then(current => {
            getWeatherForecast(current.coord.lat, current.coord.lon, reject).then(future => {
                resolve({
                    loc: current.name,
                    cache: {
                        timestamp: Date.now(),
                        current: { // Format current conditions
                            icon: {
                                src: `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`,
                                alt: current.weather[0].main
                            },
                            temp: current.main.temp,
                            humid: current.main.humidity,
                            wind: current.wind.speed,
                            uv: future.daily[0].uvi // Why doesn't the Current Weather API have UVI?
                        },
                        forecast: future.daily.map(item => { // Format forecast
                            let day = new Date(item.dt * 1000);
                            return {
                                date: `${day.getMonth() + 1}/${day.getDate()}/${day.getFullYear()}`,
                                icon: {
                                    src: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
                                    alt: item.weather[0].main
                                },
                                temp: item.temp.day,
                                humid: item.humidity
                            };
                        }).slice(1, 6) // Only get the next 5 days' forecast
                    }
                });
            });
        });
    });
}

/*
Call OpenWeather's Current Weather API
@params:
query - a string containing the location to search for
fail - the error handling callback function because for some reason jQuery's ajax has different
        error handling than a standard Promise
@returns:
what appears to be a Promise, but also bypasses Promise rejection unless otherwise specified
*/
function getWeatherCurrent(query, fail) {
    return $.ajax({
        method: "get",
        url: `https://api.openweathermap.org/data/2.5/weather?appid=${apikey}&units=imperial&q=${query}`,
        error: fail
    });
}

/*
Call OpenWeather's One Call API
@params:
lat - a string containing latitude coordinates for the query location
lon - a string containing longitude coordinates for the query location
fail - the error handling callback function because for some reason jQuery's ajax has different
        error handling than a standard Promise
@returns:
what appears to be a Promise, but also bypasses Promise rejection unless otherwise specified
*/
function getWeatherForecast(lat, lon, fail) {
    return $.ajax({
        method: "get",
        url: `https://api.openweathermap.org/data/2.5/onecall?appid=${apikey}&units=imperial&exclude=current,minutely,hourly,alerts&lat=${lat}&lon=${lon}`,
        error: fail
    });
}

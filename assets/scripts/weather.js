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
            getWeatherForecast(current.coord.lat, current.coord.lon).then(future => {
                resolve({
                    loc: current.name,
                    cache: {
                        timestamp: Date.now(),
                        current: {
                            icon: {
                                src: `http://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`,
                                alt: current.weather[0].main
                            },
                            temp: current.main.temp,
                            humid: current.main.humidity,
                            wind: current.wind.speed,
                            uv: future.daily[0].uvi
                        },
                        forecast: future.daily.map(item => {
                            let day = new Date(item.dt * 1000);
                            return {
                                date: `${day.getMonth() + 1}/${day.getDate()}/${day.getFullYear()}`,
                                icon: {
                                    src: `http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
                                    alt: item.weather[0].main
                                },
                                temp: item.temp.day,
                                humid: item.humidity
                            };
                        }).slice(1, 6)
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

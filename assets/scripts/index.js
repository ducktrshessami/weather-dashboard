(function() { // Enclose scope for debugging

    // Settings
    const cacheLife = 60; // minutes
    const apiKey = "b9214a3e75f89a779e45140f10a5ab2c"; // OpenWeather API key

    /**********/

    var recentSearches;
    var display;

    var searchQueryEl;
    var searchBtnEl;

    var historyEl;

    var curLocEl;
    var curLocImgEl;
    var curTempEl;
    var curHumidEl;
    var curWindEl;
    var curUvEl;

    var forecastEl;

    /*
    Initialize the page
    */
    function init() {
        setWeatherApiKey(apiKey);
        initElems();
        initHistory();
        searchBtnEl.click(search);
        historyEl.click(dispHist);
    }

    /*
    */
    function initElems() {
        let foo = $("#curLocation");
        searchQueryEl = $("#search");
        searchBtnEl = $("#searchBtn")
        historyEl = $("#history");
        curLocEl = foo.get(0).childNodes[0]; // The only non-jQuery element stored
        curLocImgEl = foo.children();
        curTempEl = $("#curTemp");
        curHumidEl = $("#curHumid");
        curWindEl = $("#curWind");
        curUvEl = $("#curUV");
        forecastEl = $("#forecast");
    }

    /*
    */
    function initHistory() {
        // Get
        let recent = localStorage.getItem("recentSearches") ? JSON.parse(localStorage.getItem("recentSearches")) : [];
        recentSearches = recent.map(item => ({loc: item, cache: {}}));

        // Display
        if (recentSearches.length) {
            for (let i = 0; i < recentSearches.length - 1; i++) {
                historyEl.prepend(`<li class='list-group-item' role='button'>${recentSearches[i].loc}</li>`);
            }
            getCityData(recentSearches[recentSearches.length - 1].loc).then(displayCity).catch(alert);
        }
    }

    /*
    */
    function storeHistory() {
        let relevant = recentSearches.map(item => item.loc);
        localStorage.setItem("recentSearches", JSON.stringify(relevant));
    }

    /*
    */
    function displayCity(cityData) {
        // Fill content
        curLocEl.textContent = cityData.loc;
        curLocImgEl.attr("src", cityData.cache.current.icon.src);
        curLocImgEl.attr("alt", cityData.cache.current.icon.alt);
        curTempEl.text(cityData.cache.current.temp + " ℉");
        curHumidEl.text(cityData.cache.current.humid + "%");
        curWindEl.text(cityData.cache.current.wind + " MPH");
        curUvEl.text(cityData.cache.current.uv);
        forecastEl.empty();
        for (let i = 0; i < cityData.cache.forecast.length && i < 5; i++) {
            forecastEl.append(`
            <li class="forecast card bg-primary text-white mb-3">
                <div class="card-body">
                    <h4 class="card-title">${cityData.cache.forecast[i].date}</h4>
                    <img src="${cityData.cache.forecast[i].icon.src}" alt="${cityData.cache.forecast[i].icon.alt}" class="card-img w-50">
                    <p class="card-text">Temp: ${cityData.cache.forecast[i].temp} &#8457;</p>
                    <p class="card-text">Humidity: ${cityData.cache.forecast[i].humid}%</p>
                </div>
            </li>
            `);
        }

        // Update history display
        $("li.active[role!='button']", historyEl).removeClass("active").attr("role", "button");
        if (!$(`:contains(${cityData.loc})`, historyEl).length) {
            historyEl.prepend(`<li class='list-group-item'>${cityData.loc}</li>`);
        }
        $(`li:contains(${cityData.loc}):not(.active[role='button'])`).addClass("active").attr("role", "");

        // Display page if first query
        if (!display) {
            display = true;
            $("#display").removeClass("d-none");
        }
    }

    /*
    */
    function getCityData(city) {
        return new Promise(async function(resolve, reject) {
            let cityData;
            let recentIndex = recentSearches.findIndex(data => data.loc == city);

            if (recentIndex !== -1 && verifyCache(recentSearches[recentIndex].cache)) {
                // Data is cached
                cityData = recentSearches[recentIndex];
            }
            else {
                // Remove outdated cache
                if (recentIndex !== -1) {
                    recentSearches.splice(recentIndex, 1);
                }

                try {
                    // Get new data
                    cityData = await getWeatherFormatted(city);
                }
                catch {
                    // Stop here
                    storeHistory(); // Invalid history item removed
                    reject("Could not get weather conditions for " + city);
                    return;
                }
                /*
                Minimizing load time by means of a temporary weather-condition cache meant possibly
                skipping over the asynchronous API call. Therefore, error handling needed to be
                synchronous. This resulted in a promise/try/catch mesh, but it gets the job done.
                */

                // Update stored history
                recentSearches.push(cityData);
                storeHistory();
            }

            resolve(cityData);
        });
    }

    /*
    */
    function verifyCache(data) {
        return (
            data.timestamp
            && (Date.now() - data.timestamp < cacheLife * 60000)
            && data.current.temp
            && data.current.humid
            && data.current.wind
            && data.current.uv
            && data.forecast.length
        );
    }

    /*
    */
    function search(event) {
        event.preventDefault();
        getCityData(searchQueryEl.val().trim()).then(data => {
            searchQueryEl.val("");
            displayCity(data);
        }).catch(alert);
    }

    /*
    */
    function dispHist(event) {
        if (!event.target.className.includes("active")) {
            getCityData(event.target.textContent.trim()).then(displayCity).catch(alert);
        }
    }

    init();

})();
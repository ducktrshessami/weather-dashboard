(function() { // Enclose scope for debugging

    // Settings
    const cacheLife = 60; // minutes
    const apiKey = "b9214a3e75f89a779e45140f10a5ab2c"; // OpenWeather API key

    /**********/

    var recentSearches;
    var display;

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
    }

    /*
    */
    function initElems() {
        let foo = $("#curLocation");
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
            displayCity(recentSearches[recentSearches.length - 1].loc);
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
    async function displayCity(city) {
        let cityData;
        let recentIndex = recentSearches.findIndex(data => data.loc == city);

        if (recentIndex !== -1 && verifyCache(recentSearches[recentIndex].cache)) {
            // Data is cached
            cityData = recentSearches[recentIndex];
        }
        else {
            // Remove outdated cache
            recentSearches.splice(recentIndex, 1);

            // Get new data
            cityData = await getWeatherFormatted(city);

            // Update stored history
            recentSearches.push(cityData);
            storeHistory();
        }

        // Display data
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
            <li class="forecast card bg-primary text-white mr-auto">
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
        $("li.active[role='button']", historyEl).removeClass("active").attr("role", "button");
        if (!$(`:contains(${cityData.loc})`, historyEl).length) {
            historyEl.prepend(`<li class='list-group-item'>${city}</li>`);
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
    function verifyCache(data) {
        return data.timestamp && (Date.now() - data.timestamp < cacheLife * 60000);
    }

    init();

})();
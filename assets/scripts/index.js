(function() { // Enclose scope for debugging

    // Settings
    var cacheLife = 60;

    /**********/

    var recentSearches;
    var display;

    var curLocEl;
    var historyEl;

    /*
    Initialize the page
    */
    function init() {
        initElems();
        initHistory();
    }

    /*
    */
    function initElems() {
        let foo = $("#curLocation");
        curLocEl = foo.get(0).childNodes[0]; // The only non-jQuery element stored
        curLocImgEl = foo.children();
        historyEl = $("#history");
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
                historyEl.prepend("<li class='list-group-item' role='button'>" + recentSearches[i].loc + "</li>");
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
    function displayCity(city) {
        let cityData;
        let recentIndex = recentSearches.findIndex(data => data.loc == city);

        if (recentIndex !== -1 && verifyCache(recentSearches[recentIndex].cache)) {
            cityData = recentSearches.splice(recentIndex, 1)[0];
        }
        else {
            // Get data from OpenWeather
            if (recentIndex !== 1) {
                cityData = recentSearches.splice(recentIndex, 1)[0];
            }
        }

        // Display data
        curLocEl.textContent = city;

        // Update stored history
        recentSearches.push(cityData);
        storeHistory();

        // Update history display
        $("li:contains(" + city + ")", historyEl).remove();
        $("li.active", historyEl).removeClass("active");
        historyEl.prepend("<li class='list-group-item active' role='button'>" + city + "</li>");

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
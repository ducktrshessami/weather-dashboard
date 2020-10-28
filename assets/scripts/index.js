(function() { // Enclose scope for debugging

    var recentSearches;
    var display = false;

    /*
    Initialize the page
    */
    function init() {
        getHistory();

        if (recentSearches.length) {
            displayCity(recentSearches[recentSearches.length - 1])
        }
    }

    /*
    */
    function getHistory() {
        let recent = localStorage.getItem("recentSearches") ? JSON.parse(localStorage.getItem("recentSearches")) : [];
        recentSearches = recent.map(item => ({loc: item, cache: {}}));
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
        
    }

})();
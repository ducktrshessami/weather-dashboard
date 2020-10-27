(function() { // Enclose scope for debugging

    var recentSearches;

    /*
    Initialize the page
    */
    function init() {
        getHistory();
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

})();
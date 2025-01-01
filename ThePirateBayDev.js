
// List of Pirate Bay mirrors to cycle through
var mirrors = [
    "https://thepiratebay7.com",
    "https://thepiratebay0.org",
    "https://thehiddenbay.com",
    "https://piratebay.live",
    "https://thepiratebay.zone",
    "https://piratebayproxy.live"
];

// Function to get the next mirror from the list
var currentMirrorIndex = 0;
function getNextMirror() {
    var mirror = mirrors[currentMirrorIndex];
    currentMirrorIndex = (currentMirrorIndex + 1) % mirrors.length;
    return mirror;
}

var results = [];

// Function to perform a search on The Pirate Bay
function performSearch(searchTitle) {
    try {
        // Cycle to the next mirror
        var baseUrl = getNextMirror();
        var searchUrl = baseUrl + "/search/" + encodeURIComponent(searchTitle) + "/1/99/0";
        console.log("ThePirateBay | Using mirror: " + baseUrl + " | Searching: " + searchTitle);

        var httpResponse = http.request(searchUrl);
        var searchPage = html.parse(httpResponse);

        var torrentTable = searchPage.root.getElementByTagName('tbody')[0];

        if (!torrentTable) {
            console.log("Torrent table not found.");
            return [];
        }

        var torrents = torrentTable.getElementByTagName('tr');
        console.log("ThePirateBay | Number of torrents found: " + torrents.length);

        // Limit to 10 torrents processed
        var tempResults = [];
        for (var i = 0; i < Math.min(torrents.length, 10); i++) {
            var torrent = torrents[i];

            try {
                var titleElement = torrent.getElementByTagName('a')[2];
                if (!titleElement) continue;

                var codec = /[xXhH]265/i.test(titleElement.textContent) ? "H265" : "Unknown";

                // Use a regex to find the magnet link
                var magnetLinkElement = torrent.getElementByTagName('a')[3];
                var magnetLink = magnetLinkElement.attributes.getNamedItem('href').value;

                var seederElement = torrent.getElementByTagName('td')[2];
                var seederCount = seederElement.textContent.trim();

                var item = magnetLink + " - " + 'Unknown' + " - " + seederCount + " - " + codec + " - " + "Unknown";
                tempResults.push(item);

            } catch (error) {
                console.log("ThePirateBay | Error processing torrent: " + error.message);
            }
        }
        return tempResults;
    } catch (err) {
        console.log("ThePirateBay | Error: " + err.message);
        return [];
    }
}

// Check if the title contains hyphens
if (title.includes('-')) {
    console.log("ThePirateBay | Title contains hyphens. Running additional search.");

    // Search with the original title
    results = results.concat(performSearch(title));

    // Search with hyphens removed
    var sanitizedTitle = title.replace(/-/g, "");
    results = results.concat(performSearch(sanitizedTitle));
} else {
    // Search with the original title only
    results = performSearch(title);
}
// Combine and remove duplicate results
results = [...new Set(results)];
console.log("ThePirateBay | Total results: " + results.length);
return results;

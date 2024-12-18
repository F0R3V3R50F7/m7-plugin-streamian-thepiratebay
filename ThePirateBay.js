page.loading = true;

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

var relevantTitlePartMatch = title.match(/\s(S\d{2}E\d{2})/i);

if (relevantTitlePartMatch) {
    var relevantTitlePart = relevantTitlePartMatch[1]
        .trim()
        .toLowerCase();

    console.log('ThePirateBay | Relevant title part: ' + relevantTitlePart);
} else {
    var relevantTitlePart = title.match(/\b(19\d{2}|20\d{2})\b/);

    if (relevantTitlePart) {
        relevantTitlePart = relevantTitlePart[0]; // Extract the year (first match)
        console.log('ThePirateBay | Relevant title part: ' + relevantTitlePart);
    } else {
        console.log('ThePirateBay | No year found in the title.');
    }
}

var results = [];
try {
    // Cycle to the next mirror
    var baseUrl = getNextMirror();
    var searchUrl = baseUrl + "/search/" + encodeURIComponent(title) + "/1/99/0";
    console.log("ThePirateBay | Using mirror: " + baseUrl);

    var httpResponse = http.request(searchUrl);
    var searchPage = html.parse(httpResponse);
    
    var torrentTable = searchPage.root.getElementByTagName('tbody')[0];

    if (!torrentTable) {
        console.log("Torrent table not found.");
        page.loading = false;
        return [];
    }

    var torrents = torrentTable.getElementByTagName('tr');
    console.log("ThePirateBay | Number of torrents found: " + torrents.length);

    // Limit to 10 torrents processed
    for (var i = 0; i < Math.min(torrents.length, 10); i++) {
        var torrent = torrents[i];
        
        try {
            var titleElement = torrent.getElementByTagName('a')[2];

            if (!titleElement) continue;

            // Use a regex to find the magnet link
            var magnetLinkElement = torrent.getElementByTagName('a')[3];
            var magnetLink = magnetLinkElement.attributes.getNamedItem('href').value;

            var seederElement = torrent.getElementByTagName('td')[2];
            var seederCount = seederElement.textContent.trim();

            if (service.H265Filter && /[xXhH]265/i.test(titleElement.textContent)) {
                continue;
            }
                
            // Determine quality based on title
            var quality = "Unknown";
            if (/1080p/i.test(titleElement.textContent)) {
                quality = "1080p";
            } else if (/720p/i.test(titleElement.textContent)) {
                quality = "720p";
            } else if (/XviD/i.test(titleElement.textContent)) {
                quality = "480p";
            }

            var item = magnetLink + " - " + quality + " - " + seederCount;
            results.push(item);

        } catch (error) {
            console.log("ThePirateBay | Error processing torrent: " + error.message);
        }
    }
    page.loading = false;
    return results;
} catch (err) {
    console.log("ThePirateBay | Error: " + err.message);
    page.loading = false;
    return [];
}

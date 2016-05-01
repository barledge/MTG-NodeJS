"use strict";

const url = require("url");
const fs = require('fs');
const scrapeIt = require("scrape-it");
const download = require('./download');

const startUrl = 'http://gatherer.wizards.com/Pages/Search/Default.aspx?text=+[]';

let allFiles = [];

function getNextPage(startUrl) {
    scrapeIt(startUrl, [{
        listItem: 'table.cardItemTable table',
        name: 'cards',
        data: {
            url: {
                selector: '.cardTitle a',
                attr: 'href'
            }
        }
    }, {
        nextLink: {
            selector: '.pagingcontrols a:contains(>)',
            attr: 'href'
        }
    }], (err, page) => {
        console.log(err || page);
        if(err) {
            return console.log(err);
        }

        for(let cardPage in page.cards) {
            console.log(page.cards[cardPage]);
            getCardDetails(url.resolve(startUrl, page.cards[cardPage].url));
        }
        if(page.nextLink) {
            // console.log(url.resolve(startUrl, page.nextLink));
            getNextPage(url.resolve(startUrl, page.nextLink));
        }
    })
}

getNextPage(startUrl);

function getCardDetails(sourceUrl) {
    scrapeIt(sourceUrl, [{
        title: ".cardDetails #ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_nameRow.row .value",
        image: {
            selector: "#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_leftColumn .cardImage img",
            attr: "src"
        },
        convertedManaCost: ".cardDetails #ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_cmcRow.row .value",
        types: ".cardDetails #ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_typeRow.row .value",
        text: ".cardDetails #ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_textRow.row .value",
        expansion: ".cardDetails #ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_setRow.row .value",
        rarity: ".cardDetails #ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_rarityRow.row .value",
        cardNumber: ".cardDetails #ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_numberRow.row .value",
        artist: ".cardDetails #ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_artistRow.row .value",
        rating: "#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_currentRating_textRating",
        votes: "#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_currentRating_totalVotes"
    }], (err, page) => {
        console.log(err || page);
        if(err) {
            return console.log(err);
        }

        if(!page.title) {
            return console.log('Blank data from URL ', url);
        }

        const filename = page.title.toLowerCase().replace(" ", "-").replace(/[^a-z0-9]/gmi, "");

        download(url.resolve(sourceUrl, page.image), './output/img/' + filename + '.jpg', function(err, filename) {
            if(err) {
                return console.log(err);
            }
            console.log('Saved', filename, 'okay.')
        });
        page.image = './img/' + filename + '.jpg';

        fs.writeFile("./output/" + filename + ".json", JSON.stringify(page, null, 2), function(err) {
            if(err) {
                return console.log(err);
            }

            allFiles.push(filename + ".json");
            saveAllFiles();

            console.log("The file was saved!");
        });
    });
}

function saveAllFiles() {
    fs.writeFile("./output/index.json", JSON.stringify(allFiles, null, 2), function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("Index updated!");
    });
}
"use strict";

const url = require("url");
const fs = require('fs');
const scrapeIt = require("scrape-it");

const startUrl = 'http://gatherer.wizards.com/Pages/Search/Default.aspx?text=+[]';

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

function getCardDetails(url) {
    scrapeIt(url, [{
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
        fs.writeFile("./output/" + page.title.toLowerCase().replace(" ","-").replace("'","") + ".json", JSON.stringify(page, null, 2), function(err) {
            if(err) {
                return console.log(err);
            }

            console.log("The file was saved!");
        });
    });
}
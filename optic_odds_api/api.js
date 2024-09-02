const qs = require('qs');
const axios = require('axios');
function getFixtures(params) {
    // API endpoint and API key
    // sport=soccer&league=spain_-_la_liga
    const url = `https://api.opticodds.com/api/v3/fixtures?${qs.stringify(params)}`;
    console.log("url", url)
    const apiKey = '1fb11932-e283-418e-b098-76aed3733b07';
    return new Promise((resolve, reject) => {
        // Send the GET request
        axios.get(url, {
            headers: {
                'X-Api-Key': apiKey,
                'accept': 'application/json'
            }
        })
        .then(response => {
            console.log(response.data);
            resolve(response.data);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            resolve(null);
        });
    })
    
}



async function fetchDummyOdds(fixtureId) {
    const odds=[
        {
          "id": fixtureId,
          "sportsbook": "DummyBook",
          "market": "Moneyline",
          "name": "Dummy Home Team",
          "is_main": true,
          "selection": "Dummy Home Team",
          "normalized_selection": "dummy_home_team",
          "market_id": "moneyline",
          "selection_line": null,
          "player_id": null,
          "team_id": "DUMMYHOME01",
          "price": 100,
          "timestamp": 1723088789.676596,
          "grouping_key": "default",
          "points": null,
          "deep_link": null
        }]
        return odds
}
async function fetchFixtureOdds(fixtureId) {
    const url = `https://api.opticodds.com/api/v3/fixtures/odds?sportsbook=1XBet&fixture_id=${fixtureId}&odds_format=DECIMAL`;
    const apiKey = '1fb11932-e283-418e-b098-76aed3733b07';

    try {
        const response = await axios.get(url, {
            headers: {
                'X-Api-Key': apiKey,
                'accept': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching odds:', error);
    }
}

function getSingleFixture(params) {
    // API endpoint and API key
    // sport=soccer&league=spain_-_la_liga
    const url = `https://api.opticodds.com/api/v3/fixtures?${qs.stringify(params)}`;
    console.log("url", url)
    const apiKey = '1fb11932-e283-418e-b098-76aed3733b07';
    return new Promise((resolve, reject) => {
        // Send the GET request
        axios.get(url, {
            headers: {
                'X-Api-Key': apiKey,
                'accept': 'application/json'
            }
        })
        .then(response => {
            // console.log(response.data);
            resolve(response.data);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            resolve(null);
        });
    })
    
}




module.exports = {
    getFixtures,
    fetchFixtureOdds,
    getSingleFixture
}


const SportsMysql = require('./mysql/sports');
const TeamsMysql = require('./mysql/teams');
const LeaguesMysql = require('./mysql/league');
const FixturesMysql = require('./mysql/fixtures');
const MarketMysql = require('./mysql/markets');
const OpticOddsFixtureIdMappingMysql = require('./mysql/optic_odds_fixture_mapping');
const EventMarketsMysql = require('./mysql/event_markets');
const moment = require('moment');
const config = require('./config');
const Database = require('./db');
const OpticOddsApi = require('./optic_odds_api/api')
const MarketOddsMysql = require('./mysql/market_odds');


const sportsNameMapForOpticOdds = {
    "cricket": "Cricket",
    "soccer": "Football"
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

function getUniqueInt() {
    // return Date.now() + Math.floor(Math.random() * 1000);
    const startTime = new Date('2000-01-01T00:00:00Z').getTime(); // Epoch time
    const now = Date.now();
    const secondsSinceStart = Math.floor((now - startTime) / 1000);
    // Adding some randomness
    const randomOffset = Math.floor(Math.random() * 1000); // Random offset to add variability
    const randomOffset2 = Math.floor(Math.random() * 100); // Random offset to add variability

    const uniqueId = secondsSinceStart + randomOffset + randomOffset2;
    return uniqueId;
}

function getUniqueInt2() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

async function getTeam(db, teamName, sport, sportsByNameMap) {
    const teamsByName = await TeamsMysql.getTeamsByName(db, teamName);
    let team;
    if (!teamsByName.length) {
        team = {
            sport_guid: sportsByNameMap[sportsNameMapForOpticOdds[sport]]['bet365_sport_guid'],
            team_uid: getUniqueInt(),
            team_name: teamName,
            status: 1,
            updated_at: moment().format('YYYY-MM-DD HH:mm:ss').toString(),
        }
        await TeamsMysql.createNewTeam(db, team);
    } else {
        team = teamsByName[0];
    }
    return team;
}

async function main() {
    try {
        // select first all the sports and form a map of it
        const db = new Database(config.read_mysql);
        const sportsByNameMap = {};
        const sport = "soccer";
        const allSports = await SportsMysql.getAllSports(db);
        for (const sport of allSports) {
            const {
                sports_id,
                sport_guid,
                bet365_sport_guid,
                lsport_guid,
                sports_name,
            } = sport;

            sportsByNameMap[sports_name] = sport;
        }

        // get fixtures
        const fixturesContext = {
            sport: sport,
            // id: "A0F0A0BDCB4C",
            league: 'england_-_premier_league',
            start_date_after: moment().toISOString(),
            page: 1,
        };
        console.log("fixturesContext", fixturesContext.start_date_after)
        const allFixturesResponse = await OpticOddsApi.getFixtures(fixturesContext)
        let pageCtr = 1;
        const {
            data: fixtures,
            page,
            total_pages,
        } = allFixturesResponse;


        for (const fixture of fixtures) {
            const {
                id, //  fixture_id
                game_id,
                start_date, // open_date
                is_live, 
                status, // unplayed, completed
                home_competitors,
                away_competitors,
                home_team_display,
                away_team_display,
                league, // id, name
                venue_name,
            } = fixture;

            const {
                id: leagueAbbr, // abbr
                name: leagueName, // display name
            } = league;
            console.log("id --------> ", id);

            let currentLeague;
            let team1;
            let team2;
            const leagueByAbrr = await LeaguesMysql.getLeaguesByAbbr(db, leagueAbbr)
            if (!leagueByAbrr.length) {
                currentLeague = {
                    league_uid: getUniqueInt(),
                    location_id: getUniqueInt(),
                    sport_guid: sportsByNameMap[sportsNameMapForOpticOdds[sport]]['bet365_sport_guid'],
                    league_abbr: leagueAbbr,
                    league_name: leagueName,
                    region: venue_name,
                    active: 1,
                    agent_active: 1,
                    updated_date: moment().format('YYYY-MM-DD HH:mm:ss').toString(),
                    is_deleted: 0, 
                    is_agent_deleted: 0,
                }
                await LeaguesMysql.createNewLeague(db, currentLeague);
            } else {
                currentLeague = leagueByAbrr[0];
            }

            team1 = await getTeam(db,  home_team_display, sport, sportsByNameMap);
            team2 = await getTeam(db, away_team_display, sport, sportsByNameMap);

            // check fixture in mapping 
            let fixtureEventId;
            const fixtureById = await OpticOddsFixtureIdMappingMysql.getFixtureById(db, id);
            console.log("fixtureById", fixtureById, id);
            if (fixtureById.length) {
                fixtureEventId = fixtureById[0].event_id;
                const toUpdate = {
                    is_live: is_live ? 1 : 0,
                };
                await FixturesMysql.updateFixtureById(db, fixtureEventId, toUpdate);
            } else {
                // create a new event
                const fixtureEventObj = {
                    event_id: getUniqueInt(),
                    sport_guid: sportsByNameMap[sportsNameMapForOpticOdds[sport]]['bet365_sport_guid'],
                    unique_id: 0,
                    time_status: 1,
                    league_uid: currentLeague['league_uid'],
                    open_date: start_date,
                    team_1: team1.team_uid,
                    team_2: team2.team_uid,
                    league_json: JSON.stringify({
                        id: currentLeague.league_uid,
                        name: currentLeague.league_name,
                    }),
                    participants: JSON.stringify({
                        away: {
                            id: team1.team_uid,
                            name: away_competitors[0].name,
                        },
                        home: {
                            id: team2.team_uid,
                            name: home_competitors[0].name,
                        }
                    }),
                    participant_name: `${home_team_display} ${away_team_display}`,
                    admin_status: 1,
                    agent_status: 1,
                    is_live: is_live ? 1 : 0,
                    is_auto_settle: 0,
                    order: 0,
                    is_notify: 0,
                    is_widget: 0,
                }
                await FixturesMysql.createNewFixture(db, fixtureEventObj);
                fixtureEventId = fixtureEventObj.event_id;
                const fixtureIdEventMapping = {
                    fixture_id: id,
                    event_id: fixtureEventId,
                };
                await OpticOddsFixtureIdMappingMysql.createNewMapping(db, fixtureIdEventMapping)
            }

            // get odds, update them
            let oddsResponse;
            try {
                oddsResponse = await OpticOddsApi.fetchFixtureOdds(id);
            } catch (err) {
                console.log("error", err);
            }     
            
            if (!oddsResponse) {
                continue;
            }
            
            console.log("oddsResponse", oddsResponse)
            const {
                data,
            } = oddsResponse;

            for (const _data of data) {
                console.log('`1111')
                const {
                    id: fixtureId,
                    odds,
                } = _data;
                console.log('`222222`', odds.length);
                for (const odd of odds) {
                    const {
                        name,
                        market,
                        sportsbook,
                        market_id,
                        grouping_key,
                        is_main,
                    } =  odd;

                    // check if market exists if not create
                    const markets = await MarketMysql.getMarketByName(db, market);
                    let currentMarket;
                    if (markets.length) {
                        currentMarket = markets[0];
                    }  else {
                        const marketId = getUniqueInt()
                        currentMarket = {
                            id: marketId,
                            market_id: marketId,
                            lsport_guid: sportsByNameMap[sportsNameMapForOpticOdds[sport]]['bet365_sport_guid'],
                            market_name: market,
                            active: 1,
                            is_line: 0,
                            info: market,
                            view_type: 1,
                            header: 'NA',
                            auto_settle: 1,
                            modified_by: 0
                        } 

                        await MarketMysql.createNewMarket(db, currentMarket);
                    }     

                    // insert in event markets
                    const eventMarkets = await EventMarketsMysql.getByMarketIdAndEventId(db, currentMarket.market_id, fixtureEventId);
                    let currentEventMarket;
                    if (eventMarkets.length) {
                        currentEventMarket = eventMarkets[0];
                    } else {
                        currentEventMarket = {
                            event_id: fixtureEventId,
                            market_id: currentMarket.market_id,
                            market_key: market,
                            is_main_market: is_main ? 1: 0,
                            admin_status: 1,
                            agent_status: 0,
                            is_suspended: 0,
                            is_thirdparty_notify: 0,
                            is_favourite: 0,
                            is_auto_settlement: 1,
                            provider_id: 0
                        } 

                        await EventMarketsMysql.createNewEventMarket(db, currentEventMarket);
                    }

                    // check if market odds are there
                    let currentEventMarketOdds;
                    const marketOdds = await MarketOddsMysql.getByMarketIdAndEventId(db, currentMarket.market_id, fixtureEventId);
                    if (marketOdds.length) {
                        console.log("already exists", fixtureEventId);
                        currentEventMarketOdds = marketOdds[0];
                    } else {
                        currentMarketOdds = {
                            event_id: fixtureEventId,
                            market_id: currentMarket.market_id,
                            market_name: market,
                            market_key: market_id,
                            line: 0,
                            status:  1,
                            provider_id: 0,
                            is_suspended: 0,
                            settlement_status: 0,
                            ls_settlement: 0,
                            admin_status: 1,
                            agent_status: 1,
                            lock_betting: 0,
                            agent_lock_betting: 0,
                        }

                        const options = odds.filter((odd) => odd.market == market);
                        for (const option of options) {
                            await sleep(1000);
                            await MarketOddsMysql.createNewOdd(db, {
                                ...currentMarketOdds,
                                name: option.name,
                                odds: option.price,
                                id: getUniqueInt2(),
                            })
                        }

                    }


                    // if (market_id in oddsDone) {
                    //     continue;
                    // }
            
                    // const options =  odds.filter((odd) => odd.grouping_key == grouping_key).map((odd) => odd.name).join('###');
        
        
            
                    // csvData.push({
                    //     id,
                    //     market,
                    //     question: market,
                    //     options,
                    // })
            
            
                    // oddsDone[market_id] = true;
                }
            }
    
            
            
        }


        // create a new fixture
    
    } catch (err) {
        console.log("error", err);
    }




}








// main();
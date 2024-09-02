const OpticOddsApi = require('./optic_odds_api/api')
const FixturesMysql = require('./mysql/fixtures');
const Database = require('./db');
const config = require('./config');


async function updateFixture(fixture_id) {
    const db = new Database(config.read_mysql);
    // vi_lsport_events
    const fixturesContext = {
        id: fixture_id
    };
    const updateFixturesResponse = await OpticOddsApi.getSingleFixture(fixturesContext)
    let toUpdate;
    if(updateFixturesResponse.data.length!==0){
if(updateFixturesResponse.data[0].status=="completed"){
toUpdate=1

}
else{
    toUpdate=0
}
await FixturesMysql.updateStatusById(db, fixturesContext.id, toUpdate);
    }
    else{
        console.log("don't have status")
    }
    


console.log(updateFixturesResponse)
}
updateFixture('B0458A9FB585')


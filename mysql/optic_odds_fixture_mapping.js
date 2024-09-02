
function getFixtureById(db, fixtureId) {
    const sql = "select * from optic_odds_fixture_id_mapping where fixture_id = ?";
    return db.query(sql, fixtureId);
}

function createNewMapping(db, mapping) {
    const sql = "insert into optic_odds_fixture_id_mapping SET ?";
    return db.query(sql, mapping);
}


module.exports = {
    getFixtureById,
    createNewMapping,
}
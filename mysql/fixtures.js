
function createNewFixture(db, fixture) {
    const sql = "insert into vi_lsport_events SET ?";
    return db.query(sql, fixture);
}

function updateFixtureById(db, fixtureId, obj) {
    const sql = "UPDATE vi_lsport_events SET ? WHERE event_id = ?";
    return db.query(sql, [obj, fixtureId]);
}
function updateStatusById(db, fixtureId, adminStatus) {
    console.log(fixtureId,adminStatus,"fdsrfde")
    // Prepare the SQL query to update the `admin_status` field
    const sql = "UPDATE vi_lsport_events SET admin_status = ? WHERE event_id = ?";
    
    // Execute the query with the provided adminStatus and fixtureId
    return db.query(sql, [adminStatus, fixtureId]);
}


module.exports = {
    createNewFixture,
    updateFixtureById,
    updateStatusById
}
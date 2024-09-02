
function getByMarketIdAndEventId(db, marketId, eventId) {
    const sql = "select * from vi_lsport_market_odds where market_id = ? and event_id = ?";
    return db.query(sql, [marketId, eventId]);
}

function createNewOdd(db, odd) {
    const sql = "insert into vi_lsport_market_odds  SET ?";
    return db.query(sql, odd);
}

module.exports = {
    getByMarketIdAndEventId,
    createNewOdd,
}
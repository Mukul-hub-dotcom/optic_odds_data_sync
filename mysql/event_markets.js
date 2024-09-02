
function getByMarketIdAndEventId(db, marketId, eventId) {
    const sql = "select * from vi_lsport_event_markets where market_id = ? and event_id = ?";
    return db.query(sql, [marketId, eventId]);
}

function createNewEventMarket(db, market) {
    const sql = "insert into vi_lsport_event_markets  SET ?";
    return db.query(sql, market);
}

module.exports = {
    getByMarketIdAndEventId,
    createNewEventMarket,
}

function getMarketByName(db, marketName) {
    const sql = "select * from vi_ls_markets_master where market_name = ?";
    return db.query(sql, marketName);
}

function createNewMarket(db, market) {
    const sql = "insert into vi_ls_markets_master  SET ?";
    return db.query(sql, market);
}

module.exports = {
    getMarketByName,
    createNewMarket,
}
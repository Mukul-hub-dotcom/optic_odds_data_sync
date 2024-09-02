
function getLeaguesByAbbr(db, leagueAbbr) {
    const sql = "select * from vi_ls_leagues where league_abbr = ?";
    return db.query(sql, leagueAbbr);
}

function createNewLeague(db, league) {
    const sql = "insert into vi_ls_leagues  SET ?";
    return db.query(sql, league);
}

module.exports = {
    getLeaguesByAbbr,
    createNewLeague,
}
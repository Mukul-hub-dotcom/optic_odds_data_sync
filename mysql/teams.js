
function getTeamsByName(db, teamName) {
    const sql = "SELECT * FROM vi_team where team_name = ?";
    return db.query(sql, [teamName]);
}

async function createNewTeam(db, teamsData) {
    console.log("teamsData", teamsData)
    const sql = `INSERT INTO vi_team SET ?`;
    return db.query(sql, teamsData);
}

module.exports = {
    getTeamsByName,
    createNewTeam,
}
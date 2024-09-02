
function getAllSports(db) {
    const sql = "SELECT * FROM vi_ex_master_sports";
    return db.query(sql);
}

module.exports = {
    getAllSports,
}
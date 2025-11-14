import mysql from 'mysql2/promise';


export const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'pantteri1',
    database: 'botdata',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});



(async () => {
    try {
        const connection = await db.getConnection();
        console.log('Tietokantaan yhdistetty!');
        connection.release();
    } catch (error) {
        console.error('Tietokantaan yhdistämisessä virhe!', error);
    }
})();

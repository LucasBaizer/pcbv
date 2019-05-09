const mysql = require('promise-mysql');

module.exports = {
    connect: async () => {
        try {
            return await mysql.createConnection({
                host: process.env['MYSQL_SERVER'],
                user: process.env['MYSQL_USERNAME'],
                password: process.env['MYSQL_PASSWORD'],
                database: 'pcbv'
            });
        } catch(e) {
            if(e.code === 'ER_NOT_SUPPORTED_AUTH_MODE') {
                console.error('Auth mode not supported; make sure you\'ve run "ALTER USER \'user\'@\'server\' IDENTIFIED WITH mysql_native_password BY \'password\'; FLUSH PRIVILEGES;"');
                console.error('If you\'ve already done that, make sure that you have a ".env" file created in ./server with the MySQL connection information.');
            }
        }

        return null;
    }
}
/* eslint-disable global-require */
/**
 * @Author: xesloohc
 * @Date:   2019-06-18T19:19:30+05:30
 * @Email:  god@xesloohc.com
 * @Last modified by: Abhishek Sinha
 * @Last modified date: 2020-01-20
 */
require('dotenv').config();

const Joi = require('joi');
const envVarsSchema = Joi.object({
    PORT: Joi.number().default(3000),
    MYSQL_HOST_WRITE: Joi.string().required().description('Mysql host write'),
    MYSQL_USER_WRITE: Joi.string().required().description('Mysql username write'),
    MYSQL_DB_WRITE: Joi.string().required().description('Mysql dbname write'),
    // MYSQL_PASS_WRITE: Joi.string().required().description('Mysql password write'),

    MYSQL_HOST_READ: Joi.string().required().description('Mysql host read'),
    MYSQL_USER_READ: Joi.string().required().description('Mysql username read'),
    MYSQL_DB_READ: Joi.string().required().description('Mysql sbname read'),
    // MYSQL_PASS_READ: Joi.string().required().description('Mysql password write'),
}).unknown().required();

const { error, value: envVars } = Joi.validate(process.env, envVarsSchema);
if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}
function getPoolConnectionLimit(slave = false) {
    if (envVars.NODE_ENV === 'production') {
        if (slave) {
            return parseInt(envVars.MYSQL_CONNECTION_POOL_SLAVE);
        }
        return parseInt(envVars.MYSQL_CONNECTION_POOL);
    }
    if (slave) {
        return 3;
    }
    return 2;
}

const apiConfig = {
    port: envVars.PORT,
    write_mysql: {
        host: envVars.MYSQL_HOST_WRITE,
        user: envVars.MYSQL_USER_WRITE,
        // password: envVars.MYSQL_PASS_WRITE,
        database: envVars.MYSQL_DB_WRITE,
        connectionLimit: getPoolConnectionLimit(),
        connectTimeout: 600000,		// 60 * 60 * 1000
        aquireTimeout: 600000,			// 60 * 60 * 1000
        timeout: 600000,				// 60 * 60 * 1000
        charset: 'utf8mb4',
    },
    read_mysql: {
        host: envVars.MYSQL_HOST_READ,
        user: envVars.MYSQL_USER_READ,
        password: envVars.MYSQL_PASS_READ,
        database: envVars.MYSQL_DB_READ,
        connectionLimit: getPoolConnectionLimit(true),
        connectTimeout: 600000,		// 60 * 60 * 1000
        aquireTimeout: 600000,			// 60 * 60 * 1000
        timeout: 600000,				// 60 * 60 * 1000
        charset: 'utf8mb4',
    },
    MYSQL_MAX_EXECUTION_TIME_IN_MILLISECONDS: 60
};

const scriptsConfig = {
    mysql_analytics: {
        host: envVars.MYSQL_HOST_ANALYTICS,
        user: envVars.MYSQL_USER_ANALYTICS,
        password: envVars.MYSQL_PASS_ANALYTICS,
        database: envVars.MYSQL_DB_ANALYTICS,
        timezone: envVars.MYSQL_TIMEZONE_ANALYTICS,
    },
    mysql_write: {
        host: envVars.MYSQL_HOST_WRITE,
        user: envVars.MYSQL_USER_WRITE,
        // password: envVars.MYSQL_PASS_WRITE,
        database: envVars.MYSQL_DB_WRITE,
        timezone: envVars.MYSQL_TIMEZONE_ANALYTICS,
    },
};
module.exports = { ...apiConfig, ...scriptsConfig };

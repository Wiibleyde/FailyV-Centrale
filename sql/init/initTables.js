//Récup du logger
const logger = require('../../modules/logger');
//Récup de la connection SQL
const mysql = require('../../modules/sql');

module.exports = {
    initAllTables: () => {
        return new Promise((resolve, reject) => {
            mysql.sql().query("CREATE TABLE IF NOT EXISTS `doctorRoles` (`discordUserId` varchar(255) NOT NULL,`rolesId` TEXT)")
            mysql.sql().query("CREATE TABLE radio (radioid VARCHAR(255) PRIMARY KEY NOT NULL, radiofreq VARCHAR(5) DEFAULT '0.0' NOT NULL, displayed TINYINT(1) DEFAULT FALSE NOT NULL)")
            mysql.sql().query("CREATE TABLE IF NOT EXISTS `rdv` (`id` INT(255) NOT NULL AUTO_INCREMENT PRIMARY KEY, `type` INT(1) NOT NULL DEFAULT 0, `patient` VARCHAR(255) NOT NULL, `phone` VARCHAR(8) NOT NULL, `note` TEXT NOT NULL, `contact` TEXT NOT NULL, `taker` TEXT DEFAULT NULL, `writter` VARCHAR(255) NOT NULL, `color` INT(255) NOT NULL DEFAULT 10420224, `messageID` TEXT NOT NULL)")
            mysql.sql().query("CREATE TABLE `lit` (`patient` TEXT NOT NULL, `letter` VARCHAR(1) NOT NULL PRIMARY KEY, `surveillance` BOOLEAN NOT NULL DEFAULT FALSE) ENGINE = InnoDB")
            mysql.sql().query("CREATE TABLE `lit_message` (`id` TEXT NOT NULL) ENGINE = InnoDB")
            mysql.sql().query("CREATE TABLE IF NOT EXISTS `debug` (`roleID` TEXT NOT NULL, `state` INT(1) NOT NULL)")
            mysql.sql().query("CREATE TABLE IF NOT EXISTS `channels` (`name` VARCHAR(255) NOT NULL, `id` TEXT NOT NULL)")
        });
    }
}


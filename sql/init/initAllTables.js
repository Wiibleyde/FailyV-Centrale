//Récup du logger
const logger = require('../../modules/logger');
//Récup de la connection SQL
const mysql = require('../../modules/sql');

module.exports = {
    initAllTables: (client) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query("CREATE TABLE IF NOT EXISTS `doctor_rank` (`id` varchar(50) NOT NULL, `name` varchar(50) NOT NULL, `parent_channel_id` varchar(20) NOT NULL, `role_id` varchar(20) NOT NULL, `position` INT NOT NULL, CONSTRAINT `rank_pk` PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci", function (error, results, fields) { if (error) reject(error); });
            mysql.sql().query("CREATE TABLE IF NOT EXISTS `doctor` (`id` INT(255) AUTO_INCREMENT NOT NULL, `discord_id` varchar(18) NOT NULL, `first_name` varchar(50) NOT NULL, `last_name` varchar(50) NOT NULL, `phone_number` varchar(8) NOT NULL, `rank_id` varchar(50) NOT NULL, `channel_id` varchar(20) NOT NULL, `arrival_date` DATE NOT NULL, `departure_date` DATE DEFAULT NULL NULL, CONSTRAINT `doctor_pk` PRIMARY KEY (id), CONSTRAINT `doctor_fk` FOREIGN KEY (rank_id) REFERENCES `doctor_rank`(id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci", function (error, results, fields) { if (error) reject(error); });
            mysql.sql().query("CREATE TABLE IF NOT EXISTS `doctor_card_category` (`id` varchar(50) NOT NULL, `name` varchar(100) NOT NULL, `position` INT NOT NULL, `color` varchar(7) DEFAULT '#000000' NOT NULL, CONSTRAINT doctor_card_category_pk PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci", function (error, results, fields) { if (error) reject(error); });
            mysql.sql().query("CREATE TABLE IF NOT EXISTS `doctor_card` (`position_in_category` INT NOT NULL, `category` varchar(50) NOT NULL, `item` varchar(100) NOT NULL,	CONSTRAINT `doctor_card_fk` FOREIGN KEY (category) REFERENCES doctor_card_category(id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci", function (error, results, fields) { if (error) reject(error); });
            mysql.sql().query("CREATE TABLE IF NOT EXISTS `channels` (`name` VARCHAR(255) NOT NULL, `id` TEXT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci", function (error, results, fields) { if (error) reject(error); });
            mysql.sql().query("CREATE TABLE IF NOT EXISTS `debug` (`roleID` TEXT NOT NULL, `state` INT(1) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci", function (error, results, fields) { if (error) reject(error); });
            mysql.sql().query("CREATE TABLE IF NOT EXISTS `doctorRoles` (`discordUserId` varchar(255) NOT NULL,`rolesId` TEXT) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci", function (error, results, fields) { if (error) reject(error); });
            mysql.sql().query("CREATE TABLE IF NOT EXISTS `lit` (`id` INT(255) NOT NULL PRIMARY KEY AUTO_INCREMENT, `patient` TEXT NOT NULL, `letter` VARCHAR(1) NOT NULL, `surveillance` BOOLEAN NOT NULL DEFAULT FALSE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci", function (error, results, fields) { if (error) reject(error); });
            mysql.sql().query("CREATE TABLE IF NOT EXISTS `lit_message` (`id` TEXT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci", function (error, results, fields) { if (error) reject(error); });
            mysql.sql().query("CREATE TABLE IF NOT EXISTS `nickname` (`name` VARCHAR(255) NOT NULL PRIMARY KEY) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci", function (error, results, fields) { if (error) reject(error); });
            mysql.sql().query("CREATE TABLE IF NOT EXISTS `radio` (`id` INT(255) NOT NULL PRIMARY KEY AUTO_INCREMENT, `radioid` VARCHAR(255) NOT NULL, `radiofreq` VARCHAR(5) DEFAULT '0.0' NOT NULL, `displayed` BOOLEAN DEFAULT FALSE NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci", function (error, results, fields) { if (error) reject(error); });
            mysql.sql().query("CREATE TABLE IF NOT EXISTS `rdv` (`id` INT(255) NOT NULL AUTO_INCREMENT PRIMARY KEY, `type` INT(1) NOT NULL DEFAULT 0, `patient` VARCHAR(255) NOT NULL, `phone` VARCHAR(8) NOT NULL, `note` TEXT NOT NULL, `contact` TEXT NOT NULL, `taker` TEXT DEFAULT NULL, `writter` VARCHAR(255) NOT NULL, `color` INT(255) NOT NULL DEFAULT 10420224, `messageID` TEXT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci", function (error, results, fields) { if (error) reject(error); });
            mysql.sql().query("CREATE TABLE IF NOT EXISTS `vehicule` (`id` INT(255) NOT NULL AUTO_INCREMENT PRIMARY KEY, `name` VARCHAR(255) NOT NULL, `plate` VARCHAR(8) NOT NULL, `ct` TIMESTAMP NOT NULL, `state` INT(1) NOT NULL DEFAULT 0, `type` VARCHAR(255) NOT NULL, `type_order` INT(1) NOT NULL DEFAULT 5, `messageID` TEXT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci", function (error, results, fields) { if (error) reject(error); });
            const getRadios = mysql.sql().query("SELECT * FROM `radio`", function (error, results, fields) { if (error) reject(error); });
            if(getRadios[0] == null) {
                mysql.sql().query("INSERT INTO `radio` SET `radioid`='lsms', `displayed`='1'", function (error, results, fields) { if (error) reject(error); });
                mysql.sql().query("INSERT INTO `radio` SET `radioid`='fdo', `displayed`='1'", function (error, results, fields) { if (error) reject(error); });
                mysql.sql().query("INSERT INTO `radio` SET `radioid`='bcms'", function (error, results, fields) { if (error) reject(error); });
                mysql.sql().query("INSERT INTO `radio` SET `radioid`='event'", function (error, results, fields) { if (error) reject(error); });
            }
            resolve(logger.log(`Base de donnée initialisée/mise à jour !`, client));
        });
    }
}
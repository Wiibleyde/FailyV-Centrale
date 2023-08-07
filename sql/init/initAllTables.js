//Récup du logger
const logger = require('../../modules/logger');
//Récup de la connection SQL
const mysql = require('../../modules/sql');

module.exports = {
    initAllTables: () => {
        return new Promise(async (resolve, reject) => {
            await sendRequest("CREATE TABLE IF NOT EXISTS `doctor_rank` (`id` varchar(50) NOT NULL, `name` varchar(50) NOT NULL, `parent_channel_id` varchar(20) NOT NULL, `role_id` varchar(20) NOT NULL, `position` INT NOT NULL, CONSTRAINT `rank_pk` PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");
            await sendRequest("CREATE TABLE IF NOT EXISTS `doctor` (`id` INT(255) AUTO_INCREMENT NOT NULL, `discord_id` varchar(18) NOT NULL, `first_name` varchar(50) NOT NULL, `last_name` varchar(50) NOT NULL, `phone_number` varchar(8) NOT NULL, `rank_id` varchar(50) NOT NULL, `channel_id` varchar(20) NOT NULL, `arrival_date` DATE NOT NULL, `departure_date` DATE DEFAULT NULL NULL, CONSTRAINT `doctor_pk` PRIMARY KEY (id), CONSTRAINT `doctor_fk` FOREIGN KEY (rank_id) REFERENCES `doctor_rank`(id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");
            await sendRequest("CREATE TABLE IF NOT EXISTS `doctor_card_category` (`id` varchar(50) NOT NULL, `name` varchar(100) NOT NULL, `position` INT NOT NULL, `color` varchar(7) DEFAULT '#000001' NOT NULL, CONSTRAINT doctor_card_category_pk PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");
            await sendRequest("CREATE TABLE IF NOT EXISTS `doctor_card` (`position_in_category` INT NOT NULL, `category` varchar(50) NOT NULL, `item` varchar(100) NOT NULL, CONSTRAINT `doctor_card_fk` FOREIGN KEY (category) REFERENCES doctor_card_category(id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");
            await sendRequest("CREATE TABLE IF NOT EXISTS `channels` (`name` VARCHAR(255) NOT NULL, `id` TEXT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");
            await sendRequest("CREATE TABLE IF NOT EXISTS `debug` (`roleID` TEXT NOT NULL, `state` INT(1) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");
            await sendRequest("CREATE TABLE IF NOT EXISTS `doctorRoles` (`discordUserId` varchar(255) NOT NULL,`rolesId` TEXT) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");
            await sendRequest("CREATE TABLE IF NOT EXISTS `lit` (`id` INT(255) NOT NULL PRIMARY KEY AUTO_INCREMENT, `patient` TEXT NOT NULL, `letter` VARCHAR(1) NOT NULL, `surveillance` BOOLEAN NOT NULL DEFAULT FALSE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");
            await sendRequest("CREATE TABLE IF NOT EXISTS `message` (`correspond` VARCHAR(255) NOT NULL, `id` TEXT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");
            await sendRequest("CREATE TABLE IF NOT EXISTS `nickname` (`name` VARCHAR(255) NOT NULL PRIMARY KEY) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");
            await sendRequest("CREATE TABLE IF NOT EXISTS `radio` (`id` INT(255) NOT NULL PRIMARY KEY AUTO_INCREMENT, `radioid` VARCHAR(255) NOT NULL, `radiofreq` VARCHAR(5) DEFAULT '0.0' NOT NULL, `displayed` BOOLEAN DEFAULT FALSE NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");
            await sendRequest("CREATE TABLE IF NOT EXISTS `rdv` (`id` INT(255) NOT NULL AUTO_INCREMENT PRIMARY KEY, `type` INT(1) NOT NULL DEFAULT 0, `patient` VARCHAR(255) NOT NULL, `phone` VARCHAR(8) NOT NULL, `note` TEXT NOT NULL, `contact` TEXT NOT NULL, `taker` TEXT DEFAULT NULL, `writter` VARCHAR(255) NOT NULL, `color` INT(255) NOT NULL DEFAULT 10420224, `messageID` TEXT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");
            await sendRequest("CREATE TABLE IF NOT EXISTS `vehicule` (`id` INT(255) NOT NULL AUTO_INCREMENT PRIMARY KEY, `name` VARCHAR(255) NOT NULL, `plate` VARCHAR(8) NOT NULL, `ct` TIMESTAMP NOT NULL, `state` INT(1) NOT NULL DEFAULT 0, `type` VARCHAR(255) NOT NULL, `type_order` INT(1) NOT NULL DEFAULT 5, `messageID` TEXT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");
            await sendRequest("CREATE TABLE IF NOT EXISTS `agenda` (`id` INT(255) NOT NULL AUTO_INCREMENT PRIMARY KEY, `name` VARCHAR(255) NOT NULL, `date` TIMESTAMP NOT NULL, `by` VARCHAR(4) NOT NULL, `responsibles` TEXT NOT NULL, `allowed` TEXT NOT NULL, `confidentiality` BOOLEAN DEFAULT FALSE NOT NULL, `donor` BOOLEAN DEFAULT FALSE NOT NULL, `management` TEXT NOT NULL, `cause` TEXT NOT NULL, `other` TEXT DEFAULT NULL, `writter` VARCHAR(255) NOT NULL, `contact` TEXT DEFAULT NULL, `agendaID` VARCHAR(255) NOT NULL, `mayorID` VARCHAR(255) NOT NULL, `LSPDID` VARCHAR(255) NOT NULL, `eventURL` VARCHAR(255) DEFAULT NULL, `state` TINYINT(2) DEFAULT 0 NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci"); //STATE -> 0=waiting; 1=event created; 2=ended
            await sendRequest("CREATE TABLE IF NOT EXISTS `follow_organ` (`id` INT(255) NOT NULL AUTO_INCREMENT PRIMARY KEY, `type` VARCHAR(6) NOT NULL, `side` TINYINT(1) NOT NULL, `expire_date` TIMESTAMP NOT NULL, `state` BOOLEAN NOT NULL DEFAULT FALSE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci"); //0 = left | 1 = right
            await sendRequest("CREATE TABLE IF NOT EXISTS `follow_patient_organ` (`id` INT(255) NOT NULL AUTO_INCREMENT PRIMARY KEY, `name` VARCHAR(255) NOT NULL, `organ` VARCHAR(7) NOT NULL, `side` TINYINT(3) NOT NULL DEFAULT 0) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci"); //0 = none | 1 = left | 2 = right | 3 = both
            await sendRequest("CREATE TABLE IF NOT EXISTS `follow_ppa` (`id` INT(255) NOT NULL AUTO_INCREMENT PRIMARY KEY, `name` VARCHAR(255) NOT NULL, `phone` VARCHAR(8) NOT NULL, `reason` TINYINT(5) NOT NULL, `type` BOOLEAN NOT NULL DEFAULT FALSE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");
            await sendRequest("CREATE TABLE IF NOT EXISTS `follow_secours` (`id` INT(255) NOT NULL AUTO_INCREMENT PRIMARY KEY, `name` VARCHAR(255) NOT NULL, `phone` VARCHAR(8) NOT NULL, `company` VARCHAR(255) NOT NULL, `cat` BOOLEAN NOT NULL DEFAULT TRUE, `forma_rank` TINYINT(3) NOT NULL DEFAULT 0) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");
            await sendRequest("CREATE TABLE IF NOT EXISTS `inspection` (`id` INT(255) NOT NULL AUTO_INCREMENT PRIMARY KEY, `company` VARCHAR(255) NOT NULL, `date` TIMESTAMP NOT NULL, `doctors` TEXT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");
            await sendRequest("CREATE TABLE IF NOT EXISTS `features` (`id` INT(255) NOT NULL AUTO_INCREMENT PRIMARY KEY, `type` VARCHAR(255) NOT NULL, `name` VARCHAR(255) NOT NULL, `feature` TEXT NOT NULL, `state` BOOLEAN NOT NULL DEFAULT FALSE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");
            await sendRequest("CREATE TABLE IF NOT EXISTS `patchnote` (`id` INT(255) NOT NULL AUTO_INCREMENT PRIMARY KEY, `name` VARCHAR(255) NOT NULL, `version` VARCHAR(255) NOT NULL, `features_id` TEXT NOT NULL, `state` BOOLEAN NOT NULL DEFAULT FALSE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");
            await sendRequest("CREATE TABLE IF NOT EXISTS `company` (`id` INT(255) NOT NULL AUTO_INCREMENT PRIMARY KEY, `name` VARCHAR(255) NOT NULL, `acronym` VARCHAR(255) NOT NULL, `side` BOOLEAN NOT NULL DEFAULT FALSE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");
            const getRadios = await sendRequest("SELECT * FROM `radio`");
            logger.debug(getRadios);
            if(getRadios[0] == null) {
                await sendRequest("INSERT INTO `radio` SET `radioid`='lsms', `displayed`='1'");
                await sendRequest("INSERT INTO `radio` SET `radioid`='fdo', `displayed`='1'");
                await sendRequest("INSERT INTO `radio` SET `radioid`='bcms'");
                await sendRequest("INSERT INTO `radio` SET `radioid`='event'");
            }
            resolve(logger.log(`Base de donnée initialisée !`));
        });
    }
}

function sendRequest(req) {
    return new Promise(async (resolve, reject) => {
        mysql.sql().query({
                sql: `${req}`,
                timeout: 40000
            }, (reqErr, result, fields) => {
            if(reqErr) {
                logger.error(reqErr);
                reject(reqErr);
            }
            resolve(result);
        });
    });
}
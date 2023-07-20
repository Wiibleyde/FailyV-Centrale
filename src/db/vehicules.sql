CREATE TABLE `vehicule` (`id` INT(255) NOT NULL AUTO_INCREMENT PRIMARY KEY, `name` VARCHAR(255) NOT NULL, `plate` VARCHAR(8) NOT NULL, `ct` TIMESTAMP NOT NULL, `state` INT(1) NOT NULL DEFAULT 0, `type` VARCHAR(255) NOT NULL, `messageID` TEXT NOT NULL);
ALTER TABLE `vehicule` ADD `type_order` INT(1) NOT NULL DEFAULT 5 AFTER `type`;
UPDATE `vehicule` SET `type_order`='0' WHERE `type`='ambulance';
UPDATE `vehicule` SET `type_order`='1' WHERE `type`='romero';
UPDATE `vehicule` SET `type_order`='2' WHERE `type`='firetruk';
UPDATE `vehicule` SET `type_order`='3' WHERE `type`='fbi2';
UPDATE `vehicule` SET `type_order`='4' WHERE `type`='polmav';
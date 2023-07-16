CREATE TABLE RADIOS IF NOT EXISTS (
    lsms VARCHAR(5),
    bcms VARCHAR(5),
    fdo VARCHAR(5),
    bcmsgen VARCHAR(5),
    event VARCHAR(5),
    eventgen VARCHAR(5)
);


CREATE TABLE test.DOCTOR_RANK (
	id varchar(50) NOT NULL,
	name varchar(50) NOT NULL,
	CONSTRAINT RANK_PK PRIMARY KEY (id)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

ALTER TABLE test.DOCTOR_RANK ADD parent_channel_id varchar(20) NOT NULL;

ALTER TABLE test.DOCTOR_RANK ADD role_id varchar(20) NOT NULL;


CREATE TABLE test.DOCTOR (
	id INT auto_increment NOT NULL,
	discord_id varchar(18) NOT NULL,
	first_name varchar(50) NOT NULL,
	last_name varchar(50) NOT NULL,
	phone_number varchar(8) NOT NULL,
	rank_id varchar(50) NOT NULL,
	CONSTRAINT DOCTOR_PK PRIMARY KEY (id),
	CONSTRAINT DOCTOR_FK FOREIGN KEY (rank_id) REFERENCES test.`RANK`(id)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

ALTER TABLE test.DOCTOR ADD channel_id varchar(20) NOT NULL;

ALTER TABLE test.DOCTOR ADD arrival_date DATE NOT NULL;

ALTER TABLE test.DOCTOR ADD departure_date DATE DEFAULT NULL NULL;


CREATE TABLE test.DOCTOR_CARD_CATEGORY (
	id varchar(50) NOT NULL,
	name varchar(100) NOT NULL,
	CONSTRAINT DOCTOR_CARD_CATEGORY_PK PRIMARY KEY (id)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

ALTER TABLE test.DOCTOR_CARD_CATEGORY ADD `position` INT NOT NULL;

ALTER TABLE test.DOCTOR_CARD_CATEGORY ADD color varchar(7) DEFAULT '#000000' NOT NULL;

CREATE TABLE test.DOCTOR_CARD (
	position_in_category INT NOT NULL,
	category varchar(50) NOT NULL,
	item varchar(100) NOT NULL,
	CONSTRAINT DOCTOR_CARD_FK FOREIGN KEY (category) REFERENCES test.DOCTOR_CARD_CATEGORY(id)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

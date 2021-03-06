DROP DATABASE IF EXISTS pcbv;
CREATE DATABASE pcbv;
USE pcbv;

CREATE TABLE Circuits (
	CircuitID VARCHAR(36),
	Name VARCHAR(255),

	PRIMARY KEY (CircuitID)
);

CREATE TABLE SubCircuits (
	SubCircuitID INT NOT NULL AUTO_INCREMENT,
	ParentCircuitID VARCHAR(36),
	RectX INT,
	RectY INT,
	RectWidth INT,
	RectHeight INT,
	IsRoot BOOLEAN,
	Image LONGBLOB,
	IsFront BOOLEAN,
	ImageType VARCHAR(4),
	ImageRotation INT,

	FOREIGN KEY (ParentCircuitID)
		REFERENCES Circuits(CircuitID)
		ON DELETE CASCADE,
	PRIMARY KEY (SubCircuitID)
);

CREATE TABLE Categories (
	CategoryID INT NOT NULL AUTO_INCREMENT,
	CircuitID VARCHAR(36),
	Name VARCHAR(255),
	RgbColor VARCHAR(8),

	FOREIGN KEY (CircuitID)
		REFERENCES Circuits(CircuitID)
		ON DELETE CASCADE,
	PRIMARY KEY (CategoryID)
);

CREATE TABLE Components (
	ComponentID INT NOT NULL AUTO_INCREMENT,
	SubCircuitID INT,
	RectX INT,
	RectY INT,
	RectWidth INT,
	RectHeight INT,
	Name VARCHAR(255),
	Designator VARCHAR(255),
	Description VARCHAR(1023),
	DocumentationUrl VARCHAR(1023),
	CategoryID INT,
	
	FOREIGN KEY (SubCircuitID)
		REFERENCES SubCircuits(SubCircuitID)
		ON DELETE CASCADE,
	FOREIGN KEY (CategoryID)
		REFERENCES Categories(CategoryID)
		ON DELETE CASCADE,
	PRIMARY KEY (ComponentID)
);

CREATE TABLE CategoryTags (
	CategoryTagID INT NOT NULL AUTO_INCREMENT,
	CategoryID INT,
	TagContent VARCHAR(255),
	TagType INT,

	FOREIGN KEY (CategoryID)
		REFERENCES Categories(CategoryID)
		ON DELETE CASCADE,
	PRIMARY KEY (CategoryTagID)
);

CREATE TABLE PcbvPhrases (
	PhraseID INT NOT NULL AUTO_INCREMENT,
	Phrase VARCHAR(255),

	PRIMARY KEY (PhraseID)
);
INSERT INTO PcbvPhrases
(Phrase)
VALUES
("printed circuit board viewer"),
("PCB circuit board viewer"),
("pacific coast beach view"),
("personnel carrying boatlike vehicle"),
("paper cutout button vortex"),
("personal carpet buying voucher"),
("person chucking brazen vaccine"),
("powerful complex bullet vacuum"),
("peaceful cargo box vault"),
("putrid commonly bought vodka"),
("PHP controlled bad variable"),
("proletariat celebrated Bolshevik victory"),
("painful cardboard box vessel")
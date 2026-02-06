-- =========================
-- Animal Adoption Portal DB
-- Database: animal_data
-- Tables: users, animals, animal_images
-- (animals.image_url stays as the COVER image for minimal frontend change)
-- =========================

CREATE DATABASE IF NOT EXISTS animal_data
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE animal_data;

-- users table (for admin login)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user','admin') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Drop child table first
DROP TABLE IF EXISTS animal_images;
DROP TABLE IF EXISTS animals;

-- animals table (cover image in image_url)
CREATE TABLE animals (
  animal_id INT AUTO_INCREMENT PRIMARY KEY,

  name VARCHAR(60) NOT NULL,
  species VARCHAR(30) NOT NULL,
  breed   VARCHAR(60) NOT NULL,

  gender ENUM('Male','Female','Unknown') NOT NULL DEFAULT 'Unknown',
  age_months INT NOT NULL,
  temperament TEXT NOT NULL,
  status ENUM('Available','Reserved','Adopted') NOT NULL DEFAULT 'Available',

  image_url VARCHAR(255) NOT NULL,  -- cover image

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CHECK (age_months >= 0)
) ENGINE=InnoDB;

CREATE INDEX idx_animals_species ON animals(species);
CREATE INDEX idx_animals_breed   ON animals(breed);
CREATE INDEX idx_animals_status  ON animals(status);

-- extra images table (1 animal -> many images)
CREATE TABLE animal_images (
  image_id INT AUTO_INCREMENT PRIMARY KEY,
  animal_id INT NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_animal_images_animal
    FOREIGN KEY (animal_id) REFERENCES animals(animal_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_animal_images_animal_id ON animal_images(animal_id);
CREATE UNIQUE INDEX uq_animal_images_animal_sort ON animal_images(animal_id, sort_order);

-- Seed animals
INSERT INTO animals
(name, species, breed, gender, age_months, temperament, status, image_url)
VALUES
('Ellie',    'Dog',    'Golden Retriever', 'Female', 22, 'Friendly, gentle, loves belly rubs.',           'Available', '/images/ellie.jpg'),
('Max',      'Dog',    'Beagle',           'Male',   18, 'Curious, playful, very food-motivated.',        'Reserved',  '/images/max.jpg'),
('Coco',     'Dog',    'Poodle',           'Female', 14, 'Smart, calm, learns tricks quickly.',           'Available', '/images/coco.jpg'),
('Rusty',    'Dog',    'Beagle',           'Male',   26, 'Energetic, loves running, very social.',        'Available', '/images/rusty.jpg'),
('Bella',    'Cat',    'Siamese',          'Female', 16, 'Chatty, affectionate, follows you around.',     'Available', '/images/bella.jpg'),
('Simba',    'Cat',    'Maine Coon',       'Male',   20, 'Confident, fluffy, enjoys attention.',          'Reserved',  '/images/simba.jpg'),
('Milo',     'Cat',    'Siamese',          'Male',   12, 'Playful, curious, likes sunbathing.',           'Adopted',   '/images/milo.jpg'),
('Nala',     'Cat',    'Maine Coon',       'Female', 24, 'Gentle, calm, prefers quiet corners.',          'Available', '/images/nala.jpg'),
('Thumper',  'Rabbit', 'Mini Rex',         'Male',   10, 'Gentle, curious, likes quiet spaces.',          'Available', '/images/thumper.jpg'),
('Snowball', 'Rabbit', 'Lionhead',         'Female', 12, 'Shy at first, warms up with treats.',           'Reserved',  '/images/snowball.jpg'),
('Oreo',     'Rabbit', 'Lionhead',         'Male',   14, 'Active, alert, enjoys exploring.',              'Available', '/images/oreo.jpg'),
('Bunny',    'Rabbit', 'Mini Rex',         'Female', 9,  'Sweet, calm, enjoys being handled gently.',     'Adopted',   '/images/bunny.jpg');

-- 1 image row for each animal
INSERT INTO animal_images (animal_id, image_url, sort_order)
SELECT animal_id, image_url, 0 FROM animals;

-- Demo: Ellie has 3 images (duplicates) so you immediately see 3 thumbnails on detail page
INSERT INTO animal_images (animal_id, image_url, sort_order)
SELECT animal_id, image_url, 1 FROM animals WHERE animal_id = 1;
INSERT INTO animal_images (animal_id, image_url, sort_order)
SELECT animal_id, image_url, 2 FROM animals WHERE animal_id = 1;

CREATE DATABASE  IF NOT EXISTS `animal_data` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `animal_data`;
-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: localhost    Database: animal_data
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `animal_images`
--

DROP TABLE IF EXISTS `animal_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `animal_images` (
  `image_id` int NOT NULL AUTO_INCREMENT,
  `animal_id` int NOT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`image_id`),
  UNIQUE KEY `uq_animal_images_animal_sort` (`animal_id`,`sort_order`),
  KEY `idx_animal_images_animal_id` (`animal_id`),
  CONSTRAINT `fk_animal_images_animal` FOREIGN KEY (`animal_id`) REFERENCES `animals` (`animal_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `animal_images`
--

LOCK TABLES `animal_images` WRITE;
/*!40000 ALTER TABLE `animal_images` DISABLE KEYS */;
INSERT INTO `animal_images` VALUES (1,1,'/images/ellie.jpg',0,'2026-02-07 15:36:31'),(2,2,'/images/max.jpg',0,'2026-02-07 15:36:31'),(3,3,'/images/coco.jpg',0,'2026-02-07 15:36:31'),(4,4,'/images/rusty.jpg',0,'2026-02-07 15:36:31'),(5,5,'/images/bella.jpg',0,'2026-02-07 15:36:31'),(6,6,'/images/simba.jpg',0,'2026-02-07 15:36:31'),(7,7,'/images/milo.jpg',0,'2026-02-07 15:36:31'),(8,8,'/images/nala.jpg',0,'2026-02-07 15:36:31'),(9,9,'/images/thumper.jpg',0,'2026-02-07 15:36:31'),(10,10,'/images/snowball.jpg',0,'2026-02-07 15:36:31'),(11,11,'/images/oreo.jpg',0,'2026-02-07 15:36:31'),(12,12,'/images/bunny.jpg',0,'2026-02-07 15:36:31'),(16,1,'/images/Ellie1.jpg',1,'2026-02-07 15:36:31'),(17,1,'/images/Ellie2.jpg',2,'2026-02-07 15:36:31'),(18,2,'/images/Max1.jpg',1,'2026-02-07 15:36:31'),(19,2,'/images/Max2.jpg',2,'2026-02-07 15:36:31'),(20,3,'/images/Coco1.jpg',1,'2026-02-07 15:36:31'),(21,3,'/images/Coco2.jpg',2,'2026-02-07 15:36:31'),(22,4,'/images/Rusty1.jpg',1,'2026-02-07 15:36:31'),(23,4,'/images/Rusty2.jpg',2,'2026-02-07 15:36:31'),(24,5,'/images/Bella1.jpg',1,'2026-02-07 15:36:31'),(25,5,'/images/Bella2.jpg',2,'2026-02-07 15:36:31'),(26,6,'/images/Simba1.jpg',1,'2026-02-07 15:36:31'),(27,6,'/images/Simba2.jpg',2,'2026-02-07 15:36:31'),(28,7,'/images/Milo1.jpg',1,'2026-02-07 15:36:31'),(29,7,'/images/Milo2.jpg',2,'2026-02-07 15:36:31'),(30,8,'/images/Nala1.jpg',1,'2026-02-07 15:36:31'),(31,8,'/images/Nala2.jpg',2,'2026-02-07 15:36:31'),(32,9,'/images/Thumper1.jpg',1,'2026-02-07 15:36:31'),(33,9,'/images/Thumper2.jpg',2,'2026-02-07 15:36:31'),(34,10,'/images/Snowball1.jpg',1,'2026-02-07 15:36:31'),(35,10,'/images/Snowball2.jpg',2,'2026-02-07 15:36:31'),(36,11,'/images/Oreo1.jpg',1,'2026-02-07 15:36:31'),(37,11,'/images/Oreo2.jpg',2,'2026-02-07 15:36:31'),(38,12,'/images/Bunny1.jpg',1,'2026-02-07 15:36:31'),(39,12,'/images/Bunny2.jpg',2,'2026-02-07 15:36:31');
/*!40000 ALTER TABLE `animal_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `animals`
--

DROP TABLE IF EXISTS `animals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `animals` (
  `animal_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `species` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `breed` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gender` enum('Male','Female','Unknown') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Unknown',
  `age_months` int NOT NULL,
  `temperament` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('Available','Reserved','Adopted') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Available',
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`animal_id`),
  KEY `idx_animals_species` (`species`),
  KEY `idx_animals_breed` (`breed`),
  KEY `idx_animals_status` (`status`),
  CONSTRAINT `animals_chk_1` CHECK ((`age_months` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `animals`
--

LOCK TABLES `animals` WRITE;
/*!40000 ALTER TABLE `animals` DISABLE KEYS */;
INSERT INTO `animals` VALUES (1,'Ellie','Dog','Golden Retriever','Female',22,'Friendly, gentle, loves belly rubs.','Available','/images/ellie.jpg','2026-02-07 15:36:31','2026-02-07 15:36:31'),(2,'Max','Dog','Beagle','Male',18,'Curious, playful, very food-motivated.','Reserved','/images/max.jpg','2026-02-07 15:36:31','2026-02-07 15:36:31'),(3,'Coco','Dog','Poodle','Female',14,'Smart, calm, learns tricks quickly.','Available','/images/coco.jpg','2026-02-07 15:36:31','2026-02-07 15:36:31'),(4,'Rusty','Dog','Beagle','Male',26,'Energetic, loves running, very social.','Available','/images/rusty.jpg','2026-02-07 15:36:31','2026-02-07 15:36:31'),(5,'Bella','Cat','Siamese','Female',16,'Chatty, affectionate, follows you around.','Available','/images/bella.jpg','2026-02-07 15:36:31','2026-02-07 15:36:31'),(6,'Simba','Cat','Maine Coon','Male',20,'Confident, fluffy, enjoys attention.','Reserved','/images/simba.jpg','2026-02-07 15:36:31','2026-02-07 15:36:31'),(7,'Milo','Cat','Siamese','Male',12,'Playful, curious, likes sunbathing.','Adopted','/images/milo.jpg','2026-02-07 15:36:31','2026-02-07 15:36:31'),(8,'Nala','Cat','Maine Coon','Female',24,'Gentle, calm, prefers quiet corners.','Available','/images/nala.jpg','2026-02-07 15:36:31','2026-02-07 15:36:31'),(9,'Thumper','Rabbit','Mini Rex','Male',10,'Gentle, curious, likes quiet spaces.','Available','/images/thumper.jpg','2026-02-07 15:36:31','2026-02-07 15:36:31'),(10,'Snowball','Rabbit','Lionhead','Female',12,'Shy at first, warms up with treats.','Reserved','/images/snowball.jpg','2026-02-07 15:36:31','2026-02-07 15:36:31'),(11,'Oreo','Rabbit','Lionhead','Male',14,'Active, alert, enjoys exploring.','Available','/images/oreo.jpg','2026-02-07 15:36:31','2026-02-07 15:36:31'),(12,'Bunny','Rabbit','Mini Rex','Female',9,'Sweet, calm, enjoys being handled gently.','Adopted','/images/bunny.jpg','2026-02-07 15:36:31','2026-02-07 15:36:31');
/*!40000 ALTER TABLE `animals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('39V7h95SyHLqP_vqyi4pKUYRnm3E3U0Z',1770813736,'{\"cookie\":{\"originalMaxAge\":604800000,\"expires\":\"2026-02-11T10:14:38.285Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"user\":{\"id\":1,\"name\":\"Bhone Min Thant\",\"email\":\"bmt7505@gmail.com\",\"role\":\"admin\"}}'),('VaC9sHM3K0BPDIGCg1HgwWt23CArO_K3',1770814528,'{\"cookie\":{\"originalMaxAge\":604800000,\"expires\":\"2026-02-11T12:52:00.308Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"user\":{\"id\":5,\"name\":\"Admin\",\"email\":\"admin@test.com\",\"role\":\"admin\"}}'),('mgDCxcPAvB8ICWt1lVvkIVqJ3ADth2kj',1770960121,'{\"cookie\":{\"originalMaxAge\":604800000,\"expires\":\"2026-02-11T14:58:30.112Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"user\":{\"id\":1,\"name\":\"Bhone Min Thant\",\"email\":\"bmt7505@gmail.com\",\"role\":\"admin\"}}');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('user','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Bhone Min Thant','bmt7505@gmail.com','$2b$12$6a78sBeTlQBwUMuBWWkESe7eCkc3PPIJMilLKUbCbuYj4GHpjWeta','admin','2026-02-02 09:48:35'),(2,'Tommy','Tommy@gmail.com','$2b$12$xcw6tfETNvwhNrZJM0qH4.Zsa1AXnyUcJLeEgdC6AH7Naz82nW8Fi','user','2026-02-02 14:55:14'),(3,'Myint','myintzaw34@gmail.com','$2b$12$pd2dghzma6qUIiOamqiJkeW.ZZa.ZXKpGNdbGkSrNkK5Wh1cdgxiW','user','2026-02-04 04:17:27'),(4,'brayden','brayden210390@gmail.com','$2b$12$pPrPmZVyZvh1ZkGrBhpjNOIndW1cRboGw/fHFR2oBeCMithBR0b22','admin','2026-02-04 04:48:40'),(5,'Admin','admin@test.com','$2b$12$qyzw0iSjaWNCYb0pSvuCSern9z5o.jJmHs1cQ.Bh3.iQxbuDK254q','admin','2026-02-04 12:52:00'),(6,'thiha','test@gmail.com','$2b$12$u05MewiJHZHuw7Qo0VqJTu1Ht81BQF83sW6hMX6sPqKKpHuO.dm06','user','2026-02-07 02:25:48'),(7,'test','test@user.com','$2b$12$LCzKUi4aNrkV1yzxl2vpPeC3oyDczC1HjjoSPKZjYfY/ls9dEHe9S','user','2026-02-07 04:45:38');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-07 23:47:41

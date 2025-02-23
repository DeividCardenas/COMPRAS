CREATE DATABASE  IF NOT EXISTS `pec` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `pec`;
-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: pec
-- ------------------------------------------------------
-- Server version	8.0.40

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
-- Table structure for table `empresaonlaboratorio`
--

DROP TABLE IF EXISTS `empresaonlaboratorio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `empresaonlaboratorio` (
  `empresa_id` int NOT NULL,
  `laboratorio_id` int NOT NULL,
  `fecha_creacion` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `fecha_actualizacion` datetime(3) NOT NULL,
  PRIMARY KEY (`empresa_id`,`laboratorio_id`),
  KEY `EmpresaOnLaboratorio_laboratorio_id_fkey` (`laboratorio_id`),
  CONSTRAINT `EmpresaOnLaboratorio_empresa_id_fkey` FOREIGN KEY (`empresa_id`) REFERENCES `empresa` (`id_empresa`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `EmpresaOnLaboratorio_laboratorio_id_fkey` FOREIGN KEY (`laboratorio_id`) REFERENCES `laboratorio` (`id_laboratorio`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `empresaonlaboratorio`
--

LOCK TABLES `empresaonlaboratorio` WRITE;
/*!40000 ALTER TABLE `empresaonlaboratorio` DISABLE KEYS */;
INSERT INTO `empresaonlaboratorio` VALUES (1,1,'2025-02-20 16:05:23.297','2025-02-20 16:05:23.297'),(1,2,'2025-02-20 16:05:23.297','2025-02-20 16:05:23.297'),(1,3,'2025-02-20 16:05:23.297','2025-02-20 16:05:23.297'),(1,4,'2025-02-20 16:05:23.297','2025-02-20 16:05:23.297'),(1,5,'2025-02-20 16:05:23.297','2025-02-20 16:05:23.297'),(1,6,'2025-02-20 16:05:23.297','2025-02-20 16:05:23.297'),(1,7,'2025-02-20 16:05:23.297','2025-02-20 16:05:23.297'),(1,8,'2025-02-20 16:05:23.297','2025-02-20 16:05:23.297'),(1,9,'2025-02-20 16:05:23.297','2025-02-20 16:05:23.297');
/*!40000 ALTER TABLE `empresaonlaboratorio` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-23 16:41:12

GRANT ALL PRIVILEGES ON mgt_system_db.* TO 'user1'@'%';
FLUSH PRIVILEGES;

CREATE DATABASE IF NOT EXISTS mgt_system_db;
USE mgt_system_db;
-- =============================================
-- VexCenter — PELNY SCHEMAT BAZY DANYCH
-- =============================================

-- =============================================
-- UZYTKOWNICY
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  avatar LONGTEXT DEFAULT NULL,
  role ENUM('user','developer','admin') NOT NULL DEFAULT 'user',
  status_message VARCHAR(200) DEFAULT NULL,
  display_name VARCHAR(100) DEFAULT NULL,
  bio TEXT DEFAULT NULL,
  website VARCHAR(500) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- GRY
-- =============================================
CREATE TABLE IF NOT EXISTS games (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  thumbnail VARCHAR(500) DEFAULT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  category VARCHAR(100) DEFAULT NULL,
  tags VARCHAR(500) DEFAULT NULL,
  rating DECIMAL(2,1) DEFAULT NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  game_file VARCHAR(500) DEFAULT NULL,
  download_count INT UNSIGNED NOT NULL DEFAULT 0,
  play_count INT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_games_status (status),
  INDEX idx_games_featured (is_featured),
  INDEX idx_games_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- LINKI DO POBRANIA GIER
-- =============================================
CREATE TABLE IF NOT EXISTS game_downloads (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  game_id INT UNSIGNED NOT NULL,
  url VARCHAR(1000) NOT NULL,
  platform VARCHAR(50) NOT NULL DEFAULT 'windows',
  version VARCHAR(50) DEFAULT NULL,
  filesize BIGINT UNSIGNED DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  INDEX idx_downloads_game (game_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- ZDJECIA GIER (screenshoty)
-- =============================================
CREATE TABLE IF NOT EXISTS game_screenshots (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  game_id INT UNSIGNED NOT NULL,
  url VARCHAR(500) NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  INDEX idx_screenshots_game (game_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- ZAKUPY / BIBLIOTEKA
-- =============================================
CREATE TABLE IF NOT EXISTS purchases (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  game_id INT UNSIGNED NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  UNIQUE KEY uk_purchase (user_id, game_id),
  INDEX idx_purchases_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- INSTALACJE GIER U UZYTKOWNIKA
-- =============================================
CREATE TABLE IF NOT EXISTS game_installations (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  game_id INT UNSIGNED NOT NULL,
  install_path VARCHAR(1000) NOT NULL,
  executable_path VARCHAR(1000) DEFAULT NULL,
  installed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_played_at DATETIME DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  UNIQUE KEY uk_install (user_id, game_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- OPINIE
-- =============================================
CREATE TABLE IF NOT EXISTS reviews (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  game_id INT UNSIGNED NOT NULL,
  rating TINYINT UNSIGNED NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  UNIQUE KEY uk_review (user_id, game_id),
  INDEX idx_reviews_game (game_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- ZNAJOMI
-- =============================================
CREATE TABLE IF NOT EXISTS friends (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  friend_id INT UNSIGNED NOT NULL,
  status ENUM('pending','accepted','blocked') NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_friendship (user_id, friend_id),
  INDEX idx_friends_user (user_id),
  INDEX idx_friends_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- APLIKACJE DEVELOPERSKIE
-- =============================================
CREATE TABLE IF NOT EXISTS developer_applications (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  studio_name VARCHAR(200) DEFAULT NULL,
  website VARCHAR(500) DEFAULT NULL,
  reason TEXT NOT NULL,
  experience TEXT DEFAULT NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  admin_note TEXT DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_devapps_status (status),
  INDEX idx_devapps_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- POWIADOMIENIA
-- =============================================
CREATE TABLE IF NOT EXISTS notifications (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  link VARCHAR(500) DEFAULT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notif_user (user_id),
  INDEX idx_notif_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- KATEGORIE
-- =============================================
CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- DANE POCZATKOWE
-- =============================================
INSERT INTO categories (name, slug, icon) VALUES
  ('Akcja', 'akcja', 'action'),
  ('Przygodowe', 'przygodowe', 'adventure'),
  ('RPG', 'rpg', 'rpg'),
  ('Strategie', 'strategie', 'strategy'),
  ('Symulacje', 'symulacje', 'simulation'),
  ('Sportowe', 'sportowe', 'sports'),
  ('Wyscigi', 'wyscigi', 'racing'),
  ('Horror', 'horror', 'horror'),
  ('Logiczne', 'logiczne', 'puzzle'),
  ('Indie', 'indie', 'indie');

-- =============================================
-- OGLOSZENIA
-- =============================================
CREATE TABLE IF NOT EXISTS announcements (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  type ENUM('info','warning','update','maintenance') NOT NULL DEFAULT 'info',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_announcements_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- KOMENTARZE POD OPINIAMI
-- =============================================
CREATE TABLE IF NOT EXISTS review_comments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  review_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_review_comments_review (review_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- WIADOMOSCI (czat)
-- =============================================
CREATE TABLE IF NOT EXISTS messages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sender_id INT UNSIGNED NOT NULL,
  receiver_id INT UNSIGNED NOT NULL,
  content TEXT NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_messages_conversation (sender_id, receiver_id),
  INDEX idx_messages_read (receiver_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Admin: admin@vexcenter.pl / admin123
INSERT IGNORE INTO users (id, username, email, password, role) VALUES
  (1, 'Admin', 'admin@vexcenter.pl', '$2y$10$DrYXpZuPU0NqvzSy1qPh2.pcZTZVvSfjiLpEsTNgvEGmbV0EOe6Ay', 'admin');

INSERT IGNORE INTO announcements (title, content, type) VALUES
  ('Witaj w VexCenter!', 'Platforma jest w fazie rozwoju. Już wkrótce pojawią się nowe funkcje!', 'info');

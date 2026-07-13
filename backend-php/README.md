# VexCenter Backend (PHP + MySQL)

Backend API dla platformy VexCenter, hostowany na **InfinityFree**.

## Wdrożenie na InfinityFree

### 1. Załóż konto na InfinityFree
- Wejdź na https://infinityfree.net
- Załóż darmowe konto
- Dodaj domenę (lub użyj darmowej `vexcenter.infinityfreeapp.com`)

### 2. Stwórz bazę MySQL
- W panelu InfinityFree → **MySQL Databases**
- Stwórz nową bazę (np. `if0_XXXXX_vexcenter`)
- Zapisz: host, nazwę bazy, użytkownika i hasło

### 3. Importuj schemat bazy
- W panelu → **phpMyAdmin**
- Wybierz swoją bazę → zakładka **SQL**
- Wklej zawartość pliku `database/schema.sql` i wykonaj

### 4. Skonfiguruj połączenie
Edytuj plik `config/database.php`:
```php
define('DB_HOST', 'sqlXXX.infinityfree.com');  // host z panelu
define('DB_NAME', 'if0_XXXXX_vexcenter');      // nazwa bazy
define('DB_USER', 'if0_XXXXX');                // użytkownik
define('DB_PASS', 'twoje_haslo');              // hasło
define('JWT_SECRET', 'wygeneruj_własny_secret'); // zmień!
```

### 5. Wgraj pliki na hosting
- Połącz przez FTP (dane w panelu InfinityFree → FTP)
- Wgraj całą zawartość `backend-php/` do katalogu `htdocs/`

### 6. Gotowe!
API będzie dostępne pod adresem:
```
https://vexcenter.infinityfreeapp.com/api/
```

## Testowanie API

```bash
# Rejestracja
curl -X POST https://vexcenter.infinityfreeapp.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.pl","password":"test123"}'

# Logowanie
curl -X POST https://vexcenter.infinityfreeapp.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.pl","password":"test123"}'

# Lista gier
curl https://vexcenter.infinityfreeapp.com/api/games

# Profil (z tokenem)
curl https://vexcenter.infinityfreeapp.com/api/user/profile \
  -H "Authorization: Bearer TOKEN"
```

## Struktura endpointów

| Metoda | Endpoint | Auth | Opis |
|--------|----------|------|------|
| POST | `/api/auth/register` | - | Rejestracja |
| POST | `/api/auth/login` | - | Logowanie |
| POST | `/api/auth/logout` | - | Wylogowanie |
| GET | `/api/games` | - | Lista gier |
| GET | `/api/games/:id` | - | Szczegóły gry |
| POST | `/api/games` | user | Dodanie gry |
| GET | `/api/games/search?q=` | - | Szukanie gier |
| GET | `/api/user/profile` | user | Profil |
| PUT | `/api/user/profile` | user | Edycja profilu |
| GET | `/api/user/library` | user | Biblioteka |
| POST | `/api/store/purchase` | user | Zakup gry |
| GET | `/api/admin/games` | admin | Gry oczekujące |
| PUT | `/api/admin/games/:id/approve` | admin | Zatwierdź grę |
| PUT | `/api/admin/games/:id/reject` | admin | Odrzuć grę |

# Wdrozenie na InfinityFree

## 1. Baza danych (phpMyAdmin)
1. Zaloguj sie do panelu InfinityFree → MySQL Databases
2. Przy bazie `if0_41873473_vexcenter` kliknij phpMyAdmin
3. Wklej cala zawartosc pliku `database/schema.sql` i wykonaj

## 2. Wgranie plikow (FTP)
Dane FTP z panelu InfinityFree:
- Host: ftp.infinityfree.com (lub ftp.vexcenter.xo.je)
- User: if0_41873473
- Pass: (haslo z panelu)
- Katalog: htdocs/

### Wgraj:
```
calosc z folderu backend-php/ → htdocs/
```

## 3. Test API
- https://vexcenter.xo.je/api/games
- https://vexcenter.xo.je/api/auth/login

## 4. Aplikacja Electron
W pliku `src/assets/js/api/api.js` URL jest juz ustawiony:
```js
this.baseURL = 'https://vexcenter.xo.je/api';
```

W `main.js`:
```js
const API_BASE_URL = 'https://vexcenter.xo.je/api';
```

Uruchom lokalnie:
```bash
cd VexCenter
npm start
```

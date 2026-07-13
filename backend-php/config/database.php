<?php
define('DB_HOST', getenv('DB_HOST') ?: 'sql305.infinityfree.com');
define('DB_NAME', getenv('DB_NAME') ?: 'if0_41873473_vexcenter');
define('DB_USER', getenv('DB_USER') ?: 'if0_41873473');
define('DB_PASS', getenv('DB_PASS') ?: '121koko9a');
define('DB_CHARSET', 'utf8mb4');

define('JWT_SECRET', getenv('JWT_SECRET') ?: 'v3xc3nt3r_s3cr3t_k3y_2026_8f3a2d1b9c4e7f0a');
define('JWT_EXPIRY', 86400 * 7);

# Forewords

MIT License

Copyright (c) 2019 Judekeyser

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

# Family Calendar

Family Calendar is a small, friendly project, to help my family managing
appointments and tasks. :-)

## Local development

### PHP/MySQL environment

Install recent version of PHP and MySQL.
The best is to follow production configurations.
Create a database with the `EVENT` table.

### Running a local server

To run the local server with PHP-FMP, do
```
php -S localhost:8000
```
or whatever port number you need. (Checkout `php --help` if other moves are required.)

## Ignore Policy

Files and repositories prefixed with `__` are ignored from GIT.

## Configuration secrets

### Regenerate a password

Run the PHP CLI in interactive mode:
```
php -a
```
and regenerate a hash with BCRYPT:
```
echo password_hash("local_secret", PASSWORD_DEFAULT);
```
See also https://www.php.net/manual/en/function.password-hash.php for more configuration about the strength of the algorithm.

### Regenerate a hash

Run the PHP CLI in interactive mode:
```
php -a
```
and regenerate a hash:
```
echo base64_encode(random_bytes(64));
```
See also https://www.php.net/manual/en/function.random-bytes.php .

### Security concerns

You should update the local `configs.php` file with relevant information.
The remote version is not pushed on the repository.

### Security headers

The application is making use of Security Headers, to prevent some attack vectors.
Those headers are not handled by the applicative part, but through a `.htaccess` file
on the server itself.

Below we describe the comprehensive list of policies:
```
Header set Content-Security-Policy "default-src 'none'; connect-src 'self'; font-src https://fonts.gstatic.com;img-src 'none'; object-src 'none'; script-src 'self'; style-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'none'"
Header set X-Frame-Options "none"
Header set Referrer-Policy "no-referrer"
Header set Feature-Policy "camera 'none'; fullscreen 'self'; geolocation 'none'; microphone 'none'"
Header set X-Permitted-Cross-Domain-Policies "none"
Header set X-XSS-Protection "1; mode=block"
Header set X-Content-Type-Options "nosniff"
Header set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
```

## Database setup

### Event table

The `EVENT` table contains the store of the application.

The scheme to create the table is
```
CREATE TABLE EVENT (
    _nbr_send_event INT(10) NOT NULL,
    _data VARCHAR(2045)
)
```

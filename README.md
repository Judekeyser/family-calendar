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

## Local configuration

### PHP/MySQL environment

Install recent version of PHP and MySQL. The better is to follow production configurations.

### Security concerns

You should update the local `configs.php` file with relevant information.
The remote version is not pushed on the repository.

### Database setup

The scheme to create the table is
```
CREATE TABLE EVENT (
    _nbr_send_event INT(10) NOT NULL,
    _data VARCHAR(2047)
)
```

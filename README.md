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

### Python environment

Create a Python environment and install the dependencies from the `requirements.txt` file.

You should use Python 3.9.

### Security concerns

Then you'll need the following environment variables to be setup, if you want to run the server with `python flask_app.py`:
```
DATABASE_URL=url to postgresql database
MUTE_SECURITY=1 to turn security off in development
AUTHENTICATION_KEY_SECRET=use the utility secure_bridge.py to generate the followings
ENCRYPTION_KEY_SECRET=
HASH_KEY_SECRET=
PASSWORD=
```
Your system will need to be able to connect a postgre sql server. On Windows, this may require the setting up of
```
SET PATH=%PATH%;C:\Program Files\PostgreSQL\14\bin
```

for Linux platform, you can also run the application with the Heroku service `heroku local web` (which will then use the GUnicorn server),
in which case the Heroku variables will be used instead.

### Database setup

Make sure you run the `db_bridge.py` script to set up the database.

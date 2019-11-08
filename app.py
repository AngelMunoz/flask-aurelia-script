"""
This script runs the Flaskor application using a development server.
"""

from os import environ
from FlaskAuScript import app

if __name__ == '__main__':
    HOST = environ.get('SERVER_HOST', 'localhost')
    DEBUG = environ.get('FLASK_ENV', 'development')
    try:
        PORT = int(environ.get('SERVER_PORT', '5555'))
    except ValueError:
        PORT = 5555
    app.run(HOST, PORT)

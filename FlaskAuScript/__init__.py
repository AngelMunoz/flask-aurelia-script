"""
The flask application package.
"""
from datetime import datetime
from flask import Flask
app = Flask(__name__)

import FlaskAuScript.views  # nopep8


@app.context_processor
def inject_context():
    return dict(debug=app.debug,
                year=datetime.now().year)

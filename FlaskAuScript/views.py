"""
Routes and views for the flask application.
"""

from datetime import datetime
from flask import render_template, request, jsonify
from FlaskAuScript import app


@app.route('/')
@app.route('/home')
def home():
    """Renders the home page."""
    return render_template('index.html',
                           title='Home Page')


@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'GET':
        """Renders the contact page."""
        return render_template('contact.html',
                               title='A Form Example',
                               message='Powered by Aurelia Script and Aurelia Validation')
    data = dict()
    if request.is_json:
        data = dict(**request.json)
        return jsonify(message='Thanks! we have your message now!')
    elif request.form != None:
        data = dict(**request.form)
    print(data)
    return render_template('contact.html',
                           title="I have been Sent thanks!",
                           message="If you have another inquiry you can contact us again",
                           sent=True)


@app.route('/about')
def about():
    """Renders the about page."""
    return render_template('about.html',
                           title='About',
                           message='Your application description page.',
                           prro="AAAAAAA Prro trais el piton")


@app.route('/pictures')
def pictures():
    """Renders the about page."""
    return render_template('pictures.html', title='Pictures')

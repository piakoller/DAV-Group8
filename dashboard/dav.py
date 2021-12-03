import pandas as pd
import json
from flask import Flask, render_template, Markup

app = Flask(__name__)

@app.route("/")
def index():
    svg = open('./static/europe.svg').read()
    return render_template('index.html', svg=Markup(svg))

@app.route('/api/data')
def data():
    # use pandas for loading csv so that entries have the correct type
    data = pd.read_csv('./data/happiness.csv')
    return json.dumps(json.loads(data.to_json(orient='records')))
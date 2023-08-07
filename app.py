from contract import contract_connect, get_data
from flask import Flask, render_template

import traceback

app = Flask(__name__)

@app.route("/")
def index():
	return render_template("index.html");

@app.route("/token-uri/<id>")
def token_uri(id):
	try:
		contract = contract_connect()
		if contract:
			data = get_data(contract, id)
			if data:
				return data
	except:
		traceback.print_exc()
	return "", 404

if __name__ == "__main__":
	app.run(debug = True)

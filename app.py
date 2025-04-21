import os
from flask import Flask, render_template, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from datetime import datetime

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)
# create the app
app = Flask(__name__)
# setup a secret key, required by sessions
app.secret_key = os.environ.get("FLASK_SECRET_KEY") or "a secret key"
# configure the database, relative to the app instance folder
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}
# initialize the app with the extension, flask-sqlalchemy >= 3.0.x
db.init_app(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/scan-history', methods=['POST'])
def save_scan():
    from models import ScanHistory
    data = request.get_json()
    scan = ScanHistory(
        content=data['content'],
        scan_type=data.get('scan_type', 'text')
    )
    db.session.add(scan)
    db.session.commit()
    return jsonify(scan.to_dict()), 201

@app.route('/api/scan-history', methods=['GET'])
def get_scan_history():
    from models import ScanHistory
    scans = ScanHistory.query.order_by(ScanHistory.created_at.desc()).limit(10).all()
    return jsonify([scan.to_dict() for scan in scans])

# Create all database tables
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
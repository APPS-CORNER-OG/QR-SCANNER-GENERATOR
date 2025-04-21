from datetime import datetime
from app import db

class Base(db.Model):
    __abstract__ = True
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# QR Scan History Model
class ScanHistory(Base):
    __tablename__ = 'scan_history'
    content = db.Column(db.String(500), nullable=False)
    scan_type = db.Column(db.String(50), default='text')

    def to_dict(self):
        return {
            'id': self.id,
            'content': self.content,
            'scan_type': self.scan_type,
            'created_at': self.created_at.isoformat()
        }

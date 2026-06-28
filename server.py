import os
import sqlite3
from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

DATABASE = 'grooming_salon.db'

# Функция для подключения к базе данных
def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

# Создание таблицы для заявок
def init_db():
    conn = get_db_connection()
    conn.execute('''CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        service TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')
    conn.close()

# Отправка уведомления в Telegram
def send_telegram_notification(message):
    bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
    chat_id = os.getenv('TELEGRAM_CHAT_ID')
    url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
    payload = {'chat_id': chat_id, 'text': message}
    requests.post(url, data=payload)

@app.route('/api/appointments', methods=['POST'])
def create_appointment():
    data = request.json
    name = data.get('name')
    phone = data.get('phone')
    service = data.get('service')

    if not name or not phone or not service:
        return jsonify({'error': 'Missing data'}), 400

    conn = get_db_connection()
    conn.execute('INSERT INTO appointments (name, phone, service) VALUES (?, ?, ?)', (name, phone, service))
    conn.commit()
    conn.close()

    message = f'Новая запись: {name}, {phone}, {service}'
    send_telegram_notification(message)

    return jsonify({'message': 'Appointment created successfully'}), 201

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
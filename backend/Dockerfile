FROM python:3.11-slim

WORKDIR /app

COPY app.py /app/app.py

# Встановлюємо залежності
RUN pip install --no-cache-dir fastapi uvicorn pyrogram tgcrypto

EXPOSE 9000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "9000"]

# RBG-EConnect
Internal ERP
.\rbg\Scripts\activate
python -m uvicorn Server:app --reload
uvicorn Server:app --host 192.168.123.32 --port 443 --ssl-keyfile=ssl/private.key --ssl-certfile=ssl/certificate.crt --reload

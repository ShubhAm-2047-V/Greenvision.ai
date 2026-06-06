# Agrovision AI Production Deployment Guide

This document describes how to deploy the Agrovision AI system using Docker Containers or direct process managers in a production environment.

## 1. Containerized Deployment (Recommended)

Docker Compose sets up a MySQL database, builds the python Flask backend container (serving via PyMySQL and SQLAlchemy), and builds a multi-stage Nginx-Node container that compiles and hosts the React Vite static app.

### Steps to Deploy:
1. Ensure **Docker** and **Docker Compose** are installed on the target machine.
2. Edit environmental variables in `docker-compose.yml` (specifically, database credentials and JWT security keys).
3. To build and start all containers in detached mode:
   ```bash
   docker-compose up --build -d
   ```
4. Verify running containers:
   ```bash
   docker ps
   ```
5. Access the production system:
   * **Frontend Application**: `http://localhost:80` (or the server's public IP).
   * **Backend API REST**: `http://localhost:5000` (reverse proxied internally through Nginx).
   * **MySQL Database**: `http://localhost:3306` (accessible locally or internally within the docker network).

---

## 2. Standard Manual Production Deployment

### Database (MySQL)
1. Provision a production MySQL server.
2. Import the database schema from `database/schema.sql`:
   ```bash
   mysql -u <username> -p <database_name> < database/schema.sql
   ```

### Backend (Gunicorn / WSGI)
1. Run the backend using a WSGI server like **Gunicorn** or **uWSGI** instead of Flask's built-in development server:
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 backend.run:app
   ```
2. Wrap the service in a process manager like **systemd** or **Supervisor** to ensure it auto-restarts on system reboots:
   ```ini
   # Example supervisor configuration (/etc/supervisor/conf.d/agrovision.conf)
   [program:agrovision_backend]
   command=/workspace/backend/venv/bin/gunicorn -w 4 -b 0.0.0.0:5000 backend.run:app
   directory=/workspace
   autostart=true
   autorestart=true
   stderr_logfile=/var/log/agrovision.err.log
   stdout_logfile=/var/log/agrovision.out.log
   ```

### Frontend (Static Web Hosting)
1. Build the Vite production bundle:
   ```bash
   cd frontend
   npm run build
   ```
2. Copy the resulting `dist/` directory to your web server (e.g. Nginx, Apache, or AWS S3):
   ```bash
   cp -r dist/* /var/share/nginx/html/
   ```
3. Configure the Nginx virtual host block to serve files and proxy API requests:
   ```nginx
   server {
       listen 80;
       server_name agrovision.com;

       location / {
           root /usr/share/nginx/html;
           index index.html index.htm;
           try_files $uri $uri/ /index.html;
       }

       location /api {
           proxy_pass http://127.0.0.1:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

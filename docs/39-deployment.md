# Deployment

Asok is designed to be extremely easy to deploy. The framework focuses on a performance-tuned stack using **Gunicorn**, **Nginx**, and **SystemD**.

## 1. Zero-Config Deployment

The `asok deploy` command automates the generation of a professional production stack.

### Workflow

Run the command in your project root:
```bash
asok deploy
```

Asok will generate a `deployment/` directory containing:
- `gunicorn_conf.py`: Optimized worker settings based on your server's CPU.
- `nginx.conf`: Nginx reverse-proxy with **Gzip compression** and **Security headers**.
- `myapp.service`: SystemD unit file configured with your current `SECRET_KEY`.
- `setup.sh`: A comprehensive installation script for Ubuntu/Debian.

## 2. Build Pipeline (Recommended)

Before deploying, it is highly recommended to generate an optimized distribution of your project using the Asok build engine. This will minify your assets, compile your Python source to bytecode, and optimize your images.

```bash
asok build
```

This command generates a `dist/` folder. You should deploy the **contents** of this folder to your production server instead of your raw source code. See the [Production Build Guide](44-production-build.md) for more details.

## 3. Server Setup (Ubuntu/Debian)

1. **Upload**: Copy your project (including the `deployment/` folder) to your server (e.g., via `scp` or `git clone`).
2. **Execute**: Run the setup script as root:
   ```bash
   sudo ./deployment/setup.sh
   ```

### What the script does:
- Installs `nginx`, `python3-pip`, and `python3-venv`.
- Creates a virtual environment and installs `gunicorn`.
- **Permissions**: Automatically sets correct permissions for the SQLite database and uploads folder so `www-data` (Nginx/Gunicorn) can write to them.
- **SystemD**: Configures and starts your app as a background service.
- **Nginx**: Configures Nginx to proxy traffic and serve static files with 30-day caching.

## 3. Production Hardening

### SSL (HTTPS)
Asok recommends using **Certbot** for free, automated SSL certificates:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Static Asset Hash
To ensure users always see the latest version of your CSS/JS after an update, Asok supports asset hashing. This is enabled automatically in production (`DEBUG=false`).

## 5. RHEL / AlmaLinux (SELinux)

Deploying on RHEL-based systems like **AlmaLinux** or **Rocky Linux** requires handling **SELinux** (Security-Enhanced Linux). If your app fails to write sessions or cache, you will likely see `PermissionError: [Errno 13] Permission denied` in your logs.

### The Problem: init_t vs httpd_sys_rw_content_t
By default, Gunicorn runs in the `init_t` domain. Even if you set your folder to `httpd_sys_rw_content_t`, the system may block the write operations.

### Recommended Solution: SystemD RuntimeDirectory
Instead of fighting with manual SELinux labels, use the **native SystemD way** to handle ephemeral state. This automatically grants correct permissions and SELinux contexts.

1. **Update your `.service` file**:
```ini
[Service]
RuntimeDirectory=asok
RuntimeDirectoryMode=0775
```

2. **Update your `wsgi.py`**:
```python
# Use the auto-generated systemd path
SESSION_DIR = "/run/asok/sessions"
app._session_store = SessionStore(backend="file", path=SESSION_DIR)
```

### Alternative: Custom SELinux Policy
If you must use a directory inside `/var/www`, you can generate a custom policy from the audit logs:
```bash
sudo ausearch -m avc -ts recent | audit2allow -M asok_fix
sudo semodule -i asok_fix.pp
```

---
[← Previous: CLI Reference](38-cli-reference.md) | [Documentation](README.md) | [Next: Testing →](40-testing.md)

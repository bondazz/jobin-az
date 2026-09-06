# Namecheap VPS-ə Deploy (Node.js dəstəyi ilə)

## Əgər Namecheap VPS və ya Cloud Hosting istifadə edirsinizsə

## Addım 1: VPS Hazırlığı

```bash
# SSH ilə VPS-ə qoşulun
ssh root@your-vps-ip

# Node.js quraşdırın (v18+)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 quraşdırın (process manager)
sudo npm install -g pm2

# Nginx quraşdırın (reverse proxy)
sudo apt install nginx
```

## Addım 2: Layihəni Yükləyin

```bash
# Git clone
cd /var/www
git clone https://github.com/USERNAME/jooble-az.git
cd jooble-az

# Dependencies quraşdırın
npm install

# Build edin
npm run build
```

## Addım 3: Environment Variables

```bash
# .env.production faylı yaradın
nano .env.production
```

Əlavə edin:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NODE_ENV=production
PORT=3000
```

## Addım 4: PM2 ilə İşə Salın

```bash
# Start
pm2 start npm --name "jooble" -- start

# Auto-restart on reboot
pm2 startup
pm2 save

# Logs
pm2 logs jooble
```

## Addım 5: Nginx Konfiqurasiyası

```bash
sudo nano /etc/nginx/sites-available/jooble.az
```

Əlavə edin:
```nginx
server {
    listen 80;
    server_name jooble.az www.jooble.az;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Aktivləşdirin:
```bash
sudo ln -s /etc/nginx/sites-available/jooble.az /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Addım 6: SSL (HTTPS)

```bash
# Certbot quraşdırın
sudo apt install certbot python3-certbot-nginx

# SSL sertifikat əldə edin
sudo certbot --nginx -d jooble.az -d www.jooble.az
```

## Addım 7: Firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

## Addım 8: Auto-Deploy (Optional)

GitHub webhook quraşdırın:
```bash
# Deploy script
nano /var/www/jooble-az/deploy.sh
```

```bash
#!/bin/bash
cd /var/www/jooble-az
git pull origin main
npm install
npm run build
pm2 restart jooble
```

```bash
chmod +x deploy.sh
```

---

## 🎯 Yoxlama

1. `https://jooble.az` açın
2. ✅ Bütün funksiyalar işləməlidir
3. ✅ Supabase tam işləyir
4. ✅ Server-side rendering işləyir

## 💰 Qiymət

- Namecheap VPS: ~$10-30/ay
- DigitalOcean Droplet: $6-12/ay
- **Vercel: $0 (pulsuz, unlimited bandwidth)**

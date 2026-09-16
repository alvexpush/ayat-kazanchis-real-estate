# VPS deployment: domain, crypto deposits, and registration email

The application is a Node.js server, not a static HTML site. The VPS must run
`node server.js`; Nginx should proxy the public domain to port 3000.

## 1. Point the Hostinger domain to the VPS

In Hostinger DNS, create these records (replace the example IP):

| Type | Name | Value |
| --- | --- | --- |
| A | `@` | `YOUR_VPS_IPV4` |
| A | `www` | `YOUR_VPS_IPV4` |

Remove conflicting A/AAAA records. DNS can take time to propagate.

## 2. Create the production environment

Copy `.env.example` to `.env` on the VPS and replace every placeholder. The
real `.env` is intentionally ignored by Git.

Required crypto values:

```dotenv
BTC_DEPOSIT_ADDRESS=your_real_bitcoin_address
USDT_DEPOSIT_ADDRESS=your_real_usdt_address
USDT_DEPOSIT_NETWORK=TRON (TRC-20)
```

The network must exactly match the address. Never label a TRC-20 address as
ERC-20 (or the reverse). Test both methods with a small amount before launch.
The admin page also has **Deposit Wallets**, which stores later overrides in
SQLite. Environment variables remain the deployment defaults.

Generate secrets on the VPS:

```bash
openssl rand -base64 48
openssl rand -base64 32
```

Use the first output for `OTP_SECRET` and the second for `ADMIN_PASSWORD`.

## 3. Configure registration email

A domain registration alone does not include an SMTP server or mailbox. Choose
one of these supported delivery options.

### Option A: Resend (simplest for verification messages)

1. Create a Resend account and add `ayatkazanchisrealestate.online` as a domain.
2. Add the DKIM/SPF records shown by Resend in Hostinger DNS and wait until the
   domain is verified.
3. Create a Resend API key.
4. Put these values in the VPS `.env`:

```dotenv
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_real_key
AUTH_FROM_EMAIL=Ayat Kazanchis Real Estate <noreply@ayatkazanchisrealestate.online>
OTP_SECRET=your_generated_secret
APP_URL=https://ayatkazanchisrealestate.online
```

This is not an inbox. Add a Hostinger Email or Zoho Mail mailbox separately if
staff must receive and reply to mail at the domain.

### Option B: Zoho Mail (mailbox plus sending)

Purchase/configure Zoho Mail, add Zoho's MX, SPF and DKIM records in Hostinger,
then follow `ZOHO_RAILWAY_EMAIL_SETUP.md`. Despite its filename, the same
`ZOHO_*` environment values work on a VPS. The application uses Zoho's HTTPS
Mail API, so SMTP ports being blocked by a VPS provider is not a problem.

Do not configure both providers. Remove unused placeholder credentials.

## 4. Run the Node service

Install Node.js 24 or newer, upload/clone the project, then run:

```bash
npm ci
npm run db:check
npm start
```

For a persistent service, create `/etc/systemd/system/ayat-kazanchis.service`:

```ini
[Unit]
Description=Ayat Kazanchis web application
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/ayat-kazanchis
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production
User=www-data
Group=www-data

[Install]
WantedBy=multi-user.target
```

Then enable it:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now ayat-kazanchis
sudo systemctl status ayat-kazanchis
```

Keep `data/platform.sqlite` and the `.env` outside deployment replacement steps
and back up the SQLite database regularly.

## 5. Configure Nginx and HTTPS

Use this server block:

```nginx
server {
    listen 80;
    server_name ayatkazanchisrealestate.online www.ayatkazanchisrealestate.online;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site, test Nginx, and issue TLS certificates:

```bash
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d ayatkazanchisrealestate.online -d www.ayatkazanchisrealestate.online
```

## 6. Production checks

1. Open `/api/health`; email must report `configured: true`.
2. Register using an external address (for example Gmail).
3. Confirm the emailed six-digit code on `register-confirm.html`.
4. Sign out, sign in with the private six-digit login code, and confirm the new
   emailed one-time code on `login-confirm.html`.
5. Start one BTC and one USDT deposit session and verify the address and network.
6. Submit only small test transfers before accepting real deposits.

Never place email keys, admin credentials, or wallet configuration in browser
JavaScript or commit the production `.env` file.

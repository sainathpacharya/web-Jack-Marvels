# EC2 Frontend CI/CD Setup

This project now includes:

- GitHub Actions workflow: `.github/workflows/deploy-ec2.yml`
- Manual deploy helper: `scripts/deploy-ec2.sh`

## 1) Configure production deployment (`main`)

In GitHub: **Settings -> Secrets and variables -> Actions -> New repository secret**

Production secrets (used by `.github/workflows/deploy-ec2.yml`):

- `EC2_HOST` -> `32.192.216.15`
- `EC2_USER` -> `ec2-user`
- `EC2_SSH_KEY` -> full private key content from your PEM file

Optional:

- `EC2_PORT` -> `22`
- `EC2_DEPLOY_PATH` -> `/var/www/alpha-frontend`
- `VITE_API_BASE_URL` -> backend base URL for production build
- `FRONTEND_ENV_FILE` -> full `.env.production` content (use this when you have multiple Vite keys)

### Env secret strategy (recommended)

- If you only need one key, set `VITE_API_BASE_URL`.
- If you want to mirror all local frontend keys, set a single multiline secret `FRONTEND_ENV_FILE`, for example:

```env
VITE_API_BASE_URL=https://alphavlogs.com
VITE_SOME_OTHER_KEY=your-value
```

- In CI, `FRONTEND_ENV_FILE` takes priority and generates `.env.production` before build.

## 2) How automatic deploy works

- On every push to `main`, production workflow:
  1. installs dependencies
  2. creates `.env.production` from GitHub Secrets (if provided)
  3. builds frontend (`npm run build`)
  4. uploads `dist` artifact to EC2
  5. backs up current deploy folder
  6. deploys new files to `/var/www/alpha-frontend`
  7. reloads `nginx`

## 3) Manual deploy from local machine

Run:

```bash
scripts/deploy-ec2.sh \
  --host 32.192.216.15 \
  --user ec2-user \
  --key /Users/nagasainathreddy/Downloads/jackmarvels-key.pem \
  --path /var/www/alpha-frontend
```

If you already built locally and want to skip rebuild:

```bash
scripts/deploy-ec2.sh \
  --host 32.192.216.15 \
  --user ec2-user \
  --key /Users/nagasainathreddy/Downloads/jackmarvels-key.pem \
  --path /var/www/alpha-frontend \
  --skip-build
```

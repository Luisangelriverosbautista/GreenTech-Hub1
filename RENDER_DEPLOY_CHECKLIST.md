# Render Deploy Checklist

## 1) Deploy from blueprint
- In Render Dashboard: New -> Blueprint
- Select this repository branch with `render.yaml`
- Create both services:
  - `greentech-hub-backend`
  - `greentech-hub-frontend`

## 2) Set required backend secrets
- `MONGODB_URI`
- `JWT_SECRET`
- `TRUSTLESSWORK_API_KEY`

Optional but recommended:
- Update `CORS_ORIGINS` with your final frontend domain

## 3) Confirm frontend API URL
- In frontend service env vars, verify:
  - `VITE_API_URL=https://greentech-hub-backend.onrender.com/api`

## 4) Health and routing checks
After deployment, verify these URLs:
- `GET /api/health`
  - `https://greentech-hub-backend.onrender.com/api/health`
- `GET /api/projects`
  - `https://greentech-hub-backend.onrender.com/api/projects`

Escrow endpoints (require auth token):
- `GET /api/projects/:projectId/escrows`
- `POST /api/projects/:projectId/donate-escrow`
- `POST /api/escrows/:escrowId/approve`
- `POST /api/escrows/:escrowId/release`

## 5) If you still get 404 on `/api/projects/:id/escrows`
- Confirm backend service is using the latest commit (phase 1/2 changes)
- Trigger manual redeploy on backend
- Check backend logs for route load and startup errors
- Ensure frontend is calling the same backend URL as deployed

## 6) Fast smoke test with curl/PowerShell
Replace values first:
- `BACKEND_URL`
- `TOKEN`
- `PROJECT_ID`

```powershell
$headers = @{ Authorization = "Bearer TOKEN" }
Invoke-RestMethod -Method Get -Uri "BACKEND_URL/api/health"
Invoke-RestMethod -Method Get -Uri "BACKEND_URL/api/projects"
Invoke-RestMethod -Method Get -Uri "BACKEND_URL/api/projects/PROJECT_ID/escrows" -Headers $headers
```

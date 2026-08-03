# 🎓 Geeta University MerchStore — Team Developer Guide

Follow this guide to sync your workspace with the latest updates, including the new **Admin Dashboard (Charts, Revenue, Analytics)** and **Product Review Modal**.

---

## 🛠️ Step-by-Step Sync Instructions

Run these commands in your project root directory:

### 1. Fetch & Discard Local Conflict (Safe Pull)
If you have local changes preventing a `git pull`, stash them first to make the workspace clean:
```bash
git stash
git checkout main
git pull origin main
```
*To verify you have the latest code, run `git log -n 3 --oneline`. You should see the recent commit: `Merge pull request #5 from tanmaysingla84-collab/satvik`.*

---

### 2. Configure Environment Variables (`.env`)
Since `.env` is ignored by Git, you need to copy the shared configuration:
1. In the `server/` directory, duplicate the `server/.env.example` file.
2. Rename the duplicate to `server/.env`.
3. *(The `.env.example` has been updated with the shared MongoDB Atlas URI, Cloudinary, and Google Client IDs so you can connect to the shared database immediately).*

---

### 3. Install Updated Dependencies
New libraries (like Lucide React icons, Tailwind updates, etc.) require package installation:
```bash
npm run install-all
```
*(This command runs `npm install` inside both `client/` and `server/` directories).*

---

### 4. Clear Occupied Ports (If Servers Won't Start)
If ports `5000` (server) or `5173` (client) are occupied by orphaned Node.js processes, kill them:

*   **Windows (CMD/PowerShell)**:
    ```powershell
    # Find processes occupying ports:
    netstat -ano | findstr "5000 5173"
    
    # Kill the PIDs found (replace <PID> with the actual process number):
    taskkill /F /PID <PID>
    ```
*   **Mac/Linux**:
    ```bash
    kill -9 $(lsof -t -i:5000 -i:5173)
    ```

---

### 5. Start the Development Server
Run the project in development mode:
```bash
npm run dev
```

*   **Vite Client**: `http://localhost:5173`
*   **API Server**: `http://localhost:5000`

---

## 💡 Troubleshooting Dashboard Issues
*   **No Graph Data**: If the graphs show *"No revenue data for this period yet."*, it means the database is empty or your local server is pointing to a local MongoDB instead of the shared cluster. Double check your `server/.env` `MONGO_URI`.
*   **Vite client cached**: If changes are not visible in your browser, perform a hard reload: **`Ctrl + F5`** (Windows) or **`Cmd + Shift + R`** (Mac).

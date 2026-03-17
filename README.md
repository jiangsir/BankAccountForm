# 國立高雄師大附中 學生費用領款及退費登記系統

## 架構說明

- **前端**：GitHub Pages（`docs/` 資料夾）
- **後端**：Google Apps Script（`backend/` 資料夾）
- **資料庫**：Google Sheets
- **檔案儲存**：Google Drive
- **登入驗證**：Google Identity Services (GIS) OAuth2

---

## 重要資源

| 項目 | 網址 |
|------|------|
| GitHub Pages | https://jiangsir.github.io/BankAccountForm/ |
| Google Sheets | https://docs.google.com/spreadsheets/d/1w8RUxFUORbe3jiQuNRM8ISENMlEBRlLSto-aNXzESjk/edit |
| Apps Script | https://script.google.com/ |

---

## 一次性安裝設定

### 1. Google Cloud Console — 申請 OAuth Client ID

1. 前往 https://console.cloud.google.com/
2. 建立新專案（或選現有專案）
3. 左側選單 → **API 和服務 → 憑證**
4. 點「建立憑證」→「OAuth 用戶端 ID」
5. 應用程式類型：**網頁應用程式**
6. 已授權的 JavaScript 來源加入：
   ```
   https://jiangsir.github.io
   ```
7. 建立後取得 **用戶端 ID**，填入 `docs/js/config.js`：
   ```js
   const GOOGLE_CLIENT_ID = '你的用戶端ID.apps.googleusercontent.com';
   ```

### 2. Google Apps Script — 部署設定

1. 登入 Apps Script（建議用 `jiangsir@stu.nknush.kh.edu.tw`）
2. 部署 → 管理部署項目 → 建立或編輯部署
3. 設定：
   - **執行身分**：我
   - **誰可以存取**：所有人（匿名，讓 CORS fetch 正常運作）
4. 取得部署網址，填入 `docs/js/config.js`：
   ```js
   const GAS_URL = 'https://script.google.com/macros/s/你的部署ID/exec';
   ```
5. 每次更新 `backend/code.gs` 後：
   - 部署 → 管理部署項目 → 編輯 → **新版本** → 部署

### 3. clasp 本地開發環境

```bash
# 安裝 clasp
npm install -g @google/clasp

# 登入學校帳號
clasp login
# 帳號：555@stu.nknush.kh.edu.tw

# 開啟 Apps Script API
# https://script.google.com/home/usersettings

# 上傳後端程式碼
cd backend
clasp push --force
```

### 4. GitHub Pages 設定

1. GitHub repo → Settings → Pages
2. Source：`pages` 分支，資料夾選 `/docs`

---

## 日常更新

### 更新前端

1. 修改 `docs/` 內的檔案
2. 若有版號，更新 `docs/js/config.js` 的 `FRONTEND_VERSION`
3. commit 並 push 到 `pages` 分支

### 更新後端

1. 修改 `backend/code.gs`
2. 更新 `BACKEND_VERSION` 版號
3. 在 Apps Script 編輯器貼上最新程式碼
4. 部署 → 管理部署項目 → 編輯 → **新版本** → 部署

---

## 設定檔說明（`docs/js/config.js`）

```js
const FRONTEND_VERSION = 'v2.0.x';          // 前端版號（手動更新）
const GOOGLE_CLIENT_ID = '...';              // Google OAuth 用戶端 ID
const ALLOWED_DOMAIN   = 'stu.nknush.kh.edu.tw'; // 允許登入的 Google 網域
const GAS_URL          = 'https://...';      // GAS Web App 部署網址
```

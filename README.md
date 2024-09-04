# 雲端文件:


# 建立關聯資料表 Sheet
https://docs.google.com/spreadsheets/d/1w8RUxFUORbe3jiQuNRM8ISENMlEBRlLSto-aNXzESjk/edit?usp=sharing

# 進入環境:
# 列出現有環境
conda env list

# 創建一個新的環境
conda create -n appsscript

# 切換進入 appsscript
conda activate appsscript

# 使用 clasp 進行本地開發
node -v
npm install -g @google/clasp

# 登入 555@stu
clasp login
555@stu.nknush.kh.edu.tw

開啟 Google Apps Script API
https://script.google.com/home/usersettings

# 建立 AppsScript 專案
clasp create --type webapp --title "BankAccountForm"

# 上傳
確認 .clasp.json 內的 scriptid 是正確的，即可直接 push
clasp push --force

# 部屬
https://script.google.com/

手動部屬成"網頁應用程式"


# 部署不更新 URL
管理部署->編輯->新版本->部署

https://script.google.com/a/macros/stu.nknush.kh.edu.tw/s/AKfycbzqmv9E-R-OPJQZU_jEeu0fy43yghl0Twn7w7SCENU5ZwBq5wWktwVpNt_OuSPU3mh0/exec

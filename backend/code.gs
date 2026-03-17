var SHEET_ID = '1w8RUxFUORbe3jiQuNRM8ISENMlEBRlLSto-aNXzESjk';
var SHEET_NAME = 'Sheet1';
var GITHUB_PAGES_URL = 'https://jiangsir.github.io/BankAccountForm/'; // 替換為你的 GitHub Pages 網址
var BACKEND_VERSION = 'v2.0.2';

// 入口：Google 帳號驗證，通過後轉址到 GitHub Pages
function doGet(e) {
    // API：回傳後端版本
    if (e.parameter.action === 'getVersion') {
        return ContentService
            .createTextOutput(JSON.stringify({ success: true, data: BACKEND_VERSION }))
            .setMimeType(ContentService.MimeType.JSON);
    }

    // API：查詢帳號填報狀態
    if (e.parameter.action === 'getBankAccount') {
        var studentID = e.parameter.studentID;
        var result = getBankAccount(studentID);
        return ContentService
            .createTextOutput(JSON.stringify({ success: true, data: result }))
            .setMimeType(ContentService.MimeType.JSON);
    }

    // 驗證 Google 帳號，轉址到 GitHub Pages
    var userEmail = Session.getActiveUser().getEmail();
    var userAccount = userEmail.split('@')[0];
    var userDomain = userEmail.split('@')[1];

    var redirectUrl;
    if (userDomain !== 'stu.nknush.kh.edu.tw') {
        redirectUrl = GITHUB_PAGES_URL + '/login.html?email=' + encodeURIComponent(userEmail);
    } else {
        redirectUrl = GITHUB_PAGES_URL + '/index.html'
            + '?email=' + encodeURIComponent(userEmail)
            + '&account=' + encodeURIComponent(userAccount);
    }

    return HtmlService.createHtmlOutput(
        '<script>window.location.href = "' + redirectUrl + '";</script>'
    );
}

// API：處理資料儲存與檔案上傳
function doPost(e) {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;

    if (action === 'uploadFile') {
        var fileId = uploadFile(data.base64Data, data.fileName);
        return ContentService
            .createTextOutput(JSON.stringify({ success: true, fileId: fileId }))
            .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'saveDatasToSheet') {
        saveDatasToSheet(
            data.studentID, data.bankAccount, data.userEmail, data.paymentMethod,
            data.classname, data.sitenum, data.studentid, data.studentname,
            data.studentPid, data.accountname, data.parentPid, data.parentBirth,
            data.fileUpload1, data.fileUpload2, data.fileAttachment1, data.fileAttachment2, data.fileAttachment3
        );
        return ContentService
            .createTextOutput(JSON.stringify({ success: true }))
            .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: 'Unknown action' }))
        .setMimeType(ContentService.MimeType.JSON);
}

function maskBankAccount(accountInfo) {
    if (!accountInfo) return accountInfo;

    if (accountInfo.includes(':')) {
        var parts = accountInfo.split(':');
        var method = parts[0];
        var account = parts[1];

        if (account && account.length > 6) {
            var masked = account.substring(0, 3) + '*'.repeat(account.length - 6) + account.substring(account.length - 3);
            return method + ':' + masked;
        } else if (account && account.length > 2) {
            var masked = account.charAt(0) + '*'.repeat(account.length - 2) + account.charAt(account.length - 1);
            return method + ':' + masked;
        }
    }

    return accountInfo;
}

function getBankAccount(studentID) {
    Logger.log('Checking student ID: ' + studentID);
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) {
        Logger.log('Sheet not found!');
        return 'Sheet not found!';
    }

    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
        if (data[i][1] == studentID) {
            Logger.log('Found studentID' + data[i][1] + ' bank account: ' + data[i][2]);
            var result = data[i][2] + ':' + data[i][3];
            var maskedResult = maskBankAccount(result);
            return maskedResult;
        }
    }
    Logger.log('Student ID:' + studentID + ' not found');
    return null;
}

function saveDatasToSheet(studentID, bankAccount, userEmail, paymentMethod, classname, sitenum, studentid, studentname, studentPid, accountname, parentPid, parentBirth, fileUpload1, fileUpload2, fileAttachment1, fileAttachment2, fileAttachment3) {
    Logger.log('Saving bank account for student ID: ' + studentID);
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) {
        Logger.log('Sheet not found!');
        return 'Sheet not found!';
    }
    var timestamp = new Date();

    var fileUrl1 = fileUpload1 ? 'https://drive.google.com/file/d/' + fileUpload1 + '/view' : '';
    var fileLink1 = fileUpload1 ? '=HYPERLINK("' + fileUrl1 + '", "匯款帳戶封面檔案")' : '';
    var fileUrl2 = fileUpload2 ? 'https://drive.google.com/file/d/' + fileUpload2 + '/view' : '';
    var fileLink2 = fileUpload2 ? '=HYPERLINK("' + fileUrl2 + '", "可供辨識之法定代理人證明文件")' : '';
    var fileUrl3 = fileAttachment1 ? 'https://drive.google.com/file/d/' + fileAttachment1 + '/view' : '';
    var fileLink3 = fileAttachment1 ? '=HYPERLINK("' + fileUrl3 + '", "附件1:個人資料提供同意書")' : '';
    var fileUrl4 = fileAttachment2 ? 'https://drive.google.com/file/d/' + fileAttachment2 + '/view' : '';
    var fileLink4 = fileAttachment2 ? '=HYPERLINK("' + fileUrl4 + '", "附件2:學生各款項轉帳至非受款人本人帳戶同意書")' : '';
    var fileUrl5 = fileAttachment3 ? 'https://drive.google.com/file/d/' + fileAttachment3 + '/view' : '';
    var fileLink5 = fileAttachment3 ? '=HYPERLINK("' + fileUrl5 + '", "附件3:領用現金同意書")' : '';

    sheet.appendRow([timestamp, "'" + studentID, paymentMethod, "'" + bankAccount, userEmail, classname, "'" + sitenum, "'" + studentid, studentname, accountname, studentPid, parentPid, parentBirth, fileLink1, fileLink2, fileLink3, fileLink4, fileLink5]);
    Logger.log('Bank account saved successfully');
}

function uploadFile(base64Data, fileName) {
    var folder = DriveApp.getFolderById('1bQZN_6FEMeLwfNQxCZWx-S9LC7pgJ-Lu');
    var blob = Utilities.newBlob(Utilities.base64Decode(base64Data), undefined, fileName);
    var file = folder.createFile(blob);
    return file.getId();
}

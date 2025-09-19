var SHEET_ID = '1w8RUxFUORbe3jiQuNRM8ISENMlEBRlLSto-aNXzESjk'; // 替換為你的 Google Sheet ID
var SHEET_NAME = 'Sheet1'; // 替換為你的工作表名稱

function doGet() {
    var userEmail = Session.getActiveUser().getEmail();
    var userAccount = userEmail.split('@')[0];
    var userDomain = userEmail.split('@')[1];
    var scriptUrl = ScriptApp.getService().getUrl(); // 在這裡取得 URL

    // 檢查是否為有效的學生帳號
    if (userDomain !== 'stu.nknush.kh.edu.tw') {
        var errorTemplate = HtmlService.createTemplateFromFile('error');
        errorTemplate.userEmail = userEmail;
        errorTemplate.userAccount = userAccount;
        errorTemplate.userDomain = userDomain;
        errorTemplate.scriptUrl = scriptUrl; // 傳遞給模板
        return errorTemplate.evaluate()
            .setTitle('登入驗證 - 國立高雄師大附中')
            .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }

    // 如果是有效帳號，顯示表單
    var template = HtmlService.createTemplateFromFile('PaymentForm');
    template.userEmail = userEmail;
    template.userAccount = userAccount;
    template.userDomain = userDomain;
    template.scriptUrl = scriptUrl; // 傳遞給模板
    return template.evaluate()
        .setTitle('學生各項費用領款及退費登記系統')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// 新增帳號遮蔽函數
function maskBankAccount(accountInfo) {
    if (!accountInfo) return accountInfo;
    
    // 如果包含冒號，分離方式和帳號
    if (accountInfo.includes(':')) {
        var parts = accountInfo.split(':');
        var method = parts[0];
        var account = parts[1];
        
        if (account && account.length > 6) {
            // 保留前3碼和後3碼，中間用星號遮蔽
            var masked = account.substring(0, 3) + '*'.repeat(account.length - 6) + account.substring(account.length - 3);
            return method + ':' + masked;
        } else if (account && account.length > 2) {
            // 短帳號處理
            var masked = account.charAt(0) + '*'.repeat(account.length - 2) + account.charAt(account.length - 1);
            return method + ':' + masked;
        }
    }
    
    return accountInfo;
}

// 修改現有的 getBankAccount 函數
function getBankAccount(studentID) {
    Logger.log('Checking student ID: ' + studentID);
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) {
        Logger.log('Sheet not found!');
        return 'Sheet not found!';
    }

    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
        if (data[i][1] == studentID) { // data[i][1] 代表背後資料表的第二個欄位
            Logger.log('Found studentID' + data[i][1] + ' bank account: ' + data[i][2]);
            var result = data[i][2] + ':' + data[i][3]; // 原始結果
            var maskedResult = maskBankAccount(result); // 遮蔽後的結果
            return maskedResult; // 返回遮蔽後的銀行帳號
        }
    }
    Logger.log('Student ID:' + studentID + ' not found');
    return null; // 如果沒有找到學號，返回 null
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

function loadFormBasedOnPaymentMethod(paymentMethod, userEmail, userAccount) {
    var userEmail = Session.getActiveUser().getEmail();
    var userAccount = userEmail.split('@')[0];
    var userDomain = userEmail.split('@')[1];
    var scriptUrl = ScriptApp.getService().getUrl(); // 在這裡取得 URL

    var template;
    if (paymentMethod === '現金') {
        template = HtmlService.createTemplateFromFile('Payment_cash');
    } else if (paymentMethod === '受款學生本人帳戶') {
        template = HtmlService.createTemplateFromFile('Payment_student');
    } else if (paymentMethod === '法定代理人帳戶') {
        template = HtmlService.createTemplateFromFile('Payment_parent');
    } else {
        template = HtmlService.createTemplateFromFile('error');
    }
    
    template.userEmail = userEmail;
    template.userAccount = userAccount;
    template.userDomain = userDomain;
    template.paymentMethod = paymentMethod;
    template.scriptUrl = scriptUrl; // 傳遞給模板
    
    return template.evaluate().getContent();
}

function uploadFile(base64Data, fileName) {
    var folder = DriveApp.getFolderById('1bQZN_6FEMeLwfNQxCZWx-S9LC7pgJ-Lu'); // 替換為你的文件夾 ID
    var blob = Utilities.newBlob(Utilities.base64Decode(base64Data), undefined, fileName);
    var file = folder.createFile(blob);
    return file.getId();
}
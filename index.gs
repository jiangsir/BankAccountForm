var SHEET_ID = '1w8RUxFUORbe3jiQuNRM8ISENMlEBRlLSto-aNXzESjk'; // 替換為你的 Google Sheet ID
var SHEET_NAME = 'Sheet1'; // 替換為你的工作表名稱

function doGet() {
    var userEmail = Session.getActiveUser().getEmail();
    var userAccount = userEmail.split('@')[0];
    var userDomain = userEmail.split('@')[1];
    var template;
    if (userDomain === 'stu.nknush.kh.edu.tw') {
        template = HtmlService.createTemplateFromFile('StudentForm');
    } else { // 非 tea 就當作 stu
        template = HtmlService.createTemplateFromFile('error');
    }
    template.userEmail = userEmail;
    template.userAccount = userAccount;
    template.userDomain = userDomain;
    return template.evaluate().setTitle('表單填寫');
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
        if (data[i][0] == studentID) {
            Logger.log('Found bank account: ' + data[i][1]);
            return data[i][1]; // 返回銀行帳號
        }
    }
    Logger.log('Student ID not found');
    return null; // 如果沒有找到學號，返回 null
}

function saveBankAccount(studentID, bankAccount, userEmail) {
    Logger.log('Saving bank account for student ID: ' + studentID);
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) {
        Logger.log('Sheet not found!');
        return 'Sheet not found!';
    }

    sheet.appendRow([studentID, bankAccount, userEmail]);
    Logger.log('Bank account saved successfully');
}

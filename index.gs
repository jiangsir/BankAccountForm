var SHEET_ID = '1w8RUxFUORbe3jiQuNRM8ISENMlEBRlLSto-aNXzESjk'; // 替換為你的 Google Sheet ID
var SHEET_NAME = 'Sheet1'; // 替換為你的工作表名稱

function doGet() {
    var userEmail = Session.getActiveUser().getEmail();
    var userAccount = userEmail.split('@')[0];
    var userDomain = userEmail.split('@')[1];
    var template;
    if (userDomain === 'stu.nknush.kh.edu.tw') {
        template = HtmlService.createTemplateFromFile('PaymentForm');
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
            Logger.log('Found studentID' + data[i][0] + ' bank account: ' + data[i][1]);
            return data[i][1] + ':' + data[i][2]; // 返回銀行帳號
        }
    }
    Logger.log('Student ID:' + studentID + ' not found');
    return null; // 如果沒有找到學號，返回 null
}

// function saveDatasToSheet(studentID, bankAccount, userEmail, paymentMethod, classname, sitenum, studentid, studentname, personalid, fileId1, fileId2) {
//     Logger.log('Saving bank account for student ID: ' + studentID);
//     var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
//     if (!sheet) {
//         Logger.log('Sheet not found!');
//         return 'Sheet not found!';
//     }
//     var fileUrl1 = fileId1 ? 'https://drive.google.com/file/d/' + fileId1 + '/view' : '';
//     var fileLink1 = fileId1 ? '=HYPERLINK("' + fileUrl1 + '", "查看匯款帳戶封面檔案")' : '';
//     var fileUrl2 = fileId2 ? 'https://drive.google.com/file/d/' + fileId2 + '/view' : '';
//     var fileLink2 = fileId2 ? '=HYPERLINK("' + fileUrl2 + '", "查看個人資料提供同意書")' : '';

//     sheet.appendRow([studentID, paymentMethod, bankAccount, userEmail, classname, sitenum, studentid, studentname, personalid, fileLink1, fileLink2]);
//     Logger.log('Bank account saved successfully');
// }

function saveDatasToSheet(studentID, bankAccount, userEmail, paymentMethod, classname, sitenum, studentid, studentname, parentname, parentPid, parentBirth, fileId1, fileId2, fileId3, fileId4) {
    Logger.log('Saving bank account for student ID: ' + studentID);
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) {
        Logger.log('Sheet not found!');
        return 'Sheet not found!';
    }
    var fileUrl1 = fileId1 ? 'https://drive.google.com/file/d/' + fileId1 + '/view' : '';
    var fileLink1 = fileId1 ? '=HYPERLINK("' + fileUrl1 + '", "查看匯款帳戶封面檔案")' : '';
    var fileUrl2 = fileId2 ? 'https://drive.google.com/file/d/' + fileId2 + '/view' : '';
    var fileLink2 = fileId2 ? '=HYPERLINK("' + fileUrl2 + '", "查看個人資料提供同意書")' : '';
    var fileUrl3 = fileId3 ? 'https://drive.google.com/file/d/' + fileId3 + '/view' : '';
    var fileLink3 = fileId3 ? '=HYPERLINK("' + fileUrl3 + '", "查看可供辨識之法定代理人證明文件")' : '';
    var fileUrl4 = fileId4 ? 'https://drive.google.com/file/d/' + fileId4 + '/view' : '';
    var fileLink4 = fileId4 ? '=HYPERLINK("' + fileUrl4 + '", "學生各項費用領款擊退費採現金方式領取同意書")' : '';

    sheet.appendRow([studentID, paymentMethod, bankAccount, userEmail, classname, sitenum, studentid, studentname, parentname, parentPid, parentBirth, fileLink1, fileLink2, fileLink3, fileLink4]);
    Logger.log('Bank account saved successfully');
}

function loadFormBasedOnPaymentMethod(paymentMethod, userEmail, userAccount) {
    var userEmail = Session.getActiveUser().getEmail();
    var userAccount = userEmail.split('@')[0];
    var userDomain = userEmail.split('@')[1];

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
    return template.evaluate().getContent();
}

function uploadFile(base64Data, fileName) {
    //555@stu: 匯款帳戶檔案封面// https://drive.google.com/drive/folders/1bQZN_6FEMeLwfNQxCZWx-S9LC7pgJ-Lu?usp=drive_link

    var folder = DriveApp.getFolderById('1bQZN_6FEMeLwfNQxCZWx-S9LC7pgJ-Lu'); // 替換為你的文件夾 ID
    var blob = Utilities.newBlob(Utilities.base64Decode(base64Data), undefined, fileName);
    var file = folder.createFile(blob);
    return file.getId();
}
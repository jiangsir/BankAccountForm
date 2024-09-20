var SHEET_ID = '1w8RUxFUORbe3jiQuNRM8ISENMlEBRlLSto-aNXzESjk'; // 替換為你的 Google Sheet ID
var SHEET_NAME = 'Sheet1'; // 替換為你的工作表名稱

function doGet() {
    var userEmail = Session.getActiveUser().getEmail();
    var userAccount = userEmail.split('@')[0];
    var userDomain = userEmail.split('@')[1];

    if (userDomain !== 'stu.nknush.kh.edu.tw') {
        var errorTemplate = HtmlService.createTemplateFromFile('error');
        errorTemplate.userEmail = userEmail;
        errorTemplate.userAccount = userAccount;
        errorTemplate.userDomain = userDomain;
        return errorTemplate.evaluate().setTitle('錯誤');
    }

    var template = HtmlService.createTemplateFromFile('PaymentForm');
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
        if (data[i][1] == studentID) { // data[i][1] 代表 背後資料表的第二個欄位
            Logger.log('Found studentID' + data[i][1] + ' bank account: ' + data[i][2]);
            return data[i][2] + ':' + data[i][3]; // 返回銀行帳號
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


//                          學號	    退款帳戶	登入身份	退款方式       班級	     座號	  學號	      學生姓名	       學生身分證 帳戶姓名	法定代理人身分證號碼	法定代理人生日	上傳附件1	上傳附件2	上傳附件3	上傳附件4
function saveDatasToSheet(studentID, bankAccount, userEmail, paymentMethod, classname, sitenum, studentid, studentname, studentPid, accountname, parentPid, parentBirth, fileUpload1, fileUpload2, fileAttachment1, fileAttachment2, fileAttachment3) {
    Logger.log('Saving bank account for student ID: ' + studentID);
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) {
        Logger.log('Sheet not found!');
        return 'Sheet not found!';
    }
    var timestamp = new Date();

    var fileUrl1 = fileUpload1 ? 'https://drive.google.com/file/d/' + fileUpload1 + '/view' : '';
    var fileLink1 = fileUpload1 ? '=HYPERLINK("' + fileUrl1 + '", "查看匯款帳戶封面檔案")' : '';
    var fileUrl2 = fileUpload2 ? 'https://drive.google.com/file/d/' + fileUpload2 + '/view' : '';
    var fileLink2 = fileUpload2 ? '=HYPERLINK("' + fileUrl2 + '", "查看可供辨識之法定代理人證明文件")' : '';
    var fileUrl3 = fileAttachment1 ? 'https://drive.google.com/file/d/' + fileAttachment1 + '/view' : '';
    var fileLink3 = fileAttachment1 ? '=HYPERLINK("' + fileUrl3 + '", "附件1:個人資料提供同意書")' : '';
    var fileUrl4 = fileAttachment2 ? 'https://drive.google.com/file/d/' + fileAttachment2 + '/view' : '';
    var fileLink4 = fileAttachment2 ? '=HYPERLINK("' + fileUrl4 + '", "附件2:學生各款項轉帳至非受款人本人帳戶同意書")' : '';
    var fileUrl5 = fileAttachment3 ? 'https://drive.google.com/file/d/' + fileAttachment3 + '/view' : '';
    var fileLink5 = fileAttachment3 ? '=HYPERLINK("' + fileUrl5 + '", "附件3:領用現金同意書")' : '';
    //                 時間         學號	退款方式	    退款帳戶	登入身份	班級	     座號	  學號	      學生姓名	     帳戶姓名  學生身分證 	法定代理人身分證號碼	法定代理人生日	             上傳1	    上傳2	    附件1	   附件2       附件3
    sheet.appendRow([timestamp, `'${studentID}`, paymentMethod, `'${bankAccount}`, userEmail, classname, `'${sitenum}`, `'${studentid}`, studentname, accountname, studentPid, parentPid, parentBirth, fileLink1, fileLink2, fileLink3, fileLink4, fileLink5]);
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
// setTimeout을 await async로 바꿔야 함 
// 월별 실적 조회. 이건 구글시트를 연동해야 되는데

const express = require("express");
const asyncify = require("express-asyncify");
const serverless = require("serverless-http");
require('dotenv').config();

const app = asyncify(express());
const apiRouter = express.Router();

const logger = require("morgan");
const bodyParser = require("body-parser");

const Airtable = require("airtable");
const base = new Airtable({apiKey: process.env.API_KEY}).base('appmdFjy715yHPmNw');
const getName = require('./getName.js')

app.use(logger("dev", {}));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use("/.netlify/functions/api", apiRouter);
var today = new Date();
var date = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate(); 

//클로저 함수 시작
function setArray(arr) {
  return {
    get_arr: function () {
      return arr;
    },
    set_arr: function (_url) {
      arr.push(_url);
    },
    sort_arr: function () {
      arr.sort();
    },
    ini_arr: function () {
      arr = [];
    },
  };
}

const item = setArray([]);
//클로저 함수 끝

//클로저 함수 시작(for get record Id) **변수로 바꿔야 함**
function setArray2(ids) {
  return {
    get_id : function () {
      return ids;
    },
    set_id : function (_ids) {
      ids =  _ids;   //왜 var로 선언을 하지 않지?
  },
};
}


const getRecordId = setArray2([]);

//클로저 함수 끝(for get record Id)
apiRouter.post("/gs_cost_input", (req, res) => {
  const fs = require('fs');
  const readline = require('readline');
  const {
    google
  } = require('googleapis');
  
 const creden = {
    "installed": {
        "client_id": process.env.CLIENT_ID,
        "project_id": process.env.PROJECT_ID,
        "auth_uri": process.env.AUTH_URI,
        "token_uri": process.env.TOKEN_URI,
        "auth_provider_x509_cert_url": process.env.AUTH_PROVIDER_X509_CERT_URL,
        "client_secret": process.env.CLIENT_SECRET,
        "redirect_uris": process.env.REDIRECT_URIS
    }
};

const toke = {
  "access_token": process.env.ACCESS_TOKEN,
  "refresh_token": process.env.REFRESH_TOKEN,
  "scope": "https://www.googleapis.com/auth/spreadsheets",
  "token_type": "Bearer",
  "expiry_date": 1598260908685
};

  // If modifying these scopes, delete token.json.
  const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
  // The file token.json stores the user's access and refresh tokens, and is
  // created automatically when the authorization flow completes for the first
  // time.
  //const TOKEN_PATH = 'token.json';

   authorize(creden, inputCost);
  

  function authorize(credentials, callback) {
    const {
      client_secret,
      client_id,
      redirect_uris
    } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    
      oAuth2Client.setCredentials(toke);
      callback(oAuth2Client);
  }
  

  function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error while trying to retrieve access token', err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) return console.error(err);
          console.log('Token stored to', TOKEN_PATH);
        });
        callback(oAuth2Client);
      });
    });
  }

  function inputCost(auth) {
    const sheets = google.sheets({
      version: 'v4',
      auth
    });
    const mySpreadSheetId = '1SXZ9o5ca3B-bsUozboQrFOht8z_oqsX9U_bQTMl9ytQ'
    const sheetName = 'kakaoInput'

    sheets.spreadsheets.values.get({
      spreadsheetId: mySpreadSheetId,
      range: `${sheetName}!C:C`,
    }, (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      const data = res.data.values;
      let i = data.length;
      console.log(i)

      sheets.spreadsheets.values.update({
        spreadsheetId: mySpreadSheetId,
        range: `${sheetName}!C${i + 1}`,
        valueInputOption: "USER_ENTERED",
        resource: {
          majorDimension: "ROWS",
          values: [
            ["555", "77"]
          ]
        }
      }, (err, result) => {
        if (err) {
          // Handle error
          console.log(err);
        } else {
          console.log('%d cells updated.', result.updatedCells);
        }
      });


    });
  }

  item.ini_arr();
  var buyer = JSON.stringify(req.body.action.detailParams.customer.value);
  var buyer = buyer.replace(/\"/g, "");

  //var info = JSON.stringify(req.body);
  var content = req.body.action.detailParams.contents.origin;

  var writer = JSON.stringify(req.body.userRequest.user.id);
  var wri = writer.replace(/\"/g, "");
  var wri = getName(wri);
  var wri = wri[0].name

  //inputCost(auth, buyer, wri)


  setTimeout(function () {
    const responseBody = {
      version: "2.0",
      template: {
        outputs: [{
          "basicCard": {
            "title": "AIRTABLE 사진추가 하실래요?        한장씩만 가능!!",
            "description": "거래처 :" + buyer,
            "thumbnail": {
              "imageUrl": "https://ifh.cc/g/Bo8Ecb.jpg"
            },
            "buttons": [{
                "action": "block",
                "label": "추가하기",
                "blockId": "5f2f475ef8e71a0001de609b"
              },
              {
                "action": "message",
                "label": "종료하기",
                "messageText": "종료"
              }
            ]
          }
        }, ],
      },
    };


    res.status(200).send(responseBody);
  }, 500);

});

apiRouter.post("/air_content_input", (req, res) => {
  item.ini_arr();
  var buyer = JSON.stringify(req.body.action.detailParams.customer.value); 
  var buyer = buyer.replace(/\"/g, "");
  
  //var info = JSON.stringify(req.body);
  var content = req.body.action.detailParams.contents.origin;  

  var writer = JSON.stringify(req.body.userRequest.user.id);
  var wri = writer.replace(/\"/g, "");
  var wri = getName(wri);
  var wri = wri[0].name

  base("dataBase").create({
    날짜: date,
    거래처: buyer,
    작성자: wri,
    내용: content
    
  }, function(err, record) {
    if (err) {
      console.error(err);
      return;
    }
      console.log(record.getId()); 
      var record_id = record.getId();
      getRecordId.set_id(record_id);
      
  });
  
  setTimeout(function(){
  const responseBody = {
    version: "2.0",
    template: {
      outputs: [
        {
          "basicCard": {
            "title": "AIRTABLE 사진추가 하실래요?        한장씩만 가능!!",
            "description" : "거래처 :" + buyer,
            "thumbnail": {
              "imageUrl": "https://ifh.cc/g/Bo8Ecb.jpg"
            },
            "buttons": [
              {
                "action": "block",
                "label": "추가하기",
                "blockId": "5f2f475ef8e71a0001de609b"
              },
              {
                "action":  "message",
                "label": "종료하기",
                "messageText": "종료"
              }
            ]
          }
        },
      ],
    },
  };

  
  res.status(200).send(responseBody);
  },500);
  
});

apiRouter.post("/air_pic_input", (req, res) => {

  var x = JSON.stringify(req.body);
  var block_Id = getRecordId.get_id();
  //var block_Id = block_Id[0];
  
   var pic = JSON.stringify(req.body.action.detailParams.pic.origin);
   var pic = pic.replace(/\"/g, "");
   var picList = new Array();
   item.set_arr(pic);
   var pic2 = item.get_arr();

   for(var i=0; i<pic2.length; i++){
      var data = new Object();
      data.url = pic2[i];
      picList.push(data);
   }; 

   setTimeout(function(){
   base('dataBase').update(block_Id, {
    
    "Attachments": picList
  }, function(err, record) {
    if (err) {
      console.error(err);
      return;
    }
    console.log(record.get('Name'));
  });
},500); // 이렇게 크면. req가 실행되니까 끝나버림
    
  setTimeout(function(){
    const responseBody = {
      version: "2.0",
      template: {
        outputs: [
          {
            "basicCard": {
              "title": "AIRTABLE 사진추가 하실래요?        한장씩만 가능!!",
              "thumbnail": {
                "imageUrl": "https://ifh.cc/g/Bo8Ecb.jpg"
              },
              "buttons": [
                {
                  "action": "block",
                  "label": "추가하기",
                  "blockId": "5f2f475ef8e71a0001de609b"
                },
                {
                  "action":  "message",
                  "label": "종료하기",
                  "messageText": "종료"
                }
              ]
            }
          },
        ],
      },
    };
  
  res.status(200).send(responseBody);
  
 },2000); 
});

apiRouter.post("/list_record", (req, res) => {
  
  var buyer = JSON.stringify(req.body.action.detailParams.customer.value); 
  var buyer = buyer.replace(/\"/g, "");
  listRecord = new Array;
  
  setTimeout(function(){
    base('dataBase').select({
      
      filterByFormula: '{거래처}="' + buyer + "\""
  }).eachPage(function page(records, fetchNextPage) {
      records.forEach(function(record) {
        
        var aa = record.get("날짜");
        var bb = record.get("내용");
        var cc = record.get("Attachments");
        if (cc != undefined){
        var cc = cc.map(p => p.url);  
        var cc = cc.join(" ");
          }
        else if(cc === undefined){
          var cc = "";
        }
        //item.set_arr(record.get('날짜') +"  " + record.get('내용') + "  " + kk);
        item.set_arr(aa + " " + bb + "  " + cc);
       
      //console.log(result);
      });

      item.sort_arr();
      var result = item.get_arr();
      result3 = result.join(" /////////////////////////////////////////////////////////////////////// ");

        fetchNextPage();
  
  }, function done(err) {
      if (err) { console.error(err); return; }
  });   
},500);  
 
  setTimeout(function(){
    const responseBody = {
      version: "2.0",
      template: {
        outputs: [
            {
                "simpleText": {
                    "text": result3  
                   // "text": "123"
                }
            }
        ]
    }
  }
        
  res.status(200).send(responseBody);
  item.ini_arr();
},1000); 
});

apiRouter.post("/checkId", (req, res) => {

   var x = JSON.stringify(req.body);

   const responseBody = {
      version: "2.0",
      template: {
        outputs: [
          {
            simpleText: {
              text: x,  
          }
        }        
       ]
      },
    }
  
  res.status(200).send(responseBody);
});

module.exports.handler = serverless(app);

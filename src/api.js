// TODO: Hide API KEYS.
// airtable 에서 record.getId를 살려야 함 Done
// setTimeout을 await async로 바꿔야 함
// pic_input을 update 명령어로 id는 딸 수 있으니까
// 메뉴에 form으로 입력하는 방법 추가

const express = require("express");
const asyncify = require("express-asyncify");
const serverless = require("serverless-http");

const app = asyncify(express());
const apiRouter = express.Router();

const logger = require("morgan");
const bodyParser = require("body-parser");

const Airtable = require("airtable");
const base = new Airtable({apiKey: 'keynCOHYwnnoQZDeB'}).base('apptSTO7G7lbYD7gu');
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
    ini_arr: function () {
      arr = [];
    },
  };
}

const item = setArray([]);
//클로저 함수 끝

//클로저 함수 시작(for get record Id)
function setArray2(ids) {
  return {
    get_id : function () {
      return ids;
    },
    set_id : function (_ids) {
      ids.push( _ids)   //왜 var로 선언을 하지 않지?
  },
   ini_id : function(){
     ids = [];
   }
};
}


const getRecordId = setArray2([]);

//클로저 함수 끝(for get record Id)


apiRouter.post("/air_content_input", (req, res) => {
  
  var buyer = JSON.stringify(req.body.action.detailParams.customer.origin); 
  var buyer = buyer.replace(/\"/g, "");
  
  var content = JSON.stringify(req.body.action.detailParams.contents.origin);  
  var contents = content.replace(/\"/g, "");

  var writer = JSON.stringify(req.body.userRequest.user.id);
  var wri = writer.replace(/\"/g, "");
  var wri = getName(wri);
  var wri = wri[0].name

  base("testing").create({
    날짜: date,
    거래처2: buyer,
    작성자: wri,
    내용: contents
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
            "title": "AIRTABLE",
            "description": "사진을 추가하시겠습니까?(사진만 가능해요)",
            "thumbnail": {
              "imageUrl": "http://www.bloter.net/wp-content/uploads/2017/09/5ffa7dfa1a11a7cf1db37be163197f76526ab886108275dccc9abb455a062e8b97cfcd3158ed6a517062375e7a6d954ffe97599175348a0d774ade7886d87ce07a1d5713fc684809e597b8288ce2e110-1.png"
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
                "messageText": "첨부 없이 입력 완료되었습니다!"
              }
            ]
          }
        },
      ],
    },
  };

  
  res.status(200).send(responseBody);
  },1000);
  
});

apiRouter.post("/air_pic_input", (req, res) => {

  var x = JSON.stringify(req.body);
  var block_Id = getRecordId.get_id();
  var block_Id = block_Id[0];
  
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
   base('testing').update(block_Id, {
    
    "Attachments": picList
  }, function(err, record) {
    if (err) {
      console.error(err);
      return;
    }
    console.log(record.get('Name'));
  });
},500);
  

  setTimeout(function(){
  const responseBody = {
    version: "2.0",
    template: {
      outputs: [
        {
          simpleText: {
            text: x,
          },
        },
      ],
    },
  };
  
  res.status(200).send(responseBody);
  //item.ini_arr();
  getRecordId.ini_id();
},1000);
});

apiRouter.post("/testing", (req, res) => {

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

   console.log(picList);

   setTimeout(function(){
   base('testing').update("recXvxewvSRxCPBI7", {
    
    "Attachments": picList
  }, function(err, record) {
    if (err) {
      console.error(err);
      return;
    }
    console.log(record.get('Name'));
  });
},500);
  

  setTimeout(function(){
  const responseBody = {
    version: "2.0",
    template: {
      outputs: [
        {
          simpleText: {
            text: "d",
          },
        },
      ],
    },
  };
  
  res.status(200).send(responseBody);
  item.ini_arr();
  getRecordId.ini_id();
},1000);
});

apiRouter.post("/checkId", function (req, res) {
  console.log(req.body);
  var x = JSON.stringify(req.body);

  const responseBody = {
    version: "2.0",
    template: {
      outputs: [
        {
          simpleText: {
            text: x,
          },
        },
      ],
    },
  };

  res.status(200).send(responseBody);
});

module.exports.handler = serverless(app);

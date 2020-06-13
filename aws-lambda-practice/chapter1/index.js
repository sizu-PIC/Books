let rankdata;
let AWS = require("aws-sdk");
let docClient = new AWS.DynamoDB.DocumentClient();
let puts = [];

exports.handler = async (event) => {
    AWS.config.update({
        region: "ap-northeast-1"
    });
    
    try{
        rankdata = JSON.parse(event.body); // POST で来たデータの取得
    }catch(e){
        rankdata = event;
    }
    const puts_promise = [];
    for(var i = 0; i < rankdata.length; i++){
        puts_promise.push(putitem(i));
    }
    await Promise.all(puts_promise);
    const Response = {
        headers: {
            "Content-Type": 'application/json',
            "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
            "Access-Control-Allow-Methods": "POST",
            "Access-Control-Allow-Origin": "*"
        },
        statusCode: 200,
        body: "Success"
    };
    return Response;
};

async function putitem(i){
    var title = rankdata[i].title;
    var difficulty = rankdata[i].difficulty;
    var params = {
        TableName : "DiffData",
        Key : {
            title : title,
            difficulty : difficulty
        }
    };
    var diff_val, res;
    
    try{
        res = await docClient.get(params).promise();
    }catch(err){
        console.log('Unable to get data => ', JSON.stringify(err));
        return;
    }
    
    if(res.Item === undefined) return;
    diff_val = res.Item.diff_val;
    params = {
        TableName: "RankData",
        Item: {
            "title":  title,
            "difficulty": difficulty,
            "diff_val" : diff_val,
            "rank":  rankdata[i].rank
        }
    };
    try{
        await docClient.put(params).promise();
    }catch(err){
        console.error("Unable to add data", rankdata[i].title, ". Error JSON:", JSON.stringify(err, null, 2));
        return;
    }
    console.log("PutItem succeeded:", rankdata[i].title);

}
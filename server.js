const express = require('express');
const app = express();
const host = "localhost";
const port = 3200;

var AWS = require('aws-sdk')
const tableName = "sanpham"

app.set("view engine","ejs");
app.set("views","./views");
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
AWS.config.update({
    region: "ap-southeast-1",
    endpoint: "http://dynamodb.ap-southeast-1.amazonaws.com",
    accessKeyId: "",
    secretAccessKey: ""
});
var docClient = new AWS.DynamoDB.DocumentClient();

/***************************************  Thêm san pham */
let save = function(masp, tensp, soluong){
    var input = {
        'masp': masp,
        'tensp':  tensp,
        'soluong': soluong
    }
    var params = {
        TableName: tableName,
        Item: input
    };
    docClient.put(params, function (err, data) {
        if (err) {
            console.log("save::error - " + JSON.stringify(err, null, 2));
        } else {
            console.log("save::success" );
        }
    });
}
app.get('/', (req, res) => {
    res.render('index.ejs');
});
app.post('/', (req, res) => {
    var masp = Math.floor(Math.random() * 100) + 1;
    var tensp = req.body.txtTen;
    var soluong = req.body.txtSoluong;
    save(masp, tensp, parseInt(soluong));
    res.redirect('/DanhSach');
})
/***************************************Load Sản phẩm */
function find (res) {
    let params = {
        TableName: tableName
    };
    docClient.scan(params, function (err, data) {
        if (err) {
            console.log(JSON.stringify(err, null, 2));
        } else {
            if(data.Items.length === 0){
                res.end(JSON.stringify({message :'Table rỗng '}));
            }
            res.render('DanhSach.ejs',{
                data : data.Items
            });
        }
    });
}
app.get('/DanhSach', (req, res) => {
    find(res)
});

/***************************************  Xóa sản phẩm */
function deleteSP(res,id){
    var check = !Number.isNaN(id) ? parseInt(id) : id;
    console.log(check);
    var params = {
        TableName:tableName,
        Key:{
            "masp": check
        },
        ConditionExpression:"masp = :r",
        ExpressionAttributeValues: {
            ":r": check
        }
    };

    console.log("Attempting a conditional delete...");
    docClient.delete(params, function(err, data) {
        if (err) {
            console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
            res.redirect('/DanhSach');
        }
    });
}
app.post('/XoaSP', (req, res) => {
    deleteSP(res, req.body.ID);
});

/***************************************  Sửa Sản phẩm */
function updateSP(res, masp, tensp, soluong){
    var check = !Number.isNaN(masp) ? parseInt(masp) : masp;
    soluong = parseInt(soluong);
    var params = {
        TableName: tableName,
        Key:{
            "masp": check
        },
        UpdateExpression:"set tensp =:tensp, soluong =:soluong",
        ExpressionAttributeValues: {
            ":tensp": tensp,
            ":soluong" : soluong
        }
    };
    docClient.update(params, function(err, data) {
        if (err) {
            console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
            res.redirect('/DanhSach');
        }
    });
}
app.post('/update', (req, res) =>{
    updateSP(res, req.body.txtma, req.body.txtTen, req.body.txtSoluong);
})

/***************************************  tìm 1 Sản phẩm */
function getSP (res , id) {
    var check = !Number.isNaN(id) ? parseInt(id) : id;
    console.log(check);
    var params = {
        TableName:tableName,
        KeyConditionExpression: "#masp = :ms",
        ExpressionAttributeNames:{
            "#masp": "masp"
        },
        ExpressionAttributeValues: {
            ":ms": check
        }
    };
    docClient.query(params, function (err, data) {
        if (err) {
            console.log(JSON.stringify(err, null, 2));
        } else {
            if(data.Items.length === 0){
                res.end(JSON.stringify({message :'Table rỗng '}));
            }
            console.log(data.Items)
            res.render('update.ejs',{
                data : data.Items
            });
        }
    });
}
app.post('/SuaSP', (req, res) => {
    getSP(res, req.body.IDupdate);
})
app.listen(port, () => {
    console.log(`App listening at http://${host}:${port}`);
})

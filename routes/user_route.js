var express = require("express");
var exe = require("../connection.js");
var url = require("url");
// const { register } = require("module");
var router = express.Router();
router.get("/", async function(req,res){


    var company_info = await exe(`SELECT * FROM company_info`);
    var slides = await exe(`SELECT * FROM slider`);
    var obj = {"company_info":company_info[0],"slides":slides};
    res.render("user/home.ejs",obj);
    
});

router.get("/product", async function(req,res){

    var urldata = url.parse(req.url,true).query;
    var search_key = " ";

   

    if(urldata.search==undefined)
    {
     var total_records = await exe(`SELECT COUNT(*) as ttl FROM product WHERE status ='approved' ORDER BY product_id DESC  `);
        total_records = total_records[0].ttl;
        per_page = 1;
        total_pages = total_records/per_page

        if(parseInt(total_pages)< total_pages)
        {
            total_pages = parseInt(total_pages)+1;
        }
        if(urldata.page_no==undefined)
            page_no = 1;
        
        else
            page_no = urldata.page_no;
        
        
        starting_index_of_limit = (per_page*page_no)-per_page;
        
        

        var products = await exe(`SELECT * FROM  product WHERE status ='approved' ORDER BY product_id DESC  LIMIT ${starting_index_of_limit},${per_page}`);
    }
    else
    {   
     var total_records = await exe(`SELECT COUNT(*) as ttl FROM product WHERE status ='approved' AND 
      product_name LIKE '%${search_key}%'ORDER BY product_id DESC `);
        total_records = total_records[0].ttl;
        console.log(total_records)
        per_page = 1;
        total_pages = total_records/per_page

        if(parseInt(total_pages)< total_pages)
        {
            total_pages = parseInt(total_pages)+1;
        }
        if(urldata.page_no==undefined)
            page_no = 1;
        
        else
            page_no = urldata.page_no;
        
       
        starting_index_of_limit = (per_page*page_no)-per_page;
        
        search_key = urldata.search;
        var products = await exe(`SELECT * FROM product WHERE status ='approved' AND
        product_name LIKE '%${search_key}%'ORDER BY product_id DESC`);
   
    }

    var company_info = await exe(`SELECT * FROM company_info`);
    var obj = {"company_info":company_info[0] ,"products":products, "search_key":search_key,"total_pages":total_pages,"page_no":page_no};
    res.render("user/product.ejs",obj);
});
router.get("/services",function(req,res){
    res.render("services.ejs");
});
router.get("/about",function(req,res){
    res.render("about.ejs");
});
router.get("/blog",function(req,res){
    
    res.render("blog.ejs");
});
router.get("/contact",function(req,res){
    res.render("contact.ejs");
});
router.get("/cart",checkUserLogin, async function(req,res){
    
    var company_info = await exe(`SELECT * FROM company_info`);
    var carts =  await exe(`SELECT * FROM user_cart,product WHERE user_cart.product_id = product.product_id AND
     user_cart.user_id = '${req.session.user_id}'`);
    var obj = {"company_info":company_info[0] ,"carts":carts};
    res.render("user/cart.ejs",obj);
});

router.get("/register", async function(req,res){
    var company_info = await exe(`SELECT * FROM company_info`)
    var obj = {"company_info":company_info[0]};
    res.render("user/register.ejs",obj);

});

router.post("/save_account",async function(req,res){
    var d = req.body;
    // var sql = ` CREATE TABLE user(user_id INT PRIMARY KEY AUTO_INCREMENT,user_name VARCHAR(50),user_mobile VARCHAR(50),user_email VARCHAR(50),user_password VARCHAR(100))`;

    var sql = ` INSERT INTO user(user_name,user_mobile,user_email,user_password) VALUES ('${d.user_name}','${d.user_mobile}','${d.user_email}','${d.user_password}')  `


    var data = await exe(sql);
    // res.send(data);
    res.redirect("/login");
});

router.get("/login",async function(req,res){
    var company_info = await exe(`SELECT * FROM company_info`)
    var obj = {"company_info":company_info[0]};
    res.render("user/login.ejs",obj);

});

router.post("/login_account", async function(req,res){

    var d = req.body;
    var sql = ` SELECT * FROM user  WHERE user_email = '${d.user_email}'  AND user_password = '${d.user_password}' `;
    var data = await exe(sql);

    // res.send(data);

    if(data.length > 0)
    {
        req.session.user_id = data[0].user_id;
        res.redirect("/profile");
    }
    else
    {
        res.redirect("/login");
    }
})
    function checkUserLogin(req,res,next)
    {   
        // req.session.user_id = 1;
        if(req.session.user_id ==undefined)
        res.redirect("/login");
        else
            next();
    };
router.get("/profile",checkUserLogin, async function(req,res){
    var company_info = await exe(`SELECT * FROM company_info`)
    var obj = {"company_info":company_info[0]};
    res.render("user/profile.ejs",obj);
});

router.get("/product_details/:id",checkUserLogin,async function(req,res){

    var company_info = await exe(`SELECT * FROM company_info`);
    var product_info = await exe(`SELECT * FROM product,product_category WHERE product_category.product_category_id = 
    product.product_category_id  AND product_id ='${req.params.id}'`);
                                    
        
    var obj = {"company_info":company_info[0] ,"product_info":product_info[0]};
    res.render("user/product_details.ejs",obj)
});

router.post("/add_to_cart",async function(req,res){

    var user_id = req.session.user_id
    
    var product_id = req.body.product_id

    var data = await exe(`SELECT * FROM user_cart WHERE user_id = '${user_id}' AND product_id = '${product_id}'`);
    if(data.length == 0)
    {
    var qty = req.body.quant
    var sql = `INSERT INTO user_cart(user_id , product_id ,qty) VALUES ('${user_id}','${product_id}','${qty}')`;
    var data = await exe(sql);
    }
    // res.send(req.body);
    res.redirect("/product");

});

router.get("/remove_cart/:id",async function(req,res){
    var sql = `DELETE FROM user_cart WHERE cart_id = '${req.params.id}'`;
    var data = await exe(sql);
    // res.send(data);
    res.redirect("/cart")
});
router.post("/update_cart_qty", async function(req,res){

    // var sql = `UPDATE user_cart SET qty='${req.body.qty}'
    // WHERE cart_id = '${req.body.cart_id}'`;
    // var data = await exe(sql)
    res.send(req.body);

});
router.get("/checkout",async function(req,res){
    var company_info = await exe(`SELECT * FROM company_info`);
    
    var carts =  await exe(`SELECT * FROM user_cart,product WHERE user_cart.product_id = product.product_id AND
    user_cart.user_id = '${req.session.user_id}'`);

    var obj = {"company_info":company_info[0],"carts":carts};
    res.render("user/checkout.ejs",obj);
});

router.post("/process_checkout",checkUserLogin,async function (req,res){
    
    var user_cart = await exe(`SELECT SUM(qty*product_price) as total  FROM user_cart,product WHERE user_cart.product_id = product.product_id AND user_cart.user_id = '${req.session.user_id}'`)
    // var sql = `CREATE TABLE transaction(transaction_id INT PRIMARY KEY AUTO_INCREMENT, date Date , payment_status VARCHAR(20) , payment_amount INT , user_id INT )`

    if(user_cart[0].total>0)
    {

    var today = new Date().toISOString().slice(0,10);
    var sql = `INSERT INTO transaction(payment_type,date,payment_status,payment_amount,user_id) VALUES 
    ('${req.body.payment}','${today}','pending','${user_cart[0].total}','${req.session.user_id}')   `

    var data = await exe(sql)
    var transaction_id = data.insertId;

    var carts = await exe(`SELECT * FROM user_cart,product WHERE user_cart.product_id = product.product_id AND user_cart.user_id = '${req.session.user_id}'`);

    for(var i=0;i<carts.length;i++)
    {
        var order = {

            "fname":req.body.fname,
            "lname":req.body.lname,
            "email":req.body.email,
            "mobile":req.body.mobile,
            "state":req.body.state,
            "address1":req.body.address1,
            "address2":req.body.address2,
            "postal":req.body.postal,
            "payment_type":req.body.payment,
            "product_id":carts[i].product_id,
            "qty":carts[i].qty,
            "product_name":carts[i].product_name,
            "product_price":carts[i].product_price,
            "order_price":carts[i].product_price*carts[i].qty,

            "transaction_id":transaction_id,
            "order_status":"pending",
             "order_date":today,
             "dispatch_date":"",
             "deliver_date": "",
             "cancel_date":"",
             "reject_date":"",
             "user_id":req.session.user_id
        };

        // var sql = `CREATE TABLE order_tbl(order_id INT PRIMARY KEY AUTO_INCREMENT ,order_id INT PRIMARY KEY AUTO_INCREMENT ,fname TEXT,lname TEXT,email TEXT,mobile  TEXT ,state  TEXT ,address1  TEXT ,address2  TEXT ,postal  TEXT ,payment_type  TEXT ,product_id  INT ,qty  INT ,product_name  TEXT ,transaction_id  INT ,order_status  TEXT ,order_date  TEXT ,dispatch_date  TEXT ,deliver_date  TEXT ,cancel_date  TEXT ,reject_date  TEXT)`
        var sql = `  INSERT INTO order_tbl(fname ,lname ,email ,mobile,state,address1,address2,postal,payment_type,product_id,qty,product_name,transaction_id,order_status,order_date,dispatch_date,deliver_date,cancel_date,reject_date,user_id,product_price,order_price) VALUES ( '${order.fname}', '${order.lname}', '${order.email}','${order.mobile}',
        '${order.state}','${order.address1}','${order.address2}','${order.postal}','${order.payment_type}','${order.product_id}','${order.qty}','${order.product_name}','${order.transaction_id}','${order.order_status}','${order.order_date}',
        '${order.dispatch_date}','${order.deliver_date}','${order.cancel_date}','${order.reject_date}','${order.user_id}',
        '${order.product_price}','${order.order_price}')`
        
        var data = await exe(sql)
    }

     var sql = `DELETE FROM user_cart WHERE user_id = '${req.session.user_id}'`;
     var data = await exe(sql);

    if(req.body.payment =='online')
    {
        var obj = {"amount":user_cart[0].total,"transaction_id":transaction_id, "info":req.body};
        res.render("user/payment_page.ejs",obj);
    }
    else
    {
        res.redirect("/my_orders");
    }
    // res.send("Total =" + user_cart[0].total);
    
}
else
{
    res.send("Your Cart is Empty")
}

});

router.get("/my_orders",checkUserLogin,async function(req,res){

    var sql = `SELECT * FROM transaction,product,order_tbl WHERE order_tbl.transaction_id = transaction.transaction_id AND 
    order_tbl.user_id = '${req.session.user_id}' AND order_tbl.product_id = product.product_id `;
    var orders = await exe(sql);
    var company_info = await exe(`SELECT * FROM company_info`);
    var obj = {"company_info":company_info[0],"orders":orders };
    res.render("user/my_orders.ejs",obj);

});

router.post("/save_payment/:transaction_id",async function(req,res){
    var sql = `UPDATE transaction SET payment_id =  '${req.body.razorpay_payment_id}', payment_status = 'success'
    WHERE transaction_id = '${req.params.transaction_id}' `;
    var data = await exe(sql);
    // res.send(data);
    res.redirect("/my_orders");
});






module.exports = router;
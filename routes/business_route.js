var express = require("express")
var router = express.Router();
var exe = require("../connection.js");

router.get("/register", async function(req,res){
    var company_info = await exe(`SELECT * FROM company_info`)
    var obj = {"company_info":company_info[0]};
    res.render("business/register.ejs",obj);
});

router.post("/save_business",async function(req,res){
    // var sql =`CREATE TABLE business(business_id INT PRIMARY KEY AUTO_INCREMENT ,business_name VARCHAR(100),person_name VARCHAR(100),person_contact_no VARCHAR(20),business_email VARCHAR(50),business_password VARCHAR(100))`;
    var d = req.body;
    var sql =   `INSERT INTO business(business_name,person_name,person_contact_no,business_email,business_password) VALUES
    ('${d.business_name}','${d.person_name}','${d.person_contact_no}','${d.business_email}','${d.business_password}')`;
    var data = await exe(sql);
    // res.send(data);
    res.redirect("/business/login");    
});

router.get("/login", async function(req,res){
    var company_info = await exe(`SELECT * FROM company_info`)
    var obj = {"company_info":company_info[0]};
    res.render("business/login.ejs",obj);
});
router.post("/login_business_process",async function(req,res){
    var d =req.body;
    var sql =`SELECT * FROM business WHERE business_email='${d.business_email}' AND business_password= '${d.business_password}'`;
    var data = await exe(sql);

    if(data.length > 0)
    {
        req.session['business_id'] = data[0].business_id;
        res.redirect("/business/home")
    }
    else
    {
        res.redirect("/business/login");
    }
});

var checkLogin = function(req,res,next){
    // req.session.business_id=1;
    if(req.session.business_id == undefined)
        res.redirect("/business/login");
    else
        next();

}


router.get("/home",checkLogin,function(req,res){
    
    res.render("business/home.ejs");
});

router.get("/logout",checkLogin,function(req,res){
    res.redirect("/business/login");
});
router.get("/add_product",checkLogin, async function(req,res){

    var product_cate = await exe(`SELECT * FROM product_category`);
    var obj = {"product_cate":product_cate};
    res.render("business/add_product.ejs",obj);
})

router.post("/save_product", async function(req,res){
    var d = req.body;
    req.body.business_id = req.session.business_id;

    var product_image1= "";
    if(req.files.product_image1)
    {
        product_image1 = new Date().getTime()+req.files.product_image1.name;
        req.files.product_image1.mv("public/uploads/"+ product_image1);
    }
    

    var product_image2= "";
    if(req.files.product_image2)
    {
        product_image2 = new Date().getTime()+req.files.product_image2.name;
        req.files.product_image2.mv("public/uploads/"+ product_image2);
    }
    
 
    var product_image3= "";
    if(req.files.product_image3)
    {
        product_image3 = new Date().getTime()+req.files.product_image3.name;
        req.files.product_image3.mv("public/uploads/"+ product_image3);
    }
    
    


    // var sql = `CREATE TABLE product(product_id INT PRIMARY KEY AUTO_INCREMENT,product_name VARCHAR(100),product_price VARCHAR(100),product_dup_price VARCHAR(100),product_size VARCHAR(50),product_color VARCHAR(100),product_exchange VARCHAR(100),product_info VARCHAR(100))`;
    var sql = `INSERT INTO product(business_id,product_category_id,product_name,product_price,product_dup_price,product_size,product_color,product_exchange,product_info,product_image1,product_image2,product_image3,status,verified_date) VALUES
    ('${d.business_id}','${d.product_category_id}','${d.product_name}','${d.product_price}','${d.product_dup_price}','${d.product_size}','${d.product_color}','${d.product_exchange}','${d.product_info}','${product_image1}','${product_image2}','${product_image3}','pending','')`;
    var data = await exe(sql)
    // res.send(data);
    res.redirect("/business/add_product");
});

router.get("/product_list",checkLogin, async function(req,res){
    var sql = (`SELECT * FROM product WHERE business_id = '${req.session.business_id}' `);
    var products = await exe(sql);
    var obj = {"productss":products};
    res.render("business/product_list.ejs",obj);
});

router.get("/pending_orders", checkLogin, async function(req,res){

    var orders = await exe(`SELECT * FROM transaction,product,business,order_tbl WHERE 
    order_tbl.transaction_id=transaction.transaction_id AND order_tbl.product_id=product.product_id AND
     product.business_id = business.business_id  AND business.business_id = '${req.session.business_id}' 
     AND order_status = 'pending' `);
    var obj = {"orders":orders};
    res.render("business/orders.ejs",obj);

});


router.get("/order_det/:order_id",async function(req,res){

    var order_info = await exe(`SELECT * FROM transaction,product,business,order_tbl WHERE 
    order_tbl.transaction_id=transaction.transaction_id AND order_tbl.product_id=product.product_id AND
     product.business_id = business.business_id AND order_tbl.order_id = '${req.params.order_id}' `);

    var obj = {"order_info":order_info};
    res.render("business/order_det.ejs",obj); 

});

router.get("/dispatched_orders", checkLogin, async function(req,res){

    var orders = await exe(`SELECT * FROM transaction,product,business,order_tbl WHERE 
    order_tbl.transaction_id=transaction.transaction_id AND order_tbl.product_id=product.product_id AND
     product.business_id = business.business_id  AND business.business_id = '${req.session.business_id}' 
     AND order_status = 'dispatch' `);
    var obj = {"orders":orders};
    res.render("business/dispatched_orders.ejs",obj);

});

router.get("/transfer_order_in_dispatch/:order_id",async function(req,res){

    var today = new Date().toISOString().slice(0,10);
    var sql = `UPDATE  order_tbl SET order_status = 'dispatch',dispatch_date ='${today}' 
    WHERE order_id = '${req.params.order_id}' `;
    var data = await exe(sql);
    // res.send(data);
    res.redirect("/business/order_det/"+req.params.order_id);

})
router.get("/transfer_order_in_deliver/:order_id",async function(req,res){

    var today = new Date().toISOString().slice(0,10);
    var sql = `UPDATE  order_tbl SET order_status = 'deliver',deliver_date ='${today}' 
    WHERE order_id = '${req.params.order_id}' `;
    var data = await exe(sql);
    // res.send(data);
    res.redirect("/business/order_det/"+req.params.order_id);

});
router.get("/transfer_order_in_reject/:order_id",async function(req,res){

    var today = new Date().toISOString().slice(0,10);
    var sql = `UPDATE  order_tbl SET order_status = 'deliver',deliver_date ='${today}' 
    WHERE order_id = '${req.params.order_id}' `;
    var data = await exe(sql);
    // res.send(data);
    res.redirect("/business/order_det/"+req.params.order_id);

});

router.get("/delivered_orders", checkLogin, async function(req,res){

    var orders = await exe(`SELECT * FROM transaction,product,business,order_tbl WHERE 
    order_tbl.transaction_id=transaction.transaction_id AND order_tbl.product_id=product.product_id AND
     product.business_id = business.business_id  AND business.business_id = '${req.session.business_id}' 
     AND order_status = 'deliver' `);
    var obj = {"orders":orders};
    res.render("business/delivered_orders.ejs",obj);

}); 



module.exports = router;

var express = require("express")
var router = express.Router();
var exe = require("../connection.js");
// const { reverse } = require("dns");
router.get("/",function(req,res){
    res.render("admin/home.ejs");
});

router.get("/manage_product_category",async function(req,res){

    var sql = ` SELECT * FROM product_category`;
    var data = await exe(sql)
    var obj = {"product_cate":data};
    res.render("admin/product_category.ejs",obj);
});

router.post("/save_product_category",async function(req,res){

     var d = req.body;
    // var sql = `CREATE TABLE product_category(product_category_id INT PRIMARY KEY AUTO_INCREMENT, product_category_name VARCHAR(100),product_category_details TEXT)`

    var sql =   `INSERT INTO product_category(product_category_name,product_category_details) VALUES ('${d.product_category_name}','${d.product_category_details}')`
    var data = await exe(sql);
    res.redirect("/admin/manage_product_category")

});

router.get("/edit_product_category/:id",async function(req,res){

    var sql = `SELECT * FROM product_category WHERE product_category_id =('${req.params.id}')`;
    var data = await exe(sql);
    var obj ={"edited_product":data};
    res.render("admin/edit_product_category.ejs",obj);
});

router.post("/update_product_category", async function(req,res){
    var d = req.body;
    var sql =`UPDATE product_category
                 SET product_category_name = '${d.product_category_name}',
                     product_category_details ='${d.product_category_details}'  
                WHERE product_category_id= '${d.product_category_id}' `;
    var data = await exe(sql);
    // res.send(data);
    res.redirect("/admin/manage_product_category");
});


router.get("/delete_product_category/:id",async function(req,res){

    var sql =`DELETE FROM product_category WHERE product_category_id = '${req.params.id}' `;
    var data = await exe(sql);
    // res.send(data);
    res.redirect("/admin/manage_product_category");

});

router.get("/company_Info", async function(req,res){

    var data = await exe(`SELECT * FROM company_Info WHERE company_id = 1 `);
    var obj = {'company_info':data};
    res.render("admin/company_info.ejs",obj);



});

router.post("/company_info_update",async function(req,res){
    var d = req.body;

    if(req.files)
    {
        var file_name = new Date().getTime()+".png";
        req.files.company_logo.mv("public/uploads/"+file_name);
        var sql2 =`UPDATE company_info  SET company_logo='${file_name}' WHERE company_id = 1`;
        var data2 = await exe(sql2);

    }

    var sql = `UPDATE company_info SET 
    company_name = '${d.company_name}',
    company_details ='${d.company_details}',
    company_contact_no = '${d.company_contact_no}',
    company_contact_email = '${d.company_contact_email}',
    company_address  = '${d.company_address}',
    company_location = '${d.company_location}',
    company_facebook_link = '${d.company_facebook_link}',
    company_twitter_link = '${d.company_twitter_link}',
    company_whatsapp_link = '${d.company_whatsapp_link}',
    company_instagram_link = '${d.company_instagram_link}',
    company_linkedin_link = '${d.company_linkedin_link}',
    company_telegram_link = '${d.company_telegram_link}',
    company_youtube_link = '${d.company_youtube_link}' WHERE company_id = 1 `;

    var data = await exe(sql);
    // res.send(data);
    res.redirect("/admin/company_info");
});

router.get("/manage_slider", async function(req,res){

    var sql =`SELECT * FROM slider`;
    var data = await exe(sql);
    var obj = {"sliders":data};
    res.render("admin/manage_slider.ejs",obj);
});
router.post("/save_slider",async function(req,res){

     var file_name= new Date().getTime()+".png";
     req.files.slider_image.mv("public/uploads/" + file_name);
      var d =req.body;
    //  var sql = `CREATE TABLE slider(slider_id INT PRIMARY KEY AUTO_INCREMENT,slider_title VARCHAR(100),slider_button_text VARCHAR(200),slider_button_url VARCHAR(100),slider_image TEXT)`
        var sql = `INSERT INTO slider(slider_title,slider_button_text,slider_button_url,slider_image) VALUES
        ('${d.slider_title}','${d.slider_button_text}','${d.slider_button_url}','${file_name}')`;
     var data = await exe(sql);
    //  res.send(data);
    res.redirect("/admin/manage_slider");
});

router.get("/edit_slider/:id",async function(req,res){
    var sql = `SELECT * FROM slider WHERE slider_id = '${req.params.id}' `;
    var data = await exe(sql);
    var obj = {"slid":data};
    res.render("admin/edit_slider.ejs",obj);
});

router.post("/update_save_slider",async function(req,res){
     var d = req.body;

     if(req.files)
     {
         var file_name = new Date().getTime()+".png";
         req.files.slider_image.mv("public/uploads/"+file_name);
         var sql2 =`UPDATE slider  SET slider_image='${file_name}' WHERE slider_id = '${d.slider_id}'`;
         var data2 = await exe(sql2);
 
     }

    var sql = `UPDATE slider SET
     slider_title='${d.slider_title}',
    slider_button_text='${d.slider_button_text}',
    slider_button_url='${d.slider_button_url}' WHERE slider_id = '${d.slider_id}'`;

    var data = await exe(sql);
    // res.send(data);
    res.redirect("/admin/manage_slider");

});

router.get("/delete_slider/:id", async function(req,res){

    var sql = `DELETE FROM slider WHERE slider_id = '${req.params.id}'`;
    var data = await exe(sql);
    // res.send(data);
    res.redirect("/admin/manage_slider");

});

router.get("/pending_products", async function(req,res){

    var products = await exe(`SELECT * FROM product,product_category,business WHERE product_category.product_category_id = product.product_category_id  AND business.business_id = product.business_id AND product.status ='pending'`); 
    var obj = {"products":products};
    
    res.render("admin/pending_products.ejs",obj);
    
});

router.get("/approved_product", async function(req,res){

    var products = await exe(`SELECT * FROM product,product_category,business WHERE product_category.product_category_id = product.product_category_id  AND business.business_id = product.business_id AND product.status ='approved'`); 
    var obj = {"products":products};
    
    res.render("admin/approved_product.ejs",obj);

});
router.get("/review_product/:id", async function(req,res){

    var product_info = await exe(`SELECT * FROM product,product_category,business WHERE product_category.product_category_id = product.product_category_id  AND business.business_id = product.business_id  AND product_id = '${req.params.id}'` );
    var obj = {"product_info":product_info};

    res.render("admin/review_product.ejs",obj);
});
router.get("/approve_product/:id", async function(req,res){

    var today = new Date().toISOString().slice(0,10);
    console.log(today)
    var sql = `UPDATE product SET status = 'approved' ,  verified_date = '${today}' WHERE product_id = '${req.params.id}' `;
    var data = await exe(sql)
    // res.send(data)
    res.redirect("/admin/pending_products")  
});
router.get("/reject_product/:id",async function(req,res){
    var sql = (`DELETE FROM product WHERE product_id = '${req.params.id}'`);
    var data = await exe(sql)
    // res.send(data);
    res.redirect("/admin/pending_products")

});

router.get("/orders", async function(req,res){

    var orders = await exe(`SELECT * FROM transaction,product,business,order_tbl WHERE 
    order_tbl.transaction_id=transaction.transaction_id AND order_tbl.product_id=product.product_id AND
     product.business_id = business.business_id`);
    var obj = {"orders":orders};
    res.render("admin/orders.ejs",obj);

});

router.get("/order_det/:order_id",async function(req,res){

    var order_info = await exe(`SELECT * FROM transaction,product,business,order_tbl WHERE 
    order_tbl.transaction_id=transaction.transaction_id AND order_tbl.product_id=product.product_id AND
     product.business_id = business.business_id AND order_tbl.order_id = '${req.params.order_id}' `);

    var obj = {"order_info":order_info};
    res.render("admin/order_det.ejs",obj); 

});

router.get("/transfer_to_business/:order_id",function(req,res){
    res.render("admin/transfer_to_business.ejs",req.params);
})

router.post("/save_transfer_to_business", async function(req,res){
    // res.send(req.body);

    Business_payment_status = "transfered"
    transfer_no = req.body.transfer_no;
    var sql = ` UPDATE order_tbl SET Business_payment_status = '${Business_payment_status}',transfer_no = '${transfer_no}'
    WHERE order_id = '${req.body.order_id}'`;
    var data = await exe(sql);
    // res.send(data);
    res.redirect("/admin/orders");

})




module.exports = router;

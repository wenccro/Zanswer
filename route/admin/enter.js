const express=require('express');
const common=require('../../libs/common');
const mysql=require('mysql');

//链接池
var db=mysql.createPool({
	host: 'localhost',
	user:'root',
	password:'123456',
	database:'online_answer_db'
});

module.exports=function(){
	var router=express.Router();
	
	router.get('/',(req,res)=>{
		res.render('admin/enter.ejs',{});
	});
	
	router.post('/',(req,res)=>{
		var username=req.body.username;//得到登录名
		var userpwd=common.md5(req.body.password+common.MD5_SUFFIX)//将获取得到的密码通过相同的加密方式加密在和数据库的密码比较
		
		//console.log(username,userpwd);
		db.query(`SELECT * FROM admin_table WHERE username='${username}'`,(err, data)=>{
			if(err){
				console.log(err);
				res.status(500).send("database error").end();
			}else{
				if(data.length==0){
					res.status(400).send('no this admin').end();
				}else{
					if(data[0].userpwd==userpwd){
						req.session['admin_id']=data[0].ID;//登录成功就给admin_id赋值  作用是已登录就不用再登录了
						req.session['username']=data[0].username;//将用户名
						//console.log(data[0].username);
						res.redirect('/admin')//让其进去admin
					}else{
						res.status(400).send('this password is error').end();
					}
				}
			}
		});
	});
	return router;
}

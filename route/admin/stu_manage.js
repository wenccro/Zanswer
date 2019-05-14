const express=require('express');
const mysql=require('mysql');
var xlsx = require('node-xlsx');//处理导入的xls文件
const multer=require('multer');


//操作文件
const pathLib=require('path');
const fs=require('fs');
//链接池
var db=mysql.createPool({
	host:'localhost',
	user:'root',
	password:'123456',
	database:'online_answer_db'
});
//显示基本的信息
exports.showIndex=function(req,res){
	var router=express.Router();
	var i=parseInt(req.query.num);
	if(i==0){
		i=0;
	}else{
		i=i*5-5;
	}
	//console.log(i);
	db.query(`SELECT * FROM student_table limit `+i+`,5`,(err,data)=>{
		if(err){
			console.log(err);
			res.status(500).send('database error').end();
		}else if(data[0]==null){
			res.json({"result":-1})
		}else{
			res.json({"data":data,"result":1});
		}
	})
		
	return router;
}

//搜索框
exports.showSeek=function(req,res){
	var seek_in=req.query.seek;
	//console.log(seek_in);
	db.query(`SELECT * FROM student_table WHERE s_name='${seek_in}' or s_num='${seek_in}'`,(err,data)=>{
		if(err){
			console.log(err);
			res.status(500).send("database error").end();
		}else if(data.length==0){
			res.json({
				"result":-1
			})
		}else{
			res.json({
				"data":data
			})
		}
	});
}
//删除数据
exports.deleteStu=function(req,res){
	var id=req.body.id;
	//console.log(id);
	db.query(`DELETE FROM student_table WHERE ID=${id}`,(err,data)=>{
		if(err){
			console.error(err);
			res.status(500).send('database error').end();
		}else{
			res.json({"result":1})
		}
	});
}

//重置密码
exports.updataStu=function(req,res){
	var id=req.body.id;
	console.log(id);
	db.query(`UPDATE student_table SET s_pwd='111111' WHERE ID='${id}'`,(err,data)=>{
		if(err){
			conosle.log(err);
			res.status(500).send('database error').end();
		}else{
			res.json({"result":1});
		}
	})
}
//添加一个学生
exports.addStu=function(req,res){
	//console.log(req.body.s_num,req.body.s_class,req.body.s_name);
	db.query(`INSERT INTO student_table(s_num,s_class,s_name,s_pwd) VALUE('${req.body.s_num}','${req.body.s_class}','${req.body.s_name}','111111')`,(err,data)=>{
		if(err){
			console.log(err);
			res.status(500).send("database error").end();
		}else{
			res.json({"result":1})
		}
	})
}

//为全选  删除开接口
exports.delete_xStu=function(req,res){
	//console.log(req.body.s_id);
	var ids=req.body.s_id;//
	var iss=[];
	var orr=1;
	if(typeof ids=='string'){
		iss.push(parseInt(ids));
	}else{
		for(var z=0;z<ids.length;z++){
			iss.push(parseInt(ids[z]));
		}
	}
	//console.log(iss);
	for(var i=0;i<iss.length;i++){
		db.query(`DELETE FROM student_table WHERE ID=${iss[i]}`,(err,data)=>{
			if(err){
				console.error(err);
				res.status(500).send('database error').end();
				orr=0;
			}
		});	
	}
	if(orr==1){
		res.json({"result":1})
	}else{
		res.json({"result":-1})
	}
	
}

//为全选  重置密码
exports.reset_xStu=function(req,res){
	//console.log(req.body.s_id);
	var ids=req.body.s_id;//
	var is=[];
	var orr=1;
	for(var z=0;z<ids.length;z++){
		is.push(parseInt(ids[z]));
	}
	for(var i=0;i<is.length;i++){
		db.query(`UPDATE student_table SET s_pwd='111111' WHERE ID=${is[i]}`,(err,data)=>{
			if(err){
				console.error(err);
				res.status(500).send('database error').end();
				orr=0;
			}
		});	
	}
	if(orr==1){
		res.json({"result":1})
	}else{
		res.json({"result":-1})
	}
	
}


//导入开模块
exports.lend_in=function(req,res){
	var orr=1;
	if(req.files[0]){
		var ext=pathLib.parse(req.files[0].originalname).ext;//接收图片的后缀
		var oldPath=req.files[0].path;//获取 图片位置信息
		var newPath=req.files[0].path+ext;//获取图片位置信息+后缀
		var newFileName=req.files[0].filename+ext;//获取图片名字+后缀
	}else{
		var newFileName=null;
	}
	if(newFileName){
		fs.rename(oldPath,newPath,(err)=>{
			if(err){
				console.log(err);
			}else{
				//var newFileName=req.files[0].filename;
				 //read from a file
			   	var filename='./static/upload/'+newFileName; 
				var obj = xlsx.parse(filename);
				var file_data=obj[0].data;
				//console.log(file_data);
				for(var i=1;i<file_data.length;i++){
					//console.log(file_data[i][2]);
					db.query(`INSERT INTO student_table(s_num,s_name,s_class,s_pwd) VALUE('${file_data[i][0]}','${file_data[i][1]}','${file_data[i][2]}','111111')`,(err,data)=>{
						if(err){
							console.log(err);
							res.status(500).send("database error").end();
							orr==0;
						}
					});
				}
				if(orr){
					res.json({"result":{message:"文件上传成功!"}});
				}else{
					res.json({"result":{message:"文件上传失败!"}});
				}
			}
		})
	}
			
}

//课程匹配页面
exports.showStu_course=function(req,res){
	var obj={
		ke:[],
		rel:[]
	}
	new Promise(function(resolve,reject){
		db.query(`SELECT ID,c_name from course_table`,(err,data)=>{
			if(err){
				console.log(err);
				res.status(500).send("database error").end();
			}else{
				//console.log(data);
				for(var i=0;i<data.length;i++){
					obj.ke.push({
						id:0,
						c_name:''
					});
					obj.ke[i].id=data[i].ID;
					obj.ke[i].c_name=data[i].c_name;
				}
				resolve();
			}
		})
	}).then(function(){
		var flag=0;
		for(var i=0;i<9;i++){
			obj.rel.push({
				num:i+1,
				c_id:0
			});
			(function(i){//去掉重复的
				db.query(`SELECT distinct c_ID from student_table where s_num like '20____${i+1}%' and s_num<>'nciae2018'`,(err,data)=>{
					flag++;
					if(data.length==0){
						obj.rel[i].c_id=0;
					}else{	
						obj.rel[i].c_id=data[0].c_ID;//整个班就拿中的一条数据作为参考
					}
					if(flag==9){
						res.json({"data":obj})
					}
				})
			})(i)
		}
	})
}

//修改学生情况里面的课程
exports.Updata_course=function(req,res){
	var num=req.body.num;
	var c_id=req.body.c_id;
	var flag=1;
	//console.log(num,c_id);
	//先查询有无院系学生
	new Promise(function(resolve,reject){
		db.query(`SELECT distinct c_ID from student_table where s_num like '20____${num}%' and s_num<>'nciae2018'`,(err,data)=>{
			if(data.length==0){
				flag=0;
			}
			resolve(flag);
		})
	}).then(function(value){
		//更新学生
		if(value==0){
			res.json({"result":-1});
		}else{
			db.query(`UPDATE student_table SET c_ID=${c_id} where s_num like '20____${num}%'`,(err)=>{
				if(err){
					console.log(err);
					res.status(500).send("database error").end();
				}else{
					res.json({"result":1});
				}
			})
		}
	})
}

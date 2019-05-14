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

//学生课程服务程序
exports.showCourse=function(req,res){
	var c_dage=req.query.num;
	//console.log(c_dage);
	var i=parseInt(req.query.num);
	if(i==0){
		i=0;
	}else{
		i=i*10;
	}
	db.query(`SELECT * FROM course_table limit `+i+`,10`,(err,data)=>{
		if(err){
			console.log(err);
			res.status(500).send('database error').end();
		}else if(data[0]==null){
			res.json({"result":-1})
		}else{
			res.json({
				'data':data
			});
		}
	})
}

//删除数据
exports.deleteCou=function(req,res){
	var id=req.body.id;
	console.log(id);
	db.query(`DELETE FROM course_table WHERE ID=${id}`,(err,data)=>{
		if(err){
			console.error(err);
			res.status(500).send('database error').end();
		}else{
			res.json({"result":1})
		}
	});
}
//增加课程,拿到除照片以外的内容
exports.addCou=function(req,res){
	//console.log(7777);
	var c_name=req.body.c_name;
	var c_year=req.body.c_year
	var c_semester=req.body.c_semester	
	var c_open_time=req.body.c_open_time
	var c_close_time=req.body.c_close_time
	//console.log(req.body.c_name,c_year,c_semester,c_semester,c_open_time,c_close_time);
	var open_t=c_open_time.split("/");
	var close_t=c_close_time.split("/");
		c_open_time=open_t[2]+'-'+open_t[0]+'-'+open_t[1];
		c_close_time=close_t[2]+'-'+close_t[0]+'-'+close_t[1];
	//将除图片以外的内容传入数据库
	db.query(`INSERT INTO course_table(c_name,c_year,c_semester,c_open_time,c_close_time) VALUE('${c_name}','${c_year}','${c_semester}','${c_open_time}','${c_close_time}')`,(err,data)=>{
		if(err){
			console.log(err);
			res.status(500).send("database error").end();
		}else{
			res.json({"data":data})
		}
	})
}
//增加课程-图片
exports.addCouImg=function(req,res){
//	console.log(88888);
//	console.log(req.query);
//	console.log(req.query.id);
//	console.log(req.files[0]);
	var c_id=parseInt(req.query.id);
	//console.log(c_id);
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
				//修改数据库
				db.query(`UPDATE course_table SET c_img='${newFileName}' where ID=${c_id}`,(err,data)=>{
					if(err){
						console.error(err);
						res.status(500).send('database error').end();
					}else{
						res.json({"result":1})
					}
				});
			}
		})
	}
		
}

//为每一次添加课程，动态添加一条默认第0章
exports.addMTest=function(req,res){
	var c_id=req.body.c_id;//课程id
	var ch_num=0;
	//console.log(c_id);
	db.query(`INSERT INTO chapter_table(c_ID,ch_num) VALUE('${c_id}','${ch_num}')`,(err,data)=>{
		if(err){
			console.log(err);
			res.status(500).send("database error").end();
		}else{
			res.json({"data":data})
		}
	})
}
//为每一次添加课程，动态添加一条第0章，第一题
exports.addZTest=function(req,res){
	var z_id=req.body.z_id;//章节id
	console.log(z_id);
	db.query(`INSERT INTO test_table(ch_ID) VALUE('${z_id}')`,(err,data)=>{
		if(err){
			console.log(err);
			res.status(500).send("database error").end();
		}else{
			res.json({"result":1})
		}
	})
}

//将要修改是数据先发送过去
exports.replaceCou=function(req,res){
	var id=parseInt(req.body.id);
	console.log(id);
	db.query(`SELECT * FROM course_table WHERE ID=${id}`,(err,data)=>{
		if(err){
			console.log(err);
			res.status(500).send("database error").end();
		}else{
			res.json({
				"data":data
			})
		}
	})
}
//修改课程
exports.alterCou=function(req,res){
	var id=req.body.id;
	console.log(id);
	var c_name=req.body.c_name;
	var c_year=req.body.c_year
	var c_semester=req.body.c_semester	
	var c_open_time=req.body.c_open_time
	var c_close_time=req.body.c_close_time
	console.log(req.body.c_name,c_year,c_semester,c_open_time,c_close_time);
	//修改课程内容
	db.query(`UPDATE course_table SET c_name='${c_name}',c_year='${c_year}',c_semester='${c_semester}',c_open_time='${c_open_time}',c_close_time='${c_close_time}' WHERE ID=${id}`,(err,data)=>{
		if(err){
			cosele.error(err);
			res.status(500).send('database error').end();
		}else{
			res.json({'result':1});
		}
	})
}

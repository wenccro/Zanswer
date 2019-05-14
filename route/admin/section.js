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

//显示章节有一个问题，就是数据库必须之前有一条数据才能，找到课程。所有修改就在sql语句这里
//解决办法，可以在添加课程的时候，动态添加一条ch_num=0;的带有课程id的默认章节开始

exports.showSection=function(req,res){
	//var num_page=req.query.num;//获取请求页面
	//console.log(num_page);
	//先建立一个数字
	var section_data=[];
	var section=[];//去掉null的部分
//	var i=parseInt(req.query.num);
//	if(i==0){
//		i=0;
//	}else{
//		i=i*10;
//	}
	var promise=new Promise(function(resolve, reject){
		db.query(`SELECT chapter_table.ID,chapter_table.c_ID,chapter_table.ch_num,chapter_table.ch_name,chapter_table.ch_open_time,chapter_table.ch_close_time,course_table.c_name FROM chapter_table,course_table where chapter_table.c_ID = course_table.ID`,(err,data)=>{
			if(err){
				console.log(err);
				res.status(500).send('database error').end();
			}else if(data[0]==null){
				res.json({"result":-1})
			}else{
				//console.log(data);
				//console.log(data.length);
				for(var i=0;i<data.length;i++){
					
					section_data.push({});
					section_data[i].ID=data[i].ID;//章节id
					section_data[i].c_id=data[i].c_ID;//课程id
					section_data[i].ch_num=data[i].ch_num;//章节序号
					section_data[i].ch_name=data[i].ch_name;//章节名称
					section_data[i].c_name=data[i].c_name;//课程名称
					section_data[i].ch_open_time=data[i].ch_open_time;//章节开发时间
					section_data[i].ch_close_time=data[i].ch_close_time;//章节关闭时间

				}
				//console.log(section_data);
				resolve(section_data);
			}
		});
		
	}).then(function(value){
		//console.log(value);
		//console.log(section_data);
		return new Promise(function(resolve,reject){
			db.query(`SELECT ch_ID,count(*) FROM test_table,chapter_table,course_table where test_table.ch_ID=chapter_table.ID and chapter_table.c_ID=course_table.ID group by ch_ID`,(err,data)=>{
				if(err){
					console.log(err);
					res.status(500).send("database error").end();
				}else if(data[0]==null){
					res.json({"result":-1})
				}else{
						for(var i=0;i<data.length;i++){
							section_data[i].ch_ID=data[i].ch_ID;//章节id
							section_data[i].ti_num=data[i]['count(*)'];//数量
						}
					resolve(section_data);
				}
			});
	
		});
	}).then(function(value){
		section=section_data;
		//console.log(section);
		res.json({'data':section,'result':1})
	})
}

//添加章节
exports.addSection=function(req,res){
	var c_id=req.body.c_id;
	var zj_num=req.body.zj_num;
	var zj_name=req.body.zj_name;
		zj_name="第"+zj_num+"章-"+zj_name;
	var z_open_time=req.body.z_open_time;
	var z_close_time=req.body.z_close_time;
	var open_t=z_open_time.split("/");
	var close_t=z_close_time.split("/");
		z_open_time=open_t[2]+'-'+open_t[0]+'-'+open_t[1];
		z_close_time=close_t[2]+'-'+close_t[0]+'-'+close_t[1];
	console.log(c_id,zj_num,zj_name,z_open_time,z_close_time);
	
	//将内容添加到数据库中
	db.query(`INSERT INTO chapter_table(ch_num,ch_name,c_ID,ch_open_time,ch_close_time) VALUE('${zj_num}','${zj_name}','${c_id}','${z_open_time}','${z_close_time}')`,(err,data)=>{
		if(err){
			console.log(err);
			res.status(500).send("database error").end();
		}else{
			res.json({"data":data})
		}
	});
}

//为每一章节添加一条默认的试题
exports.addMTest=function(req,res){
	var ch_id=req.body.ch_id;
	//console.log(ch_id);
	db.query(`INSERT INTO test_table(ch_ID) VALUE('${ch_id}')`,(err,data)=>{
		if(err){
			console.log(err);
			res.status(500).send("database error").end();
		}else{
			res.json({"result":1})
		}
	})
}
//删除章节
exports.deleteSection=function(req,res){
	var id=req.body.id;
	//console.log(id);
	db.query(`DELETE FROM chapter_table WHERE ID=${id}`,(err,data)=>{
		if(err){
			console.error(err);
			res.status(500).send('database error').end();
		}else{
			res.json({"result":1})
		}
	});
}
//删除所选
exports.delete_xSec=function(req,res){
	console.log(req.body.s_id);
	var ids=req.body.s_id;
	var iss=[];//用于将所选的字符串都转换为int型数组
	var orr=1;//用于标志for循环中是否有某一个错误
	if(typeof ids=='string'){
		iss.push(parseInt(ids));
	}else{
		for(var z=0;z<ids.length;z++){
			iss.push(parseInt(ids[z]));
		}
	}
	//console.log(iss);
	for(var i=0;i<iss.length;i++){
		db.query(`DELETE FROM chapter_table WHERE ID=${iss[i]}`,(err,data)=>{
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
//修改章节内容
exports.alterSection=function(req,res){
	var id=req.body.id;
	//console.log(id);
	var c_id=req.body.c_id;
	var zj_num=req.body.zj_num;
	var zj_name=req.body.alt_name;
		zj_name="第"+zj_num+"章-"+zj_name;
	var z_open_time=req.body.alt_op;
	var z_close_time=req.body.alt_cl;
	var open_t=z_open_time.split("/");
	var close_t=z_close_time.split("/");
		z_open_time=open_t[2]+'-'+open_t[0]+'-'+open_t[1];
		z_close_time=close_t[2]+'-'+close_t[0]+'-'+close_t[1];
	//console.log(id,c_id,zj_name,zj_num,z_open_time,z_close_time);
	//修改课程内容								ch_num,ch_name,c_ID,ch_open_time,ch_close_time
	db.query(`UPDATE chapter_table SET ch_name='${zj_name}',ch_num='${zj_num}',c_ID='${c_id}',ch_open_time='${z_open_time}',ch_close_time='${z_close_time}' WHERE ID=${id}`,(err,data)=>{
		if(err){
			cosele.error(err);
			res.status(500).send('database error').end();
		}else{
			res.json({'result':1});
		}
	})
}

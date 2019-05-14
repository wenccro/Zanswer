const express=require('express');
const mysql=require('mysql');
var xlsx = require('node-xlsx');//处理导入的xls文件
var formidable=require("formidable");

//操作文件
const pathLib=require('path');
const fs=require('fs');
//链接池
var db=mysql.createPool({
	host:'localhost',
	user:'root',
	password:'123456',
	database:'online_answer_db'
})
//显示具体信息的
exports.showIndex=function(req,res){
	var page_num=req.query.num;
	//console.log(page_num);
	var i=parseInt(req.query.num);
	if(i==0){
		i=0;
	}else{
		i=(i-1)*10;
	}
	var test_data=[];
	var promise=new Promise(function(resolve, reject){
		db.query(`SELECT course_table.c_name,chapter_table.ch_num,test_gaicuo_table.ID,test_gaicuo_table.t_title FROM chapter_table,course_table,test_gaicuo_table where chapter_table.c_ID = course_table.ID and test_gaicuo_table.ch_ID=chapter_table.ID and chapter_table.ch_num!=0 and test_gaicuo_table.t_title!='null' limit `+i+`,10`,(err,data)=>{
			if(err){
				console.log(err);
				res.status(500).send('database error').end();
			}else if(data[0]==null){
				res.json({"result":-1})
			}else{
				//onsole.log(data);
				for(var i=0;i<data.length;i++){
					test_data.push({});
					test_data[i].t_id=data[i].ID;//试题id
					test_data[i].ch_num=data[i].ch_num;//章节序号
					test_data[i].c_name=data[i].c_name;//课程名称
					var title=delHtmlTag(data[i].t_title);
					test_data[i].t_title=title;//试题的标题
				}
				//去掉所有的html标签
				function delHtmlTag(str)
				{
				    var strs=str.replace(/<[^>]+>/g,"");//去掉所有的html标记
				    for(var i=0;i<strs.length;i++){
				    	strs=strs.replace('&lt;','<');
				    	strs=strs.replace('&gt;','>');
				    	strs=strs.replace('&nbsp;',' ');
				    	strs=strs.replace('&quot;','"');
				    }
				    return strs;
				}
				//console.log(test_data);
				resolve(test_data);
			}
		});
	}).then(function(value){
		//console.log(test_data);
		res.json({'data':test_data,'result':1})
	})
}
//用来应付index 页面里的试题添加 a标签的请求  跳转页面
exports.addPage=function(req,res){
	res.render('admin/test_reform_add.ejs',{});
}
//用来应付window.location重置的路径
exports.alterPage=function(req,res){
	res.render('admin/test_reform_alter.ejs',{});
}
//添加改错题
exports.addIndex=function(req,res){
	var t_title=req.body.t_title;
	var t_answer=req.body.t_answer;
	var t_explain=req.body.t_explain;
	var blank_count=req.body.blank_count;
	var ch_ID=req.body.ch_ID;
	//console.log(t_title,t_answer,t_explain,blank_count,ch_ID)
	db.query(`INSERT INTO test_gaicuo_table(t_title,t_answer,t_explain,blank_count,ch_ID) VALUE('${t_title}','${t_answer}','${t_explain}','${blank_count}','${ch_ID}')`,(err,data)=>{
		if(err){
			console.log(err);
			res.status(500).send("database error").end();
		}else{
			res.json({"result":1})
		}
	})	
}
//删除
exports.deleteTest=function(req,res){
	var t_id=req.body.id;
	console.log(t_id);
	db.query(`DELETE FROM test_gaicuo_table WHERE ID=${t_id}`,(err,data)=>{
		if(err){
			console.error(err);
			res.status(500).send('database error').end();
		}else{
			res.json({"result":1})
		}
	});	
}
//修改改错题页面时将基本信息发送回去
exports.alterShow=function(req,res){
	var t_id=req.body.t_id;
	//console.log(t_id);
	var alter_data=[];
	//先拿到标题
	var promise=new Promise(function(resolve,reject){
		db.query(`SELECT chapter_table.ch_name,course_table.c_name from chapter_table,course_table,test_gaicuo_table where test_gaicuo_table.ID='${t_id}' and test_gaicuo_table.ch_ID=chapter_table.ID and chapter_table.c_ID=course_table.ID`,(err,data)=>{
			if(err){
				console.error(err);
				res.status(500).send('database error').end();
			}else{
				for(var i=0;i<data.length;i++){
					alter_data.push({});
					alter_data[i].ch_name=data[i].ch_name;
					alter_data[i].c_name=data[i].c_name;
				}
				resolve(alter_data);
			}
		})
	}).then(function(value){
		//拿到基本的数据
		return new Promise(function(resolve,reject){
			db.query(`SELECT * FROM test_gaicuo_table WHERE ID='${t_id}'`,(err,data)=>{
				if(err){
					console.error(err);
					res.status(500).send('database error').end();
				}else{
					for(var i=0;i<data.length;i++){
						alter_data[i].t_title=data[i].t_title;
						alter_data[i].t_explain=data[i].t_explain;
						alter_data[i].t_count=data[i].blank_count;
						alter_data[i].t_answer=data[i].t_answer;
					}
					resolve(alter_data);
				}
			});
		});
	}).then(function(value){
		//console.log(value);
		res.json({'data':value,'result':1})
	})
}
//修改改错题
exports.alterIndex=function(req,res){
	var t_id=req.body.t_id;
	var t_title=req.body.t_title;
	var t_answer=req.body.t_an;
	var t_explain=req.body.t_ex;
	//console.log(t_id,t_title,t_answer,t_explain);
	db.query(`UPDATE test_gaicuo_table SET t_title='${t_title}',t_answer='${t_answer}',t_explain='${t_explain}' where ID='${t_id}'`,(err,data)=>{
		if(err){
			cosele.error(err);
			res.status(500).send('database error').end();
		}else{
			res.json({'result':1});
		}
	})
}
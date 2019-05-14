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

//响应前台发送过来的拉取数据的请求
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
	//console.log(i);
	//先将课程和章节id相同的数据拿出来
	var promise=new Promise(function(resolve, reject){
		db.query(`SELECT course_table.c_name,chapter_table.ch_num,chapter_table.c_ID,test_table.ID,test_table.t_title,test_table.t_score,test_table.t_degree,test_table.ch_ID FROM chapter_table,course_table,test_table where chapter_table.c_ID = course_table.ID and test_table.ch_ID=chapter_table.ID and chapter_table.ch_num!=0 and test_table.t_title!='null' limit `+i+`,10`,(err,data)=>{
			if(err){
				console.log(err);
				res.status(500).send('database error').end();
			}else if(data[0]==null){
				res.json({"result":-1})
			}else{
				//console.log(data);
				for(var i=0;i<data.length;i++){
					test_data.push({});
					test_data[i].z_id=data[i].ch_ID;//章节id
					test_data[i].c_id=data[i].c_ID;//课程id
					test_data[i].t_id=data[i].ID;//试题id
					test_data[i].ch_num=data[i].ch_num;//章节序号
					test_data[i].c_name=data[i].c_name;//课程名称
					var title=delHtmlTag(data[i].t_title);
					test_data[i].t_title=title;//试题的标题
					test_data[i].t_score=data[i].t_score;//分值
					if(data[i].t_degree==1){
						test_data[i].t_degree='低';//难度系数
					}else if(data[i].t_degree==2){
						test_data[i].t_degree='中';//难度系数
					}else{
						test_data[i].t_degree='难';//难度系数
					}
					
				}
				//去掉所有的html标签
				function delHtmlTag(str)
				{
				    var strs=str.replace(/<[^>]+>/g,"");//去掉所有的html标记
				    for(var i=0;i<strs.length;i++){
				    	strs=strs.replace('&lt;','<');
				    	strs=strs.replace('&gt;','>');
				    	strs=strs.replace('&nbsp;',' ');
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
//删除
exports.deleteTest=function(req,res){
	var t_id=req.body.id;
	db.query(`DELETE FROM test_table WHERE ID=${t_id}`,(err,data)=>{
		if(err){
			console.error(err);
			res.status(500).send('database error').end();
		}else{
			res.json({"result":1})
		}
	});
	
}
//用来应付index 页面里的试题添加 a标签的请求  跳转页面
exports.addPage=function(req,res){
	res.render('admin/test_add.ejs',{});
}
//用来应付window.location重置的路径
exports.alterPage=function(req,res){
	res.render('admin/test_alter.ejs',{});
}
//将数据在发送给增加页面
exports.addIndex=function(req,res){
	//console.log(8989);
	var test_data=[];
	//先将课程和章节id相同的数据拿出来
	var promise=new Promise(function(resolve, reject){
		db.query(`SELECT course_table.c_name,chapter_table.ch_num,chapter_table.c_ID,test_table.ch_ID FROM chapter_table,course_table,test_table where chapter_table.c_ID = course_table.ID and test_table.ch_ID=chapter_table.ID and chapter_table.ch_num!=0`,(err,data)=>{
			if(err){
				console.log(err);
				res.status(500).send('database error').end();
			}else if(data[0]==null){
				res.json({"result":-1})
			}else{
				//console.log(data);
				for(var i=0;i<data.length;i++){
					test_data.push({});
					test_data[i].z_id=data[i].ch_ID;//章节id
					test_data[i].c_id=data[i].c_ID;//课程id
					test_data[i].ch_num=data[i].ch_num;//章节序号
					test_data[i].c_name=data[i].c_name;//课程名称
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
//增加试题
exports.addTest=function(req,res){
	var z_id=req.body.z_id;
	var t_title=req.body.title;
	var t_option_a=req.body.t_a;
	var t_option_b=req.body.t_b;
	var t_option_c=req.body.t_c;
	var t_option_d=req.body.t_d;
	var t_answer=req.body.t_an;
	var t_explain=req.body.t_ex;
	//将内容添加到数据库中
	db.query(`INSERT INTO test_table(t_title,t_option_a,t_option_b,t_option_c,t_option_d,t_answer,t_explain,t_score,t_degree,ch_ID) VALUE('${t_title}','${t_option_a}','${t_option_b}','${t_option_c}','${t_option_d}','${t_answer}','${t_explain}','3','2','${z_id}')`,(err,data)=>{
		if(err){
			console.log(err);
			res.status(500).send("database error").end();
		}else{
			res.json({"result":1})
		}
	});
}

//将对应的数据  发送到修改数据里面
exports.alterShow=function(req,res){
	var t_id=req.body.t_id;
	test_DI=[];
	var promise=new Promise(function(resolve, reject){
		db.query(`SELECT * from test_table where ID='${t_id}'`,(err,data)=>{
			if(err){
				console.error(err);
				res.status(500).send('database error').end();
			}else{
				//console.log(data);
				for(var i=0;i<data.length;i++){
					test_DI.push({});
					test_DI[i].t_title=data[i].t_title;
					test_DI[i].t_option_a=data[i].t_option_a;
					test_DI[i].t_option_b=data[i].t_option_b;
					test_DI[i].t_option_c=data[i].t_option_c;
					test_DI[i].t_option_d=data[i].t_option_d;
					test_DI[i].t_answer=data[i].t_answer;
					test_DI[i].t_explain=data[i].t_explain;
				}
				resolve(test_DI);
			}
		});
	}).then(function(value){
		//console.log(test_data);
		return new Promise(function(resolve,reject){
			db.query(`SELECT chapter_table.ch_name,course_table.c_name from chapter_table,course_table,test_table where test_table.ID='${t_id}' and test_table.ch_ID=chapter_table.ID and chapter_table.c_ID=course_table.ID`,(err,data)=>{
				if(err){
					console.error(err);
					res.status(500).send('database error').end();
				}else{
					//console.log(data);
					for(var i=0;i<data.length;i++){
						test_DI[i].ch_name=data[i].ch_name;
						test_DI[i].c_name=data[i].c_name;
					}
					resolve(test_DI);
				}
			});
		});	
	}).then(function(value){
		//console.log(value);
		res.json({'data':test_DI,'result':1})
	})
}

//保存修改是数据
exports.alterUp=function(req,res){
	var t_id=req.body.t_id;
	var t_title=req.body.title;
	var t_option_a=req.body.t_a;
	var t_option_b=req.body.t_b;
	var t_option_c=req.body.t_c;
	var t_option_d=req.body.t_d;
	var t_answer=req.body.t_an;
	var t_explain=req.body.t_ex;
	
	db.query(`UPDATE test_table SET t_title='${t_title}',t_option_a='${t_option_a}',t_option_b='${t_option_b}',t_option_c='${t_option_c}',t_option_d='${t_option_d}',t_answer='${t_answer}',t_explain='${t_explain}' where ID='${t_id}'`,(err,data)=>{
		if(err){
			cosele.error(err);
			res.status(500).send('database error').end();
		}else{
			res.json({'result':1});
		}
	})
}

//试题的导入
exports.testLend=function(req,res){
	console.log(555);
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
			   	var filename='./static/upload/'+newFileName; 
				var obj = xlsx.parse(filename);
				var file_data=obj[0].data;
				var kc_zj_b=[];//用来存放上传上来的课程名字和章节
				var test_id=[];//用来存放数组id
				var test_data=[];//用来存放具体的试题内容和id
				//console.log(file_data);
				//console.log(file_data.length);
				for(var i=2,j=0;i<file_data.length;i++){
					kc_zj_b.push({});
					test_data.push({});
					kc_zj_b[j].kc=file_data[i][0];//课程名字
					kc_zj_b[j].zj=file_data[i][1];//课程章节
					test_data[j].t_title=file_data[i][2];//标题
					test_data[j].a=file_data[i][3];//a选项
					test_data[j].b=file_data[i][4];//b选项
					test_data[j].c=file_data[i][5];//c选项
					test_data[j].d=file_data[i][6];//d选项
					test_data[j].answer=file_data[i][7];//答案
					test_data[j].explain=file_data[i][8];//解释
					j++;
				}
				//console.log(kc_zj_b);
				//console.log(test_data);
				var promise=new Promise(function(resolve, reject){
					for(var i=0;i<kc_zj_b.length;i++){
						db.query(`SELECT chapter_table.ID FROM chapter_table,course_table where course_table.c_name='${kc_zj_b[i].kc}' and chapter_table.ch_num='${kc_zj_b[i].zj}' and course_table.ID=chapter_table.c_ID`,(err,data)=>{
							if(err){
								console.log(err);
								res.status(500).send("database error").end();
								orr=0;
							}else{	
								test_id.push(data[0].ID);
								if(test_id.length>3){//课程就三门课，这里用了偷懒的方法
									resolve(test_id);
								}
							}
						});
					}	
					
				}).then(function(value){
					//console.log(value);
					//将查询到的章节id添加到test_data数组中
					for(var j=0;j<value.length;j++){
						test_data[j].id=value[j];
					}
					//console.log(test_data);
					return new Promise(function(resolve,reject){
						//将内容添加到数据库中
						for(var i=0;i<test_data.length;i++){
							db.query(`INSERT INTO test_table(t_title,t_option_a,t_option_b,t_option_c,t_option_d,t_answer,t_explain,t_score,t_degree,ch_ID) VALUE('${test_data[i].t_title}','${test_data[i].a}','${test_data[i].b}','${test_data[i].c}','${test_data[i].d}','${test_data[i].answer}','${test_data[i].explain}','3','2','${test_data[i].id}')`,(err,data)=>{
								if(err){
									console.log(err);
									orr=0;
									res.status(500).send("database error").end();
								}else{
									orr=1;
									if(i==test_data.length){
										resolve(orr);
									}
								}
							});
						}
					})
				}).then(function(value){
					//console.log(value);
					if(orr){
						res.json({"result":{message:"文件上传成功!"}});
					}else{
						res.json({"result":{message:"文件上传失败!"}});
					}
				})

			}
		})
	}

}

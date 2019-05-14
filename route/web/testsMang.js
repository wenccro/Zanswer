const mysql=require('mysql');
const formidable=require('formidable');
const querystring=require('querystring');
var common=require('../../libs/common.js');
var db=mysql.createPool({
	host:'localhost',
	user:'root',
	password:'123456',
	database:'online_answer_db'
});
//已改
exports.getTenTests=function(req,res){
	var s_ID=parseInt(req.query.s_ID);
	var ch_ID=parseInt(req.query.ch_ID);
	if(!ch_ID || !s_ID){	
		res.status(400).json({"result":0,"err":"错误的章节ID或学生ID"});
		return;
	}
	var tenTests={
		danxuan:{
			test_type:1,
			count:0,
			tests:[]
		},
		tiankong:{
			test_type:2,
			count:0,
			tests:[]
		},
		panduan:{
			test_type:3,
			count:0,
			tests:[]
		},
		gaicuo:{
			test_type:4,
			count:0,
			tests:[]
		}
	};
	new Promise(function(resolve,reject){
		//获取单选题的数量
		db.query(`select count(*) from test_table where ch_ID=${ch_ID} and t_title is not null and ID not in (select test_ID from student_detail_table where s_ID=${s_ID} and test_type=1)`,(err,data)=>{
			if(err){
				res.status(500).json({"result":0,"err":"服务器出现错误"});
			}else{
				tenTests.danxuan.count=data[0]['count(*)'];
			}
			resolve();
		});
	}).then(function(){
		//获取填空题的数量
		return new Promise(function(resolve,reject){
			db.query(`select count(*) from test_fillblank_table where ch_ID=${ch_ID} and ID not in (select test_ID from student_detail_table where s_ID=${s_ID} and test_type=2)`,(err,data)=>{
				if(err){
					res.status(500).json({"result":0,"err":"服务器出现错误"});
				}else{
					tenTests.tiankong.count=data[0]['count(*)'];
				}
				resolve();
			});
		});
	}).then(function(){
		//获取判断题的数量
		return new Promise(function(resolve,reject){
			db.query(`select count(*) from test_panduan_table where ch_ID=${ch_ID} and ID not in (select test_ID from student_detail_table where s_ID=${s_ID} and test_type=3)`,(err,data)=>{
				if(err){
					res.status(500).json({"result":0,"err":"服务器出现错误"});
				}else{
					tenTests.panduan.count=data[0]['count(*)'];
				}
				resolve();
			});
		});
	}).then(function(){
		//获取程序改错题的数量
		return new Promise(function(resolve,reject){
			db.query(`select count(*) from test_gaicuo_table where ch_ID=${ch_ID} and ID not in (select test_ID from student_detail_table where s_ID=${s_ID} and test_type=4)`,(err,data)=>{
				if(err){
					res.status(500).json({"result":0,"err":"服务器出现错误"});
				}else{
					tenTests.gaicuo.count=data[0]['count(*)'];
				}
				resolve();
			});
		});
	}).then(function(){
		console.log(tenTests);
		return new Promise(function(resolve,reject){
			if(tenTests.danxuan.count>0){
				db.query(`select * from test_table where ch_ID=${ch_ID} and t_title is not null and ID not in (select test_ID from student_detail_table where s_ID=${s_ID} and test_type=1) limit 10`,function(err,data){
					if(err){
						console.log(err);
						res.status(500).json({"result":0,"err":"服务器出现错误"});
					}else{
						for(var i=0;i<data.length;i++){
							tenTests.danxuan.tests.push({
								test_ID:0,
								test_collection:0,
								test_type:1,
								t_options:[
									{name:'A',value:""},
									{name:'B',value:""},
									{name:'C',value:""},
									{name:'D',value:""}
								],
								t_answer:"",
								t_title:"",
								t_explain:""
							});
							tenTests.danxuan.tests[i].test_ID=data[i].ID;
							tenTests.danxuan.tests[i].t_explain=common.strReplace(data[i].t_explain);
							tenTests.danxuan.tests[i].t_title=common.strReplace(data[i].t_title);
							tenTests.danxuan.tests[i].t_options[0].value=common.strReplace(data[i].t_option_a);
							tenTests.danxuan.tests[i].t_options[1].value=common.strReplace(data[i].t_option_b);
							tenTests.danxuan.tests[i].t_options[2].value=common.strReplace(data[i].t_option_c);
							tenTests.danxuan.tests[i].t_options[3].value=common.strReplace(data[i].t_option_d);
							tenTests.danxuan.tests[i].t_answer=data[i].t_answer;
						}
					}
					if(tenTests.danxuan.count>=10){
						res.json({"result":1,"tenTests":tenTests});
						return;
					}else{
						return resolve();
					}
				});
			}else{
				return resolve();
			}
		})
	}).then(function(){
		return new Promise(function(resolve,reject){
			if(tenTests.tiankong.count>0){
				db.query(`select * from test_fillblank_table where ch_ID=${ch_ID} and ID not in (select test_ID from student_detail_table where s_ID=${s_ID} and test_type=2) limit ${10-tenTests.danxuan.count}`,function(err,data){
					if(err){
						console.log(err);
						res.status(500).json({"result":0,"err":"服务器出现错误"});
					}else{
						for(var i=0;i<data.length;i++){
							tenTests.tiankong.tests.push({
								test_ID:0,
								test_collection:0,
								test_type:2,
								t_title:"",
								blank_count:0,
								t_answer:"",
								t_explain:""
							});
							tenTests.tiankong.tests[i].test_ID=data[i].ID;
							tenTests.tiankong.tests[i].t_title=common.strReplace(data[i].t_title);
							tenTests.tiankong.tests[i].t_explain=common.strReplace(data[i].t_explain);
							tenTests.tiankong.tests[i].t_answer=data[i].t_answer;
							tenTests.tiankong.tests[i].blank_count=data[i].blank_count;
						}
					}
					if(parseInt(tenTests.tiankong.count)+parseInt(tenTests.danxuan.count)>=10){
						res.json({"result":1,"tenTests":tenTests});
						return;
					}else{
						resolve();
					}
				});
			}else{
				return resolve();
			}
		})
	}).then(function(){
		return new Promise(function(resolve,reject){
			if(tenTests.panduan.count>0){
				db.query(`select * from test_panduan_table where ch_ID=${ch_ID} and ID not in (select test_ID from student_detail_table where s_ID=${s_ID} and test_type=3) limit ${10-tenTests.danxuan.count-tenTests.tiankong.count}`,function(err,data){
					if(err){
						console.log(err);
						res.status(500).json({"result":0,"err":"服务器出现错误"});
					}else{
						for(var i=0;i<data.length;i++){
							tenTests.panduan.tests.push({
								test_ID:0,
								test_collection:0,
								test_type:3,
								t_title:"",
								t_answer:"",
								t_explain:""
							});
							tenTests.panduan.tests[i].test_ID=data[i].ID;
							tenTests.panduan.tests[i].t_title=common.strReplace(data[i].t_title);
							tenTests.panduan.tests[i].t_explain=common.strReplace(data[i].t_explain);
							tenTests.panduan.tests[i].t_answer=data[i].t_answer;
						}
					}
					if(parseInt(tenTests.tiankong.count)+parseInt(tenTests.danxuan.count)+parseInt(tenTests.gaicuo.count)>=10){
						res.json({"result":1,"tenTests":tenTests});
						return;
					}else{
						resolve();
					}
				});
			}else{
				return resolve();
			}
		});
	}).then(function(){
		if(tenTests.gaicuo.count>0){
			db.query(`select * from test_gaicuo_table where ch_ID=${ch_ID} and ID not in (select test_ID from student_detail_table where s_ID=${s_ID} and test_type=4) limit ${10-tenTests.danxuan.count-tenTests.tiankong.count-tenTests.panduan.count}`,function(err,data){
				if(err){
					console.log(err);
					res.status(500).json({"result":0,"err":"服务器出现错误"});
				}else{
					for(var i=0;i<data.length;i++){
						tenTests.gaicuo.tests.push({
							test_ID:0,
							test_collection:0,
							test_type:4,
							t_title:"",
							blank_count:0,
							t_answer:"",
							t_explain:""
						});
						tenTests.gaicuo.tests[i].test_ID=data[i].ID;
						tenTests.gaicuo.tests[i].t_title=common.strReplace(data[i].t_title);
						tenTests.gaicuo.tests[i].t_explain=common.strReplace(data[i].t_explain);
						tenTests.gaicuo.tests[i].t_answer=data[i].t_answer;
						tenTests.gaicuo.tests[i].blank_count=data[i].blank_count;
					}
					res.json({"result":1,"tenTests":tenTests});
					return;
				}
			});
		}else{
			res.json({"result":1,"tenTests":tenTests});
		}
	})
}
exports.getSomeChColTest=function(req,res){
	//获取某一个章节的收藏题目详情
	var ch_ID=parseInt(req.query.ch_ID);
	var s_ID=parseInt(req.query.s_ID);
	if(!ch_ID|| !s_ID ){
		res.status(400).json({"result":0,"err":"不合法的章节ID或者用户ID"});
		return;
	}
	var someChTest={
		"s_ID":s_ID,
		"ch_ID":ch_ID,
		"danxuan":{
			test_type:1,
			tests:[]
		},
		"tiankong":{
			test_type:2,
			tests:[]
		},
		"panduan":{
			test_type:3,
			tests:[]
		},
		"gaicuo":{
			test_type:4,
			tests:[]
		}
	};
	new Promise(function(resolve,reject){//获取本章节收藏的单选题目
		db.query(`select student_detail_table.test_ID,is_collection,t_explain,t_title,t_option_a,t_option_b,t_option_c,t_option_d,t_answer from student_detail_table,test_table where t_title is not null and test_table.ID=student_detail_table.test_ID and test_table.ch_ID=${ch_ID} and is_collection=1 and student_detail_table.s_ID=${s_ID} and test_type=1`,function(err,data){
			if(err){
				console.log(err);
				res.status(500).json({"result":0,"err":"服务器出现错误"});
			}else{
				for(var i=0;i<data.length;i++){
					someChTest.danxuan.tests.push({
						test_ID:0,
						is_collection:1,
						test_type:1,
						t_explain:"",
						t_title:"",
						t_options:[
							{name:'A',value:""},
							{name:'B',value:""},
							{name:'C',value:""},
							{name:'D',value:""}
						],
						t_answer:"",
					});
					someChTest.danxuan.tests[i].test_ID=data[i].test_ID;
					someChTest.danxuan.tests[i].is_collection=data[i].is_collection;
					someChTest.danxuan.tests[i].t_explain=common.strReplace(data[i].t_explain);
					someChTest.danxuan.tests[i].t_title=common.strReplace(data[i].t_title);
					someChTest.danxuan.tests[i].t_options[0].value=common.strReplace(data[i].t_option_a);
					someChTest.danxuan.tests[i].t_options[1].value=common.strReplace(data[i].t_option_b);
					someChTest.danxuan.tests[i].t_options[2].value=common.strReplace(data[i].t_option_c);
					someChTest.danxuan.tests[i].t_options[3].value=common.strReplace(data[i].t_option_d);
					someChTest.danxuan.tests[i].t_answer=data[i].t_answer;
				}
				resolve();
			}
		});
	}).then(function(){//获取本章节收藏的 填空 题目
		return new Promise(function(resolve,reject){
			db.query(`select student_detail_table.test_ID,is_collection,t_explain,t_title,t_answer,blank_count from student_detail_table,test_fillblank_table where t_title is not null and test_fillblank_table.ID=student_detail_table.test_ID and test_fillblank_table.ch_ID=${ch_ID} and is_collection=1 and student_detail_table.s_ID=${s_ID} and test_type=2`,function(err,data){
				if(err){
					console.log(err);
					res.status(500).json({"result":0,"err":"服务器出现错误"});
				}else{
					for(var i=0;i<data.length;i++){
						someChTest.tiankong.tests.push({
							test_ID:0,
							is_collection:1,
							test_type:2,
							t_title:"",
							blank_count:0,
							t_answer:"",
							t_explain:""
						});
						someChTest.tiankong.tests[i].test_ID=data[i].test_ID;
						someChTest.tiankong.tests[i].t_title=common.strReplace(data[i].t_title);
						someChTest.tiankong.tests[i].t_explain=common.strReplace(data[i].t_explain);
						someChTest.tiankong.tests[i].t_answer=data[i].t_answer;
						someChTest.tiankong.tests[i].blank_count=data[i].blank_count;
					}
					resolve();
				}
			});
		});
	}).then(function(){
		//获取判断题
		return new Promise(function(resolve,reject){
			db.query(`select student_detail_table.test_ID,is_collection,t_explain,t_title,t_answer from student_detail_table,test_panduan_table where t_title is not null and test_panduan_table.ID=student_detail_table.test_ID and test_panduan_table.ch_ID=${ch_ID} and is_collection=1 and student_detail_table.s_ID=${s_ID} and test_type=3`,function(err,data){
				if(err){
					console.log(err);
					res.status(500).json({"result":0,"err":"服务器出现错误"});
				}else{
					for(var i=0;i<data.length;i++){
						someChTest.panduan.tests.push({
							test_ID:0,
							test_collection:1,
							test_type:3,
							t_title:"",
							t_answer:"",
							t_explain:""
						});
						someChTest.panduan.tests[i].test_ID=data[i].test_ID;
						someChTest.panduan.tests[i].t_title=common.strReplace(data[i].t_title);
						someChTest.panduan.tests[i].t_explain=common.strReplace(data[i].t_explain);
						someChTest.panduan.tests[i].t_answer=data[i].t_answer;
					}
					resolve();
				}
			});
		});	
	}).then(function(){
		//获取改错题
		return new Promise(function(resolve,reject){
			db.query(`select student_detail_table.test_ID,is_collection,t_explain,t_title,t_answer,blank_count from student_detail_table,test_gaicuo_table where t_title is not null and test_gaicuo_table.ID=student_detail_table.test_ID and test_gaicuo_table.ch_ID=${ch_ID} and is_collection=1 and student_detail_table.s_ID=${s_ID} and test_type=4`,function(err,data){
				if(err){
					console.log(err);
					res.status(500).json({"result":0,"err":"服务器出现错误"});
				}else{
					for(var i=0;i<data.length;i++){
						someChTest.gaicuo.tests.push({
							test_ID:0,
							test_collection:1,
							test_type:4,
							t_title:"",
							blank_count:0,
							t_answer:"",
							t_explain:""
						});
						someChTest.gaicuo.tests[i].test_ID=data[i].test_ID;
						someChTest.gaicuo.tests[i].t_title=common.strReplace(data[i].t_title);
						someChTest.gaicuo.tests[i].t_explain=common.strReplace(data[i].t_explain);
						someChTest.gaicuo.tests[i].t_answer=data[i].t_answer;
						someChTest.gaicuo.tests[i].blank_count=data[i].blank_count;
					}
					res.json({"result":1,"someChTest":someChTest});
				}
			});
		});
	})
}

exports.getSomeChErrTest=function(req,res){//获取某一个章节的错题详情
	var ch_ID=parseInt(req.query.ch_ID);
	var s_ID=parseInt(req.query.s_ID);
	console.log("学生"+s_ID+"选择错题本章节"+ch_ID);
	if(!ch_ID || !s_ID){
		res.status(400).json({"result":0,"err":"不合法的章节ID或者用户ID"});
		return;
	}
	var someChTest={
		"s_ID":s_ID,
		"ch_ID":ch_ID,
		"danxuan":{
			test_type:1,
			tests:[]
		},
		"tiankong":{
			test_type:2,
			tests:[]
		},
		"panduan":{
			test_type:3,
			tests:[]
		},
		"gaicuo":{
			test_type:4,
			tests:[]
		}
	};
	new Promise(function(resolve,reject){//获取本章节收藏的单选题目
		db.query(`select student_detail_table.test_ID,is_collection,t_explain,t_title,t_option_a,t_option_b,t_option_c,t_option_d,t_answer from student_detail_table,test_table where t_title is not null and test_table.ID=student_detail_table.test_ID and test_table.ch_ID=${ch_ID} and is_add_cuotiben=1 and student_detail_table.s_ID=${s_ID} and test_type=1`,function(err,data){
			if(err){
				console.log(err);
				res.status(500).json({"result":0,"err":"服务器出现错误"});
			}else{
				for(var i=0;i<data.length;i++){
					someChTest.danxuan.tests.push({
						test_ID:0,
						is_collection:0,
						test_type:1,
						t_explain:"",
						t_title:"",
						t_options:[
							{name:'A',value:""},
							{name:'B',value:""},
							{name:'C',value:""},
							{name:'D',value:""}
						],
						t_answer:"",
					});
					someChTest.danxuan.tests[i].test_ID=data[i].test_ID;
					someChTest.danxuan.tests[i].is_collection=data[i].is_collection;
					someChTest.danxuan.tests[i].t_explain=common.strReplace(data[i].t_explain);
					someChTest.danxuan.tests[i].t_title=common.strReplace(data[i].t_title);
					someChTest.danxuan.tests[i].t_options[0].value=common.strReplace(data[i].t_option_a);
					someChTest.danxuan.tests[i].t_options[1].value=common.strReplace(data[i].t_option_b);
					someChTest.danxuan.tests[i].t_options[2].value=common.strReplace(data[i].t_option_c);
					someChTest.danxuan.tests[i].t_options[3].value=common.strReplace(data[i].t_option_d);
					someChTest.danxuan.tests[i].t_answer=data[i].t_answer;
				}
				resolve();
			}
		});
	}).then(function(){//获取本章节收藏的 填空 题目
		return new Promise(function(resolve,reject){
			db.query(`select student_detail_table.test_ID,is_collection,t_explain,t_title,t_answer,blank_count from student_detail_table,test_fillblank_table where t_title is not null and test_fillblank_table.ID=student_detail_table.test_ID and test_fillblank_table.ch_ID=${ch_ID} and is_add_cuotiben=1 and student_detail_table.s_ID=${s_ID} and test_type=2`,function(err,data){
				if(err){
					console.log(err);
					res.status(500).json({"result":0,"err":"服务器出现错误"});
				}else{
					for(var i=0;i<data.length;i++){
						someChTest.tiankong.tests.push({
							test_ID:0,
							is_collection:0,
							test_type:2,
							t_title:"",
							blank_count:0,
							t_answer:"",
							t_explain:""
						});
						someChTest.tiankong.tests[i].test_ID=data[i].test_ID;
						someChTest.tiankong.tests[i].is_collection=data[i].is_collection;
						someChTest.tiankong.tests[i].t_title=common.strReplace(data[i].t_title);
						someChTest.tiankong.tests[i].t_explain=common.strReplace(data[i].t_explain);
						someChTest.tiankong.tests[i].t_answer=data[i].t_answer;
						someChTest.tiankong.tests[i].blank_count=data[i].blank_count;
					}
					resolve();
				}
			});
		});
	}).then(function(){
		//获取判断题
		return new Promise(function(resolve,reject){
			db.query(`select student_detail_table.test_ID,is_collection,t_explain,t_title,t_answer from student_detail_table,test_panduan_table where t_title is not null and test_panduan_table.ID=student_detail_table.test_ID and test_panduan_table.ch_ID=${ch_ID} and is_add_cuotiben=1 and student_detail_table.s_ID=${s_ID} and test_type=3`,function(err,data){
				if(err){
					console.log(err);
					res.status(500).json({"result":0,"err":"服务器出现错误"});
				}else{
					for(var i=0;i<data.length;i++){
						someChTest.panduan.tests.push({
							test_ID:0,
							test_collection:0,
							test_type:3,
							t_title:"",
							t_answer:"",
							t_explain:""
						});
						someChTest.panduan.tests[i].test_ID=data[i].test_ID;
						someChTest.panduan.tests[i].test_collection=data[i].is_collection;
						someChTest.panduan.tests[i].t_title=common.strReplace(data[i].t_title);
						someChTest.panduan.tests[i].t_explain=common.strReplace(data[i].t_explain);
						someChTest.panduan.tests[i].t_answer=data[i].t_answer;
					}
					resolve();
				}
			});
		});	
	}).then(function(){
		//获取改错题
		return new Promise(function(resolve,reject){
			db.query(`select student_detail_table.test_ID,is_collection,t_explain,t_title,t_answer,blank_count from student_detail_table,test_gaicuo_table where t_title is not null and test_gaicuo_table.ID=student_detail_table.test_ID and test_gaicuo_table.ch_ID=${ch_ID} and is_add_cuotiben=1 and student_detail_table.s_ID=${s_ID} and test_type=4`,function(err,data){
				if(err){
					console.log(err);
					res.status(500).json({"result":0,"err":"服务器出现错误"});
				}else{
					for(var i=0;i<data.length;i++){
						someChTest.gaicuo.tests.push({
							test_ID:0,
							test_collection:0,
							test_type:4,
							t_title:"",
							blank_count:0,
							t_answer:"",
							t_explain:""
						});
						someChTest.gaicuo.tests[i].test_ID=data[i].test_ID;
						someChTest.gaicuo.tests[i].test_collection=data[i].is_collection;
						someChTest.gaicuo.tests[i].t_title=common.strReplace(data[i].t_title);
						someChTest.gaicuo.tests[i].t_explain=common.strReplace(data[i].t_explain);
						someChTest.gaicuo.tests[i].t_answer=data[i].t_answer;
						someChTest.gaicuo.tests[i].blank_count=data[i].blank_count;
					}
					res.json({"result":1,"someChTest":someChTest});
				}
			});
		});
	})
}

exports.removeErrTest=function(req,res){
	var s_ID=parseInt(req.query.s_ID);
	var test_ID=parseInt(req.query.test_ID);
	var is_add_cuotiben=parseInt(req.query.is_add_cuotiben);
	//console.log(s_ID,test_ID,is_add_cuotiben);
	if(!s_ID || !test_ID){
		res.json({"result":0,"err":"不合法的学生ID或试题ID"});
		return;
	}
	if(is_add_cuotiben==0){
		is_add_cuotiben=1;
	}else if(is_add_cuotiben==1){
		is_add_cuotiben=0;
	}
	db.query(`update student_detail_table set is_add_cuotiben=${is_add_cuotiben} where s_ID=${s_ID} and test_ID=${test_ID}`,(err,data)=>{
		if(err){
			console.log(err);
			res.json({"result":500});
		}else{
			res.json({"result":1});
		}
	});
}

exports.colSomeTest=function(req,res){
	var s_ID=parseInt(req.query.s_ID);
	var test_ID=parseInt(req.query.test_ID);
	var c_ID=parseInt(req.query.c_ID);
	var test_collection=parseInt(req.query.test_collection);
	var allBlank=parseInt(req.query.allBlank);
	var test_type=parseInt(req.query.test_type);
	console.log('学生ID'+s_ID,"试题"+test_ID,"课程"+c_ID,"收藏状态"+test_collection,"总空数"+allBlank,"试题类型"+test_type);
	if(!test_ID || !s_ID || !c_ID || !test_type){ 
		res.status(400).json({"result":0,"err":"不合法的参数"});
		return;
	}
	console.log("学生"+s_ID+"收藏"+test_ID,"课程ID"+c_ID,"收藏状态："+test_collection);
	if(test_collection==0){
		test_collection=1;
	}else if(test_collection==1){
		test_collection=0;
	}
	//先查数据库中是否有此题记录，若无则插入 否则
	db.query(`select * from student_detail_table where s_ID=${s_ID} and test_ID=${test_ID} and test_type=${test_type}`,(err,data)=>{
		if(err){
			console.log(err);
			res.status(500).json({"result":0,"err":"服务器出现错误"});
		}else{
			if(data.length==0){
				db.query(`insert into student_detail_table(s_ID,test_ID,is_collection,is_add_cuotiben,allBlank,isTrue,c_ID,test_type) values(${s_ID},${test_ID},1,1,${allBlank},0,${c_ID},${test_type})`,function(err,data){
					if(err){
						console.log(err);
						res.status(500).json({"result":0,"err":"服务器出现错误"});
					}else{
						res.json({"result":1});
					}
				});
			}else if(data.length!=0){
				db.query(`update student_detail_table set is_collection=${test_collection} where s_ID=${s_ID} and test_ID=${test_ID} and test_type=${test_type}`,(err,data)=>{
					if(err){
						console.log(err);
						res.status(500).json({"result":0,"err":"服务器出现错误"});
					}else{
						res.json({"result":1});
					}
				});
			}
		}
	});
}
//已改
exports.handInTest=function(req,res){
	var data=JSON.parse(req.query.data);
	console.log(data);
	var s_ID=parseInt(data.s_ID);
	var c_ID=parseInt(data.c_ID);
	if(!s_ID || !c_ID){ 
		res.status(400).json({"result":0,"err":"不合法的学生ID或者课程ID"});
		return;
	}
	if(data.resultData.length==0){
		res.json({"result":0,"err":"数据长度为0"});
		return;
	}
	var handInTests=data.resultData;
	console.log(handInTests);
	for(let i=0;i<handInTests.length;i++){
		if(handInTests[i].test_type==1){ //单选题
			if(handInTests[i].isTrue==1){ //做对的情况下
				handInTests[i].is_add_cuotiben=0;
			}else{
				handInTests[i].is_add_cuotiben=1;
			}
			db.query(`select * from student_detail_table where test_ID=${handInTests[i].test_ID} and s_ID=${s_ID} and test_type=1`,(err,query_result)=>{
				if(err){
					res.status(500).json({"result":0,"err":"服务器出现错误"});
				}else if(query_result.length!=0){
					db.query(`update student_detail_table set is_add_cuotiben=${handInTests[i].is_add_cuotiben},isTrue=${handInTests[i].isTrue} where test_type=1 and s_ID=${s_ID} and test_ID=${handInTests[i].test_ID}`,function(err,data){
						if(err){
							console.log(err);
							res.status(500).json({"result":0,"err":"服务器出现错误"});
						}else{
							if(i==handInTests.length-1){
								res.json({"result":1});
							}
						}
					});
				}else if(query_result.length==0){
					db.query(`insert into student_detail_table(s_ID,test_ID,is_add_cuotiben,isTrue,c_ID,test_type) values(${s_ID},${handInTests[i].test_ID},${handInTests[i].is_add_cuotiben},${handInTests[i].isTrue},${c_ID},${handInTests[i].test_type})`,function(err,data){
						if(err){
							console.log(err);
							res.status(500).json({"result":0,"err":"服务器出现错误"});
						}else{
							if(i==handInTests.length-1){
								res.json({"result":1});
							}
						}
					});
				}
			});
		}
		if(handInTests[i].test_type==2){ //填空题
			if(handInTests[i].isTrue==handInTests[i].allBlank){ //做对的情况下
				handInTests[i].is_add_cuotiben=0;
			}else{
				handInTests[i].is_add_cuotiben=1;
			}
			db.query(`select * from student_detail_table where test_ID=${handInTests[i].test_ID} and s_ID=${s_ID} and test_type=2`,(err,query_result)=>{
				if(err){
					console.log(err);
					res.status(500).json({"result":0,"err":"服务器出现错误"});
				}else if(query_result.length!=0){
					db.query(`update student_detail_table set is_add_cuotiben=${handInTests[i].is_add_cuotiben},isTrue=${handInTests[i].isTrue} where test_type=2 and s_ID=${s_ID} and test_ID=${handInTests[i].test_ID}`,function(err,data){
						if(err){
							res.status(500).json({"result":0,"err":"服务器出现错误"});
						}else{
							if(i==handInTests.length-1){
								res.json({"result":1});
							}
						}
					});
				}else if(query_result.length==0){
					db.query(`insert into student_detail_table(s_ID,test_ID,is_add_cuotiben,allBlank,isTrue,c_ID,test_type) values(${s_ID},${handInTests[i].test_ID},${handInTests[i].is_add_cuotiben},${handInTests[i].allBlank},${handInTests[i].isTrue},${c_ID},${handInTests[i].test_type})`,function(err,data){
						if(err){
							res.status(500).json({"result":0,"err":"服务器出现错误"});
						}else{
							if(i==handInTests.length-1){
								res.json({"result":1});
							}
						}
					});
				}
			});
		}
		if(handInTests[i].test_type==3){ //判断题
			if(handInTests[i].isTrue==1){ //做对的情况下
				handInTests[i].is_add_cuotiben=0;
			}else{
				handInTests[i].is_add_cuotiben=1;
			}
			db.query(`select * from student_detail_table where test_ID=${handInTests[i].test_ID} and s_ID=${s_ID} and test_type=3`,(err,query_result)=>{
				if(err){
					res.status(500).json({"result":0,"err":"服务器出现错误"});
				}else if(query_result.length!=0){
					db.query(`update student_detail_table set is_add_cuotiben=${handInTests[i].is_add_cuotiben},isTrue=${handInTests[i].isTrue} where test_type=3 and s_ID=${s_ID} and test_ID=${handInTests[i].test_ID}`,function(err,data){
						if(err){
							res.status(500).json({"result":0,"err":"服务器出现错误"});
						}else{
							if(i==handInTests.length-1){
								res.json({"result":1});
							}
						}
					});
				}else if(query_result.length==0){
					db.query(`insert into student_detail_table(s_ID,test_ID,is_add_cuotiben,isTrue,c_ID,test_type) values(${s_ID},${handInTests[i].test_ID},${handInTests[i].is_add_cuotiben},${handInTests[i].isTrue},${c_ID},${handInTests[i].test_type})`,function(err,data){
						if(err){
							res.status(500).json({"result":0,"err":"服务器出现错误"});
						}else{
							if(i==handInTests.length-1){
								res.json({"result":1});
							}
						}
					});
				}
			});
		}
		if(handInTests[i].test_type==4){ //改错题
			if(handInTests[i].isTrue==handInTests[i].allBlank){ //做对的情况下
				handInTests[i].is_add_cuotiben=0;
			}else{
				handInTests[i].is_add_cuotiben=1;
			}
			db.query(`select * from student_detail_table where test_ID=${handInTests[i].test_ID} and s_ID=${s_ID} and test_type=4`,(err,query_result)=>{
				if(err){
					res.status(500).json({"result":0,"err":"服务器出现错误"});
				}else if(query_result.length!=0){
					db.query(`update student_detail_table set is_add_cuotiben=${handInTests[i].is_add_cuotiben},isTrue=${handInTests[i].isTrue} where test_type=4 and s_ID=${s_ID} and test_ID=${handInTests[i].test_ID}`,function(err,data){
						if(err){
							res.status(500).json({"result":0,"err":"服务器出现错误"});
						}else{
							if(i==handInTests.length-1){
								res.json({"result":1});
							}
						}
					});
				}else if(query_result.length==0){
					db.query(`insert into student_detail_table(s_ID,test_ID,is_add_cuotiben,allBlank,isTrue,c_ID,test_type) values(${s_ID},${handInTests[i].test_ID},${handInTests[i].is_add_cuotiben},${handInTests[i].allBlank},${handInTests[i].isTrue},${c_ID},${handInTests[i].test_type})`,function(err,data){
						if(err){
							console.error(err);
							res.status(500).json({"result":0,"err":"服务器出现错误"});
						}else{
							if(i==handInTests.length-1){
								res.json({"result":1});
							}
						}
					});
				}
			});
		}
	}
}


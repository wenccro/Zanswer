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
exports.getCourse=function(req,res){
	var s_ID=parseInt(req.query.s_ID);
	if(!s_ID){
		res.status(400).json({"result":0,"err":"错误的题目ID"});
		return;
	}
	db.query(`select ID from student_table where ID=${s_ID}`, function(err, data) {
		if(err) {
			res.status(500).json({"result":0,"err":"服务器出现错误"});
		} else {
			if(data.length == 0) {
				res.status(404).json({"result":0,"err":"学生ID找不到"});
				return;
			}
		}
	});
	console.log("ID："+s_ID+"登陆成功"+new Date());
	/*{
		c_ID:0,
		c_name:"",
		c_img:"",
		xuenian:"",   //2017-2018
		xueqi:0,
		openDateYear:0,
		openDateMonth:0,
		openDateDay:0,
		closeDateYear:0,
		closeDateMonth:0,
		closeDateDay:0,
		zhangjieNum:0,
		timuNum:0,
		peopleNum:0
	}*/
	var course=[];
	new Promise(function(resolve, reject) {
		db.query(`select * from course_table`,function(err,data){
			if(err) {
				res.status(404).json({"result":501});
			} else {
				for(var i=0;i<data.length;i++){
					course.push({
						c_ID:0,
						c_name:"",
						c_img:"",
						xuenian:"",   //2017-2018
						xueqi:0,
						isOpen:0,		//0 不开放  1 开放
						openDateYear:0,
						openDateMonth:0,
						openDateDay:0,
						closeDateYear:0,
						closeDateMonth:0,
						closeDateDay:0,
						zhangjieNum:0,
						timuNum:0,
						peopleNum:0
					});
					course[i].c_ID=data[i].ID;
					course[i].c_name=data[i].c_name;
					course[i].c_img="http://139.199.124.188/upload/"+data[i].c_img;
					course[i].xuenian=data[i].c_year;
					course[i].xueqi=data[i].c_semester;
					//开放日期
					course[i].openDateYear=data[i].c_open_time.split('-')[0];
					course[i].openDateMonth=data[i].c_open_time.split('-')[1];
					course[i].openDateDay=data[i].c_open_time.split('-')[2];
					//截至日期
					course[i].closeDateYear=data[i].c_close_time.split('-')[0];
					course[i].closeDateMonth=data[i].c_close_time.split('-')[1];
					course[i].closeDateDay=data[i].c_close_time.split('-')[2];
				}
				resolve();
			}
		});
	}).then(function(){
		//获取所有课的总章节数量
		return new Promise(function(resolve, reject) {
			if(course.length==0){
				resolve();
			}
			var flag=0;
			for(let i=0;i<course.length;i++){
				db.query(`select count(*) from chapter_table where c_ID=${course[i].c_ID} and ch_name is not null`,function(err,data){
					if(err) {
						console.error(err);
						res.status(500).json({"result":0,"err":"服务器出现错误"});
					} else {
						course[i].zhangjieNum=data[0]['count(*)'];
					}
					flag++;
					if(flag==course.length){
						resolve();
					}
				});
			}
		});
	}).then(function(){
		return new Promise(function(resolve, reject) {
			var flag=0;
			for(let i=0;i<course.length;i++){
				//console.log(i,course[i].c_ID);
				//SELECT count(s_ID) FROM student_detail_table,test_table WHERE test_table.t_title is not null and student_detail_table.test_ID=test_table.ID AND test_table.ID IN(SELECT test_table.ID FROM test_table,chapter_table WHERE chapter_table.c_ID=${course[i].c_ID} AND test_table.ch_ID=chapter_table.ID)
				db.query(`select count(*) from test_table where t_title is not null and ch_ID in(select ID from chapter_table where c_ID=${course[i].c_ID})`,function(err,data){
					if(err) {
						console.error(err);
						res.status(500).json({"result":0,"err":"服务器出现错误"});
					} else{
						//console.log(data);
						course[i].timuNum=data[0]['count(*)'];
					}
					flag++;
					if(flag==course.length){
						resolve();
					}
				});
			}
		});
	}).then(function(){
		//获取每一门课   题 的数量
		//console.log(course);
		if(course.length==0){
			resolve();
		}
		return new Promise(function(resolve, reject) {
			var flag=0;
			for(let i=0;i<course.length;i++){
				db.query(`SELECT count(distinct s_ID) FROM student_detail_table where c_ID=${course[i].c_ID}`,function(err,data){
					if(err) {
						console.error(err);
						res.status(500).json({"result":0,"err":"服务器出现错误"});
					} else {
						course[i].peopleNum=data[0]['count(distinct s_ID)'];
					}
					flag++;
					if(flag==course.length){
						resolve();
					}	
				});
			}
		});
	}).then(function(){
		db.query(`select c_ID from student_table where ID=${s_ID}`,function(err,data){
			if(err){
				console.error(err);
				res.status(500).json({"result":0,"err":"服务器出现错误"});
			}else{
				for(var i=0;i<course.length;i++){
					if(course[i].c_ID==data[0].c_ID){
						course[i].isOpen=1;
					}
				}
				res.json({'course':course,'result':1});
			}
		});
	})
}
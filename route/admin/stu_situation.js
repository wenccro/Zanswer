const express=require('express');
const mysql=require('mysql');
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
//显示学生学习情况的非数据内容
exports.showStu=function(req,res){
	var course_data=[];//存放课程内容
	db.query(`SELECT course_table.ID,course_table.c_name,course_table.c_year,course_table.c_semester from course_table`,(err,data)=>{
		if(err){
			console.log(err);
			res.status(500).send("database error").end();
		}else{
			for(var i=0;i<data.length;i++){
				course_data.push({});
				course_data[i].id=data[i].ID;
				course_data[i].c_name=data[i].c_name;
				course_data[i].c_year=data[i].c_year;
				course_data[i].c_semester=data[i].c_semester;
			}
			//console.log(course_data);
			res.json({"data":course_data});
		}
	});
}
//显示第一次页面刷新时的内容
exports.showFirst=function(req,res){
	var id=req.query.id;//拿到最近所上课的id
	//console.log(id);
	stu_data=[];//存放刷这门课的每一个学生的信息
	//拿到学生id
	var promise=new Promise(function(resolve,reject){
		//通过课程id拿到每一个学生的学生id+ 每一个学生的做题数量
		db.query(`SELECT s_ID,count(*) from student_detail_table where student_detail_table.c_ID='${id}' group by s_ID`,(err,data)=>{
			if(err){
				console.log(err);
				res.status(500).send('database error').end();
			}else if(data[0]==null){
				res.json({'result':-1});
			}else{
				for(var i=0;i<data.length;i++){
					stu_data.push({});
					stu_data[i].s_id=data[i].s_ID;
					stu_data[i].sum=data[i]['count(*)'];//拿到每一个这一科所做的总体数
				}
				resolve(stu_data);
			}
		});
	
	}).then(function(value){
		//console.log(value);//通过课程id拿到每一个学生的学生id和做题总数
		var flag=0;
		//拿到学生的个人信息
		return new Promise(function(resolve,reject){
			for(var i=0;i<value.length;i++){
				(function(i){
					//console.log(value[i].s_id);
					db.query(`SELECT student_table.s_num,student_table.s_class,student_table.s_name from student_table where student_table.ID='${value[i].s_id}'`,(err,data)=>{
						flag++;
						if(err){
							console.log(err);
							res.status(500).send("database error").end();
						}else{
							stu_data[i].s_num=data[0].s_num;
							stu_data[i].s_class=data[0].s_class;
							stu_data[i].s_name=data[0].s_name;
							if(flag==value.length){
								resolve(stu_data);
							}
						}
					});
				})(i)
			}
		});	
	}).then(function(value){
		//console.log(value);//拿到做 这门课的学生具体信息+做题总数
		//拿到这门课的总题量 ，
		//拿到单选的数量
		return new Promise(function(resolve,reject){
			db.query(`SELECT count(*) from chapter_table,test_table where chapter_table.c_ID='${id}' and test_table.ch_ID=chapter_table.ID and test_table.t_title!='null'`,(err,data)=>{
				if(err){
					console.log(err);
					res.status(500).send("database error").end();
				}else{
					for(var i=0;i<value.length;i++){
						 stu_data[i].test_num_d=data[0]['count(*)'];//添加一个题目总数的标志
					}
				}
				resolve(stu_data);
			})
		})
	}).then(function(value){
		//拿到填空的数量
		return new Promise(function(resolve,reject){
			db.query(`SELECT count(*) from chapter_table,test_fillblank_table where chapter_table.c_ID='${id}' and test_fillblank_table.ch_ID=chapter_table.ID`,(err,data)=>{
				if(err){
					console.log(err);
					res.status(500).send("database error").end();
				}else{
					for(var i=0;i<value.length;i++){
						 stu_data[i].test_num_t=data[0]['count(*)'];//添加一个题目总数的标志
					}
				}
				resolve(stu_data);
			})
		})
	}).then(function(value){
		//拿到判断的数量
		return new Promise(function(resolve,reject){
			db.query(`SELECT count(*) from chapter_table,test_panduan_table where chapter_table.c_ID='${id}' and test_panduan_table.ch_ID=chapter_table.ID`,(err,data)=>{
				if(err){
					console.log(err);
					res.status(500).send("database error").end();
				}else{
					for(var i=0;i<value.length;i++){
						 stu_data[i].test_num_p=data[0]['count(*)'];//添加一个题目总数的标志
					}
				}
				resolve(stu_data);
			})
		})
	}).then(function(value){
		//拿到改错的数量
		return new Promise(function(resolve,reject){
			db.query(`SELECT count(*) from chapter_table,test_gaicuo_table where chapter_table.c_ID='${id}' and test_gaicuo_table.ch_ID=chapter_table.ID`,(err,data)=>{
				if(err){
					console.log(err);
					res.status(500).send("database error").end();
				}else{
					for(var i=0;i<value.length;i++){
						stu_data[i].test_num_g=data[0]['count(*)'];//添加一个题目总数的标志
						var test_sum_all=stu_data[i].test_num_d+stu_data[i].test_num_t+stu_data[i].test_num_p+stu_data[i].test_num_g;
						var acc=(stu_data[i].sum/(test_sum_all)*100).toFixed(2);//计算  每个人自己做过的总题数/题目的总题数(占比50%);
						stu_data[i].test_num=test_sum_all;//添加一个题目总数的标志
						stu_data[i].acc_1=parseFloat(acc);//拿到第一个参数
					}
				}
				resolve(stu_data);
			})
		})
	}).then(function(value){
		//console.log(value);//到这里拿到学生的基本信息，做题总数（sum）题目总数(test_num)，和做题/总题的第一个参数一（acc_1）
		//拿到正确率
		var flag=0;//控制变量
		return new Promise(function(resolve, reject) { 
			for(var i=0;i<value.length;i++){
				(function(i){
					db.query(`SELECT COALESCE(SUM(done_blank),0),COALESCE(SUM(true_blank),0) FROM student_chapter_result WHERE s_ID='${value[i].s_id}'`,(err,data)=>{
						flag++;
						if(err){
							res.status(500).json({"result":0,"err":"服务器出现错误"});
						}else{
							var done_num=data[0]['COALESCE(SUM(done_blank),0)'];
							var true_num=data[0]['COALESCE(SUM(true_blank),0)'];
							//求个人正确率
							stu_data[i].accuracy=parseFloat((true_num/done_num)*100).toFixed(2);
							if(flag==value.length){
								resolve(stu_data);
							}
						}
					});
				})(i)
			}
		})
	}).then(function(value){
		//console.log(value);//到这里拿到学生的基本信息，做题总数（sum）题目总数(test_num)，和做题/总题的第一个参数一（acc_1），参数2 正确率（accuracy）
		//计算综合测评
		return new Promise(function(resolve,reject){
			for(var i=0;i<value.length;i++){
				var acc=stu_data[i].acc_1*0.5;//做题率
				var ans=stu_data[i].accuracy*0.5;//正确率
				stu_data[i].ranking=(parseFloat(ans)+parseFloat(acc)).toFixed(2);//这是一个综合排名依据
			}
			resolve(stu_data);
		})
	}).then(function(value){
		//console.log(value);//到这里拿到学生的基本信息，做题总数（sum）题目总数(test_num)，和做题/总题的第一个参数一（acc_1），参数2 正确率（accuracy）,综合测评(ranking)
		//按综合排名分数对数据排序
		return new Promise(function(resolve,reject){
			var tt=bubbingSort(stu_data);
			for(var i=0;i<tt.length;i++){
				stu_data[i].pai=(i+1);
			}
			resolve(tt);
		})
	}).then(function(value){
		//console.log(value);//到这里拿到学生的基本信息，做题总数（sum）题目总数(test_num)，和做题/总题的第一个参数一（acc_1），参数2 正确率（accuracy）,综合测评(ranking),排名（pai）
		var arr=new Array();
		for(var i=0;i<value.length;i++){
			arr.push({});
			arr[i].s_id=stu_data[i].s_id;
			arr[i].sum=stu_data[i].sum;
			arr[i].s_num=stu_data[i].s_num;
			arr[i].s_class=stu_data[i].s_class;
			arr[i].s_name=stu_data[i].s_name;
			arr[i].test_num=stu_data[i].test_num;
			arr[i].accuracy=stu_data[i].accuracy;
			arr[i].ranking=stu_data[i].ranking;
			arr[i].pai=stu_data[i].pai;
		}
		//console.log(arr);//对数据做处理，将不需要的去掉
		res.json({"data":arr,"result":1});
	})

	//一个快速排序函数算法（不能有相同分数）
	function quickSort(arr){
		if(arr.length<=1){return arr}
		//选择基准 pivot
		var pivotIndex=Math.floor(arr.length/2);
		//console.log("基准是"+pivotIndex);
		var pivot=arr.splice(pivotIndex,1)[0];
		//console.log("基准元素是:"+JSON.stringify(pivot));
		var left=[];
		var right=[];
		for(var i=0;i<arr.length;i++){
			if(arr[i].ranking>pivot.ranking){
				left.push(arr[i]);
			}else if(arr[i].ranking<pivot.ranking){
				right.push(arr[i]);
			}
		}
		return quickSort(left).concat(pivot, quickSort(right));
	};
	
	//冒泡排序
	function bubbingSort(arr){
		var flag=0;
		for(var i=0;i<arr.length;i++){
			for(var j=i;j<arr.length;j++){
				if(arr[i].ranking<arr[j].ranking){//一旦符合条件就将整个对象交换
					flag=arr[j];
					arr[j]=arr[i];
					arr[i]=flag;
				}
			}
		}
		return arr;
	}
}

//去判断是否有此课程并拿到课程id
exports.getCourseId=function(req,res){
	var c_name=req.body.c_name;
	var c_year=req.body.c_year;
	var c_semester=req.body.c_semester;
	//console.log(c_name,c_year,c_semester);
	db.query(`SELECT ID from course_table where c_name='${c_name}' and c_year='${c_year}' and c_semester='${c_semester}'`,(err,data)=>{
		if(err){
			console.log(err);
			res.status(500).send("database error").end();
		}else if(data.length==0){
			res.json({"result":-1})
		}else{
			res.json({"ID":data[0].ID,"result":1});
		}
	})
	
}

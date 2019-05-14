const mysql=require('mysql');
const formidable=require('formidable');
const querystring=require('querystring');
var common=require('../../libs/common.js');
var db=mysql.createPool({
	host:'localhost',
	user:'root',
	password:'123456',
	database:'online_answer_db'
})
exports.login=function(req,res){
	console.log('1');
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files) {
		var s_num = fields.s_num;
		var s_pwd = fields.s_pwd;
		var s_pwd_md5=common.md5(s_pwd);
		//console.log(s_pwd_md5);
		//console.log(s_num,s_pwd);
		db.query(`select * from student_table where s_num='${s_num}'`, function(err, data) {
			if(err) {
				res.status(500).json({"result":0,"err":"服务器出现错误"});
			} else {
				if(data.length == 0) {
					res.status(404).json({"result":0});
				} else {
					if(data[0].s_pwd == s_pwd_md5 || data[0].s_pwd == s_pwd) { //用户密码验证通过
						//返回结果：
						res.json({"result":1,"ID":data[0].ID});
					} else {
						res.json({"result":0});
					}
				}
			}
		});
	});
}

exports.modifyPwd=function(req,res){
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files) {
		var s_num = fields.s_num;
		var s_new_pwd = fields.s_new_pwd;
		//console.log(s_new_pwd,s_num);
		var s_new_pwd_md5=common.md5(s_new_pwd);
		//console.log(s_new_pwd_md5);
		db.query(`update student_table set s_pwd='${s_new_pwd_md5}' where s_num='${s_num}'`, function(err, data) {
			if(err) {
				console.log(err);
				res.status(500).json({"result":0,"err":"服务器出现错误"});
			} else {
				res.json({"result":1});
			}
		});
	});
}

exports.getMeDetail=function(req,res){
	var c_ID=parseInt(req.query.c_ID);
	var s_ID=parseInt(req.query.s_ID);
	if(!s_ID || !c_ID){
		res.status(400).json({"result":0,"err":"不合法的学生ID或课程ID"});
		return;
	}
	db.query(`select ID from student_table where ID=${s_ID}`, function(err, data) {
		if(err) {
			res.status(500).json({"result":0,"err":"服务器出现了错误"});
		} else {
			if(data.length == 0) {
				res.status(404).json({"result":0,"err":"学生ID找不到"});
				return;
			}
		}
	});
	console.log("当前登录学生ID:"+s_ID+"---"+new Date());
	var myInfo={
		s_num:"",   					//学号
		s_name:"",						//姓名
		level:5,						//等级
		overPersonCount:0,				//超越人数
		studentCount:0,					//学生总人数
		mingci:0,						//排名
		selfAvgRightRate:0,				//自己正确率
		allPepAvgRightRate:0,			//所有人平均正确率
		jiafen:0,						//期末加分 
		cuotibenTestNum:0,				//错题本中的题目数量
		collectionNum:0,				//收藏题目的数量
		allTestNum:0,					//数据库中的总题数 改
		allDoTestNum:0,					//做过题目的数量 
		allTrueTestNum:0,				//做过的题目中，做对的数量 
		selfComEvl:0,					//综合测评
		allPeopleDetail:[]				//所有人信息
	};
	new Promise(function(resolve, reject) { //学号，姓名
		db.query(`select * from student_table where ID=${s_ID}`,function(err,data){
			if(err){
				res.status(500).json({"result":0,"err":"服务器出现错误"});
			}else{
				myInfo.s_num=data[0].s_num;
				myInfo.s_name=data[0].s_name;
				resolve();
			}
		});
	}).then(function(){
		return new Promise(function(resolve, reject) {//当前课程（和我一样）做题总人数
			db.query(`select count(distinct s_ID) from student_detail_table where c_ID=${c_ID}`,function(err,data){
				if(err){
					res.status(500).json({"result":0,"err":"服务器出现错误"});
				}else{
					myInfo.studentCount=data[0]['count(distinct s_ID)'];
					resolve(myInfo);
				}
			});
		})
	}).then(function(){
		return new Promise(function(resolve, reject) {//数据库中总题数量
			var ch_arr=[];
			var flag=0;
			db.query(`select ID from chapter_table where ch_num!=0 and c_ID=${c_ID}`,function(err,ch_arr_param){
				if(err){
					res.status(500).json({"result":0,"err":"服务器出现错误"});
				}else{
					for(let i=0;i<ch_arr_param.length;i++){
						ch_arr[i]=ch_arr_param[i]['ID'];
					}
					for(let i=0;i<ch_arr.length;i++){
						db.query(`call getPerChAllBlank(${ch_arr[i]});`,(err,data)=>{
							if(err){
								res.status(500).json({"result":0,"err":"服务器出现错误"});
							}else{
								myInfo.allTestNum+=data[0][0]['sum_con'];
							}
							flag++;
							if(flag==ch_arr.length){
								resolve();
							}
						});
					}
				}
			});
		})
	}).then(function(value){
		return new Promise(function(resolve, reject) { //错题本中题目数量
			db.query(`select count(test_ID) from student_detail_table where s_ID=${s_ID} and is_add_cuotiben=1`,function(err,data){
				if(err){
					res.status(500).json({"result":0,"err":"服务器出现错误"});
				}else{
					myInfo.cuotibenTestNum=data[0]['count(test_ID)'];
					resolve(myInfo);
				}
			});
		})
	}).then(function(value){ 
		return new Promise(function(resolve, reject) { //收藏题目数量
			db.query(`select count(distinct test_ID) from student_detail_table where s_ID=${s_ID} and is_collection=1`,function(err,data){
				if(err){
					res.status(500).json({"result":0,"err":"服务器出现错误"});
				}else{
					myInfo.collectionNum=data[0]['count(distinct test_ID)'];
					resolve(myInfo);
				}
			});
		})
	}).then(function(){
		//计算个人做题总量和对的题总量以及正确率
		return new Promise(function(resolve, reject) { 
			db.query(`SELECT COALESCE(SUM(done_blank),0),COALESCE(SUM(true_blank),0) FROM student_chapter_result WHERE s_ID=${s_ID}`,function(err,data){
				if(err){
					res.status(500).json({"result":0,"err":"服务器出现错误"});
				}else{
					myInfo.allDoTestNum=data[0]['COALESCE(SUM(done_blank),0)'];
					myInfo.allTrueTestNum=data[0]['COALESCE(SUM(true_blank),0)'];
					//求个人正确率
					myInfo.selfAvgRightRate=common.division(myInfo.allDoTestNum,myInfo.allTrueTestNum);
					resolve();
				}
			});
		});
	}).then(function(){
		return new Promise(function(resolve,reject){
			//获得所有人的ID
			db.query(`select DISTINCT s_ID from student_detail_table where c_ID=${c_ID}`,function(err,data){

				if(err){
					res.status(500).json({"result":0,"err":"服务器出现错误"});
				}else{
					for(var i=0;i<data.length;i++){
						myInfo.allPeopleDetail.push({
							s_ID:0,
							rightRate:0.00,
							allDoNum:0,
							trueNum:0,
							comEvl:0  //个人综合测评，排名的依据
						});
						myInfo.allPeopleDetail[i].s_ID=data[i].s_ID;
					}
					resolve();
				}
			});
		})
	}).then(function(){
		//计算 每个人做 题总量 和 对的题总量 以及 正确率
		return new Promise(function(resolve,reject){
			if(myInfo.allPeopleDetail.length==0){
				resolve();
			}
			var flag=0;
			for(let i=0;i<myInfo.allPeopleDetail.length;i++){
				db.query(`SELECT COALESCE(SUM(done_blank),0),COALESCE(SUM(true_blank),0) FROM student_chapter_result WHERE s_ID=${myInfo.allPeopleDetail[i].s_ID}`,function(err,data){
					if(err){
						res.status(500).json({"result":0,"err":"服务器出现错误"});
					}else{
						myInfo.allPeopleDetail[i].allDoNum=data[0]["COALESCE(SUM(done_blank),0)"];
						myInfo.allPeopleDetail[i].trueNum=data[0]["COALESCE(SUM(true_blank),0)"];
					}
					flag++;
					if(flag==myInfo.allPeopleDetail.length){
						resolve();
					}
				});
			}
		});
	}).then(function(){
		//到此为止获取到所有异步任务结果
		//求每个人的 平均正确率
		for(var i=0;i<myInfo.allPeopleDetail.length;i++){
			myInfo.allPeopleDetail[i].rightRate=common.division(myInfo.allPeopleDetail[i].allDoNum,myInfo.allPeopleDetail[i].trueNum);
		}
		//求所有人的综合测评
		for(var i=0;i<myInfo.allPeopleDetail.length;i++){
			myInfo.allPeopleDetail[i].comEvl=(common.division(myInfo.allTestNum,myInfo.allPeopleDetail[i].allDoNum)+parseFloat(myInfo.allPeopleDetail[i].rightRate)).toFixed(2);
		}
    	//求所有人 总的 的平均正确率
    	myInfo.allPepAvgRightRate=common.avgRightRate(myInfo.allPeopleDetail);
	    //计算我的综合测评
		myInfo.selfComEvl=(common.division(myInfo.allTestNum,myInfo.allDoTestNum) + parseFloat(myInfo.selfAvgRightRate)).toFixed(2);
		//对所有人的正确率进行排名
	   	myInfo.allPeopleDetail=common.bubbleSort(myInfo.allPeopleDetail,"comEvl");
	   	//计算我的排名，按照综合测评进行排名

	   	for(var i=0;i<myInfo.allPeopleDetail.length;i++){
			if(parseFloat(myInfo.selfComEvl)<parseFloat(myInfo.allPeopleDetail[i].comEvl)){
				continue;
			}else{
				myInfo.mingci=i+1;
				break;
			}
		}
		if(myInfo.allDoTestNum==0){
			myInfo.overPersonCount=0;
		}else{
			myInfo.overPersonCount=myInfo.allPeopleDetail.length-myInfo.mingci;
		}
		//1.学渣 2.学民 3.学霸 4.学神 5.学魔
		var gross=myInfo.allPeopleDetail.length;
		var xuemo=Math.ceil(gross*0.05);
		var xueshen=Math.ceil(gross*0.15);
		var xueba=Math.ceil(gross*0.4);
		var xuemin=Math.ceil(gross*0.7);
		if(myInfo.mingci<=xuemo&&myInfo.allDoTestNum!=0){
			myInfo.level=1; //学魔
			myInfo.jiafen=10;
		}else if(myInfo.mingci<=xueshen&&myInfo.allDoTestNum!=0){
			myInfo.level=2; //学神
			myInfo.jiafen=6;
		}else if(myInfo.mingci<=xueba&&myInfo.allDoTestNum!=0){
			myInfo.level=3; //学霸
			myInfo.jiafen=4;
		}else if(myInfo.mingci<=xuemin&&myInfo.allDoTestNum!=0){
			myInfo.level=4; //学民
			myInfo.jiafen=2;
		}else{
			myInfo.level=5; //学渣
			myInfo.jiafen=0;
		}
		if(myInfo.overPersonCount==0){
			myInfo.jiafen=0;
		}
		res.json({"myinfo":myInfo,"result":1});
	});
}










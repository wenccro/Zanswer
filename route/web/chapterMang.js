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
exports.getChapter=function(req,res){
	//获取学生ID
	var s_ID=parseInt(req.query.s_ID);
	//获取学生所选课程ID
	var cur_c_ID=parseInt(req.query.c_ID);
	if(!s_ID || !cur_c_ID){
		res.status(400).json({"result":0,"err":"不合法的ID或章节序号"});
		return;
	}
	//查询此学生 是否存在数据库中
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
	console.log("学生ID："+s_ID +"---课程ID:"+cur_c_ID);
	//数据结构
	/*[{
			ch_ID:0,
			ch_name:"",
			...
			allPeopleAvgRightRate:0 // 所有人本章平均正确率
	},{},{}
	]*/
	var chapters=[];//存储章节信息
	//获取课程ID
	new Promise(function(resolve,reject){
		db.query(`select * from chapter_table where ch_num!=0 and c_ID=${cur_c_ID} order by ch_num`,(err,data)=>{
			
			if(err){
				res.status(500).json({"result":0,"err":"服务器出现错误"});
			}else{
				for(let i=0;i<data.length;i++){
					chapters.push({
						ch_ID:0,							//本章节ID
						ch_name:"",							//本章节名称
						open:3, 							//1已经结束 2正在开放 3未开始
						ch_num:0,							//章节序号
						ch_closeYear:0,	  					//截止年
						ch_closeMonth:0,  					//截止月
						ch_closeDay:0,	  					//截止日
						curChTestCount:0,					//本章总题数量
						curChBlankCount:0,  				//本章总空数    
						curChDoneBlankCount:0,  			//此人本章节共做题数   
						curChDoneBlankTrueCount:0,  		//此人本章节做对题数
						rightRate:0.00,	  					//此人本章正确率
						isRemainTest:false,					//此人这个章节是否还有题未做
						allPeopleDoneBlankCount:0,  		//所有人本章节共做题数   
						allPeopleTrueBlankCount:0, 			//所有人本章节做对题数
						allPeopleAvgRightRate:0.00 			// 所有人本章平均正确率
						
					});
					chapters[i].ch_ID=data[i].ID;
					chapters[i].ch_num=data[i].ch_num;
					chapters[i].ch_name=data[i].ch_name;
					chapters[i].ch_closeYear=data[i].ch_close_time.split('-')[0];
					chapters[i].ch_closeMonth=data[i].ch_close_time.split('-')[1];
					chapters[i].ch_closeDay=data[i].ch_close_time.split('-')[2];
					var dateCompare=common.dateCompare;
					if( dateCompare(data[i].ch_open_time,new Date()) ){
						chapters[i].open=3; //未开始
					}
					if( dateCompare(new Date(),data[i].ch_open_time)  &&  dateCompare(data[i].ch_close_time,new Date())){
						chapters[i].open=2; //正在开放
					}
					if( dateCompare(new Date(),data[i].ch_close_time) ){
						chapters[i].open=1; //已结束
					}
				}
				resolve(chapters);
			}
		});
	}).then(function(value){	
		return new Promise(function(resolve,reject){
			//求各个章节题的总空数(填空 改错题有多个空)
			if(chapters.length==0){
				res.json({"result":0,"info":"此课程还没有添加任何章节"});
				return;
			}
			var flag=0;
			for(let i=0;i<chapters.length;i++){
				//利用存储过程求值  注意取值的时候，要取的是数组第0项的第0项
				db.query(`call getPerChAllBlank(${chapters[i].ch_ID})`,(err,data)=>{
					if(err){
						res.status(500).json({"result":0,"err":"服务器错误"});
					}else{
						//console.log(i,chapters[i].ch_ID,data[0][0]);
						chapters[i].curChBlankCount=data[0][0]["sum_con"];
					} 
					flag++;
					if(flag==chapters.length){
						resolve();
					}
				})
			}
		});
	}).then(function(){
		return new Promise(function(resolve,reject){
			//求各个章节题的总题数
			if(chapters.length==0){
				res.json({"result":0,"info":"此课程还没有添加任何章节"});
				return;
			}
			var flag=0;
			for(let i=0;i<chapters.length;i++){
				//利用存储过程求值  注意取值的时候，要取的是数组第0项的第0项
				db.query(`call getPerChTestCon(${chapters[i].ch_ID})`,(err,data)=>{
					if(err){
						res.status(500).json({"result":0,"err":"服务器错误"});
					}else{
						//console.log(i,chapters[i].ch_ID,data[0][0]);
						chapters[i].curChTestCount=data[0][0]["sum_con"];
					} 
					flag++;
					if(flag==chapters.length){
						resolve();
					}
				})
			}
		});
	}).then(function(){
		return new Promise(function(resolve,reject){
			//求每个章节 此人做题（空）数量和对的题（空）数量
			var flag=0;
			for(let i=0;i<chapters.length;i++){
				db.query(`select done_blank,true_blank from student_chapter_result where s_ID=${s_ID} and ch_ID=${chapters[i].ch_ID}`,function(err,data){
					if(err){
						res.status(500).json({"result":0,"err":"服务器错误"});
					}else{
						if(data.length!=0){
							chapters[i].curChDoneBlankCount=data[0]['done_blank'];
							chapters[i].curChDoneBlankTrueCount=data[0]['true_blank'];
						}
					}
					flag++;
					if(flag==chapters.length){
						resolve();
					}
				});
			}
		});
	}).then(function(){
		var flag=0;
		return new Promise(function(resolve,reject){
			//求此章所有人共做题（空）数 和 对的题（空）数
			for(let i=0;i<chapters.length;i++){
				db.query(`SELECT COALESCE(SUM(done_blank),0),COALESCE(SUM(true_blank),0) FROM student_chapter_result WHERE ch_ID=${chapters[i].ch_ID}`,function(err,data){
					if(err){
						res.status(500).json({"result":0,"err":"服务器错误"});
					}else{
						//容易出错的地方：
						chapters[i].allPeopleDoneBlankCount=data[0]['COALESCE(SUM(done_blank),0)'];
						chapters[i].allPeopleTrueBlankCount=data[0]['COALESCE(SUM(true_blank),0)'];
					}
					flag++;
					if(flag==chapters.length){
						resolve();
					}
				})
			}
		});
	}).then(function(){
		//求每个章节此人正确率 所有人的平均正确率 此人每个章节是否还有题未做
		for(let i=0;i<chapters.length;i++){
			chapters[i].rightRate=common.division(chapters[i].curChDoneBlankCount,chapters[i].curChDoneBlankTrueCount);
			chapters[i].allPeopleAvgRightRate=common.division(chapters[i].allPeopleDoneBlankCount,chapters[i].allPeopleTrueBlankCount);
			if(chapters[i].curChBlankCount-chapters[i].curChDoneBlankCount>0){
				chapters[i].isRemainTest=true;
			}
		}
		res.json({'chapters':chapters,"result":1});
	});
}

exports.getMyColCh=function(req,res){
	var s_ID=parseInt(req.query.s_ID);
	var c_ID=parseInt(req.query.c_ID);
	if(!s_ID || !c_ID){
		res.status(500).json({"result":0,"err":"不合法的学生ID或课程ID"});
		return;
	}
	console.log('获取我的收藏章节列表',s_ID,c_ID);
	var myColCh={
		"c_ID":c_ID,
		"c_name":"",
		"chapters":[]
	};
	new Promise(function(resolve,reject){
		//获取此学生所选课程的名字
		db.query(`select c_name from course_table where ID=${c_ID}`,function(err,data){
			if(err){
				res.status(500).json({"result":0,"err":"服务器出现错误"});
			}else{
				myColCh.c_name=data[0].c_name;
			}
			resolve();
		})
	}).then(function(){
		//准备得到此课程 所有的章节ID，章节名称
		return new Promise(function(resolve,reject){
			db.query(`select ID,ch_num,ch_name from chapter_table where ch_num!=0 and c_ID=${c_ID} group by ch_num`,function(err,data){
				if(err){
					res.status(500).json({"result":0,"err":"服务器出现错误"});
				}else{
					for(let i=0;i<data.length;i++){
						myColCh.chapters.push({
							"ch_ID":0,			//章节ID
							"ch_num":0,			//章节序号
							"ch_name":"",		//章节名称
							"colTestNum":0    	//收藏题目数量
						});
						myColCh.chapters[i].ch_ID=data[i].ID;
						myColCh.chapters[i].ch_num=data[i].ch_num;
						myColCh.chapters[i].ch_name=data[i].ch_name;
					}
					resolve();
				}
			});
			
		})
	}).then(function(){
		//准备求每个章节的错题本的数量   注意 是错题本 不是错的题
		var flag=0;
		for(let j=0;j<myColCh.chapters.length;j++){
			db.query(`CALL getPerChColCon(${s_ID},${myColCh.chapters[j].ch_ID});`,function(err,data){
				if(err){
					res.status(500).json({'result':0,"err":服务器出现了错误});
				}else{
					myColCh.chapters[j].colTestNum=data[0][0]["sum_con"];
				}
				flag++;
				if(flag==myColCh.chapters.length){
					res.json({"myColCh":myColCh,"result":1});
				}
			});
		}
	})
}

exports.getMyErrBenCh=function(req,res){
	var s_ID=parseInt(req.query.s_ID);
	var c_ID=parseInt(req.query.c_ID);
	if(!s_ID || !c_ID){
		res.status(500).json({"result":0,"err":"不合法的学生ID或课程ID"});
		return;
	}
	console.log('获取错题本章节',s_ID,c_ID);
	var myErrBenCh={
		"c_ID":c_ID,
		"c_name":"",
		"chapters":[]
	};
	new Promise(function(resolve,reject){
		//获取此学生所选课程的名字
		db.query(`select c_name from course_table where ID=${c_ID}`,function(err,data){
			if(err){
				res.status(500).json({"result":0,"err":"服务器出现错误"});
			}else{
				myErrBenCh.c_name=data[0].c_name;
			}
			resolve();
		})
	}).then(function(){
		//准备得到此课程 所有的章节ID，章节名称
		return new Promise(function(resolve,reject){
			db.query(`select ID,ch_num,ch_name from chapter_table where ch_num!=0 and c_ID=${c_ID} group by ch_num`,function(err,data){
				if(err){
					res.status(500).json({"result":0,"err":"服务器出现错误"});
				}else{
					for(let i=0;i<data.length;i++){
						myErrBenCh.chapters.push({
							"ch_ID":0,			//章节ID
							"ch_num":0,			//章节序号
							"ch_name":"",		//章节名称
							"errBenTestNum":0    //错题数量
						});
						myErrBenCh.chapters[i].ch_ID=data[i].ID;
						myErrBenCh.chapters[i].ch_num=data[i].ch_num;
						myErrBenCh.chapters[i].ch_name=data[i].ch_name;
					}
					resolve();
				}
			});
			
		})
	}).then(function(){
		//准备求每个章节的错题本的数量   注意 是错题本 不是错的题
		var flag=0;
		for(let j=0;j<myErrBenCh.chapters.length;j++){
			db.query(`CALL getPerChErrBenCon(${s_ID},${myErrBenCh.chapters[j].ch_ID});`,function(err,data){
				if(err){
					res.status(500).json({'result':0,"err":服务器出现了错误});
				}else{
					//console.log(data,myErrBenCh.chapters[j].ch_ID);
					myErrBenCh.chapters[j].errBenTestNum=data[0][0]["sum_con"];
				}
				flag++;
				if(flag==myErrBenCh.chapters.length){
					res.json({"myErrBenCh":myErrBenCh,"result":1});
				}
			});
		}
	})
}

exports.showChapterResult=function(req,res){
	var s_ID=parseInt(req.query.s_ID);
	var ch_ID=parseInt(req.query.ch_ID);
	console.log("显示章节答题结果---学生"+s_ID+"章节"+ch_ID);
	if(!ch_ID || !s_ID){
		res.status(400).json({"result":0,"err":"不合法的章节ID或者用户ID"});
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
	db.query(`select ID from chapter_table where ID=${ch_ID}`, function(err, data) {
		if(err) {
			res.status(500).json({"result":0,"err":"服务器出现了错误"});
		} else {
			if(data.length == 0) {
				res.status(404).json({"result":0,"err":"章节ID找不到"});
				return;
			}
		}
	});
	var result={
		"s_ID":s_ID,					//学生ID
		"ch_ID":ch_ID,					//章节ID
		"howManyTimes":1,				//第几次参与本章的答题
		"paiming":0,					//此章节按正确率排名  我是第几名
		"allTestsCount":0,				//本章题的总量  存储过程
		"peopleNum":0,					//参与本章答题的人数
		"rightTestsCount":0,			//此人本章答 对 题的数量
		"doneTestsCount":0,				//此人本章答 总 题的数量
		"errTestsCount":0,				//此人本章答 错 题的数量
		"rightRate":0.00,				//此人本章正确率
		"avgRightRate":0.00,			//所有人本章平均正确率
		"allPeopleDetail":[]			//所有人本章节答题详情
	};
	new Promise(function(resolve,reject){
		//获取此章节所有题目（单选判断填空改错）的总量
		db.query(`call getPerChTestCon(${ch_ID})`, function(err, data) {
			if(err) {
				res.status(500).json({"result":0,"err":"服务器出现了错误"});
			} else {
				if(data.length == 0) {
					res.status(404).json({"result":0,"err":"此章节暂无题目"});
					return;
				}else{
					result.allTestsCount=data[0][0]['sum_con'];
					resolve();
				}
			}
		});
	}).then(function(){
		return new Promise(function(resolve,reject){
			//计算参与到本章答题的总人数
			db.query(`select count(s_ID) from student_chapter_result where ch_ID=${ch_ID}`,function(err,data){
				if(err){
					res.status(500).json({"result":0,"err":"服务器出现错误"});
				}else{
					result.peopleNum=data[0]['count(s_ID)'];
					resolve();
				}
			});
		});
	}).then(function(){
		return new Promise(function(resolve, reject) { 
			//计算个人做对的题目 和 总数量 以及本章正确率
			db.query(`select done_blank,true_blank from student_chapter_result where s_ID=${s_ID} and ch_ID=${ch_ID}`,function(err,data){
				if(err){
					res.status(500).json({"result":0,"err":"服务器出现错误"});
				}else{
					if(data.length!=0){
						result.doneTestsCount=data[0]['done_blank'];
						result.rightTestsCount=data[0]['true_blank'];
						result.rightRate=common.division(result.doneTestsCount,result.rightTestsCount);
					}else{
						result.doneTestsCount=0;
						result.rightTestsCount=0;
						result.rightRate=0;
					}
				}
				resolve();
			});
		});
	}).then(function(){//CALL getPerChErrTestCon(191,30)
		return new Promise(function(resolve,reject){
			db.query(`call getPerChErrTestCon(${s_ID},${ch_ID});`,function(err,data){
				if(err){
					res.status(500).json({"result":0,"err":"服务器出现错误"});
				}else{
					if(data.length!=0){
						result.errTestsCount=data[0][0]['sum_con'];
					}else{
						result.errTestsCount=0;
					}
				}
				resolve();
			});
		});
	}).then(function(){
		//获取所有人本章节答题详情
		return new Promise(function(resolve, reject) { 
			//首先获取本章节所有答题人的ID
			db.query(`select s_ID from student_chapter_result where ch_ID=${ch_ID}`,function(err,data){
				if(err){
					res.status(500).json({"result":0,"err":"服务器出现错误"});
				}else{
					for(let i=0;i<data.length;i++){
						result.allPeopleDetail.push({
							s_ID:data[i]['s_ID'],
							doneBlank:0,
							trueBlank:0,
							rightRate:0.00
						});
					}
					resolve();
				}
			});
		});
	}).then(function(){

		return new Promise(function(resolve, reject){ 
			//获取每个人此章节答对的题目数量和题的总量，最后求正确率
			var flag=0;
			for(let i=0;i<result.allPeopleDetail.length;i++){
				db.query(`select done_blank,true_blank from student_chapter_result where s_ID=${result.allPeopleDetail[i].s_ID} and ch_ID=${ch_ID}`,function(err,data){
					if(err){
						res.status(500).json({"result":0,"err":"服务器出现错误"});
					}else{
						result.allPeopleDetail[i].doneBlank=data[0]['done_blank'];
						result.allPeopleDetail[i].trueBlank=data[0]['true_blank'];
						result.allPeopleDetail[i].rightRate=common.division(result.allPeopleDetail[i].doneBlank,result.allPeopleDetail[i].trueBlank);
					}
					flag++;
					if(flag==result.allPeopleDetail.length){
						resolve();
					}
				});
			}
		});
	}).then(function(){
		console.log(result);
		//异步任务完成，接下来计算  排名  和  所有人平均正确率
		//所有人平均正确率
		result.avgRightRate=common.avgRightRate(result.allPeopleDetail);
		//根据正确率对所有学生（参与本章答题）进行 降序排序
		result.allPeopleDetail=common.bubbleSort(result.allPeopleDetail,"rightRate");
		for(var i=0;i<result.allPeopleDetail.length;i++){
			if(parseFloat(result.rightRate)<parseFloat(result.allPeopleDetail[i].rightRate)){
				continue;
			}else{
				result.paiming=i+1;
				break;
			}
		}
		res.json({"result":1,"jieguo":result});
	})
}

exports.getColCtbCount=function(req,res){
	var c_ID=parseInt(req.query.c_ID);
	var s_ID=parseInt(req.query.s_ID);
	console.log('获取错题本/收藏数量');
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
	var colCtbCount={
		colCount:0,
		ctbCount:0
	};
	new Promise(function(resolve,reject){
		db.query(`select count(*) from student_detail_table where s_ID=${s_ID} and c_ID=${c_ID} and is_add_cuotiben=1`, function(err, data) {
			if(err) {
				res.status(500).json({"result":0,"err":"服务器出现了错误"});
			} else {
				colCtbCount.ctbCount=data[0]['count(*)'];
				resolve();
			}
		});
	}).then(function(){
		db.query(`select count(*) from student_detail_table where s_ID=${s_ID} and c_ID=${c_ID} and is_collection=1`, function(err, data) {
			//console.log(data);
			if(err) {
				res.status(500).json({"result":0,"err":"服务器出现了错误"});
			} else {
				colCtbCount.colCount=data[0]['count(*)'];
				res.json({'result':1,"colCtbCount":colCtbCount});
			}
		});
	})
}
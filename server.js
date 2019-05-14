const express=require('express');
const static=require('express-static');
const bodyParser=require('body-parser');
const multer=require('multer');//上传文件
const multerObj=multer({dest:'./static/upload'});
const mysql=require('mysql');
const cookieParse=require('cookie-parser');
const cookieSession=require('cookie-session');
const consolidate=require('consolidate');
const expressRoute=require('express-route');
const fs=require('fs');
var https=require('https');
var options={
	key:fs.readFileSync('./2_www.todolist666.club.key'),
	cert:fs.readFileSync('1_www.todolist666.club_bundle.crt')
}
const db=mysql.createPool({
	host:'localhost',
	user:'root',
	password:'123456',
	database:'online_answer_db'
});


var server=express();


var personInfoMang=require('./route/web/personInfoMang.js');
var testsMang=require('./route/web/testsMang.js');
var courseMang=require('./route/web/courseMang.js');
var chapterMang=require('./route/web/chapterMang.js');
var discussMang=require('./route/web/discussMang.js');

var admintrol=require('./route/admin/index.js');
//学生管理控制器
var student_manage=require('./route/admin/stu_manage.js');
//设置课程管理的控制器
var gl_course=require('./route/admin/course.js');//引入课程管理的控制器
//设置章节的控制器
var gl_section=require('./route/admin/section.js');//引入章节的控制器
//单选题库管理的控制器
var question_bank=require('./route/admin/t_ques_bank.js');//引入单选题库管理的控制器
//填空题题库
var question_fillblank=require('./route/admin/t_fillblank.js');//引入填空题管理的控制器
//判断题
var question_judge=require('./route/admin/t_judge.js');//引入判断题管理的控制器
//改错题
var question_reform=require('./route/admin/t_reform.js');//引入改错题的控制器
//学生情况的控制器
var student_situation=require('./route/admin/stu_situation.js');//引入学生学习情况的控制器

//接收图片，写在前面
server.post('/submitDiscuss',discussMang.submitDiscuss);//提交评论
server.get('/getDiscuss',discussMang.getDiscuss);//获取评论
server.post('/modifyDiscuss',discussMang.modifyDiscuss);//修改评论
server.put('/thumbsUp',discussMang.thumbsUp);//点赞
server.delete('/deleteDiscuss',discussMang.deleteDiscuss);//删除评论



//1 获取请求数据
server.use(bodyParser.urlencoded({extended:false}));
server.use(multerObj.any());//上传任何文件


//cookie session
server.use(cookieParse());
(function(){
	var keys=[];
	for(var i=0;i<10000;i++){
		keys[i]='fbadh'+Math.random();
	}
	server.use(cookieSession({
		name:'sess_id',
		keys:keys,
		maxAge:60*60*1000
	}));
})();

//模板
server.engine('html',consolidate.ejs);//用ejs引擎来渲染html
server.set('views','template');//template存放运行后的文件
server.set('view engine','html');
//小程序端路由开始
server.get('/',(req,res)=>{
	res.render('web/test.ejs',{});
	//res.end("13456");
	/*var sql=`select * from test_discuss`;
	db.query(sql,(err,data)=>{
		if(err){
			console.log(err);
		}
		console.log(data);
	})*/
});

server.post('/login'			,personInfoMang.login);				//登陆
server.post('/modifyPwd'		,personInfoMang.modifyPwd);			//修改密码
server.get('/getMeDetail'		,personInfoMang.getMeDetail);		//获取我的页面	
server.get('/getCourse'			,courseMang.getCourse);				//获取所有课程信息

server.get('/getChapter'		,chapterMang.getChapter);			//获取所章节信息
server.get('/getMyColCh'		,chapterMang.getMyColCh);			//获取我的错题本章节信息
server.get('/getMyErrBenCh'		,chapterMang.getMyErrBenCh);		//获取我的错题   按照章节序号进行排序
server.get('/showChapterResult'	,chapterMang.showChapterResult);	//获取每一章节做题的结果
server.get('/getColCtbCount'	,chapterMang.getColCtbCount);		//获取错题本和收藏题目数量

server.get('/getTenTests'		,testsMang.getTenTests);			//获取10道题(根据学生ID和章节ID)
server.get('/getSomeChColTest'	,testsMang.getSomeChColTest);		//获取我的错题本章节信息
server.get('/getSomeChErrTest'	,testsMang.getSomeChErrTest);		//获取某个章节的错题详情
server.get('/handInTest'		,testsMang.handInTest);				//题的上交
server.get('/removeErrTest'		,testsMang.removeErrTest);			//移除错题
server.get('/colSomeTest'		,testsMang.colSomeTest);			//收藏某题

//小程序端路由结束


server.use('/admin'   ,admintrol.checkmain());//访问admin 就执行主控制器里面的一个方法

//学生信息管理
server.get('/admin/stu_manage',student_manage.showIndex);//请求显示页面，让其去showIndex
server.get('/admin/seek',student_manage.showSeek);//请求显示搜索，就路由到showSeek
server.delete('/admin/delete',student_manage.deleteStu);//删除学生信息
server.post('/admin/updata',student_manage.updataStu);//修改密码
server.post('/admin/add',student_manage.addStu);//添加一个学生
server.post('/admin/delete_x',student_manage.delete_xStu);//删除所选情况下的内容
server.post('/admin/reset_x',student_manage.reset_xStu);//重置所选内容的密码
server.post('/admin/lend_in',student_manage.lend_in);//从外部导入excel表格数据
server.post('/admin/stu_course',student_manage.showStu_course);//拉取课程页面
server.post('/admin/stu_course_updata',student_manage.Updata_course);//修改学生课程

//课程管理
server.get('/admin/course',gl_course.showCourse);//请求显示课程管理的页面
server.delete('/admin/c_delete',gl_course.deleteCou);//删除课程信息
server.post('/admin/c_add',gl_course.addCou);//增加课程-基本内容
server.post('/admin/c_add_img',gl_course.addCouImg);//修改课程-图片
server.post('/admin/c_alter_ol',gl_course.replaceCou);//发送要修改内容
server.post('/admin/c_alter',gl_course.alterCou);//修改课程-基本内容
server.post("/admin/c_add_test",gl_course.addMTest);//为每一章添加一个默认的一章
server.post("/admin/c_add_testF",gl_course.addZTest);//为第一章添加一个默认的题


//章节管理
server.get("/admin/section",gl_section.showSection);//请求显示章节管理的页面
server.post("/admin/z_add",gl_section.addSection);//增加章节
server.delete("/admin/z_delete",gl_section.deleteSection);//删除章节
server.post('/admin/delete_zx',gl_section.delete_xSec);//删除所选情况下的内容
server.post("/admin/z_alter",gl_section.alterSection);//修改章节内容
server.post("/admin/z_add_test",gl_section.addMTest);//为每一章添加一个默认的一题

//单选管理
server.get('/admin/test_show',question_bank.showIndex);//显示试题
server.delete("/admin/s_delete",question_bank.deleteTest);//删除试题
server.get("/admin/test_add",question_bank.addPage);//主页面添加试题  a标签的get请求
server.get("/admin/test_alter",question_bank.alterPage);//主页面修改试题 window.location改变的请求
server.post("/admin/lend_test",question_bank.testLend);//试题的导入
server.checkout("/admin/test_add",question_bank.addIndex);//给增加页面的添加数据
server.post("/admin/test_add",question_bank.addTest);//增加试题
server.post("/admin/test_alter",question_bank.alterShow);//去拉取数据相对于的数据id的内容
server.post("/admin/test_alter_up",question_bank.alterUp);//保持修改成功的数据

//填空题管理
server.get("/admin/test_t_show",question_fillblank.showIndex);//显示填空题
server.get("/admin/test_fill_add",question_fillblank.addPage);//（添加按钮）主页面添加试题  a标签的get请求
server.post("/admin/test_t_add",question_fillblank.addIndex);//添加填空题
server.delete("/admin/t_delete",question_fillblank.deleteTest);//删除试题
server.get("/admin/test_fill_alter",question_fillblank.alterPage);//主页面修改试题 window.location改变的请求
server.post("/admin/test_fill_alter",question_fillblank.alterShow);//去拉取数据相对于的数据id的内容
server.post("/admin/test_t_alter",question_fillblank.alterIndex);//添加填空题

//判断题管理
server.get("/admin/test_p_show",question_judge.showIndex);//显示判断题
server.get("/admin/test_judge_add",question_judge.addPage);//（添加按钮）主页面添加试题  a标签的get请求
server.post("/admin/test_p_add",question_judge.addIndex);//添加判断题
server.delete("/admin/p_delete",question_judge.deleteTest);//删除判断题
server.get("/admin/test_judge_alter",question_judge.alterPage);//主页面修改试题 window.location改变的请求
server.post("/admin/test_judge_alter",question_judge.alterShow);//去拉取相对应的数据id的内容
server.post("/admin/test_p_alter",question_judge.alterIndex);//修改填空题

//改错题管理
server.get("/admin/test_g_show",question_reform.showIndex);//显示改错题
server.get("/admin/test_reform_add",question_reform.addPage);//（添加按钮）主页面添加试题  a标签的get请求
server.post("/admin/test_g_add",question_reform.addIndex);//添加判断题
server.delete("/admin/g_delete",question_reform.deleteTest);//删除改错题
server.get("/admin/test_reform_alter",question_reform.alterPage);//主页面修改试题 window.location改变的请求
server.post("/admin/test_reform_alter",question_reform.alterShow);//显示相对应的数据id的内容
server.post("/admin/test_g_alter",question_reform.alterIndex);//修改改错题

//学生学习情况
server.get('/admin/stu_situ',student_situation.showStu);//显示学生学习情况非数据内容
server.get('/admin/stu_first_data',student_situation.showFirst);//初始化时显示最新的那一科目的学习情况
server.post('/admin/stu_situation',student_situation.getCourseId);//去判断是否有此课程并拿到课程id


//静态文件
server.use(static('./static'));

server.listen(80);
https.createServer(options,server).listen(443);

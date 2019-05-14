const express=require('express');
const common=require('../../libs/common');//引入加密部分

//检测是否登录   并做相应处理的  方法
exports.checkmain=function(){
	var router=express.Router();
	var username=null;
	//检测登录状态
	router.use((req,res,next)=>{
		if(!req.session['admin_id']&&req.url!='/enter'){//没有登录
			res.redirect('/admin/enter');//将访问路径重置到登录
		}else{
			username=req.session['username'];
			next();
		}
	});
	
	router.get('/',(req,res)=>{
		res.render('admin/index.ejs');
	});

	router.use('/enter',require('./enter')());//处理  登录界面
	router.get('/logout',(req,res)=>{//处理注销页面
		req.session['admin_id']=0;
		res.redirect('/admin/enter');//将访问路径重置到登录
	});
	return router;
}



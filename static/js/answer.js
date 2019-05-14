 window.onload=function(){
    // 根据选择菜单值设置特效
    //为课程管理绑定事件，
//  $( ".sectio_ti_k" ).click(function() {
//    $("#gl_k").removeClass("hide");//显示课程管理
//	  $("#gl_z").addClass('hide');//将章节管理隐藏
//	  $("#gl_s").addClass("hide");//将试题管理隐藏
//    $("#st").addClass('hide');//将学生信息管理添加隐藏
//    $("#st_yuan").addClass('hide');//将院系情况隐藏
//    $("#st_class").addClass('hide');//将班级内容隐藏
//  });
//  //为章节管理绑定事件
//  $( ".sectio_ti_z" ).click(function() {
//    $("#gl_z").removeClass("hide");//显示章节管理
//    $("#gl_k").addClass('hide');//隐藏课程
//    $("#gl_s").addClass("hide");//将试题管理隐藏
//    $("#st").addClass('hide');//将学生信息管理添加隐藏
//    $("#st_yuan").addClass('hide');//将院系情况隐藏
//    $("#st_class").addClass('hide');//将班级内容隐藏
//  });
    //为试题管理绑定事件
//  $(".sectio_ti_s").click(function(){
//    $("#gl_s").removeClass("hide")//显示试题管理
//    $("#gl_z").addClass("hide");//隐藏章节管理
//    $("#gl_k").addClass('hide');//隐藏课程
//    $("#st").addClass('hide');//将学生信息管理添加隐藏
//    $("#st_yuan").addClass('hide');//将院系情况隐藏
//    $("#st_class").addClass('hide');//将班级内容隐藏
//  })
    //为学生信息管理绑定事件
//  $("#student_g").click(function(){
//  	$("#st").removeClass('hide');//显示学生管理信息
//  	$("#gl_z").addClass('hide');//将章节管理隐藏
//  	$("#gl_s").addClass("hide");//将试题管理隐藏
//  	$("#gl_k").addClass('hide');//将课程管理隐藏
//  	$("#st_yuan").addClass('hide');//将院系情况隐藏
//  	$("#zj").addClass('hide');//将章节隐藏
//  	$("#st_class").addClass('hide');//将班级内容隐藏
//  });
    //显示院系
    $("#stu_yuan").click(function(){
    	$("#st_yuan").removeClass('hide');//显示院系内容
    	$("#gl_z").addClass('hide');//将章节管理隐藏
    	$("#gl_s").addClass("hide");//将试题管理隐藏
    	$("#gl_k").addClass('hide');//将课程管理隐藏
    	$("#st").addClass('hide');//将学生信息管理添加隐藏
    	$("#zj").addClass('hide');//将章节隐藏
    	$("#st_class").addClass('hide');//将班级内容隐藏
    });
    //显示班级
    $("#stu_class").click(function(){
    	$("#st_class").removeClass('hide');//显示班级内容
    	$("#gl_z").addClass('hide');//将章节管理隐藏
    	$("#gl_s").addClass("hide");//将试题管理隐藏
    	$("#gl_k").addClass('hide');//将课程管理隐藏
    	$("#st_yuan").addClass('hide');//将院系情况隐藏
    	$("#st").addClass('hide');//将学生信息管理添加隐藏
    	$("#zj").addClass('hide');//将章节隐藏
    });
    
    //操作按钮
    //修改-学生信息管理
//	$(".recompose").click(function(){
//		$("#blindstroy").addClass("shadow");//添加滤镜层
//		$(".re_dage").removeClass("hide");
//	})
	//增加-学生信息管理
//	$(".add").click(function(){
//		$("#blindstroy").addClass("shadow");//添加滤镜层
//		$(".add_page").removeClass("hide");
//	});
	
	//删除
	
	//详情-查看学生学习情况的
	$(".detail").click(function(){
		$("#blindstroy").addClass("shadow");//添加滤镜层
		$(".detail_page").removeClass("hide");
	});
	
	//题库管理的相关操作
	//课程管理
//	$(".ti_k_add").click(function(){
//		$("#blindstroy").addClass("shadow");//添加滤镜层
//		$(".ti_k_add-page").removeClass("hide");//显示页面
//		$(".ti_k_alter-page").addClass('hide');//将修改隐藏
//	});
//	$(".ti_k_alter").click(function(){
//		$("#blindstroy").addClass("shadow");//添加滤镜层
//		$(".ti_k_alter-page").removeClass("hide");//显示修改
//		$(".ti_k_add-page").addClass('hide');//隐藏增加
//	});
	//章节管理-增加
//	$(".ti_z_add").click(function(){
//		$("#blindstroy").addClass("shadow");//添加滤镜层
//		$('.ti_z_add-page').removeClass('hide');//显示增加章节
//		$(".ti_z_alter-page").addClass('hide');//隐藏修改
//	});
//	$(".ti_z_alter").click(function(){
//		$("#blindstroy").addClass("shadow");//添加滤镜层
//		$(".ti_z_alter-page").removeClass("hide");//显示修改
//		$(".ti_z_add-page").addClass('hide');//隐藏增加
//	});
	//试题管理-增加
//	$(".ti_s_add").click(function(){
//		
//	});
//	$(".ti_s_alter").click(function(){
//		
//	});
	$(".ti_s_lead").click(function(){
		$("#blindstroy").addClass("shadow");//添加滤镜层
		$(".ti_s_lead-page").removeClass("hide");//显示导入
		$(".ti_s_export-page").addClass('hide');//隐藏导出
	});
	$(".ti_s_export").click(function(){
		$("#blindstroy").addClass("shadow");//添加滤镜层
		$(".ti_s_export-page").removeClass('hide');//显示导出
		$(".ti_s_lead-page").addClass('hide');//隐藏导入

	});
	
	 //为学年学期绑定事件
    $("#lean_year").delegate("li","click",function(){
    	var lean=$(this).text();//留住所选内容
    	$(".xue_nian>b:first").text('');//清除h3标签里面原来是内容
	 	$(".xue_nian>b:first").text(lean);
    })
    $("#lean_term").delegate("li","click",function(){
    	var lean=$(this).text();
    	$(".xue_nian>b:last").text('');
	 	$(".xue_nian>b:last").text(lean);
    })
	
	//日期控件-课程
	$(".from").datepicker({
      defaultDate: "+1w",
      changeMonth: true,
      numberOfMonths: 2,
      onClose: function( selectedDate ) {
        $(".to").datepicker( "option", "minDate", selectedDate );
      }
    });
    $(".to").datepicker({
      defaultDate: "+1w",
      changeMonth: true,
      numberOfMonths: 2,
      onClose: function( selectedDate ) {
        $(".from").datepicker( "option", "maxDate", selectedDate );
      }
    });
    
   
};
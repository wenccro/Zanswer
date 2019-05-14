//首先未解决的问题有  
//{}
//1，本次代码出现了window.onload重复，和异步请求获取不到后面加入的按钮
//解决方法有三个，第一个 将之前的按钮提前写入，适用用于数据有限的情况下（本次代码中 对每一个页面的删除和修改）
//			   第二个 适用延迟，先让异步请求完成后，在去获取按钮，缺点  无法控制延迟的时间多少合适
//			   第三个，直接在异步请求成功的函数里，调用之前封装好的模块（比如本次代码中的 对搜索结果的处理）  比较推荐使用第三个
//2,课程管理，出现了文件和参数不能同时传递的问题，解决办法
//			如果参数比较多，就将参数单独放一个ajax的data里，发送出去，这样，一个按键就会发送2个ajax，利用他们的success就可以解决异步问题
//			如果参数比较少，就将参数放入ajax里的url,后面用+"id=?"+参数，这样也可以将参数带过去。
//3,课程和章节,出现了必须在数据库中有一条数据才能将两个表关联起来，
//			解决，在每一次添加课程的时候就创建一个默认初始化的第一章，每一次添加章节时，就创建一个默认初始化的第一题
//4,学生学习情况，是使用存储过程，这个自己不懂，自己找时间补一下
(function(){
	window.onload=function(){
	//为导航条添加基本 的内容
	/****************************************************************/
	$(".nav>li:eq(1)").click(function(){//为学生信息绑定事件
		$("#st").removeClass('hide');//显示学生管理信息
    	$("#gl_z").addClass('hide');//将章节管理隐藏
    	$("#gl_s").addClass("hide");//将单选试题管理隐藏
    	$("#ti_t_fillblank").addClass('hide');//隐藏填空题试题
    	$("#ti_p_judge").addClass('hide');//隐藏判断题
    	$("#ti_g_fillblank").addClass('hide');//隐藏改错题
    	$("#gl_k").addClass('hide');//将课程管理隐藏
    	$("#st_course").addClass('hide');//将课程匹配隐藏
    	$("#st_yuan").addClass('hide');//将院系情况隐藏
    	$("#zj").addClass('hide');//将章节隐藏
    	$("#st_class").addClass('hide');//将班级内容隐藏
	   	stu_pp(0);//调用
	});
	$(".nav>li:eq(2)").click(function(){//为题库管理绑定事件
		$("#gl_k").removeClass("hide");//显示课程管理
		$("#gl_z").addClass('hide');//将章节管理隐藏
		$("#gl_s").addClass("hide");//将单选试题管理隐藏
    	$("#ti_t_fillblank").addClass('hide');//隐藏填空题试题
    	$("#ti_p_judge").addClass('hide');//隐藏判断题
    	$("#ti_g_fillblank").addClass('hide');//隐藏改错题
		$("#st").addClass('hide');//将学生信息管理添加隐藏
		$("#st_course").addClass('hide');//将课程匹配隐藏
		$("#st_yuan").addClass('hide');//将院系情况隐藏
		$("#st_class").addClass('hide');//将班级内容隐藏
		course_gl();//调用课程函数拉取内容的函数
	})
	$(".nav>li:eq(3)").click(function(){//学习情况绑定事件
		$("#st_yuan").removeClass('hide');//显示院系内容
    	$("#gl_z").addClass('hide');//将章节管理隐藏
    	$("#gl_s").addClass("hide");//将单选试题管理隐藏
    	$("#ti_t_fillblank").addClass('hide');//隐藏填空题试题
    	$("#ti_p_judge").addClass('hide');//隐藏判断题
    	$("#ti_g_fillblank").addClass('hide');//隐藏改错题
    	$("#gl_k").addClass('hide');//将课程管理隐藏
    	$("#st").addClass('hide');//将学生信息管理添加隐藏
    	$("#st_course").addClass('hide');//将课程匹配隐藏
    	$("#zj").addClass('hide');//将章节隐藏
    	$("#st_class").addClass('hide');//将班级内容隐藏
    	 stu_sitution();//这页全部数据操作函数
	})
	/****************************************************************/
	//将管理页面给放出来，学生信息
	$("#student_g").click(function(){
    	$("#st").removeClass('hide');//显示学生管理信息
    	$("#st_course").addClass('hide');//将课程匹配隐藏
    	$("#st_course").addClass('hide');//将课程匹配隐藏
    	$("#gl_z").addClass('hide');//将章节管理隐藏
    	$("#gl_s").addClass("hide");//将单选试题管理隐藏
    	$("#ti_t_fillblank").addClass('hide');//隐藏填空题试题
    	$("#ti_p_judge").addClass('hide');//隐藏判断题
    	$("#ti_g_fillblank").addClass('hide');//隐藏改错题
    	$("#gl_k").addClass('hide');//将课程管理隐藏
    	$("#st_yuan").addClass('hide');//将院系情况隐藏
    	$("#zj").addClass('hide');//将章节隐藏
    	$("#st_class").addClass('hide');//将班级内容隐藏
	    /*上来就拉取数据库里面的第一页内容*/
	   	stu_pp(0);
    
	});//管理页面结尾
    
	//拉去信息的函数
	function stu_pp(page_num){
		$.ajax({
			type:"get",
			url:"/admin/stu_manage",
			async:true,
			data:{"num":page_num},
			success:function(data){
				if(data.result==-1){
					$(".st_tbody").text("暂无内容，请先添加");
					var p_num=page_num%5;//对应到相应的li上去
					for(var z=(p_num+1);z<7;z++){
						$(".stu_page li:eq("+z+")").addClass('hide');//将后面没有的数据时，打页面隐藏
					}
				}else{
					//console.log(data.data);
					$(".st_tbody").text('');//将之前数据清空
					$("#st thead>tr>th:first>input[type='checkbox']").prop("checked", false);
					//将数据刷到页面上去		
					for(var i=0;i<data.data.length;i++){
						$(".st_tbody").append("<tr><td><input type='checkbox'/></td><td></td><td></td><td></td><td><button class='btn recompose alter'>修改</button><button class='btn btn-warning delete'>删除</button></td></tr>");//为tbody里加入行
						$(".st_tbody>tr:eq("+i+")>td:eq(1)").text(data.data[i].s_num);//打印每一行学号
						$(".st_tbody>tr:eq("+i+")>td:eq(2)").text(data.data[i].s_class);//打印每一行名字
						$(".st_tbody>tr:eq("+i+")>td:eq(3)").text(data.data[i].s_name);//打印每一行班级
						$(".st_tbody>tr:eq("+i+")>td:eq(4)>button").attr("data-id",data.data[i].ID);//为每一行的按钮添加id属性
					}

				}//if else
				
				//删除操作
				$(".delete").click(function(){
					if(confirm("确认删除吗？")){
						$.ajax({
							type:"delete",
							url:"/admin/delete",
							data:{"id":$(this).attr('data-id')},
							async:true,
							success:function(data){
								if(data.result==-1){
									alert("删除失败");
									window.location='/admin'					
								}else{
									alert("删除成功");
									window.location='/admin'
								}
							}
						});
					}
					
				});	
				
				//修改操作
				$(".alter").click(function(){
					var shaf_id=null;
					$("#blindstroy").addClass("shadow");//添加滤镜层
					$(".re_dage").removeClass("hide");
					shaf_id=$(this).attr("data-id")
					
					//点击重置就发送请求
					$(".reset").click(function(){
						$.ajax({
							type:"post",
							url:"/admin/updata",
							data:{"id":shaf_id},
							success:function(data){
								if(data.result==1){
									$("#blindstroy").removeClass("shadow");//移除滤镜层
									$(".re_dage").addClass("hide");
									alert("重置密码成功");
								}else{
									$("#blindstroy").removeClass("shadow");//移除滤镜层
									$(".re_dage").addClass("hide");
									alert("重置密码失败");
								}
							}
						});
					});
					
					//点击取消时
					$(".quxiao_re").click(function(){
						$("#blindstroy").removeClass("shadow");//移除滤镜层
						$(".re_dage").addClass("hide");
					});
				});
			
			//为全选取消其中一个内容时，页面上的全选功能的对勾去掉,全部选中时，在将内容加上
			$(".st_tbody>tr>td>input").click(function(){
				//获取它有多少个节点个数 
				var node_num=$(".st_tbody").children().length;
				//只要有一个取消，就将全选按钮取消
				for(var i=0,z=0;i<node_num;i++){
					var bb=$(".st_tbody>tr:eq("+i+")>td:eq(0)>input[type='checkbox']").prop("checked");
					if(!bb){
						$("#st thead>tr>th:first>input[type='checkbox']").prop("checked", false);
						break;
					}
					if(bb==1){
						z++;
					}
					if(z==node_num){
						$("#st thead>tr>th:first>input[type='checkbox']").prop("checked", true);
					}
				}
				
			})
			
			}//seccess(function)
		});
	}
	
	//为页码操作绑定事件
    //分页代码
    $(".stu_page>ul").delegate('li','click',function(){
    	//可以选择的情况下，如果获取的是>>则就将页码数据更改
		if($(this).text()=='>>'){
			var act_num=parseInt($(".active1>a").html());//获取现在所处的位置
			var te_num=act_num%5;//对应到li所处的位置上
 			var last_right_num=parseInt($(".stu_page>ul>li:eq(5)>a").html());//获取最右边的数字
 			if(act_num<last_right_num){//当目前所处的位置没有抵达最后一个时
 				$(".stu_page>ul>li:eq("+(te_num+1)+")").addClass('active1').siblings().removeClass('active1');//为下一个添加选中状态
				stu_pp((act_num+1));//调用上面的函数
 			}else{
 				var top_num=parseInt(act_num);//留住上一页的号码
 				for(var i=1;i<6;i++){
    				$(".stu_page>ul>li:eq("+i+")>a").text('');//先移除
    				$(".stu_page>ul>li:eq("+i+")>a").text((top_num+1));
    				top_num++;
				}
 				stu_pp((top_num+1));//申请翻页的数据
    			$(".stu_page li:eq(1)").addClass('active1').siblings().removeClass('active1');//为第一个添加选中状态
 			}

		}else if($(this).text()=='<<'){
			var act_num=parseInt($(".active1>a").html());//获取现在所处的位置
			var te_num=act_num%5;//对应到li所处的位置上
			if(te_num==0){//给最后一个赋值
				te_num=5;
			}
			var last_num=parseInt($(".stu_page>ul>li:eq(1)").text());//获取<<箭头旁边的数字
			if(act_num==1){//拦住小于1的
				alert("老铁都到第一页了，你还点啊！")
			}else{
				if(act_num>last_num&&te_num!=1){//不需要翻页的情况下
					$(".stu_page>ul>li:eq("+(te_num-1)+")").addClass('active1').siblings().removeClass('active1');//为下一个添加选中状态
					stu_pp((act_num-1));//调用上面的函数
				}else{//需要翻页的情况下
					$(".stu_page li").removeClass("hide");//移除>>右箭头所隐藏的hide
    				for(var i=5;i>0;i--){
	    				$(".stu_page li:eq("+i+")>a").text('');//先移除
	    				$(".stu_page li:eq("+i+")>a").text((last_num-1));
	    				last_num--;
    				}
    				stu_pp((act_num-1));//调用上面的函数
    				$(".stu_page li:eq(5)").addClass('active1').siblings().removeClass('active1');//为第5个添加选中状态
				}
			}	
		}else{//鼠标直接点击时
			var page_num=parseInt($(this).text());//获取所选中的页码数字并转化为int型
    		$(this).addClass('active1').siblings().removeClass('active1');//为选中添加状态，移除其兄弟元素的选中状态
   			stu_pp(page_num);//调用上面的函数
		}
    });
    
    //为搜索绑定事件----(不用模糊查询)
    //搜索-学生信息管理
	$(".seek").click(function(){
		var seek_input=$(".c_zuo input").val();
		
		if(seek_input!=''){
			$("#blindstroy").addClass("shadow");//添加滤镜层
			$(".seek_page").removeClass("hide");
			$(".c_zuo input").val('');//清除搜索框里的内容
			
			$.ajax({
				type:"get",
				url:"/admin/seek",
				data:{'seek':seek_input},
				success:function(data){
					if(data.result==-1){
						$(".seek_page tbody").text('木有找到该学生');
					}else{
						$(".seek_page tbody").text('');//清除之前的搜索结果
						for(var i=0;i<data.data.length;i++){//防止同名的人，能全部显示
							$(".seek_page tbody").append("<tr><td></td><td></td><td><button class='btn reset'>重置</button></td><td><button class='btn btn-warning delete'>删除</button></td></tr>");
							$(".seek_page tbody>tr:eq("+i+")>td:eq(0)").text(data.data[i].s_num);
							$(".seek_page tbody>tr:eq("+i+")>td:eq(1)").text(data.data[i].s_name);
							$(".seek_page tbody>tr:eq("+i+")>td:eq(2)>button").attr("data-id",data.data[i].ID);//为每一行的按钮添加id属性
							$(".seek_page tbody>tr:eq("+i+")>td:eq(3)>button").attr("data-id",data.data[i].ID);//为每一行的按钮添加id属性
						}
						//点击重置就发送请求
						$(".reset").click(function(){
							$.ajax({
								type:"post",
								url:"/admin/updata",
								data:{"id":$(this).attr('data-id')},
								success:function(data){
									if(data.result==1){
										$("#blindstroy").removeClass("shadow");//移除滤镜层
										$(".seek_page").addClass("hide");
										alert("重置密码成功");
									}else{
										$("#blindstroy").removeClass("shadow");//移除滤镜层
										$(".seek_page").addClass("hide");
										alert("重置密码失败");
									}
								}
							});
						});
						
						//删除操作
						$(".delete").click(function(){
							if(confirm("确认删除吗？")){
								$.ajax({
									type:"delete",
									url:"/admin/delete",
									data:{"id":$(this).attr('data-id')},
									async:true,
									success:function(data){
										if(data.result==-1){
											alert("删除失败");
											window.location='/admin'					
										}else{
											alert("删除成功");
											window.location='/admin'
										}
									}
								});
							}
							
						});	
					}
				
				}
			});
			
			//监听是否点击取消
			$(".quxiao_se").click(function(){
				$("#blindstroy").removeClass("shadow");//添加滤镜层
				$(".seek_page").addClass("hide");
			})
		}
	});
	
	
	
	//增加学生信息
	$(".add").click(function(){
		$("#blindstroy").addClass("shadow");//添加滤镜层
		$(".add_page").removeClass("hide");
		//清除内容
		$(".add_page input[name='s_num']").val('');
		$(".add_page input[name='s_class']").val('');
		$(".add_page input[name='s_name']").val('');
		$('.add_save').click(function(){
			//检测是否有空
			var s_num=$(".add_page input[name='s_num']").val();
			var s_class=$(".add_page input[name='s_class']").val();
			var s_name=$(".add_page input[name='s_name']").val();
			
			//没有加入  正则检测
			if(s_num!=''&&s_class!=''&&s_name!=''){
				$.ajax({
					type:"post",
					url:"/admin/add",
					data:{"s_num":s_num,"s_class":s_class,"s_name":s_name},
					success:(function(data){
						if(data.result==1){
							alert('添加成功，请重新刷新');
							$("#blindstroy").removeClass("shadow");//移除滤镜层
							$(".add_page").addClass("hide");
						}else{
							alert('添加失败');
							$("#blindstroy").removeClass("shadow");//移除滤镜层
							$(".add_page").addClass("hide");
						}
					})
				});
			}else{
				if(s_num==''){
					$(".add_page tr:eq(0)").append("<td class='add_red'>*学号为空</td>");
				}
				if(s_class==''){
					$(".add_page tr:eq(1)").append("<td class='add_red'>*班级为空</td>");
				}
				if(s_name==''){
					$(".add_page tr:eq(2)").append("<td class='add_red'>*名字为空</td>");
				}
			}
		});
		//点击修改时
		$('.quxiao_ad').click(function(){
			$("#blindstroy").removeClass("shadow");//移除滤镜层
			$(".add_page").addClass("hide");
		})
	});
	
	//为全选设置标记
	$("#st thead>tr>th:first>input").click(function(){//为全选绑定事件
		var bj=this.checked;
		//表示全选的按被按下，将所有复选框勾上
		if(bj==1){   
        	$("input[type='checkbox']").prop("checked", true); 
        	bj=0;
        //取消全选
	    }else{   
			$("input[type='checkbox']").prop("checked", false);
			bj=1;
	    } 
	});
	
	
	//获取表中所有选中数据的data-id
	$(".delete_x").click(function(){
		var stu_num=[];
		var zt;
        	for(var i=0;i<5;i++){
        		zt=$(".st_tbody>tr:eq("+i+")>td>input[type='checkbox']").prop("checked");
        		if(zt==1){
        			stu_num.push($(".st_tbody>tr:eq("+i+")>td:eq(4)>button").attr('data-id'));	
        		}
        		
        	}
		if(confirm("确认真的要删除全选？")){
			$.ajax({
				type:"post",
				url:"/admin/delete_x",
				data:{"s_id":stu_num},
				traditional: true,    //数组传递时必须为true,否则发给后台的是stu_num[],而不是一个正常的数组
				success:function(data){
					if(data.result==1){
						alert('删除成功');
					}else{
						alert('删除失败');
					}
				}
			});
		}
	});
	
	//重置所选内容
	$(".reset_x").click(function(){
		var stu_num=[];
		var zt;
        	for(var i=0;i<5;i++){
        		zt=$(".st_tbody>tr:eq("+i+")>td>input[type='checkbox']").prop("checked");
        		if(zt==1){
        			stu_num.push($(".st_tbody>tr:eq("+i+")>td:eq(4)>button").attr('data-id'));	
        		}
        		
        	}
        //console.log(stu_num);
		if(confirm("确认重置全选密码？")){
			$.ajax({
				type:"post",
				url:"/admin/reset_x",
				data:{"s_id":stu_num},
				traditional: true,    //数组传递时必须为true,否则发给后台的是stu_num[],而不是一个正常的数组
				success:function(data){
					if(data.result==1){
						alert('重置成功');
					}else{
						alert('重置失败');
					}
				}
			});
		}
	});
	
	//使用ajax上传文件
	$('.lend_into').click(function(){//弹出提示框
		$("#blindstroy").addClass("shadow");//添加滤镜层
		$(".lend_into_c").removeClass("hide");
		
		$(".lend_save").click(function(){
			var files = $('input[name="fileTrans"]').prop('files');//获取到文件列表
			//console.log(files);
			if(files.length==0){
				alert("请选择文件");
			}else{
				var files_name=files[0].name;
				var zh=(/[^\.]+$/);
				var files_name=files_name.match(zh);
				//console.log(files_name[0]);
				if(files_name[0]!='xls'){
					alert("请选择excel表格");
				}else{
					var formData = new FormData();
					 //为FormData对象添加数据
		            $.each(files, function(i, files) {
		               formData.append('upload_file', files);
		            });
					$.ajax({
						type:"post",
						url:"/admin/lend_in",
						data:formData,
						dataType: 'JSON',
						contentType:false,
						processData:false,
						success: function(data){
		                    alert("上传成功！");
		                    $("#blindstroy").removeClass("shadow");//移除滤镜层
							$(".lend_into_c").addClass("hide");
		                    
		                },
		                error: function(XHR, ajaxOptions, thrownError) {
			                switch(XHR.status) {
			                    // 403 Forbidden
			                    case 403:
			                        alert("Woops ..服务器正在进行维护, 请稍后再试");
			                        break;
			                    // 404 Not Found
			                    case 404:
			                        alert("Woops ..糟糕, 页面走丢了");
			                        break;
			                    // 500/502 服务器内部错误
			                    case 500: case 502:
			                        alert("Woops ..服务器正在进行升级, 请稍后再试");
			                        break;
			                }
			            }
					});
					
				}
			}
			
		});
	});
	//为取消绑定事件
	$(".lend_q").click(function(){
		$("#blindstroy").removeClass("shadow");//移除滤镜层
		$(".lend_into_c").addClass("hide");
	})
/************************************************************************************/
//课程匹配管理
	$(".sectio_s_k").click(function(){
		$("#st_course").removeClass('hide');//显示课程匹配
		$("#gl_k").addClass("hide");//显示课程管理
		$("#gl_z").addClass('hide');//将章节管理隐藏
		$("#gl_s").addClass("hide");//将单选试题管理隐藏
    	$("#ti_t_fillblank").addClass('hide');//隐藏填空题试题
    	$("#ti_p_judge").addClass('hide');//隐藏判断题
    	$("#ti_g_fillblank").addClass('hide');//隐藏改错题
	    $("#st").addClass('hide');//将学生信息管理添加隐藏
	    $("#st_yuan").addClass('hide');//将院系情况隐藏
	    $("#st_class").addClass('hide');//将班级内容隐藏
		
		var st_yuan=['机电工程学院','电子与控制工程学院','经济管理系','建筑工程系','计算机与信息遥感技术学院','会计系','外语系','材料工程学院','文法系'];
		$.ajax({
			type:"post",
			url:"/admin/stu_course",
			async:true,
			success:function(data){
				//console.log(data.data);//那到课程
				$(".st_course_cc").text('');//去掉之前添加数据
				for(var i=0;i<data.data.rel.length;i++){
					$(".st_course_cc").append("<tr><td></td><td><select class='st_course_kc'><option value='0'>未匹配课程</option></select></td></tr>");
					$(".st_course_cc>tr:eq("+i+")>td:eq(0)").text(st_yuan[i]);//添加院系
					$(".st_course_cc>tr:eq("+i+")>td:eq(0)").attr('value',(i+1));//为每一个院系添加一个value值
					//为选项添加内容
					for(var j=0;j<data.data.ke.length;j++){
						$(".st_course_cc>tr:eq("+i+")>td:eq(1)>select").append("<option>"+data.data.ke[j].c_name+"</option>");
						$(".st_course_cc>tr:eq("+i+")>td:eq(1)>select>option:eq("+(j+1)+")").attr('value',data.data.ke[j].id);
					}
					//添加选中状态
					for(var z=0;z<data.data.ke.length;z++){
						if(data.data.rel[i].c_id==data.data.ke[z].id){
							$(".st_course_cc>tr:eq("+i+")>td:eq(1)>select>option").removeAttr('selected');
							$(".st_course_cc>tr:eq("+i+")>td:eq(1)>select>option:eq("+(z+1)+")").attr('selected','selected');
							break;
						}else{
							$(".st_course_cc>tr:eq("+i+")>td:eq(1)>select>option").removeAttr('selected');
							$(".st_course_cc>tr:eq("+i+")>td:eq(1)>select>option:eq(0)").attr('selected','selected');
						}
					}
					
				}
				//为课程选项更改绑定事件
				$(".st_course_cc").delegate("select","change",function(){
					var c_id=$(this).val();//拿到课程id
					var num=$(this.parentNode.parentNode.firstElementChild).attr('value');
					//将结果发送上去
					$.ajax({
						type:"post",
						url:"/admin/stu_course_updata",
						async:true,
						data:{
							"c_id":c_id,
							"num":num
						},
						success:function(data){
							if(data.result==-1){
								alert("暂无此院系学生")
							}else{
								alert("保存成功");
							}
						}
					});
				})
				
				
			}//success:function(data){
		});//$.ajax	    	
	})
/************************************************************************************/
//课程管理操作
	$( ".sectio_ti_k" ).click(function() {
        $("#gl_k").removeClass("hide");//显示课程管理
	    $("#gl_z").addClass('hide');//将章节管理隐藏
	    $("#gl_s").addClass("hide");//将试题管理隐藏
        $("#st").addClass('hide');//将学生信息管理添加隐藏
        $("#st_course").addClass('hide');//将课程匹配隐藏
        $("#st_yuan").addClass('hide');//将院系情况隐藏
        $("#st_class").addClass('hide');//将班级内容隐藏
		course_gl();//调用课程函数拉取内容的函数
	});//点击课程页面的
	function course_gl(){
		//上来就去拉去数据
		$.ajax({
			type:"get",
			url:"/admin/course",
			async:true,
			data:{"num":0},
			success:function(data){
				//console.log(data);
				if(data.result==-1){
					$(".c_tbody").append("<tr><td>暂无内容，请先添加</td></tr>");
				}else{
					//console.log(data.data);
					$(".c_tbody").text('');//清除因为没有数据写入的内容
					$("#gl_k thead>tr>th:first>input[type='checkbox']").prop("checked", false);
					for(var i=0;i<data.data.length;i++){
						$(".c_tbody").append("<tr><td><input type='checkbox'/></td><td><img/></td><td></td><td></td><td></td><td></td><td><button class='btn recompose ti_k_alter'>修改</button><button class='c_delete btn btn-warning'>删除</button></td></tr>");//为tbody里加入行
						$(".c_tbody>tr:eq("+i+")>td:eq(1)>img").attr("src","./upload/"+data.data[i].c_img);//打印每一行图片
						$(".c_tbody>tr:eq("+i+")>td:eq(1)>img").attr("style","width:32px;");
						$(".c_tbody>tr:eq("+i+")>td:eq(2)").text(data.data[i].c_name);//打印每一行课程名称
						$(".c_tbody>tr:eq("+i+")>td:eq(3)").text(data.data[i].c_year);//打印每一行学年
						$(".c_tbody>tr:eq("+i+")>td:eq(4)").text(data.data[i].c_semester);//打印每一行学期
						$(".c_tbody>tr:eq("+i+")>td:eq(5)").text(data.data[i].c_open_time+'--'+data.data[i].c_close_time);//打印每一行开发时间
						$(".c_tbody>tr:eq("+i+")>td:eq(6)>button").attr("data-id",data.data[i].ID);//为每一行的按钮添加id属性
						
					}
				}
				//操作删除和修改的
				$(".c_delete").click(function(){
					var c_id=$(this).attr("data-id");
					//console.log(c_id);
					if(confirm("确认删除吗？")){
						$.ajax({
							type:"delete",
							url:"/admin/c_delete",
							data:{"id":c_id},
							async:true,
							success:function(data){
								if(data.result==-1){
									alert("删除失败");
									window.location='/admin'					
								}else{
									alert("删除成功");
									window.location='/admin'
								}
							}
						});
					}
				});
				
				//修改的
				$(".ti_k_alter").click(function(){
					$("#blindstroy").addClass("shadow");//添加滤镜层
					$(".ti_k_alter-page").removeClass("hide");//显示修改
					$(".ti_k_add-page").addClass('hide');//隐藏增加
					
					var id=$(this).attr("data-id");//拿到这个修改数据的iD
					//console.log(id);
					//页面弹出来后，就去拉去数据
					$.ajax({
						type:"post",
						url:"/admin/c_alter_ol",
						data:{"id":id},
						async:true,
						success:function(data){
							//console.log(data.data[0]);
							$("#alter_kc").attr('value',data.data[0].c_name);
							$("#alter_xn").attr('value',data.data[0].c_year);
							$("#alter_fi").attr('value',data.data[0].c_open_time);
							$("#alter_la").attr('value',data.data[0].c_close_time);
						}
					});
					
					//点击修改时发送的
					$(".c_alter").click(function(){
						var c_img=$('input[name="alter_img"]').prop('files');//获取文件图片
						var c_name=$("#alter_kc").val();//获取课程名称
						var c_year=$("#alter_xn").val();//获取学年
						var c_semester=$(".c_alter_select option:selected").val();//获取学期
						if(c_semester==-1){c_semester=1}
						var c_open_time=$("#alter_fi").val();//获取开放时间
						var c_close_time=$("#alter_la").val();//获取结束时间
						//console.log(c_name,c_year,c_semester,c_open_time,c_close_time);
						//发送修改课程基本内容的数据
						$.ajax({
							type:"post",
							url:"/admin/c_alter",
							data:{
								"id":id,
								"c_name":c_name,
								"c_year":c_year,
								"c_semester":c_semester,
								"c_open_time":c_open_time,
								"c_close_time":c_close_time
							},
							async:true,
							success:function(data){
								if(c_img.length!=0){
									//发送修改课程图片的信息
									var files_name=c_img[0].name;
									var zh=(/[^\.]+$/);
									var files_name=files_name.match(zh);
									//发送图片
									var formData = new FormData();
									 //为FormData对象添加数据
						            $.each(c_img, function(i, c_img) {
						               formData.append('upload_file', c_img);
						            });
					            
						            //console.log(files_name[0]);
									if(files_name[0]!='jpg'&&files_name[0]!='png'&&files_name[0]!='jpeg'){
										alert("请上传图片格式为jpg或png或jpeg的图片");
									}else{
										$.ajax({
											type:"post",
											url:"/admin/c_add_img"+"?id="+id,
											data:formData,
											dataType: 'JSON',
											contentType:false,
											processData:false,
											async:true,
											success:function(data){
												if(data.result==1){
													alert("修改成功")
												}else{
													alert("修改失败")
												}
												$("#blindstroy").removeClass("shadow");//去掉滤镜层
												$(".ti_k_alter-page").addClass("hide");//隐藏修改
												$(".ti_k_add-page").addClass('hide');//隐藏增加
											}
										});
									}
								}else{//修改没有没有带图片的
									if(data.result==1){
										alert("修改成功")
									}else{
										alert("修改失败")
									}
									$("#blindstroy").removeClass("shadow");//去掉滤镜层
									$(".ti_k_alter-page").addClass("hide");//隐藏修改
									$(".ti_k_add-page").addClass('hide');//隐藏增加
								}
							}//success:function(data)
						});
		
					});
					
				});
				//为全选设置标记
				$("#gl_k thead>tr>th:first>input").click(function(){//为全选绑定事件
					var bj=this.checked;
					//表示全选的按被按下，将所有复选框勾上
					if(bj==1){   
			        	$("input[type='checkbox']").prop("checked", true); 
			        	bj=0;
			        //取消全选
				    }else{   
						$("input[type='checkbox']").prop("checked", false);
						bj=1;
				    } 
				});
				//为全选取消其中一个内容时，页面上的全选功能的对勾去掉,全部选中时，在将内容加上
				$(".c_tbody>tr>td>input").click(function(){
					//只要有一个取消，就将全选按钮取消
					var node_num=$(".c_tbody").children().length;
					for(var i=0,z=0;i<node_num;i++){
						var bb=$(".c_tbody>tr:eq("+i+")>td:eq(0)>input[type='checkbox']").prop("checked");
						if(!bb){
							$("#gl_k thead>tr>th:first>input[type='checkbox']").prop("checked", false);
							break;
						}
						if(bb==1){
							z++;
						}
						if(z==node_num){
							$("#gl_k thead>tr>th:first>input[type='checkbox']").prop("checked", true);
						}
					}
					
				})
			}//success:function(data)的结尾
		});//ajax的
	}
	
	//修改的取消
	$(".c_quxiao").click(function(){
		$("#blindstroy").removeClass("shadow");//去掉滤镜层
		$(".ti_k_alter-page").addClass("hide");//隐藏修改
		$(".ti_k_add-page").addClass('hide');//隐藏增加
	});
	
	//增加课程
	$(".ti_k_add").click(function(){
		$("#blindstroy").addClass("shadow");//添加滤镜层
		$(".ti_k_add-page").removeClass("hide");//显示页面
		$(".ti_k_alter-page").addClass('hide');//将修改隐藏
		
		//当点击保存的时候获取填写的内容
		$(".c_save").click(function(){
			var c_img=$('input[name="c_img"]').prop('files');//获取文件图片
			var c_name=$("#c_name").val();//获取课程名称
			var c_year=$("#c_year").val();//获取学年
			var c_semester=$(".c_add_select option:selected").val();//获取学期
			if(c_semester==-1){c_semester=1}
			var c_open_time=$("#c_open_time").val();//获取开放时间
			var c_close_time=$("#c_close_time").val();//获取结束时间
			
			//判断文件不能为空,和内容不能为空，没有做正则限制
			if(c_img.length==0||c_name==''||c_year==''||c_open_time==''||c_open_time==''){
				alert("上传文件或其他内容不能为空");
			}else{
				var files_name=c_img[0].name;
				var zh=(/[^\.]+$/);
				var files_name=files_name.match(zh);
				//发送图片
				var formData = new FormData();
				 //为FormData对象添加数据
	            $.each(c_img, function(i, c_img) {
	               formData.append('upload_file', c_img);
	            });
				//console.log(files_name[0]);
				if(files_name[0]!='jpg'&&files_name[0]!='png'&&files_name[0]!='jpeg'){
					alert("请上传图片格式为jpg或png或jpeg的图片");
				}else{
					//发送出图片以外的数据到服务器中
					$.ajax({
						type:"post",
						url:"/admin/c_add",
						data:{
							"c_name":c_name,
							"c_year":c_year,
							"c_semester":c_semester,
							"c_open_time":c_open_time,
							"c_close_time":c_close_time
						},
						dataType: 'JSON',
						async:true,
						success:function(data){
							var c_id=data.data.insertId;//拿到新添加的课程id
							//发送图片
							$.ajax({
				            	type:"post",
				            	url:"/admin/c_add_img"+"?id="+c_id,
				            	data:formData,
								dataType: 'JSON',
								contentType:false,
								processData:false,
								success:function(data){
									if(data.result==1){
										//当图片上传成功后,为每一课的第一章添加一个默认第0章
										$.ajax({
											type:"post",
											url:"/admin/c_add_test",
											data:{"c_id":c_id},
											async:true,
											success:function(data){
												var z_id=data.data.insertId;//拿到新添加的章节id
												$.ajax({
													type:"post",
													url:"/admin/c_add_testF",
													data:{"z_id":z_id},
													async:true,
													success:function(data){
														if(data.result==1){
															alert('上传成功')
														}else{
															alert('上传失败');
														}
														$("#blindstroy").removeClass("shadow");//添加滤镜层
														$(".ti_k_add-page").addClass("hide");//隐藏页面
														$(".ti_k_alter-page").addClass('hide');//将修改隐藏
													}
												});
												
											}
										});									
									}	
								}
				           });
						}
					}); 
				}
			}
		});
		//当点击取消时
		$(".c_quxiao").click(function(){
			$("#blindstroy").removeClass("shadow");//添加滤镜层
			$(".ti_k_add-page").addClass("hide");//隐藏页面
			$(".ti_k_alter-page").addClass('hide');//将修改隐藏
		});
		
	});
	
/************************************************************************************/
	 //为章节管理绑定事件
    $( ".sectio_ti_z" ).click(function() {
      	$("#gl_z").removeClass("hide");//显示章节管理
      	$("#gl_k").addClass('hide');//隐藏课程
      	$("#gl_s").addClass("hide");//将单选试题管理隐藏
    	$("#ti_t_fillblank").addClass('hide');//隐藏填空题试题
    	$("#ti_p_judge").addClass('hide');//隐藏判断题
    	$("#ti_g_fillblank").addClass('hide');//隐藏改错题
      	$("#st").addClass('hide');//将学生信息管理添加隐藏
      	$("#st_course").addClass('hide');//将课程匹配隐藏
      	$("#st_yuan").addClass('hide');//将院系情况隐藏
      	$("#st_class").addClass('hide');//将班级内容隐藏
	    //上来就拉取数据
	    $.ajax({
	    	type:"get",
	    	url:"/admin/section",
	    	async:true,
	//  	data:{"num":0},
	  		success:function(data){
	 			var tip=0;//用于判断是否有课程
	    		if(data.result!=1){
					$(".z_tbody").append("<tr><td>暂无内容，请先添加</td></tr>");
				}else{
					$(".z_tbody").text('');//清除因为没有数据写入的内容
					$("#gl_z thead>tr>th:first>input[type='checkbox']").prop("checked", false);//将全选清除
					for(var i=0,j=0;i<data.data.length;i++){
						if(data.data[i].ch_name!=null){
							$(".z_tbody").append("<tr><td><input type='checkbox'/></td><td></td><td></td><td></td><td></td><td><button class='btn recompose ti_z_alter'>修改</button><button  class='z_delete btn btn-warning'>删除</button></td></tr>");//为tbody里加入行
							$(".z_tbody>tr:eq("+j+")>td:eq(1)").text(data.data[i].ch_name);//打印每一行章节名称
							$(".z_tbody>tr:eq("+j+")>td:eq(2)").text(data.data[i].c_name);//打印每一行章节所属课程
							$(".z_tbody>tr:eq("+j+")>td:eq(3)").text((data.data[i].ti_num-1));//每一章的题目,//因为这前添加章节时，会默认添加一条个章节的第一题
							$(".z_tbody>tr:eq("+j+")>td:eq(4)").text(data.data[i].ch_open_time+'--'+data.data[i].ch_close_time);//打印每一行开发时间
							$(".z_tbody>tr:eq("+j+")>td:eq(5)>button").attr("data-id",data.data[i].ID);//为每一行的按钮添加id属性
							j++;
						}
					}	
					tip=1;
				}
				//只有在已经添加了课程的基础上才能添加,删除和修改，章节的增加按钮
				if(tip){
					$(".ti_z_add").click(function(){
						$("#blindstroy").addClass("shadow");//添加滤镜层
						$('.ti_z_add-page').removeClass('hide');//显示增加章节
						$(".ti_z_alter-page").addClass('hide');//隐藏修改
						
						var courseS=[];//将添加的课程都归结到这里
						//动态添加课程
						for(var i=0;i<data.data.length;i++){
							var tt=courseS.indexOf(data.data[i].c_name);//数组里没有是-1
							if(tt==-1){
								courseS.push(data.data[i].c_name)
							}
						}
						//将之前添加的课程去掉
						$(".select_zj").text('');
						for(var j=0;j<courseS.length;j++){
							$(".select_zj").append("<option value="+(j-1)+">"+courseS[j]+"</option>");
						}
						var c_id=null;//当填写章节名称的时候拿去，相对于的课程的 ID
						var zz_num=0;//显示目前已经有的章节数
						//当填写章节名称时获取课程名称，并查找相应的课程号，然后在显示在p标签里
						$("#zj_name").focus(function(){
							var kc_name=$(".select_zj option:selected").val();//获取课程名字的value
							kc_name=courseS[(parseInt(kc_name)+1)];
							for(var t=0;t<data.data.length;t++){
								if(data.data[t].c_name==kc_name){
									zz_num=data.data[t].ch_num;
									c_id=data.data[t].c_id;
								}
							}
							$(".zj_num").text("您正在添加-"+kc_name+"-的第-"+(zz_num+1)+"-章");
						})
						
						//点击保存时
						$(".z_save").click(function(){
							var zj_name=$("#zj_name").val();//拿到添加页面上的内容
							var z_open_time=$("#z_open_time").val();
							var z_close_time=$("#z_close_time").val();
							//检测一下是否有空
							if(c_id==null||zj_name==''||z_close_time==''||z_close_time==''){
								alert('填写内容不能为空');
							}else{
								$.ajax({
									type:"post",
									url:"/admin/z_add",
									data:{
										"c_id":c_id,
										"zj_num":(zz_num+1),
										"zj_name":zj_name,
										"z_close_time":z_close_time,
										"z_open_time":z_open_time
									},
									success:function(data){
										var ch_id=data.data.insertId;//拿到新添加的章节id,
										//发一个请求，去填写一个默认的这一章的第一题
										$.ajax({
											type:"post",
											url:"/admin/z_add_test",
											data:{"ch_id":ch_id},
											async:true,
											success:function(data){
												if(data.result==1){
													alert("添加成功");
												}else{
													alert("添加失败");
												}
												$("#blindstroy").removeClass("shadow");//添加滤镜层
												$('.ti_z_add-page').addClass('hide');//显示增加章节
												$(".ti_z_alter-page").addClass('hide');//隐藏修改
											}
										});
	
									}
								})
							}	
						});//点击保存的
						//当点击取消时
						$(".z_quxiao").click(function(){
							$("#blindstroy").removeClass("shadow");//添加滤镜层
							$('.ti_z_add-page').addClass('hide');//显示增加章节
							$(".ti_z_alter-page").addClass('hide');//隐藏修改
						});
						
					});
					
					//删除
					$(".z_delete").click(function(){
						var id=$(this).attr("data-id");
						//console.log(id);
						if(confirm("确认删除吗？")){
							$.ajax({
								type:"delete",
								url:"/admin/z_delete",
								data:{"id":id},
								async:true,
								success:function(data){
									if(data.result==-1){
										alert("删除失败");
										window.location='/admin'					
									}else{
										alert("删除成功");
										window.location='/admin'
									}
								}
							});
						}
					});
				}//tip=1;
				//为全选设置标记
				$("#gl_z thead>tr>th:first>input").click(function(){//为全选帮顶事件
					var bj=this.checked;
					//表示全选的按被按下，将所有复选框勾上
					if(bj==1){   
			        	$("input[type='checkbox']").prop("checked", true); 
			        	bj=0;
			        //取消全选
				    }else{   
						$("input[type='checkbox']").prop("checked", false);
						bj=1;
				    } 
				});
				//为全选取消其中一个内容时，页面上的全选功能的对勾去掉,全部选中时，在将内容加上
				$(".z_tbody>tr>td>input").click(function(){
					//只要有一个取消，就将全选按钮取消
					var node_num=$(".z_tbody").children().length;
					for(var i=0,z=0;i<node_num;i++){
						var bb=$(".z_tbody>tr:eq("+i+")>td:eq(0)>input[type='checkbox']").prop("checked");
						if(!bb){
							$("#gl_z thead>tr>th:first>input[type='checkbox']").prop("checked", false);
							break;
						}
						if(bb==1){
							z++;
						}
						if(z==node_num){
							$("#gl_z thead>tr>th:first>input[type='checkbox']").prop("checked", true);
						}
					}
					
				})
			    //获取表中所有选中数据的data-id
				$(".z_zuo button").click(function(){
					var stu_num=[];
					var zt;
			        	for(var i=0;i<data.data.length;i++){
			        		zt=$(".z_tbody>tr:eq("+i+")>td>input[type='checkbox']").prop("checked");
			        		if(zt==1){
			        			stu_num.push($(".z_tbody>tr:eq("+i+")>td:eq(5)>button").attr('data-id'));	
			        		}
			        		
			        	}
					if(confirm("确认真的要删除全选？")){
						$.ajax({
							type:"post",
							url:"/admin/delete_zx",
							data:{"s_id":stu_num},
							traditional: true,    //数组传递时必须为true,否则发给后台的是stu_num[],而不是一个正常的数组
							success:function(data){
								if(data.result==1){
									alert('删除成功');
								}else{
									alert('删除失败');
								}
							}
						});
					}
				});
				
				//点击页面上的修改按钮时
				$(".ti_z_alter").click(function(){
					$("#blindstroy").addClass("shadow");//添加滤镜层
					$(".ti_z_alter-page").removeClass("hide");//显示修改
					$(".ti_z_add-page").addClass('hide');//隐藏增加
					var alter_id=parseInt($(this).attr("data-id"));
					var alter_name=null;//用来保留修改名字
					var alter_open=null;//用来保留修改时间
					var alter_close=null;//用来保留关闭时间
					var alter_num=null;//用于保留修改的章节
					var c_id=null;//当填写章节名称的时候拿去，相对于的课程的 ID
					var c_name=null;//课程名字
					for(var w=0;w<data.data.length;w++){
						if(data.data[w].ID==alter_id){
							c_id=data.data[w].c_id;//课程id
							c_name=data.data[w].c_name;//课程名字
							alter_name=data.data[w].ch_name;//章节名字
							alter_open=data.data[w].ch_open_time;
					 		alter_close=data.data[w].ch_close_time;
					 		alter_num=data.data[w].ch_num;
						}
					}
					var yy=alter_name.split("-");
						alter_name=yy[1];
					//将要修改的内容显示在p标签里
					$(".zj_name").text(c_name);
					$(".zj_num").text("您正在修改-"+c_name+"-的第-"+alter_num+"-章");//提示语p标签的
					$("#zj_name_alter").attr("value",alter_name);//提前将要修改的内容显示
					$("#alter_zj_open").attr("placeholder",alter_open)//将时间放上去
					$("#alter_zj_close").attr("placeholder",alter_close);
					//当点击修改时
					$(".zj_alter").click(function(){
						//已经有的值，c_id课程id，later_id，所要修改是章节id，zz_num
						var alter_new_name=$("#zj_name_alter").val();//拿到课程名字
						var alter_new_o_time=$("#alter_zj_open").val();//开发时间
						var alter_new_c_time=$("#alter_zj_close").val();//关闭时间
						//console.log(alter_id,c_id,alter_num,alter_new_name,alter_new_o_time,alter_new_c_time)
						if(alter_new_name==''||alter_new_o_time==''||alter_new_c_time==''){
							alert("章节名字和开放时间，关闭时间不能为空");
						}else{
							$.ajax({
								type:"post",
								url:"/admin/z_alter",
								async:true,
								data:{
									"id":alter_id,
									"c_id":c_id,
									"zj_num":alter_num,
									"alt_name":alter_new_name,
									"alt_op":alter_new_o_time,
									"alt_cl":alter_new_c_time
								},
								success:function(data){
									if(data.result==1){
										alert("修改成功");
									}else{
										alert("修改失败");
									}
									$("#blindstroy").removeClass("shadow");//添加滤镜层
									$(".ti_z_alter-page").addClass("hide");//显示修改
									$(".ti_z_add-page").addClass('hide');//隐藏增加
								}
							});
						}
					})
				});
				
	    	}//success:function(data)
	    });
    });//点击课程列表时
    //点击修改取消时
    $(".zj_quxiao").click(function(){
    	$("#blindstroy").removeClass("shadow");//添加滤镜层
		$(".ti_z_alter-page").addClass("hide");//显示修改
		$(".ti_z_add-page").addClass('hide');//隐藏增加
    })
    
/************************************************************************************/
	//为单选试题管理绑定事件
    $(".sectio_ti_s").click(function(){
      	$("#gl_s").removeClass("hide")//显示单选试题管理
      	$("#gl_z").addClass("hide");//隐藏章节管理
      	$("#gl_k").addClass('hide');//隐藏课程
      	$("#ti_t_fillblank").addClass('hide');//隐藏填空题试题
      	$("#ti_p_judge").addClass('hide');//隐藏判断题
      	$("#ti_g_fillblank").addClass('hide');//隐藏改错题
      	$("#st").addClass('hide');//将学生信息管理添加隐藏
      	$("#st_course").addClass('hide');//将课程匹配隐藏
      	$("#st_yuan").addClass('hide');//将院系情况隐藏
      	$("#st_class").addClass('hide');//将班级内容隐藏
	    //上来就是拉去服务器上的试题内容
		page(0);
	});
/************************************************************************/
/************单选试题分页***********************/
	$(".test_page>ul>li:eq(1)").addClass('active');//页面一上来就给数字1添加选中状态
	//这是一个拉取数据并刷新到页面上的函数，可以修改和删除
	function page(page_num){
		//将这前的数据清空
	 	$(".t_tbody").text('');//清除之前添加的所有信息
	 	$.ajax({
			type:"get",
			url:"/admin/test_show",
			data:{"num":page_num},
			async:true,
			success:function(data){
				//console.log(data.data);
				if(data.result!=1){
					$(".t_tbody").append("<tr><td>暂无内容，请先添加</td></tr>");
				}else{
					$(".t_tbody").text('');//清除之前添加的暂无内容的信息
					$("#gl_s thead>tr>th:first>input[type='checkbox']").prop("checked", false);
					for(var i=0;i<data.data.length;i++){
						$(".t_tbody").append("<tr><td><input type='checkbox'/></td><td></td><td></td><td></td><td></td><td></td><td><button class='btn recompose ti_s_alter'>修改</button><button class='s_delete btn btn-warning'>删除</button></td></tr>");
						data.data[i].t_title=data.data[i].t_title.substring(0,15);//截取25个字符
						$(".t_tbody>tr:eq("+i+")>td:eq(1)").text(data.data[i].t_title);//打印试题的题目
						$(".t_tbody>tr:eq("+i+")>td:eq(2)").text("第"+data.data[i].ch_num+"章");//打印每一行试题所属章节
						$(".t_tbody>tr:eq("+i+")>td:eq(3)").text(data.data[i].c_name);//打印每一行试题所属课程
						$(".t_tbody>tr:eq("+i+")>td:eq(4)").text(data.data[i].t_score);//每一题的分值
						$(".t_tbody>tr:eq("+i+")>td:eq(5)").text(data.data[i].t_degree);//每一行的难度系数
						$(".t_tbody>tr:eq("+i+")>td:eq(6)>button").attr("data-id",data.data[i].t_id);//为每一行的按钮添加id属性
					}
				
				}
				//操作删除和修改的
				$(".s_delete").click(function(){
					var t_id=$(this).attr("data-id");
					//console.log(t_id);
					if(confirm("确认删除吗？")){
						$.ajax({
							type:"delete",
							url:"/admin/s_delete",
							data:{"id":t_id},
							async:true,
							success:function(data){
								if(data.result==-1){
									alert("删除失败");
									window.location='/admin'					
								}else{
									alert("删除成功");
									window.location='/admin'
								}
							}
						});
					}
				});
				//点击修改时，将页面引导到对应的页面
				$(".ti_s_alter").click(function(){
					var t_id=$(this).attr("data-id");
					window.location='/admin/test_alter'+'?t_id='+t_id;
				});
				//为全选设置标记
				$("#gl_s thead>tr>th:first>input").click(function(){//为全选帮顶事件
					var bj=this.checked;
					//表示全选的按被按下，将所有复选框勾上
					if(bj==1){   
			        	$("input[type='checkbox']").prop("checked", true); 
			        	bj=0;
			        //取消全选
				    }else{   
						$("input[type='checkbox']").prop("checked", false);
						bj=1;
				    } 
				});
				//为全选取消其中一个内容时，页面上的全选功能的对勾去掉,全部选中时，在将内容加上
				$(".t_tbody>tr>td>input").click(function(){
					//只要有一个取消，就将全选按钮取消
					var node_num=$(".t_tbody").children().length;
					for(var i=0,z=0;i<node_num;i++){
						var bb=$(".t_tbody>tr:eq("+i+")>td:eq(0)>input[type='checkbox']").prop("checked");
						if(!bb){
							$("#gl_s thead>tr>th:first>input[type='checkbox']").prop("checked", false);
							break;
						}
						if(bb==1){
							z++;
						}
						if(z==node_num){
							$("#gl_s thead>tr>th:first>input[type='checkbox']").prop("checked", true);
						}
					}
				})
			}//上来拉取数据的success:function(data)(上来就刷新页面的)
		});
	}
	//为试题分页绑定事件
	$(".test_page>ul").delegate('li','click',function(){
		var test_biao=$(this).text();
	 	if(test_biao!='>>'&&test_biao!='<<'){//直接点击时
	 		var page_num=parseInt(test_biao);//获取所选中的页码数字并转化为int型
			$(this).addClass('active').siblings().removeClass('active');//为选中添加状态，移除其兄弟元素的选中状态
			page(page_num);//调用函数
	 	}else{//当点击的不是数字时
	 		if(test_biao=='>>'){
	 			var ac_text=parseInt($(".active>a").html());//获取现在所处位置的内容
	 			var te_num=ac_text%5;//对应到li所处的位置上
	 			var last_right_num=parseInt($(".test_page>ul>li:eq(5)>a").html());//获取最右边的数字
	 			//console.log(ac_text,last_right_num);
	 			if(ac_text<last_right_num){//当选中状态不是最后一个时
	 				$(".test_page>ul>li:eq("+(te_num+1)+")").addClass('active').siblings().removeClass('active');//为下一个添加选中状态
	 				page((ac_text+1));//调用上面的函数
	 			}else{
	 				var top_num=ac_text;//留住上一页的号码
	 				for(var i=1;i<6;i++){
	    				$(".test_page>ul>li:eq("+i+")>a").text('');//先移除
	    				$(".test_page>ul>li:eq("+i+")>a").text((ac_text+1));
	    				ac_text++;
    				}
	 				page((top_num+1));//调用上面的函数
	 				$(".test_page>ul>li:eq(1)").addClass('active').siblings().removeClass('active');//为下一个添加选中状态
	 			}
	 		}else{//为<<箭头时
	 			var ac_text=parseInt($(".active>a").html());//获取现在所处位置的内容
	 			var te_num=ac_text%5;//对应到li所处的位置上
	 			if(te_num==0){
	 				te_num=5;
	 			}
	 			var first_left_num=parseInt($(".test_page>ul>li:eq(1)>a").html());//获取最左边的数字
 				if(ac_text>first_left_num){//当选中状态不是第一个时
	 				$(".test_page>ul>li:eq("+(te_num-1)+")").addClass('active').siblings().removeClass('active');//为下一个添加选中状态
	 				page((ac_text-1));//调用上面的函数
	 			}else{
	 				var top_num=ac_text;//留住上一页的号码
	 				if(top_num!=1){
	 					for(var i=5;i>0;i--){
		    				$(".test_page>ul>li:eq("+i+")>a").text('');//先移除
		    				$(".test_page>ul>li:eq("+i+")>a").text((ac_text-1));
		    				ac_text--;
	    				}
	 					page((top_num-1));//调用上面的函数
	 					$(".test_page>ul>li:eq(5)").addClass('active').siblings().removeClass('active');//为最后个添加选中状态
	 				}else{
	 					alert("老铁都已经到头了，你还点，要脸波？");
	 				}
	 				
	 			}

	 		}
	 	}

	});
	/**********************************************/
	/*导入试题*/
	$(".ti_s_lead").click(function(){
		$("#blindstroy").addClass("shadow");//添加滤镜层
		$(".ti_s_lead-page").removeClass("hide");//显示导入
		$(".ti_s_export-page").addClass('hide');//隐藏导出
		
		$(".lend_test").click(function(){
			var files = $('input[name="fileTrans_ts"]').prop('files');//获取到文件列表
			//console.log(files);
			if(files.length==0){
				alert("请选择文件");
			}else{
				var files_name=files[0].name;
				var zh=(/[^\.]+$/);
				var files_name=files_name.match(zh);
				if(files_name[0]!='xls'){
					alert("请选择excel表格");
				}else{
					var formData = new FormData();
					 //为FormData对象添加数据
		            $.each(files, function(i, files) {
		               formData.append('upload_file', files);
		            });
					$.ajax({
						type:"post",
						url:"/admin/lend_test",
						data:formData,
						dataType: 'JSON',
						contentType:false,
						processData:false,
						success: function(data){
		                   alert(data.result.message);
		                   $("#blindstroy").removeClass("shadow");//移除滤镜层
						   $(".ti_s_lead-page").addClass("hide");//隐藏导入
		                    
		                },
		                error: function(XHR, ajaxOptions, thrownError) {
			                switch(XHR.status) {
			                    // 403 Forbidden
			                    case 403:
			                        alert("Woops ..服务器正在进行维护, 请稍后再试");
			                        break;
			                    // 404 Not Found
			                    case 404:
			                        alert("Woops ..糟糕, 页面走丢了");
			                        break;
			                    // 500/502 服务器内部错误
			                    case 500: case 502:
			                        alert("Woops ..服务器正在进行升级, 请稍后再试");
			                        break;
			                }
			            }
					});

				}
			}
			
		});
		//点击取消时
		$(".t_quxiao").click(function(){
			$("#blindstroy").removeClass("shadow");//移除滤镜层
			$(".ti_s_lead-page").addClass("hide");//隐藏导入
		})
	});
/*************************************************************************************/
	//为填空题绑定事件
	$(".sectio_ti_t").click(function(){
		$("#ti_t_fillblank").removeClass('hide');//隐藏填空题试题
		$("#gl_s").addClass("hide")//显示单选试题管理
		$("#ti_p_judge").addClass('hide');//隐藏判断题
		$("#ti_g_fillblank").addClass('hide');//隐藏改错题
      	$("#gl_z").addClass("hide");//隐藏章节管理
      	$("#gl_k").addClass('hide');//隐藏课程
      	$("#st").addClass('hide');//将学生信息管理添加隐藏
      	$("#st_course").addClass('hide');//将课程匹配隐藏
      	$("#st_yuan").addClass('hide');//将院系情况隐藏
      	$("#st_class").addClass('hide');//将班级内容隐藏
      	//上来就去拉取数据
      	fill_page(0);//去拉去第一页的数据
	});
	/*******************************************/
	//为填空题分页添加选中状态
	$(".fill_page>ul>li:eq(1)").addClass('active');//页面一上来就给数字1添加选中状态
	//构建拉取函数
	function fill_page(num){
		//将这前的数据清空
	 	$(".tian_tbody").text('');//清除之前添加的所有信息
	 	$.ajax({
      		type:"get",
      		url:"/admin/test_t_show",
      		async:true,
      		data:{"num":num},
      		success:function(data){
      			if(data.result!=1){
					$(".tian_tbody").append("<tr><td>暂无内容，请先添加</td></tr>");
				}else{
					$(".tian_tbody").text('');//清除之前添加的暂无内容的信息
					$("#ti_t_fillblank thead>tr>th:first>input[type='checkbox']").prop("checked", false);
					for(var i=0;i<data.data.length;i++){
						$(".tian_tbody").append("<tr><td><input type='checkbox'/></td><td></td><td></td><td></td><td><button class='btn recompose ti_t_alter'>修改</button><button class='t_delete btn btn-warning'>删除</button></td></tr>");
						data.data[i].t_title=data.data[i].t_title.substring(0,25);//截取25个字符
						$(".tian_tbody>tr:eq("+i+")>td:eq(1)").text(data.data[i].t_title);//打印试题的题目
						$(".tian_tbody>tr:eq("+i+")>td:eq(2)").text("第"+data.data[i].ch_num+"章");//打印每一行试题所属章节
						$(".tian_tbody>tr:eq("+i+")>td:eq(3)").text(data.data[i].c_name);//打印每一行试题所属课程
						$(".tian_tbody>tr:eq("+i+")>td:eq(4)>button").attr("data-id",data.data[i].t_id);//为每一行的按钮添加id属性
					}
				}
				//操作删除和修改的
				$(".t_delete").click(function(){
					var t_id=$(this).attr("data-id");
					if(confirm("确认删除吗？")){
						$.ajax({
							type:"delete",
							url:"/admin/t_delete",
							data:{"id":t_id},
							async:true,
							success:function(data){
								if(data.result==-1){
									alert("删除失败");
									window.location='/admin'					
								}else{
									alert("删除成功");
									window.location='/admin'
								}
							}
						});
					}
				});
				//点击修改时，将页面引导到对应的页面
				$(".ti_t_alter").click(function(){
					var t_id=$(this).attr("data-id");
					window.location='/admin/test_fill_alter'+'?t_id='+t_id;
				});
				//为全选设置标记
				$("#ti_t_fillblank thead>tr>th:first>input").click(function(){//为全选帮顶事件
					var bj=this.checked;
					//表示全选的按被按下，将所有复选框勾上
					if(bj==1){   
			        	$("input[type='checkbox']").prop("checked", true); 
			        	bj=0;
			        //取消全选
				    }else{   
						$("input[type='checkbox']").prop("checked", false);
						bj=1;
				    } 
				});
				//为全选取消其中一个内容时，页面上的全选功能的对勾去掉,全部选中时，在将内容加上
				$(".tian_tbody>tr>td>input").click(function(){
					//只要有一个取消，就将全选按钮取消
					var node_num=$(".tian_tbody").children().length;
					for(var i=0,z=0;i<node_num;i++){
						var bb=$(".tian_tbody>tr:eq("+i+")>td:eq(0)>input[type='checkbox']").prop("checked");
						if(!bb){
							$("#ti_t_fillblank thead>tr>th:first>input[type='checkbox']").prop("checked", false);
							break;
						}
						if(bb==1){
							z++;
						}
						if(z==node_num){
							$("#ti_t_fillblank thead>tr>th:first>input[type='checkbox']").prop("checked", true);
						}
					}
				})
      		}
      	});
	}
	/*****************************************/
	//为填空题分页绑定事件
	$(".fill_page>ul").delegate('li','click',function(){
		var test_biao=$(this).text();
	 	if(test_biao!='>>'&&test_biao!='<<'){//直接点击时
	 		var page_num=parseInt(test_biao);//获取所选中的页码数字并转化为int型
			$(this).addClass('active').siblings().removeClass('active');//为选中添加状态，移除其兄弟元素的选中状态
			fill_page(page_num);//调用函数
	 	}else{//当点击的不是数字时
	 		if(test_biao=='>>'){
	 			var ac_text=parseInt($(".fill_page li.active>a").html());//获取现在所处位置的内容
	 			var te_num=ac_text%5;//对应到li所处的位置上
	 			var last_right_num=parseInt($(".fill_page>ul>li:eq(5)>a").html());//获取最右边的数字
	 			if(ac_text<last_right_num){//当选中状态不是最后一个时
	 				$(".fill_page>ul>li:eq("+(te_num+1)+")").addClass('active').siblings().removeClass('active');//为下一个添加选中状态
	 				fill_page((ac_text+1));//调用上面的函数
	 			}else{
	 				var top_num=ac_text;//留住上一页的号码
	 				for(var i=1;i<6;i++){
	    				$(".fill_page>ul>li:eq("+i+")>a").text('');//先移除
	    				$(".fill_page>ul>li:eq("+i+")>a").text((ac_text+1));
	    				ac_text++;
    				}
	 				fill_page((top_num+1));//调用上面的函数
	 				$(".fill_page>ul>li:eq(1)").addClass('active').siblings().removeClass('active');//为下一个添加选中状态
	 			}
	 		}else{//为<<箭头时
	 			var ac_text=parseInt($(".fill_page li.active>a").html());//获取现在所处位置的内容
	 			var te_num=ac_text%5;//对应到li所处的位置上
	 			if(te_num==0){
	 				te_num=5;
	 			}
	 			var first_left_num=parseInt($(".fill_page>ul>li:eq(1)>a").html());//获取最左边的数字
 				if(ac_text>first_left_num){//当选中状态不是第一个时
	 				$(".fill_page>ul>li:eq("+(te_num-1)+")").addClass('active').siblings().removeClass('active');//为下一个添加选中状态
	 				fill_page((ac_text-1));//调用上面的函数
	 			}else{
	 				var top_num=ac_text;//留住上一页的号码
	 				if(top_num!=1){
	 					for(var i=5;i>0;i--){
		    				$(".fill_page>ul>li:eq("+i+")>a").text('');//先移除
		    				$(".fill_page>ul>li:eq("+i+")>a").text((ac_text-1));
		    				ac_text--;
	    				}
	 					fill_page((top_num-1));//调用上面的函数
	 					$(".fill_page>ul>li:eq(5)").addClass('active').siblings().removeClass('active');//为最后个添加选中状态
	 				}else{
	 					alert("老铁都已经到头了，你还点，要脸波？");
	 				}
	 			}
	 		}
	 	}
	});
	/*****************************************/
	//填空试题导入
//	$(".ti_t_lead").click(function(){
//		$("#blindstroy").addClass("shadow");//添加滤镜层
//		$(".ti_t_lead-page").removeClass("hide");//显示导入
//		$(".ti_s_export-page").addClass('hide');//隐藏导出
//		
//		
//		//点击取消时
//		$(".t_quxiao_t").click(function(){
//			$("#blindstroy").removeClass("shadow");//移除滤镜层
//			$(".ti_t_lead-page").addClass("hide");//隐藏导入
//		})
//	})
/*************************************************************************************/
//为判断题绑定事件
	$(".sectio_ti_p").click(function(){
		$("#ti_p_judge").removeClass('hide');//隐藏判断题
		$("#st_yuan").addClass('hide');//隐藏院系内容
    	$("#gl_z").addClass('hide');//将章节管理隐藏
    	$("#gl_s").addClass("hide");//将单选试题管理隐藏
    	$("#ti_g_fillblank").addClass('hide');//隐藏改错题
    	$("#ti_t_fillblank").addClass('hide');//隐藏填空题试题
    	$("#gl_k").addClass('hide');//将课程管理隐藏
    	$("#st").addClass('hide');//将学生信息管理添加隐藏
    	$("#st_course").addClass('hide');//将课程匹配隐藏
    	$("#zj").addClass('hide');//将章节隐藏
    	$("#st_class").addClass('hide');//将班级内容隐藏
    	judge(0);//调用这个拉取函数
	})
	//为判断题分页添加选中状态
	$(".pan_page>ul>li:eq(1)").addClass('active');//页面一上来就给数字1添加选中状态
	//拉取函数
	function judge(num){
		//清除主体内容
		$(".pan_tbody").text('');
		$("#ti_p_judge thead>tr>th:first>input[type='checkbox']").prop("checked", false);
		//去拉取函数
		$.ajax({
			type:"get",
			url:"/admin/test_p_show",
			async:true,
			data:{"num":num},
			success:function(data){
				//console.log(data);
				//有一个问题，就是没有处理数据内容，就直接刷上去了。建议在服务器那里处理一下数据
				if(data.result!=1){
					$(".pan_tbody").append("<tr><td>暂无内容，请先添加</td></tr>");
				}else{
					$(".pan_tbody").text('');//清除之前添加的暂无内容的信息
					$("#ti_p_judge thead>tr>th:first>input[type='checkbox']").prop("checked", false);
					for(var i=0;i<data.data.length;i++){
						$(".pan_tbody").append("<tr><td><input type='checkbox'/></td><td></td><td></td><td></td><td><button class='btn recompose ti_p_alter'>修改</button><button class='p_delete btn btn-warning'>删除</button></td></tr>");
						data.data[i].t_title=data.data[i].t_title.substring(0,25);//截取50个字符
						$(".pan_tbody>tr:eq("+i+")>td:eq(1)").text(data.data[i].t_title);//打印试题的题目
						$(".pan_tbody>tr:eq("+i+")>td:eq(2)").text("第"+data.data[i].ch_num+"章");//打印每一行试题所属章节
						$(".pan_tbody>tr:eq("+i+")>td:eq(3)").text(data.data[i].c_name);//打印每一行试题所属课程
						$(".pan_tbody>tr:eq("+i+")>td:eq(4)>button").attr("data-id",data.data[i].t_id);//为每一行的按钮添加id属性
					}
				}
				//操作删除和修改的
				$(".p_delete").click(function(){
					var t_id=$(this).attr("data-id");
					if(confirm("确认删除吗？")){
						$.ajax({
							type:"delete",
							url:"/admin/p_delete",
							data:{"id":t_id},
							async:true,
							success:function(data){
								if(data.result==-1){
									alert("删除失败");
									window.location='/admin'					
								}else{
									alert("删除成功");
									window.location='/admin'
								}
							}
						});
					}
				});
				//点击修改时，将页面引导到对应的页面
				$(".ti_p_alter").click(function(){
					var t_id=$(this).attr("data-id");
					window.location='/admin/test_judge_alter'+'?t_id='+t_id;
				});
				//为全选设置标记
				$("#ti_p_judge thead>tr>th:first>input").click(function(){//为全选帮顶事件
					var bj=this.checked;
					//表示全选的按被按下，将所有复选框勾上
					if(bj==1){   
			        	$("input[type='checkbox']").prop("checked", true); 
			        	bj=0;
			        //取消全选
				    }else{   
						$("input[type='checkbox']").prop("checked", false);
						bj=1;
				    } 
				});
				//为全选取消其中一个内容时，页面上的全选功能的对勾去掉,全部选中时，在将内容加上
				$(".pan_tbody>tr>td>input").click(function(){
					//只要有一个取消，就将全选按钮取消
					var node_num=$(".tian_tbody").children().length;
					for(var i=0,z=0;i<node_num;i++){
						var bb=$(".pan_tbody>tr:eq("+i+")>td:eq(0)>input[type='checkbox']").prop("checked");
						if(!bb){
							$("#ti_p_judge thead>tr>th:first>input[type='checkbox']").prop("checked", false);
							break;
						}
						if(bb==1){
							z++;
						}
						if(z==node_num){
							$("#ti_p_judge thead>tr>th:first>input[type='checkbox']").prop("checked", true);
						}
					}
				})
			}//success:function(data){
		});
	}
	//为判断题分页绑定事件
	$(".pan_page>ul").delegate('li','click',function(){
		var test_biao=$(this).text();
	 	if(test_biao!='>>'&&test_biao!='<<'){//直接点击时
	 		var page_num=parseInt(test_biao);//获取所选中的页码数字并转化为int型
			$(this).addClass('active').siblings().removeClass('active');//为选中添加状态，移除其兄弟元素的选中状态
			judge(page_num);//调用函数
	 	}else{//当点击的不是数字时
	 		if(test_biao=='>>'){
	 			var ac_text=parseInt($(".pan_page li.active>a").html());//获取现在所处位置的内容
	 			var te_num=ac_text%5;//对应到li所处的位置上
	 			var last_right_num=parseInt($(".pan_page>ul>li:eq(5)>a").html());//获取最右边的数字
	 			if(ac_text<last_right_num){//当选中状态不是最后一个时
	 				$(".pan_page>ul>li:eq("+(te_num+1)+")").addClass('active').siblings().removeClass('active');//为下一个添加选中状态
	 				judge((ac_text+1));//调用上面的函数
	 			}else{
	 				var top_num=ac_text;//留住上一页的号码
	 				for(var i=1;i<6;i++){
	    				$(".pan_page>ul>li:eq("+i+")>a").text('');//先移除
	    				$(".pan_page>ul>li:eq("+i+")>a").text((ac_text+1));
	    				ac_text++;
    				}
	 				judge((top_num+1));//调用上面的函数
	 				$(".pan_page>ul>li:eq(1)").addClass('active').siblings().removeClass('active');//为下一个添加选中状态
	 			}
	 		}else{//为<<箭头时
	 			var ac_text=parseInt($(".pan_page li.active>a").html());//获取现在所处位置的内容
	 			var te_num=ac_text%5;//对应到li所处的位置上
	 			if(te_num==0){
	 				te_num=5;
	 			}
	 			var first_left_num=parseInt($(".pan_page>ul>li:eq(1)>a").html());//获取最左边的数字
 				if(ac_text>first_left_num){//当选中状态不是第一个时
	 				$(".pan_page>ul>li:eq("+(te_num-1)+")").addClass('active').siblings().removeClass('active');//为下一个添加选中状态
	 				judge((ac_text-1));//调用上面的函数
	 			}else{
	 				var top_num=ac_text;//留住上一页的号码
	 				if(top_num!=1){
	 					for(var i=5;i>0;i--){
		    				$(".pan_page>ul>li:eq("+i+")>a").text('');//先移除
		    				$(".pan_page>ul>li:eq("+i+")>a").text((ac_text-1));
		    				ac_text--;
	    				}
	 					judge((top_num-1));//调用上面的函数
	 					$(".pan_page>ul>li:eq(5)").addClass('active').siblings().removeClass('active');//为最后个添加选中状态
	 				}else{
	 					alert("老铁都已经到头了，你还点，要脸波？");
	 				}
	 			}
	 		}
	 	}
	});
	/*****************************************/
	/*****************************************/
	//判断题题导入
//	$(".ti_t_lead").click(function(){
//		$("#blindstroy").addClass("shadow");//添加滤镜层
//		$(".ti_t_lead-page").removeClass("hide");//显示导入
//		$(".ti_s_export-page").addClass('hide');//隐藏导出
//		
//		
//		//点击取消时
//		$(".t_quxiao_t").click(function(){
//			$("#blindstroy").removeClass("shadow");//移除滤镜层
//			$(".ti_t_lead-page").addClass("hide");//隐藏导入
//		})
//	})
/*************************************************************************************/
//为改错题绑定事件
	$(".sectio_ti_g").click(function(){
		$("#ti_g_fillblank").removeClass('hide');//隐藏改错题
		$("#st_yuan").addClass('hide');//隐藏院系内容
    	$("#gl_z").addClass('hide');//将章节管理隐藏
    	$("#gl_s").addClass("hide");//将单选试题管理隐藏
    	$("#ti_p_judge").addClass('hide');//隐藏判断题
    	$("#ti_t_fillblank").addClass('hide');//隐藏填空题试题
    	$("#gl_k").addClass('hide');//将课程管理隐藏
    	$("#st").addClass('hide');//将学生信息管理添加隐藏
    	$("#st_course").addClass('hide');//将课程匹配隐藏
    	$("#zj").addClass('hide');//将章节隐藏
    	$("#st_class").addClass('hide');//将班级内容隐藏
    	reform(0);//拉取第一页的数据
	})
	//为改错题分页添加选中状态
	$(".reform_page>ul>li:eq(1)").addClass('active');//页面一上来就给数字1添加选中状态
	function reform(num){
		//清除主体内容
		$(".gai_tbody").text('');
		$.ajax({
			type:"get",
			url:"/admin/test_g_show",
			async:true,
			data:{"num":num},
			success:function(data){
				//console.log(data);
				if(data.result!=1){
					$(".gai_tbody").append("<tr><td>暂无内容，请先添加</td></tr>");
				}else{
					$(".gai_tbody").text('');//清除之前添加的暂无内容的信息
					$("#ti_g_fillblank thead>tr>th:first>input[type='checkbox']").prop("checked", false);
					for(var i=0;i<data.data.length;i++){
						$(".gai_tbody").append("<tr><td><input type='checkbox'/></td><td></td><td></td><td></td><td><button class='btn recompose ti_g_alter'>修改</button><button class='g_delete btn btn-warning'>删除</button></td></tr>");
						data.data[i].t_title=data.data[i].t_title.substring(0,25);//截取50个字符
						$(".gai_tbody>tr:eq("+i+")>td:eq(1)").text(data.data[i].t_title);//打印试题的题目
						$(".gai_tbody>tr:eq("+i+")>td:eq(2)").text("第"+data.data[i].ch_num+"章");//打印每一行试题所属章节
						$(".gai_tbody>tr:eq("+i+")>td:eq(3)").text(data.data[i].c_name);//打印每一行试题所属课程
						$(".gai_tbody>tr:eq("+i+")>td:eq(4)>button").attr("data-id",data.data[i].t_id);//为每一行的按钮添加id属性
					}
				}
				//操作删除和修改的
				$(".g_delete").click(function(){
					var t_id=$(this).attr("data-id");
					if(confirm("确认删除吗？")){
						$.ajax({
							type:"delete",
							url:"/admin/g_delete",
							data:{"id":t_id},
							async:true,
							success:function(data){
								if(data.result==-1){
									alert("删除失败");
									window.location='/admin'					
								}else{
									alert("删除成功");
									window.location='/admin'
								}
							}
						});
					}
				});
				//点击修改时，将页面引导到对应的页面
				$(".ti_g_alter").click(function(){
					var t_id=$(this).attr("data-id");
					window.location='/admin/test_reform_alter'+'?t_id='+t_id;
				});
				//为全选设置标记
				$("#ti_g_fillblank thead>tr>th:first>input").click(function(){//为全选帮顶事件
					var bj=this.checked;
					//表示全选的按被按下，将所有复选框勾上
					if(bj==1){   
			        	$("input[type='checkbox']").prop("checked", true); 
			        	bj=0;
			        //取消全选
				    }else{   
						$("input[type='checkbox']").prop("checked", false);
						bj=1;
				    } 
				});
				//为全选取消其中一个内容时，页面上的全选功能的对勾去掉,全部选中时，在将内容加上
				$(".gai_tbody>tr>td>input").click(function(){
					//只要有一个取消，就将全选按钮取消
					var node_num=$(".gai_tbody").children().length;
					for(var i=0,z=0;i<node_num;i++){
						var bb=$(".gai_tbody>tr:eq("+i+")>td:eq(0)>input[type='checkbox']").prop("checked");
						if(!bb){
							$("#ti_g_fillblank thead>tr>th:first>input[type='checkbox']").prop("checked", false);
							break;
						}
						if(bb==1){
							z++;
						}
						if(z==node_num){
							$("#ti_g_fillblank thead>tr>th:first>input[type='checkbox']").prop("checked", true);
						}
					}
				})
			}
		});
	}
	//为填空题分页绑定事件
	$(".reform_page>ul").delegate('li','click',function(){
		var test_biao=$(this).text();
	 	if(test_biao!='>>'&&test_biao!='<<'){//直接点击时
	 		var page_num=parseInt(test_biao);//获取所选中的页码数字并转化为int型
			$(this).addClass('active').siblings().removeClass('active');//为选中添加状态，移除其兄弟元素的选中状态
			reform(page_num);//调用函数
	 	}else{//当点击的不是数字时
	 		if(test_biao=='>>'){
	 			var ac_text=parseInt($(".reform_page li.active>a").html());//获取现在所处位置的内容
	 			var te_num=ac_text%5;//对应到li所处的位置上
	 			var last_right_num=parseInt($(".reform_page>ul>li:eq(5)>a").html());//获取最右边的数字
	 			if(ac_text<last_right_num){//当选中状态不是最后一个时
	 				$(".reform_page>ul>li:eq("+(te_num+1)+")").addClass('active').siblings().removeClass('active');//为下一个添加选中状态
	 				reform((ac_text+1));//调用上面的函数
	 			}else{
	 				var top_num=ac_text;//留住上一页的号码
	 				for(var i=1;i<6;i++){
	    				$(".reform_page>ul>li:eq("+i+")>a").text('');//先移除
	    				$(".reform_page>ul>li:eq("+i+")>a").text((ac_text+1));
	    				ac_text++;
    				}
	 				reform((top_num+1));//调用上面的函数
	 				$(".reform_page>ul>li:eq(1)").addClass('active').siblings().removeClass('active');//为下一个添加选中状态
	 			}
	 		}else{//为<<箭头时
	 			var ac_text=parseInt($(".reform_page li.active>a").html());//获取现在所处位置的内容
	 			var te_num=ac_text%5;//对应到li所处的位置上
	 			if(te_num==0){
	 				te_num=5;
	 			}
	 			var first_left_num=parseInt($(".reform_page>ul>li:eq(1)>a").html());//获取最左边的数字
 				if(ac_text>first_left_num){//当选中状态不是第一个时
	 				$(".reform_page>ul>li:eq("+(te_num-1)+")").addClass('active').siblings().removeClass('active');//为下一个添加选中状态
	 				reform((ac_text-1));//调用上面的函数
	 			}else{
	 				var top_num=ac_text;//留住上一页的号码
	 				if(top_num!=1){
	 					for(var i=5;i>0;i--){
		    				$(".reform_page>ul>li:eq("+i+")>a").text('');//先移除
		    				$(".reform_page>ul>li:eq("+i+")>a").text((ac_text-1));
		    				ac_text--;
	    				}
	 					reform((top_num-1));//调用上面的函数
	 					$(".reform_page>ul>li:eq(5)").addClass('active').siblings().removeClass('active');//为最后个添加选中状态
	 				}else{
	 					alert("老铁都已经到头了，你还点，要脸波？");
	 				}
	 			}
	 		}
	 	}
	});
	/*****************************************/
	//改错题题导入
//	$(".ti_t_lead").click(function(){
//		$("#blindstroy").addClass("shadow");//添加滤镜层
//		$(".ti_t_lead-page").removeClass("hide");//显示导入
//		$(".ti_s_export-page").addClass('hide');//隐藏导出
//		
//		
//		//点击取消时
//		$(".t_quxiao_t").click(function(){
//			$("#blindstroy").removeClass("shadow");//移除滤镜层
//			$(".ti_t_lead-page").addClass("hide");//隐藏导入
//		})
//	})
/*************************************************************************************/
//为学生学习情况绑定事件
 	//显示院系
    $("#stu_yuan").click(function(){ 
    	//$(".stu_page2>ul.pagination_2").undelegate('li','click');//这是将之前的数据解绑
    	$("#st_yuan").removeClass('hide');//显示院系内容
    	$("#gl_z").addClass('hide');//将章节管理隐藏
    	$("#gl_s").addClass("hide");//将单选试题管理隐藏
    	$("#ti_t_fillblank").addClass('hide');//隐藏填空题试题
    	$("#ti_p_judge").addClass('hide');//隐藏判断题
    	$("#ti_g_fillblank").addClass('hide');//隐藏改错题
    	$("#gl_k").addClass('hide');//将课程管理隐藏
    	$("#st").addClass('hide');//将学生信息管理添加隐藏
    	$("#st_course").addClass('hide');//将课程匹配隐藏
    	$("#zj").addClass('hide');//将章节隐藏
    	$("#st_class").addClass('hide');//将班级内容隐藏
	    //上来先拿到除具体数据以为的基本信息
	    stu_sitution();//这页全部数据操作函数
	});
    //这页全部数据操作函数
    function stu_sitution(){
    	$.ajax({
	    	type:'get',
	    	url:'/admin/stu_situ',
	    	async:true,
	    	success:function(data){
	    		//console.log(data.data);
	    		var year=(data.data[(data.data.length-1)].c_year).split('-');
				var id=data.data[(data.data.length-1)].id;//拿到最后一科的id
	    		//位科目选项动态添加课程,学年
	    		//先将这前添加的内容清除
	    		$("#lean_item").text('');
	    		$("#lean_year").text('');
	    		for(var i=0;i<data.data.length;i++){
	    			$("#lean_item").append('<li></li>');
	    			$("#lean_item>li:eq("+i+")").text(data.data[i].c_name);
	    			$("#lean_year").append('<li></li>');
	    			$("#lean_year>li:eq("+i+")").text((parseInt(year[0])-i)+'-'+(parseInt(year[1])-i))
	    		}
				//为标题添加内容,最后一条就是最新内容
	    		$(".xue_nian>b:first").text(data.data[(data.data.length-1)].c_name);
	    		$(".xue_nian>b:eq(1)").text(data.data[(data.data.length-1)].c_year);
	    		$(".xue_nian>b:last-child").text(data.data[(data.data.length-1)].c_semester);
	    		upData(id);//请求对应id的数据内容

	    		//先留住最新的标题，避免没有改变标题的情况下去请求数据
	    		var old_item=$(".xue_nian>b:first").text()+$(".xue_nian>b:eq(1)").text()+$(".xue_nian>b:last-child").text();
	    		//为标题绑定事件监听
	    		$("#st_yuan>div>ul").click(function(){
	    			var c_name=$(".xue_nian>b:first").text();
	    			var c_year=$(".xue_nian>b:eq(1)").text();
	    			var c_semester=$(".xue_nian>b:last-child").text();
	    			var new_item=c_name+c_year+c_semester;
	    			if(new_item!=old_item){
	    				$.ajax({
	    					type:"post",
	    					url:"/admin/stu_situation",
	    					async:true,
	    					data:{
	    						"c_name":c_name,
	    						"c_year":c_year,
	    						"c_semester":c_semester
	    					},
	    					success:function(data){
	    						old_item=new_item;//更新信息
	    						if(data.result==-1){
	    							$(".test_tbody").text('');//清空之前数据
									$(".test_tbody").text("暂无此课程");
	    						}else{
	    							$(".stu_page2>ul.pagination_2").undelegate('li','click');//这是将之前的数据解绑
	    							upData(data.ID);//请求对应id的数据内容
	    						}
	    					}
	    				});
	    			}
	    		});
	    	}//success:function(data){//课程等基本信息的
    	});
    }	    
    /**************************************************/	   
	//学生学习情况分页控制
	//进来第一件事就是将第一个设置为选中状态,将页码重置到12345
	function stu_fen(stu_data){
		$(".stu_page2>ul>li:eq(1)").addClass('active2').siblings().removeClass('active2');//为下一个添加选中状态
		for(var i=1;i<6;i++){
			$(".stu_page2>ul>li:eq("+i+")>a").text('');//先移除
			$(".stu_page2>ul>li:eq("+i+")>a").text(i);
		}
		//这个页面操作有一个问题，不稳定
		$(".stu_page2>ul.pagination_2").delegate('li','click',function(){
			//可以选择的情况下，如果获取的是>>则就将页码数据更改
			if($(this).text()=='>>'){
				var act_num=parseInt($(".active2>a").html());//获取现在所处的位置
				var te_num=act_num%5;//对应到li所处的位置上
				var last_right_num=parseInt($(".stu_page2>ul>li:eq(5)>a").html());//获取最右边的数字
				if(act_num<last_right_num){//当目前所处的位置没有抵达最后一个时
					$(".stu_page2>ul>li:eq("+(te_num+1)+")").addClass('active2').siblings().removeClass('active2');//为下一个添加选中状态
					upTree(stu_data,((act_num+1)*15)-15);//调用上树函数，传入数组和起始角标
				}else{
					var top_num=parseInt(act_num);//留住上一页的号码
					for(var i=1;i<6;i++){
						$(".stu_page2>ul>li:eq("+i+")>a").text('');//先移除
						$(".stu_page2>ul>li:eq("+i+")>a").text((top_num+1));
						top_num++;
					}
					upTree(stu_data,((top_num+1)*15)-15)//申请翻页的数据
					$(".stu_page2 li:eq(1)").addClass('active2').siblings().removeClass('active2');//为第一个添加选中状态
				}
		
			}else if($(this).text()=='<<'){
				var act_num=parseInt($(".active2>a").html());//获取现在所处的位置
				var te_num=act_num%5;//对应到li所处的位置上
				if(te_num==0){//给最后一个赋值
					te_num=5;
				}
				var last_num=parseInt($(".stu_page2>ul>li:eq(1)").text());//获取<<箭头旁边的数字
				if(act_num==1){//拦住小于1的
					alert("老铁都到第一页了，你还点啊！")
				}else{
					if(act_num>last_num&&te_num!=1){//不需要翻页的情况下
						$(".stu_page2>ul>li:eq("+(te_num-1)+")").addClass('active2').siblings().removeClass('active2');//为下一个添加选中状态
						upTree(stu_data,((act_num-1)*15)-15);//调用上面的函数
					}else{//需要翻页的情况下
						$(".stu_page2 li").removeClass("hide");//移除>>右箭头所隐藏的hide
						for(var i=5;i>0;i--){
		    				$(".stu_page2 li:eq("+i+")>a").text('');//先移除
		    				$(".stu_page2 li:eq("+i+")>a").text((last_num-1));
		    				last_num--;
						}
						upTree(stu_data,((act_num-1)*15)-15);//调用上面的函数
						$(".stu_page2 li:eq(5)").addClass('active2').siblings().removeClass('active2');//为第5个添加选中状态
					}
				}	
			}else{//鼠标直接点击时
				var page_num=parseInt($(this).text());//获取所选中的页码数字并转化为int型
				$(this).addClass('active2').siblings().removeClass('active2');//为选中添加状态，移除其兄弟元素的选中状态
				upTree(stu_data,((page_num)*15)-15);//调用上面的函数
			}
		});
		//学生学习情况分页结束
		/*********************************************************************/
	}
    //按不同需求排序函数
    function bubbingSort(arr,value){
		//备注：1  代表 按正确率的升序排序，2 代表 按正确率的降序排序
		//	  3 代表 按综合测评的升序排序，4 代表 按综合测评的降序排序
		if(value=='1'){
			var flag=0;
			for(var i=0;i<arr.length;i++){
				for(var j=i;j<arr.length;j++){
					if(parseFloat(arr[i].accuracy)>parseFloat(arr[j].accuracy)){//一旦符合条件就将整个对象交换
						flag=arr[j];
						arr[j]=arr[i];
						arr[i]=flag;
					}
				}
			}
			return arr;
		}else if(value=='2'){
			var flag=0;
			for(var i=0;i<arr.length;i++){
				for(var j=i;j<arr.length;j++){
					if(parseFloat(arr[i].accuracy)<parseFloat(arr[j].accuracy)){//一旦符合条件就将整个对象交换
						flag=arr[j];
						arr[j]=arr[i];
						arr[i]=flag;
					}
				}
			}
			return arr;
		}else if(value=='3'){
			var flag=0;
			for(var i=0;i<arr.length;i++){
				for(var j=i;j<arr.length;j++){
					if(arr[i].ranking>arr[j].ranking){//一旦符合条件就将整个对象交换
						flag=arr[j];
						arr[j]=arr[i];
						arr[i]=flag;
					}
				}
			}
			return arr;
		}else{
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
    //遍历上树
    function upTree(arr,z){//传入数组，传入起始脚标
    	if(arr!=null){
    		if(arr.length<z+15){//如果数据起始位置小于
	    		//将数据刷新到页面上去
				$(".test_tbody").text('');//清空之前数据
	    		for(var i=z,j=0;i<arr.length;i++){
					$(".test_tbody").append("<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>");//插入一行
					$(".test_tbody>tr:eq("+j+")>td:eq(0)").text(arr[i].s_num);//加入学号
					$(".test_tbody>tr:eq("+j+")>td:eq(1)").text(arr[i].s_class);//加入班级
					$(".test_tbody>tr:eq("+j+")>td:eq(2)").text(arr[i].s_name);//姓名
					$(".test_tbody>tr:eq("+j+")>td:eq(3)").text(arr[i].accuracy);//正确率
					$(".test_tbody>tr:eq("+j+")>td:eq(4)").text(arr[i].sum+'/'+arr[i].test_num);//做题情况
					$(".test_tbody>tr:eq("+j+")>td:eq(5)").text(arr[i].ranking);//综合测评
					$(".test_tbody>tr:eq("+j+")>td:eq(6)").text(arr[i].pai);//排名
					j++;
				}
	    	}else{
	    		//将数据刷新到页面上去
				$(".test_tbody").text('');//清空之前数据
	    		for(var i=z,j=0;i<z+15;i++){
					$(".test_tbody").append("<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>");//插入一行
					$(".test_tbody>tr:eq("+j+")>td:eq(0)").text(arr[i].s_num);//加入学号
					$(".test_tbody>tr:eq("+j+")>td:eq(1)").text(arr[i].s_class);//加入班级
					$(".test_tbody>tr:eq("+j+")>td:eq(2)").text(arr[i].s_name);//姓名
					$(".test_tbody>tr:eq("+j+")>td:eq(3)").text(arr[i].accuracy);//正确率
					$(".test_tbody>tr:eq("+j+")>td:eq(4)").text(arr[i].sum+'/'+arr[i].test_num);//做题情况
					$(".test_tbody>tr:eq("+j+")>td:eq(5)").text(arr[i].ranking);//综合测评
					$(".test_tbody>tr:eq("+j+")>td:eq(6)").text(arr[i].pai);//排名
					j++;
				}
	    	}
    	}
    }
    //刷数据的函数
    function upData(id){
    	$(".stu_page2>ul.pagination_2").undelegate('li','click');//这是将之前的数据解绑
    	$.ajax({
			type:"get",
			url:"/admin/stu_first_data",
			data:{"id":id},
			async:true,
			success:function(data){
				//console.log(data.data);
				if(data.result==-1){
					$(".test_tbody").text('');//清空之前数据
					$(".test_tbody").text("暂无学生做此课练习");
				}else{
					upTree(data.data,0);//上树，传入数组和第一页
					/**************************************************/
					stu_fen(data.data);//调用分页函数
					//为升序和降序按钮绑定事件
					$(".rank_table>thead>tr>th>i").click(function(){
						//console.log($(this).attr("value"));
						var flag=$(this).attr("value");//获取所点击的按键value
						var arr=bubbingSort(data.data,flag);//拿到按要求排行序的数据
						//在将数据刷新到页面上去
	    				upTree(arr,0);//上树，上第一页的内容，就是前15条
					});

					/**********************************************************/
					//当点击搜索功能的时候
				   $(".stu_seek").click(function(){
				   		$("#blindstroy").addClass("shadow");//添加滤镜层
				   		$(".stu_seek_page").removeClass('hide');//移除隐藏
				   		//获取搜索框里面的内容是名字或学号
				   		var input_in=$(".stu_seek_input").val();
				   		//每次搜索之前先将之前的数据清空
				   		$(".stu_sti_steek").text('');
				   		var flag=0;//标志位  用来判断是否没有这个数据
				   		for(var i=0;i<data.data.length;i++){
				   			if(data.data[i].s_num==input_in||data.data[i].s_name==input_in){
								$(".stu_sti_steek").append("<tr class='st"+i+" stu_com'><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>");//插入一行
								$(".stu_sti_steek>tr.st"+i+">td:eq(0)").text(data.data[i].s_num);
								$(".stu_sti_steek>tr.st"+i+">td:eq(1)").text(data.data[i].s_class);
								$(".stu_sti_steek>tr.st"+i+">td:eq(2)").text(data.data[i].s_name);
								$(".stu_sti_steek>tr.st"+i+">td:eq(3)").text(data.data[i].accuracy);
								$(".stu_sti_steek>tr.st"+i+">td:eq(4)").text(data.data[i].sum+'/'+data.data[i].test_num);
								$(".stu_sti_steek>tr.st"+i+">td:eq(5)").text(data.data[i].ranking);
								$(".stu_sti_steek>tr.st"+i+">td:eq(6)").text(data.data[i].pai);
				   			}else{
				   				flag++;
				   			}
				   		}
				   		//所有遍历结束以后看是否有人
				   		if(flag==data.data.length){
				   			$(".stu_sti_steek").append('<tr><td></td></tr>')
				   			$(".stu_sti_steek>tr>td:eq(0)").text("此科目并没有这个学生做题情况");
				   		}
				   });
				    //为搜索功能的取消绑定事件
				   $(".stu_qu").click(function(){
				   		$("#blindstroy").removeClass("shadow");//移除滤镜层
				   		$(".stu_seek_page").addClass('hide');//添加隐藏
				   		//将输入框中的内容清空
				   		$(".stu_seek_input").val('');
				   })
				}	
			}//success:function(data)//具体数据的
		});
    }
	   
	  
 	//显示班级
    $("#stu_class").click(function(){
    	$("#st_class").removeClass('hide');//显示班级内容
    	$("#gl_z").addClass('hide');//将章节管理隐藏
    	$("#gl_s").addClass("hide");//将单选试题管理隐藏
    	$("#ti_t_fillblank").addClass('hide');//隐藏填空题试题
    	$("#ti_p_judge").addClass('hide');//隐藏判断题
    	$("#ti_g_fillblank").addClass('hide');//隐藏改错题
    	$("#gl_k").addClass('hide');//将课程管理隐藏
    	$("#st_yuan").addClass('hide');//将院系情况隐藏
    	$("#st_course").addClass('hide');//将课程匹配隐藏
    	$("#st").addClass('hide');//将学生信息管理添加隐藏
    	$("#zj").addClass('hide');//将章节隐藏
    });

	//改变标题内容
	$("#lean_item").delegate("li","click",function(){
    	var lean=$(this).text();//留住所选内容
    	$(".xue_nian>b:eq(0)").text('');//清除h3标签里面原来是内容
	 	$(".xue_nian>b:eq(0)").text(lean);
    })
	 //为学年学期绑定事件
    $("#lean_year").delegate("li","click",function(){
    	var lean=$(this).text();//留住所选内容
    	$(".xue_nian>b:eq(1)").text('');//清除h3标签里面原来是内容
	 	$(".xue_nian>b:eq(1)").text(lean);
    })
    $("#lean_term").delegate("li","click",function(){
    	var lean=$(this).text();
    	$(".xue_nian>b:eq(2)").text('');
	 	$(".xue_nian>b:eq(2)").text(lean);
    })

/************************************************************************************/
	//添加日期控件-开始
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
	//添加日期控件结束
	
	//为注销绑定数事件
	$(".logout").click(function(){
		$.ajax({
			type:"get",
			url:"/admin",
			async:true
		});
	})
	}//window.onload	
})();

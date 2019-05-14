//加密部分，为了在数据库中   管理员  的密码使用加密 的密码
const crypto=require('crypto');
var https = require('https');
const FormData=require('form-data');
module.exports={
	MD5_SUFFIX:'wehidhfihfeihfioehiheofh(美女恒大华府？)ehejkdhfjekhjkefh',
	md5:function(str){
		var obj=crypto.createHash('md5');//使用md5签名的方法式，
		obj.update(str);
		return obj.digest('hex');
	},
	dateCompare:function(date1,date2){//比较两个日期的大小
	    var oDate1 = new Date(date1);
	    var oDate2 = new Date(date2);
	    //console.log(oDate1,oDate2);
	    if(oDate1.getTime() >= oDate2.getTime()){  //前者时间大于后者  返回true
	        //console.log('第一个大或者一样大');
	        return true;
	    } else{
	        //console.log('第二个大');
	        return false;
	    }
	},
	division:function(a,b){  //  求b/a  a是大数  求百分比 并保留两位小数
		//排除undefined  null  NaN
		if(!a || !b){
			return 0;
		}
		a=parseFloat(a);
		b=parseFloat(b);
		//字符串经过parseFloat会变成NaN，所以得排除这种情况
		if(!a || !b){
			return 0;
		}
		return parseFloat(((b/a)*100).toFixed(2));
	},
	strReplace:function(str){
		if(!!str){
			return str.replace(/\s+/g," ").replace(/\<p\>/g,"").replace(/\<\/p\>/g,"\n").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&#38;/g,'"');
		}else{
			return "";
		}
	},
	bubbleSort:function(arr,str){
		for(var i=0;i<arr.length-1;i++){
			for(var j=0;j<arr.length-i-1;j++){
				if(parseFloat(arr[j][str])<parseFloat(arr[j+1][str])){
					var x=arr[j];
					arr[j]=arr[j+1];
					arr[j+1]=x;
				}
			}
		}
		return arr;
	},
	avgRightRate:function(arr){
		var sum=0;
		for(var i=0;i<arr.length;i++){
			//排除undefined  null 字符串
			if(!arr[i].rightRate || !parseFloat(arr[i].rightRate)){
				arr[i].rightRate=0;
			}
			sum+=parseFloat(arr[i].rightRate);
		}
		//console.log(sum);
		return parseFloat((sum/arr.length).toFixed(2));
	},
	getCurTime:function(){
		var date=new Date();
		var year=date.getFullYear();
		var month=date.getMonth()+1;
		month=month>9?month:'0'+month;
		var day=date.getDate();
		day=day>9?day:'0'+day;
		var hour=date.getHours();
		hour=hour>9?hour:'0'+hour;
		var minute=date.getMinutes();
		minute=minute>9?minute:'0'+minute;
		var second=date.getSeconds();
		second=second>9?second:'0'+second;
		return year+month+day+hour+minute+second;
	},
	gelin2norm:function(time){
		var date = new Date(new String(time));
       	return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds(); 
	},
	imgCheck:function(imgsrcORcon,conORimg=1){
		return new Promise(function(resolve,reject){
			var options = {
				protocol:"https:",
				host:"api.weixin.qq.com",
				path:"/cgi-bin/token?grant_type=client_credential&appid=wxb7be00ec7db0a219&secret=4fb85ce673eafdd49370c5b57de95a55",
				port:443,
				method: 'get',
			}
			var sendmsg = '';
			const req = https.request(options, function(res) {
				res.on("data", function(chunk) {
					sendmsg += chunk; 
				});
				res.on("end", function() { 
					var list = JSON.parse(sendmsg);  
					var token=list.access_token;
					resolve(token);
				});
			});
			req.end();
		}).then(function(token){
			return new Promise(function(resolve,reject){
				if(conORimg==1){
					var formData = new FormData();
				    formData.append('m',imgsrcORcon);
					var post_data = JSON.stringify({
						content:JSON.stringify(formData)
					});
					var options = {
					  host: 'api.weixin.qq.com',
					  port: 443,
					  path: "/wxa/msg_sec_check?access_token="+token,
					  method: 'POST',
					  headers:{
					  	  'Content-Type': 'application/octet-stream',
						  'Content-Length':post_data.length
					  }
					};	 
					const req = https.request(options, function(res) {
					  res.setEncoding('utf8');
					  var _data='';
					  res.on('data', function(chunk){
					     _data += chunk;
					  });
					  res.on('end', function(){
					  	if(JSON.parse(_data).errcode!=87014) //正常
					  		resolve(1);
					  	else resolve(0);
					  });
					});
					req.write(post_data);
					req.end(); 
				}
				if(conORimg==2){
					var formData = new FormData();
				    formData.append('file',imgsrcORcon);
					var post_data = JSON.stringify({
						media:JSON.stringify(formData)
					});
					var options = {
					  host: 'api.weixin.qq.com',
					  port: 443,
					  path: "/wxa/img_sec_check?access_token="+token,
					  method: 'POST',
					  headers:{
					  	  'Content-Type': 'application/octet-stream',
						  'Content-Length':post_data.length
					  }
					};	 
					const req = https.request(options, function(res) {
					  res.setEncoding('utf8');
					  var _data='';
					  res.on('data', function(chunk){
					     _data += chunk;
					  });
					  res.on('end', function(){
					  	if(JSON.parse(_data).errcode!=87014)
					  		resolve(1);
					  	else resolve(0);
					  });
					});
					req.write(post_data);
					req.end(); 
				}
			});
		})
	}
}


 /* 仅仅为提前在数据库中  录入数据*/
/*const common=module.exports;
var str='000000';
var str=common.md5(str+'wehidhfihfeihfioehiheofh(美女恒大华府？)ehejkdhfjekhjkefh');

console.log(str);*/
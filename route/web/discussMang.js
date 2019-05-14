const mysql=require('mysql');
const formidable=require('formidable');
const querystring=require('querystring');
const common=require('../../libs/common.js');
const path = require("path");
const fs = require("fs");
var http = require('http');  
const db=mysql.createPool({
	host:'localhost',
	user:'root',
	password:'123456',
	database:'online_answer_db'
});
exports.submitDiscuss=function(req,res){
    console.log(1);
		var form = new formidable.IncomingForm();
		form.encoding = 'utf-8';
    form.keepExtensions = true;//保留后缀
    form.maxFieldsSize = 2 * 1024 * 1024;
    form.uploadDir=path.resolve(__dirname,"../../static/discussImgs");
    form.parse(req, function(err, fields, files){
        //console.log(files);
       // console.log(fields);
        var s_ID=parseInt(fields.s_ID);
        var test_ID=parseInt(fields.test_ID);
        var test_type=parseInt(fields.test_type);
        var content=fields.content;
        if(!s_ID || !test_ID || !test_type){
            res.status(400).json({"result":0,"err":"不合法的学生ID或者试题ID"});
            return;
        }
     //    console.log(files.img.path);
     //    console.log(path.dirname(files.img.path));
        if(Object.getOwnPropertyNames(files).length!=0){
            console.log(1,files.img);
            console.log(11,files.img.path);
            common.imgCheck(files.img.path,2).then(function(value){
                if(value!=1){
                    console.log("图片敏感");
                    res.json({"result":0,"err":"图片敏感"});
                    return;
                }
            });
            var dir=path.dirname(files.img.path);//获取目录（路径最后一部分不要）
            var ext=path.extname(files.img.path);//文件后缀
            var old_file_path=files.img.path;
            var new_file_path=path.resolve(dir,common.getCurTime()+'_'+s_ID+ext);
            fs.rename(old_file_path,new_file_path,function(err){
                if(err)
                    console.error(err);
            });//修改名字
            //console.log(new_file_path);
        }
        var img_src=new_file_path?path.basename(new_file_path):'';
        db.query(`insert into test_discuss(s_ID,test_ID,test_type,content,img_src) 
        values(${s_ID},${test_ID},${test_type},'${content}','${img_src}')`,(err,data)=>{
            if(err){
                console.error(err);
                res.status(500).send('服务器错误').end();
            }
            else{
                res.json({"result":1,"info":"success"});
            }
        });
    });
}

exports.getDiscuss=function(req,res){
    var test_ID=parseInt(req.query.test_ID);
    var test_type=parseInt(req.query.test_type);
    if(!test_ID || !test_type){
        res.status(400).json({"result":0,"err":"不合法的试题类型或者试题ID"});
    }
    var testDis={
        "test_ID":test_ID,
        "test_type":test_type,
        "dis":[]
    };
    new Promise(function(resolve,reject){
        db.query(`select * from test_discuss,student_table where test_ID=${test_ID} and test_type=${test_type}  AND student_table.ID=test_discuss.s_ID`,(err,data)=>{
            if(err){
                console.error(err);
                res.status(500).send("服务器错误").end();
            }else{
                if(data.length!=0){
                    for(let i=0;i<data.length;i++){
                        testDis.dis.push({
                            "ID":data[i]['ID'],
                            "s_ID":data[i]['s_ID'],
                            "s_name":data[i]['s_name'],
                            "s_num":data[i]['s_num'],
                            "s_class":data[i]['s_class'],
                            "content":data[i]['content'],
                            "img_src":Boolean(data[i]['img_src'])?'https://todolist666.club/discussImgs/'+data[i]['img_src']:"",
                            "praise_con":data[i]['praise_con'],
                            "sub_date":common.gelin2norm(data[i]['sub_date']),
                            "dis_dis":[],
                        });
                    }

                    return resolve();
                }else if(data.length==0){
                    res.json({"result":1,"testDis":testDis,"info":"当前题目暂时没有评论"});
                    return;
                }
            }
        });
    }).then(function(){
        //现在获取针对评论的评论
        var flag=0;
        for(let i=0;i<testDis.dis.length;i++){
            db.query(`select * from test_discuss where test_ID=${testDis.dis[i].ID} and test_type=10`,(err,data)=>{
                if(err){
                    console.error(err);
                    res.status(500).send('服务器错误').end();
                }else{
                    if(data.length!=0){
                        testDis.dis[i].dis_dis.push({
                            "ID":data[i]['ID'],
                            "s_ID":data[i]['s_ID'],
                            "s_name":data[i]['s_name'],
                            "s_num":data[i]['s_num'],
                            "s_class":data[i]['s_class'],
                            "content":data[i]['content'],
                            "img_src":Boolean(data[i]['img_src'])?'https://todolist666.club/discussImgs/'+data[i]['img_src']:"",
                            "praise_con":data[i]['praise_con'],
                            "sub_date":common.gelin2norm(data[i]['sub_date']),
                        });
                    }
                }
                flag++;
                if(flag==testDis.dis.length){
                      res.json({"result":1,"testDis":testDis});
                }
            });
        }
    });
}

exports.modifyDiscuss=function(req,res){//修改评论
    console.log(2);
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.keepExtensions = true;//保留后缀
    form.maxFieldsSize = 2 * 1024 * 1024;
    form.uploadDir=path.resolve(__dirname,"../../static/discussImgs");
    form.parse(req, function(err, fields, files){
        //console.log(files);
       // console.log(fields);
        var s_ID=parseInt(fields.s_ID);
        var test_ID=parseInt(fields.test_ID);
        var test_type=parseInt(fields.test_type);
        var state=fields.state;  // 0是没有图片 
        var content=fields.content;
        var sql='';
        if(!s_ID || !test_ID || !test_type){
            res.status(400).json({"result":0,"err":"不合法的学生ID或者试题ID"});
            return;
        }
        //console.log(files.img.path);
        //console.log(path.dirname(files.img.path));
        if(Object.getOwnPropertyNames(files).length!=0){
            console.log(2,files.img);
            var dir=path.dirname(files.img.path);//获取目录（路径最后一部分不要）
            var ext=path.extname(files.img.path);//文件后缀
            var old_file_path=files.img.path;
            var new_file_path=path.resolve(dir,common.getCurTime()+'_'+s_ID+ext);
            console.log(old_file_path,new_file_path);
            fs.rename(old_file_path,new_file_path,function(err){
                if(err)
                    console.error(err)
            });//修改名字
            //console.log(new_file_path);
        }
        var img_src=new_file_path?path.basename(new_file_path):'';
        if(state==1){
            sql=`UPDATE test_discuss SET content="${content}"
            WHERE s_ID=${s_ID} AND test_ID=${test_ID} AND test_type=${test_type}`;
        }else{
            sql=`UPDATE test_discuss SET content="${content}",img_src="${img_src}" 
            WHERE s_ID=${s_ID} AND test_ID=${test_ID} AND test_type=${test_type}`;
        }
        db.query(sql,(err,data)=>{
            if(err){
                console.error(1,err);
                res.status(500).send('服务器错误').end();
            }
            else{
                res.json({"result":1,"info":"success"});
            }
        });
    });
}

exports.thumbsUp=function(req,res){
    var form = new formidable.IncomingForm();
    form.parse(res,(err,fields,files)=>{
        var s_ID=fields.s_ID;
        var test_ID=fields.test_ID;
        var test_type=fields.test_type;
        var thumbsUpState=parseInt(fields.thumbsUpState);
        var flag=0;
        if(thumbsUpState){
            flag=1
        }else{
            flag=-1;
        }
        if(!s_ID || !test_ID||!test_type){
            res.status(400).send("不合法的学生ID或者试题ID").end();
            return;
        }
        db.query(`update test_discuss set praise_con=praise_con+${flag} where s_ID=${s_ID} and test_ID=${test_ID} and test_type=${test_type}`,(err,data)=>{
            if(err){
                console.error(err);
                res.status(500).end("服务器错误");
            }else{
                res.json({"result":1});
            }
        })
    });
}

exports.deleteDiscuss=function(req,res){
    var form = new formidable.IncomingForm();
    form.parse(res,(err,fields,files)=>{
        var ID=fields.ID;
        var s_ID=fields.s_ID;
        var test_ID=fields.test_ID;
        var test_type=fields.test_type;
        if(!s_ID || !test_ID||!test_type){
            res.status(400).send("不合法的学生ID或者试题ID").end();
            return;
        }
        new Promise(function(resolve,reject){
            db.query(`delete from test_discuss where s_ID=${s_ID} and test_ID=${test_ID} and test_type=${test_type}`,(err,data)=>{
                if(err){
                    console.error(err);
                    res.status(500).end("服务器错误");
                }else{
                    resolve();
                }
            })
        }).then(function(){
            db.query(`delete from test_discuss where s_ID=${s_ID} and test_ID=${ID} and test_type=10`,(err,data)=>{
                if(err){
                    console.error(err);
                    res.status(500).end("服务器错误");
                }else{
                    res.json({"result":1});
                }
            })
        })
        
    });
}
var express = require('express');
var router = express.Router();
const ModelUsers = require('../model/users.js');
const ModelBlog = require('../model/blog.js');
const ModelMessage = require('../model/message.js');
const pathLib = require('path');
const fs = require('fs');
const md5 = require('../libs/md5.js');

router.use(function(req,res,next){
    if(!req.session['user_id'] && req.url!='/login' && req.url!='/reg'){
        res.redirect('/users/login');
    }else{
        next();
    }
});

//注册
router.get('/reg',function(req,res){
    res.render('reg.html',{title:'注册'});
})

router.post('/reg',function(req,res){
    // 密码用md5加密
    var password = md5.md5(req.body.password + md5.MD5_SUFFIX);

    var postData = new ModelUsers({
        user: req.body.user,
        password: password
    });
    ModelUsers.findOne({
        user: req.body.user
    },function(err,data){
        if(err){
            console.log(err);
            res.status(500).send('数据库错误');
        }else{
            if(data){
                res.send('用户已存在');
            }else{
                postData.save(function(err){
                    res.send('注册成功').end();
                });
            }
        }
    })
});

//登陆
router.get('/login', function(req, res) {
  res.render('login.html',{title:'登陆'});
});

router.post('/login',function(req,res){
    var password = md5.md5(req.body.password + md5.MD5_SUFFIX);

    ModelUsers.findOne({user: req.body.user},function(err,userdata){
        if(err){
            console.log(err);
            res.status(500).send('数据库错误');
        }else{
            if(userdata){
                if(userdata.password == password){
                    req.session['user_id'] = userdata._id;
                    res.redirect('/users/');
                }else{
                    res.send('密码错误');
                }
            }else{
                res.send('用户名不存在');
            }
        }
    })
});


//用户首页
router.get('/',function(req,res){
    res.render('index.html');
});

//我的微博
router.get('/blog',function(req,res){
    switch(req.query.act){
        case 'mod':
        ModelBlog.findOne({'_id':req.query.id},function(err,modData){
            if(err){
                console.log(err);
                res.status(500).send('数据库错误').end();
            }else{
                if(modData.length == 0){
                    res.status(404).send('NOT FOUND').end();
                }else{
                    ModelBlog.find({},function(err,blogData){
                        if(err){
                            console.log(err);
                            res.status(500).send('数据库错误').end();
                        }else{
                            res.render('blog.html',{blogData,modData})
                        }
                    });
                }
            }
        })
            break;
        case 'del':   //删除blog数据
        ModelBlog.remove({'_id':req.query.id},function(err,delData){
            if(err){
                console.log(err);
                res.status(500).send('数据库错误').end();
            }else{
                res.redirect('/users/blog');
            }
        })
            break;
        default :   //页面显示blog数据
        ModelBlog.find({},function(err,blogData){
            if(err){
                console.log(err);
                res.status(500).send('数据库错误').end();
            }else{
                res.render('blog.html',{blogData});
            }
        });
            break;
    }

});

router.post('/blog',function(req,res){
    var postData = new ModelBlog({
        title: req.body.title,
        content: req.body.content
    });
    if(!postData.title || !postData.content){
        res.status(400).send('数据不能为空');
    }else{
        //修改blog数据
         if(req.body.mod_id){
            ModelBlog.update(
                {'_id':req.body.mod_id},
                {$set:{title:postData.title,content:postData.content}},
                function(err,modData){
                    res.redirect('/users/blog');
            });

         }else{
            //查询blog数据
            postData.save(function(err,blogData){
                if(err){
                    console.log(err);
                    res.status(500).send('数据库错误').end();
                }else{
                    res.redirect('/users/blog');
                }
            });
         }

    }
})

//个人资料
router.get('/user',function(req,res){
     switch(req.query.act){
        case 'mod':
            break;
        case 'del':
        ModelMessage.findOne({'_id':req.query.id},function(err,messageData){
            if(err){
                console.log(err);
                res.status(500).send('数据库错误').end();
            }else{
                if(messageData.length==0){
                    res.status(404).send('Not found').end();
                }else{
                    fs.unlink('public/upload/'+messageData.src,function(err){
                        if(err){
                            console.log(err);
                            res.status(500).send('file error').end();
                        }else{
                            ModelMessage.remove({'_id':req.query.id},function(err){
                                if(err){
                                    console.log(err);
                                    res.status(500).send('数据库错误').end();
                                }else{
                                    res.redirect('/users/user');
                                }
                            });
                        }
                    });
                }
            }
        });
            break;
        default :
            ModelMessage.find({},function(err,messageData){
                if(err){
                    console.log(err);
                    res.status(500).send('数据库错误').end();
                }else{
                    res.render('user.html',{messageData});
                }
            });
            break;
     }


});

router.post('/user',function(req,res){
    if(req.files[0]){
        var ext = pathLib.parse(req.files[0].originalname).ext;
        var oldPath = req.files[0].path;
        var newPath = req.files[0].path + ext;
        var newFileName = req.files[0].filename + ext;
    }else{
        var newFileName = null;
    }
    var postData = new ModelMessage({
        petName: req.body.petName,
        description: req.body.description,
        src: newFileName
    });
    if(!postData.petName || !postData.description || !postData.src){
                res.status(400).send('信息不能为空');
    }else{
        fs.rename(oldPath,newPath,function(err){
            if(err){
                console.log(err);
                res.status(500).send('数据库错误').end();
            }else{
                postData.save(function(err,messageData){
                    if(err){
                        console.log(err);
                        res.status(500).send('数据库错误').end();
                    }else{
                        res.redirect('/users/user');
                    }
                });
            }
        });
    }

});


module.exports = router;



const router = require('koa-router')();
//工具类
const Tool = require('../module/OperationTools.js');
//Db
const Db = require('../module/Db.js');
router.get('/loginOut',async (ctx,next) => {
    ctx.session.userinfo = "";
    ctx.body = {'success': true,'msg': '登出成功'};
});


router.post('/doLogin',async (ctx,next) => {
    let username = ctx.request.body.username;
    let password = ctx.request.body.pass;
    if(!username || !password) {
        ctx.body= {'success':false,'msg':'用户登录异常'};
        return;
    }

    let result = await Db.find('admin',{username: username,password:Tool.md5(password),state:"1"});
    if (result.length != 0) {
        //登录成功设置session
        ctx.session.userinfo = result[0];
        //更新时间
        await Db.update('admin',{_id: Db.getObjectId(result[0]._id)},{last_time: new Date()});
        ctx.body= {'success':true,'msg':'登录成功','username': username};
    } else {
        // 登录失败 提示
        ctx.body= {'success':false};
    }
});

module.exports = router.routes();

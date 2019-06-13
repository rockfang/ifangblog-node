const router = require('koa-router')();
//工具类
const Tool = require('../module/OperationTools.js');
//Db
const Db = require('../module/Db.js');
router.get('/',async (ctx,next) => {
    let result = await Db.find('admin',{});
    let managers = [];
    if(result.length != 0) {
        for(let i = 0, length = result.length; i < length; i++) {
            managers.push({
                 username:result[i].username,
                 _id:result[i]._id,
                 state:result[i].state,
                 last_time:result[i].last_time
                });
        }
    }

    ctx.body = {success:true,managers:managers};
});

router.get('/delete',async (ctx,next) => {
    let id = ctx.query.id;
    console.log(id);
    if (!id) {
        ctx.body= {'success':false,'msg':'参数异常'};
        return;
    }
    let delResult = await Db.delete('admin',{_id: Db.getObjectId(id)});
    if(delResult.result.ok) {
        ctx.body= {'success':true,'msg':'管理员删除成功'};
    } else {
        ctx.body= {'success':false,'msg':'管理员删除失败'};
    }

});

router.post('/doAdd',async (ctx,next) => {
    let username = ctx.request.body.username;
    let password = ctx.request.body.password;
    let repwd = ctx.request.body.repwd;
    let state = ctx.request.body.state;
    if(!username || !password || !repwd) {
        ctx.body= {'success':false,'msg':'用户信息异常'};
        return;
    }

    if (password !== repwd) {
        ctx.body= {'success':false,'msg':'两次输入密码不一致'};
        return;
    }

    let result = await Db.find('admin',{username: username});
    if (result.length != 0) {
        ctx.body= {'success':false,'msg':'用户名已存在'};
        return;
    }
    let addResult = await Db.add('admin',{username:username,password:Tool.md5(password),state:state,last_time:''})
    if(addResult) {
        ctx.body= {'success':true,'msg':'管理员添加成功'};
    } else {
        ctx.body= {'success':false,'msg':'管理员添加失败'};
    }
});

router.post('/doEdit',async (ctx,next) => {
    console.log(ctx.request.body);
    let id = ctx.request.body.id;
    let username = ctx.request.body.username;
    let password = ctx.request.body.password;
    let repwd = ctx.request.body.repwd;
    if(!id || !password || !repwd) {
        ctx.body= {'success':false,'msg':'用户信息异常'};
        return;
    }

    if (password !== repwd) {
        ctx.body= {'success':false,'msg':'两次输入密码不一致'};
        return;
    }

    let result = await Db.find('admin',{_id: Db.getObjectId(id)});
    if (result.length == 0) {
        ctx.body= {'success':false,'msg':'用户不存在'};
        return;
    }
    let updateResult = await Db.update('admin',{_id: Db.getObjectId(id)},{password:Tool.md5(password)});
    if(updateResult) {
        ctx.body= {'success':true,'msg':'密码修改成功'};
    } else {
        ctx.body= {'success':false,'msg':'密码失败'};
    }
});

module.exports = router.routes();

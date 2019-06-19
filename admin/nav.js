const router = require('koa-router')();
//工具类
const Tool = require('../module/OperationTools.js');
//Db
const Db = require('../module/Db.js');
router.get('/',async (ctx,next) => {
    let result = await Db.find('nav',{},{},{
        sort: {
            'add_time':1
        }
    });
    let nav = [];
    if(result.length != 0) {
        nav = result;
    }

    ctx.body = {success:true,nav:nav};
});

router.get('/delete',async (ctx,next) => {
    let id = ctx.query.id;
    console.log("delete:" + id);
    if (!id) {
        ctx.body= {'success':false,'msg':'参数异常'};
        return;
    }
    let delResult = await Db.delete('nav',{_id: Db.getObjectId(id)});
    if(delResult.result.ok) {
        ctx.body= {'success':true,'msg':'删除成功'};
    } else {
        ctx.body= {'success':false,'msg':'删除失败'};
    }

});

router.post('/doAdd',async (ctx,next) => {

    let name = ctx.request.body.name;
    let route = ctx.request.body.route;
    let state = ctx.request.body.state;
    let sort = ctx.request.body.state;
    if(!name || !route) {
        ctx.body= {'success':false,'msg':'提交信息异常'};
        return;
    }

    let result = await Db.find('nav',{name: name});
    if (result.length != 0) {
        ctx.body= {'success':false,'msg':'该导航名称已存在'};
        return;
    }
    let addResult = await Db.add('nav',{name,route,state,sort,add_time:Tool.getCurrentTime()});

    if(addResult) {
        ctx.body= {'success':true,'msg':'添加成功'};
    } else {
        ctx.body= {'success':false,'msg':'添加失败'};
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

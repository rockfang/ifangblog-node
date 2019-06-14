const router = require('koa-router')();
//工具类
const Tool = require('../module/OperationTools.js');
//Db
const Db = require('../module/Db.js');
router.get('/',async (ctx,next) => {
    let result = await Db.find('articletype',{});
    let articletypes = [];
    if (result.length != 0) {
        let articleData = await Tool.processArticleData(result);
        articletypes = articleData;
    }

    ctx.body = {success:true,articletypes:articletypes};
});

//获取所有父类型(一级目录)
router.get('/getPtypes',async (ctx,next) => {
    let result = await Db.find('articletype',{pid: '0'});
    let articletypes = [];
    if (result.length != 0) {
        articletypes = result;
    }

    ctx.body = {success:true,ptypes:articletypes};
});

//获取当前id的分类信息
router.get('/getctype',async (ctx,next) => {
    console.log(ctx.query);
    let id = ctx.query.id;
    let result = await Db.find('articletype',{_id: Db.getObjectId(id)});
    if (result.length != 0) {
        ctx.body = {success:true,ctype:result[0]};
    } else {
        ctx.body = {success:false,msg:'未获取操作类型信息'};
    }

});

router.get('/delete',async (ctx,next) => {
    let id = ctx.query.id;
    console.log(id);
    if (!id) {
        ctx.body= {'success':false,'msg':'参数异常'};
        return;
    }
    let delResult = await Db.delete('articletype',{_id: Db.getObjectId(id)});
    if(delResult.result.ok) {
        let delSonResult = await Db.delete('articletype',{pid: id});
        //子目录未删除也不影响显示 因此不做二级目录删除成功判断

        ctx.body= {'success':true,'msg':'管理员删除成功'};
    } else {
        ctx.body= {'success':false,'msg':'管理员删除失败'};
    }

});

router.post('/doAdd',async (ctx,next) => {
    let title = ctx.request.body.title;
    let pid = ctx.request.body.pid;
    let state = ctx.request.body.state;
    let description = ctx.request.body.description;
    let lock = ctx.request.body.lock;

    if(!title) {
        ctx.body= {'success':false,'msg':'用户信息异常'};
        return;
    }

    let findResult = await Db.find('articletype',{title: title});
    if (findResult.length != 0) {
        ctx.body= {'success':false,'msg':'该分类名已存在'};
        return;
    }
    let addResult = await Db.add('articletype',{title,pid,state,description,lock,add_time:Tool.getCurrentTime()});
    if(addResult) {
        ctx.body= {'success':true,'msg':'添加成功'};
    } else {
        ctx.body= {'success':false,'msg':'添加失败'};
    }
});

router.post('/doEdit',async (ctx,next) => {
    console.log(ctx.request.body);
    let id = ctx.request.body.id;
    let pid = ctx.request.body.pid;
    let state = ctx.request.body.state;
    let description = ctx.request.body.description;
    let lock = ctx.request.body.lock;

    let result = await Db.find('articletype',{_id: Db.getObjectId(id)});
    if (result.length == 0) {
        ctx.body= {'success':false,'msg':'该分类不存在'};
        return;
    }
    let updateResult = await Db.update('articletype',{_id: Db.getObjectId(id)},{pid,state,description,lock});
    if(updateResult) {
        ctx.body= {'success':true,'msg':'修改成功'};
    } else {
        ctx.body= {'success':false,'msg':'修改失败'};
    }
});

module.exports = router.routes();

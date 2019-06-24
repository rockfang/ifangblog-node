const router = require('koa-router')();
//工具类
const Tool = require('../module/OperationTools.js');
//Db
const Db = require('../module/Db.js');
router.get('/',async (ctx,next) => {
    console.log(ctx.query);
    //分页加载
    let currentPage = ctx.query.page || 1;
    //每页多少条
    let PAGE_SIZE = ctx.query.pageSize || 10;
    //获取页数用于分页设置
    let total = await Db.count('tag',{});

    //获取当前页数据
    let result = await Db.find('tag',{},{},
        {   page:parseInt(currentPage),
            pageSize:parseInt(PAGE_SIZE),
            sort: {
                'add_time': -1
            }
        }
    );

    let tags = [];
    if (result.length != 0) {
        tags = result;
    }
    ctx.body = {success:true,tags:tags,pageCount:Math.ceil(total/PAGE_SIZE)};

});

//获取当前id的分类信息
router.get('/getctag',async (ctx,next) => {
    console.log(ctx.query);
    let id = ctx.query.id;
    let result = await Db.find('tag',{_id: Db.getObjectId(id)});
    if (result.length != 0) {
        ctx.body = {success:true,ctag:result[0]};
    } else {
        ctx.body = {success:false,msg:'未获取标签信息'};
    }

});

router.get('/delete',async (ctx,next) => {
    let id = ctx.query.id;
    console.log("delete:" + id);
    if (!id) {
        ctx.body= {'success':false,'msg':'参数异常'};
        return;
    }
    let delResult = await Db.delete('tag',{_id: Db.getObjectId(id)});
    if(delResult.result.ok) {
        ctx.body= {'success':true,'msg':'删除成功'};
    } else {
        ctx.body= {'success':false,'msg':'删除失败'};
    }
});

router.post('/doAdd',Tool.multerUpload("/tagIcon").single('tagIcon'),async (ctx)=>{
    let tag_url = "";
    if (ctx.req.file) {
        console.log(ctx.req.file.path);
        tag_url = ctx.request.header.host + ctx.req.file.path.substr(6)
    } else {
        tag_url = "";
    }
    //使用multer后，通过req获取表单数据
    let name = ctx.req.body.typeName;
    let state = ctx.req.body.state;
    let sort = ctx.req.body.sort;
    let icon = tag_url;

    let findResult = await Db.find('tag',{name});

    if (findResult.length != 0) {
        ctx.body= {'success':false,'msg':'该标签名已存在'};
        return;
    }
    let addResult = await Db.add('tag',{name,state,sort,icon,add_time:Tool.getCurrentTime()});
    if(addResult) {
        ctx.body= {'success':true,'msg':'添加成功'};
    } else {
        ctx.body= {'success':false,'msg':'添加失败'};
    }

});

router.post('/doEdit',Tool.multerUpload("/tagIcon").single('tagIcon'),async (ctx,next) => {
    let tag_url = "";
    if (ctx.req.file) {
        tag_url = ctx.request.header.host + ctx.req.file.path.substr(6)
    } else {
        tag_url = "";
    }

    console.log(ctx.req.body);
    let id = ctx.req.body.id;
    let name = ctx.req.body.typeName;
    let state = ctx.req.body.state;
    let sort = ctx.req.body.sort;
    let icon = tag_url;

    let result = await Db.find('tag',{_id: Db.getObjectId(id)});
    if (result.length == 0) {
        ctx.body= {'success':false,'msg':'该标签不存在'};
        return;
    }
    if(icon && icon.length > 0) {
        var updateResult = await Db.update('tag',{_id: Db.getObjectId(id)},{state,sort,icon,add_time:Tool.getCurrentTime()});
    } else {
        var updateResult = await Db.update('tag',{_id: Db.getObjectId(id)},{state,sort,add_time:Tool.getCurrentTime()});
    }
    if(updateResult) {
        ctx.body= {'success':true,'msg':'修改成功'};
    } else {
        ctx.body= {'success':false,'msg':'修改失败'};
    }
});

module.exports = router.routes();

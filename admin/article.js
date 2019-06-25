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
    let total = await Db.count('article',{});

    //获取当前页数据,去除无关字段
    let result = await Db.find('article',{},{rawText: 0,renderText: 0,keywords: 0},
        {   page:parseInt(currentPage),
            pageSize:parseInt(PAGE_SIZE),
            sort: {
                'createId': -1
            }
        }
    );

    let articles = [];
    if (result.length != 0) {
        articles = result;
    }
    ctx.body = {success:true,articles:articles,pageCount:Math.ceil(total/PAGE_SIZE)};
});

//获取当前id的文章信息
router.get('/getarticle',async (ctx,next) => {
    let id = ctx.query.id;
    let result = await Db.find('article',{_id: Db.getObjectId(id)});
    if (result.length != 0) {
        //处理tags
        let showTags = [];
        let sourceData = result[0];
        for(let i = 0, length = sourceData.tags.length; i < length; i++) {
            showTags.push(sourceData.tags[i].name)
        }
        result[0].tags = showTags;

        ctx.body = {success:true,article:result[0]};
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
    let delResult = await Db.delete('article',{_id: Db.getObjectId(id)});
    if(delResult.result.ok) {
        ctx.body= {'success':true,'msg':'删除成功'};
    } else {
        ctx.body= {'success':false,'msg':'删除失败'};
    }

});

router.post('/doAdd',async (ctx,next) => {
    let pid = ctx.request.body.pid;
    let title = ctx.request.body.title;
    let state = ctx.request.body.state; //草稿还是发布
    let description = ctx.request.body.description;
    let keywords = ctx.request.body.keywords;
    let rawText = ctx.request.body.rawText;
    let renderText = ctx.request.body.renderText;
    let createTime = ctx.request.body.createTime;
    let tags = ctx.request.body.tags;

    console.log(ctx.request.body);

    if(!title || !description || !renderText) {
        ctx.body= {'success':false,'msg':'提交信息异常'};
        return;
    }

    let findTitleResult = await Db.find('article',{title: title});
    if (findTitleResult.length != 0) {
        ctx.body= {'success':false,'msg':'该文章名已存在'};
        return;
    }

    let findArticletypeResult = await Db.find('articletype',{_id: Db.getObjectId(pid)});
    if (findArticletypeResult.length == 0) {
        ctx.body= {'success':false,'msg':'文章所属类目不存在'};
        return;
    }

    let latestCreateResult = await Db.find('article',{},{createId:1},{
        sort: {
            createId: -1
        }
    });

    console.log(latestCreateResult);
    // 默认信息
    let atname = findArticletypeResult[0].title;
    let lock = '0';
    let createId = latestCreateResult.length === 0 ? 1 : latestCreateResult[0].createId + 1;

    //把tags和标签页的标签绑定  warning
    let newTags = [];
    for(let i = 0, length = tags.length; i < length; i++) {
        let findTagResult = await Db.find('tag',{name: tags[i]});
            if (findTagResult.length > 0) {
                newTags.push({name:findTagResult[0].name,icon:findTagResult[0].icon});
            } else {
                newTags.push({name:tags[i],icon: ''});
            }
    }

    let addResult = await Db.add('article',{pid,atname,title,state,description,keywords,rawText,renderText,
        lock,tags:newTags,createId,updateTime:'',createTime:Tool.getTimeFormat(createTime)});
    if(addResult) {
        ctx.body= {'success':true,'msg':'添加成功'};
    } else {
        ctx.body= {'success':false,'msg':'添加失败'};
    }
});

router.post('/doEdit',async (ctx,next) => {
    let id = ctx.request.body.id;

    let pid = ctx.request.body.pid;
    let title = ctx.request.body.title;
    let state = ctx.request.body.state; //草稿还是发布
    let description = ctx.request.body.description;
    let keywords = ctx.request.body.keywords;
    let rawText = ctx.request.body.rawText;
    let renderText = ctx.request.body.renderText;
    let tags = ctx.request.body.tags;

    // let result = await Db.find('article',{_id: Db.getObjectId(id)});
    // if (result.length == 0) {
    //     ctx.body= {'success':false,'msg':'该文章不存在'};
    //     return;
    // }

    let findArticletypeResult = await Db.find('articletype',{_id: Db.getObjectId(pid)});
    if (findArticletypeResult.length == 0) {
        ctx.body= {'success':false,'msg':'文章所属类目不存在'};
        return;
    }
    let atname = findArticletypeResult[0].title;

    //把tags和标签页的标签绑定  warning
    let newTags = [];
    for(let i = 0, length = tags.length; i < length; i++) {
        let findTagResult = await Db.find('tag',{name: tags[i]});
        if (findTagResult.length > 0) {
            newTags.push({name:findTagResult[0].name,icon:findTagResult[0].icon});
        } else {
            newTags.push({name:tags[i],icon: ''});
        }
    }

    let updateResult = await Db.update('article',{_id: Db.getObjectId(id)},{pid,atname,title,state,description,keywords,rawText,renderText,
        tags:newTags,updateTime:Tool.getCurrentTime()});
    if(updateResult) {
        ctx.body= {'success':true,'msg':'修改成功'};
    } else {
        ctx.body= {'success':false,'msg':'修改失败'};
    }
});


router.post('/postImg',Tool.multerUpload("/articleImages").single('articleImages'),async (ctx,next) => {
    let pid = ctx.request.body.pid;
    let title = ctx.request.body.title;
    let state = ctx.request.body.state; //草稿还是发布
    let description = ctx.request.body.description;
    let keywords = ctx.request.body.keywords;
    let rawText = ctx.request.body.rawText;
    let renderText = ctx.request.body.renderText;
    let createTime = ctx.request.body.createTime;
    let tags = ctx.request.body.tags;

    console.log(ctx.request.body);

    if(!title || !description || !renderText) {
        ctx.body= {'success':false,'msg':'提交信息异常'};
        return;
    }

    let findTitleResult = await Db.find('article',{title: title});
    if (findTitleResult.length != 0) {
        ctx.body= {'success':false,'msg':'该文章名已存在'};
        return;
    }

    let findArticletypeResult = await Db.find('articletype',{_id: Db.getObjectId(pid)});
    if (findArticletypeResult.length == 0) {
        ctx.body= {'success':false,'msg':'文章所属类目不存在'};
        return;
    }

    let latestCreateResult = await Db.find('article',{},{createId:1},{
        sort: {
            createId: -1
        }
    });

    console.log(latestCreateResult);
    // 默认信息
    let atname = findArticletypeResult[0].title;
    let lock = '0';
    let createId = latestCreateResult.length === 0 ? 1 : latestCreateResult[0].createId + 1;

    //把tags和标签页的标签绑定  warning
    let newTags = [];
    for(let i = 0, length = tags.length; i < length; i++) {
        let findTagResult = await Db.find('tag',{name: tags[i]});
        if (findTagResult.length > 0) {
            newTags.push({name:findTagResult[0].name,icon:findTagResult[0].icon});
        } else {
            newTags.push({name:tags[i],icon: ''});
        }
    }

    let addResult = await Db.add('article',{pid,atname,title,state,description,keywords,rawText,renderText,
        lock,tags:newTags,createId,updateTime:'',createTime:Tool.getTimeFormat(createTime)});
    if(addResult) {
        ctx.body= {'success':true,'msg':'添加成功'};
    } else {
        ctx.body= {'success':false,'msg':'添加失败'};
    }
});

module.exports = router.routes();

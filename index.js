/**
 * 博客前端接口
 */

const router = require('koa-router')();
//工具类
const Tool = require('./module/OperationTools.js');
//Db
const Db = require('./module/Db.js');

//配置中间件
router.use(async (ctx,next) => {

    await next();
});

router.get('/',async (ctx,next) => {
    //获取文章索引数据,首页展示10篇
    let result = await Db.find('article',{state: '1',lock: '0'},{rawText: 0,renderText: 0,
            keywords: 0, pid: 0,lock: 0},
        {   page:1,
            pageSize:10,
            sort: {
                'createId': -1
            }
        }
    );
    let articles = [];
    if (result.length != 0) {
        articles = result;
    }
    ctx.body = {success:true,articles:articles};
});
router.get('/articleDetail',async (ctx,next) => {
    console.log(ctx.query);
    let id = ctx.query.id;
    let result = await Db.find('article',{_id: Db.getObjectId(id)},{renderText: 1,
        keywords: 1});

    if (result.length != 0) {
        ctx.body = {success:true,article:result[0]};
    } else {
        ctx.body = {success:true,msg: '没有此文章信息'};
    }

});

router.get('/tags',async (ctx,next) => {
    let result = await Db.find('tag',{state: '1'},{name: 1});
    let tags = [];
    if (result.length != 0) {
        tags = result;
    }

    ctx.body = {success:true,tags:tags};
});
router.get('/taginfo',async (ctx,next) => {
    let tagName = ctx.query.name;
    if(!tagName) {
        ctx.body = {success:false,msg: '该标签信息不存在'};
        return;
    }
    let result = await Db.find('tag',{name: tagName},{name: 1,icon: 1});

    let taginfo = {};
    if (result.length != 0) {
        taginfo = result[0];
    }

    ctx.body = {success:true,taginfo:taginfo};
});

router.get('/tagarticle',async (ctx,next) => {
    console.log(ctx.query);
    let tagName = ctx.query.tagName;
    // console.log("tagName:" + tagName);

    //分页加载
    let currentPage = ctx.query.page || 1;
    //每页多少条
    let PAGE_SIZE = ctx.query.pageSize || 10;
    //获取页数用于分页设置
    let totlaResult = await Db.findArticle('article',[{"$unwind":"$tags"},{"$match":{"tags.name":tagName,state:'1'}}],{});
    let total = 0;
    if (totlaResult.length != 0) {
        total = totlaResult.length;
    }
    console.log("total:" + total);

    //获取当前页数据
    //db.article.aggregate([{"$unwind":"$tags"},{"$match":{"tags.name":"Chrome"}},{"$project":{"tags":1}}])//返回数组中对象只包含_id和tags
    //db.article.aggregate([{"$unwind":"$tags"},{"$match":{"tags.name":"Chrome"}},{$sort:{createId:-1}}])

    let result = await Db.findArticle('article',[{"$unwind":"$tags"},{"$match":{"tags.name":tagName,state:'1'}},{$sort:{createId:-1}}],//返回数组对象包含所有字段
        {   page:parseInt(currentPage),
            pageSize:parseInt(PAGE_SIZE)
        }
    );
    // console.log(result);
    let articles = [];
    if (result.length != 0) {
        articles = result;
    }
    ctx.body = {success:true,articles:articles,pageCount:Math.ceil(total/PAGE_SIZE)};
});


router.get('/case',async (ctx,next) => {

});
router.get('/contact',async (ctx,next) => {
});
router.get('/news',async (ctx,next) => {
});
router.get('/service',async (ctx,next) => {
});

router.get('/content/:id',async (ctx,next) => {

});

module.exports = router.routes();

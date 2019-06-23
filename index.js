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

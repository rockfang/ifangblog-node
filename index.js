/**
 * 博客前端接口
 */

const router = require('koa-router')();
let url=require('url');

//配置中间件
router.use(async (ctx,next) => {

    await next();
});

router.get('/',async (ctx,next) => {

});
router.get('/about',async (ctx,next) => {
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

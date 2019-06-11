const router = require('koa-router')();
//引入子路由
const login = require('./admin/login');
// const board = require('./admin/board');
// const manager = require('./admin/manager');
// const articlecate = require('./admin/articlecate');
// const article = require('./admin/article');
// const link = require('./admin/link');
// const nav = require('./admin/nav');
// const setting = require('./admin/setting');
const md5 = require('md5');
const url = require('url');

//配置中间件
router.use(async (ctx,next) => {

    //做权限校验 ？
    /**
     * 区分前端页面请求的接口还是，cms后台请求的
     */
    let pathname = url.parse(ctx.request.url).pathname;//获取/admin/login/getCode?ts=770.0280020629946中/admin/login/getCode
    console.log('admin中间件');
    console.log(pathname);
    console.log('----------');
    console.log(ctx.session.userinfo);
    if(ctx.session.userinfo) {
        await next();
    } else {
        if (pathname == '/admin/login/doLogin' || pathname == '/admin/login/loginOut') {
            await next();
        } else {
            ctx.body={'code':100,'msg': "请先登录"};
        }
    }
});


router.use('/login',login);
// router.use('/board',board);
// router.use('/manager',manager);
// router.use('/articlecate',articlecate);
// router.use('/article',article);
// router.use('/link',link);
// router.use('/nav',nav);
// router.use('/setting',setting);

module.exports = router.routes();

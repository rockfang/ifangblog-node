const Koa = require('koa');
const app = new Koa();

const Router = require('koa-router');
const router = new Router();
//jsonp
const url = require('url');
const jsonp = require('koa-jsonp');
app.use(jsonp());

//koa2-cors 允许跨域post访问
const cors = require('koa2-cors');
app.use(cors());

const bodyParser = require('koa-bodyparser');
app.use(bodyParser());
//工具类
const Tool = require('./module/OperationTools.js');
//Db
const Db = require('./module/Db.js');
//session
const session = require('koa-session');
const CONFIG = {
    key: 'koa:sess',
    maxAge: 30000,
    autoCommit: true,
    overwrite: true,
    httpOnly: true, /** (boolean) httpOnly or not (default true) */
    signed: true, /** (boolean) signed or not (default true) */
    rolling: true, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
    renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
};
app.keys = ['newest secret key', 'older secret key'];
app.use(session(CONFIG, app));
//配置中间件;
router.use(async (ctx,next) => {
    /**
     * 区分前端页面请求的接口还是，cms后台请求的
     */
    let pathname = url.parse(ctx.request.url).pathname;//获取/admin/login/getCode?ts=770.0280020629946中/admin/login/getCode
    console.log(pathname);
    console.log(ctx.session.userinfo);

    // if(ctx.session.userinfo) {
    //     await next();
    // } else {
    //     if (pathname.indexOf('manager' > -1)) {
    //         ctx.body={'code':100,'msg': "请先登录"};
    //     } else {
    //         await next();
    //     }
    // }

});
router.get('/', async (ctx, next) => {
    // ctx.router available
    ctx.body="hello"
});

router.post('api/doLogin', async (ctx, next) => {
    let username = ctx.request.body.username;
    let password = ctx.request.body.pass;
    let result = await Db.find('admin',{username: username,password:Tool.md5(password),state:"1"});
    if (result.length != 0) {
        //登录成功设置session
        ctx.session.userinfo = result[0];
        //更新时间
        await Db.update('admin',{_id: Db.getObjectId(result[0]._id)},{last_time: new Date()});
        ctx.body= {'success':true};
    } else {
        // 登录失败 提示
        ctx.body= {'success':false};
    }
});

app
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(3005);

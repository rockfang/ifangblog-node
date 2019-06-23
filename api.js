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
app.use(cors({
    origin: function (ctx) {
        // return 'http://106.15.233.83:8888';
        return 'http://localhost:8080';

    },
    exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
    maxAge: 5,
    credentials: true,//表示是否允许发送Cookie
    allowMethods: ['GET', 'POST', 'DELETE'], //设置允许的HTTP请求类型
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

const bodyParser = require('koa-bodyparser');
app.use(bodyParser());

const serve = require('koa-static');
app.use(serve(__dirname + '/public'));
//session
const session = require('koa-session');
const CONFIG = {
    key: 'koa:sess',
    maxAge: 2*3600*1000,
    autoCommit: true,
    overwrite: true,
    httpOnly: true, /** (boolean) httpOnly or not (default true) */
    signed: true, /** (boolean) signed or not (default true) */
    rolling: true, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
    renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
};
app.keys = ['newest secret key', 'older secret key'];
app.use(session(CONFIG, app));

router.get('/', async (ctx, next) => {
    // ctx.router available
    ctx.body="hello"
});


/**
 * 接口路由划分：api.js入口
 * index.js博客前端页面接口入口
 *      可细分前端接口
 * admin.js博客cms管理平台接口入口
 *      login.js登录相关接口
 *      board.js控制台相关接口
 *      manager.js管理员相关接口
 *      ...
 */

//引入子路由
const admin = require('./admin');
const index = require('./index');

app.use(async (ctx,next) => {
    await next();
});

//配置子路由即访问/admin，对应admin.js
router.use('/admin',admin);
router.use('/index',index);

app
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(3005);

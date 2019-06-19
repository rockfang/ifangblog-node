const router = require('koa-router')();
//工具类
const Tool = require('./module/OperationTools.js');
//Db
const Db = require('./module/Db.js');
//引入子路由
const login = require('./admin/login');
// const board = require('./admin/board');
const manager = require('./admin/manager');
const articletype = require('./admin/articletype');
const tag = require('./admin/tag');
// const article = require('./admin/article');
const link = require('./admin/link');
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
    // await next();

    let pathname = url.parse(ctx.request.url).pathname;//获取/admin/login/getCode?ts=770.0280020629946中/admin/login/getCode
    // console.log('admin中间件');
    // console.log(ctx.session.userinfo);
    if(ctx.session.userinfo) {
        await next();
    } else {
        if (pathname == '/admin/login/doLogin' || pathname == '/admin/login/loginOut') {
            await next();
        } else {
            ctx.body={'code':1002,'msg': "请先登录"};
        }
    }

});


router.use('/login',login);
// router.use('/board',board);
router.use('/manager',manager);
router.use('/articletype',articletype);
router.use('/tag',tag);
// router.use('/article',article);
router.use('/link',link);
// router.use('/nav',nav);
// router.use('/setting',setting);


router.post('/changeState',async (ctx) => {
    console.log(ctx.request.body);
    let collectionName = ctx.request.body.collectionName;
    let attr = ctx.request.body.attr;//要改变的参数,对应数据库表中一个字段
    let id = ctx.request.body.id;

    if (!collectionName || !attr || !id) {
        ctx.body = {success: false,message: "参数异常"};
        return;
    }
    let result = await Db.find(collectionName,{"_id": Db.getObjectId(id)});
    if (result.length != 0) {
        let serverAttr = result[0][attr];
        let destAttr = {};
        if (serverAttr == 0) {
            destAttr = { /*es6 属性名表达式*/
                [attr]: "1"
            };
        } else {
            destAttr = { /*es6 属性名表达式*/
                [attr]: "0"
            };
        }
        console.log(destAttr);
        let updateResult = await Db.update(collectionName,{_id: Db.getObjectId(id)},destAttr);
        if(updateResult) {
            ctx.body = {success: true,msg: "更新成功"};
        } else {
            ctx.body = {success: false,msg: "更新失败"};
        }

    } else {
        ctx.body = {success: false,msg: "参数错误"};
    }
});

router.post('/changeSort',async (ctx) => {
    console.log('----------changeSort---------');
    console.log(ctx.request.body);
    let collectionName = ctx.request.body.collectionName;
    let sort = ctx.request.body.sort;//要改变的参数,对应数据库表中一个字段
    let id = ctx.request.body.id;

    let updateResult = await Db.update(collectionName,{_id: Db.getObjectId(id)},{sort:sort});
    if(updateResult) {
        ctx.body = {success: true,message: "更新成功"};
    } else {
        ctx.body = {success: false,message: "更新失败"};
    }
});
module.exports = router.routes();

const router = require('koa-router')();
//工具类
const Tool = require('../module/OperationTools.js');
//Db
const Db = require('../module/Db.js');
router.get('/',async (ctx,next) => {
    //分页加载
    let result = await Db.find('tag',{});
    console.log(result);
    let tags = [];
    if (result.length != 0) {
        tags = result;
    }
    ctx.body = {success:true,tags:tags};

});

router.get('/delete',async (ctx,next) => {

});

router.post('/doAdd',async (ctx,next) => {

});

router.post('/addPic',Tool.multerUpload().single('tag_icon'),async (ctx)=>{
    // let tag_icon=ctx.req.file? ctx.req.file.path.substr(7) :'';
    // console.log(ctx.req.file.path);
    // console.log(tag_icon);
    console.log(ctx.req.body);

});

router.post('/doEdit',async (ctx,next) => {

});

module.exports = router.routes();

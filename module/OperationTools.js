const md5 = require('md5');
const multer = require('koa-multer');
const sd = require('silly-datetime');
const fs = require("fs");

const Tool = {

    delPath:function(path){
        if(path.indexOf('./')!==0||path.indexOf('../')!==0){
            return "为了安全仅限制使用相对定位..";
        }
        if(!fs.existsSync(path)){
            console.log("路径不存在");
            return "路径不存在";
        }
        let info=fs.statSync(path);
        if(info.isDirectory()){//目录
            let data=fs.readdirSync(path);
            if(data.length>0){
                for (var i = 0; i < data.length; i++) {
                    delPath(`${path}/${data[i]}`); //使用递归
                    if(i==data.length-1){ //删了目录里的内容就删掉这个目录
                        delPath(`${path}`);
                    }
                }
            }else{
                fs.rmdirSync(path);//删除空目录
            }
        }else if(info.isFile()){
            fs.unlinkSync(path);//删除文件
        }
    },

    delArticleImg: function(name) {
        let realPath = "public/articleImages/" + name
        if(!fs.existsSync(realPath)){
            console.log("delArticleImg " + realPath + " ----文件不存在");
            return "文件不存在";
        }
        let info=fs.statSync(realPath);

        if(info.isFile()) {
            fs.unlinkSync(realPath);//删除文件
        }
    },

    multerUpload: function(pathname) {
        let storage = multer.diskStorage({
            destination: function (req, file, cb) {
                if (pathname) {
                    cb(null, 'public' + pathname)
                } else {
                    cb(null, 'public')
                }

            },
            filename: function (req, file, cb) {
                let fileFormat = (file.originalname).split(".");   /*获取后缀名  分割数组*/
                cb(null,Date.now() + "." + fileFormat[fileFormat.length - 1]);
            }
        })
        let upload = multer({ storage: storage });
        return upload;
    },
    md5: function (src) {
       return md5(src);
    },
    getCurrentTime: function () {
        return sd.format(new Date(), 'YYYY-MM-DD HH:mm');
    },
    getTimeFormat: function(time) {
        return sd.format(time, 'YYYY-MM-DD');
    },
    getCurrentDayTime: function () {
        return sd.format(new Date(), 'YYYY-MM-DD');
    },
    processArticleData: function (srcArr) {
        let resultArr = [];
        let length = srcArr.length;
        for(let i=0;i<length;i++) {
            //取出pid=0的一级目录
            // console.log(srcArr[i].pid);
            if(srcArr[i].pid == '0') {
                //一级目录增加list属性，用于添加子目录
                srcArr[i].list = [];
                for(let j=0;j<length;j++) {
                    //取到一级目录的_id
                    if(srcArr[j].pid == srcArr[i]._id) {
                        srcArr[i].list.push(srcArr[j]);
                    }
                }

                resultArr.push(srcArr[i]);
            }
        }
        return resultArr;
    },
};

module.exports = Tool;

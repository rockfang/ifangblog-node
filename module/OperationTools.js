const md5 = require('md5');
const multer = require('koa-multer');
const Tool = {
    multerUpload: function() {
        let storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, 'public/upload')
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
    getCurrentTime: function () {
      return new Date();
    }
};

module.exports = Tool;

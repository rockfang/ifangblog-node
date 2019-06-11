/**
 * 封装 数据库操作
 */
const MongoClient = require('mongodb').MongoClient;
const Config = require("./Config.js");

const ObjectID = require('mongodb').ObjectID;

class Db {

    static getInstance() {
        if (!Db.INSTANCE) {
            Db.INSTANCE = new Db();
        }
        return Db.INSTANCE;
    }
    constructor() {
        this.dbClient = "";//数据库连接对象。用属性方式存
        this.connect();
    }
    connect() {
        return new Promise((resolve,reject) => {
            if (this.dbClient) {
                resolve(this.dbClient);
                return;
            }
            MongoClient.connect(Config.dbUrl,{ useNewUrlParser: true }, (err, client) => {
                if (err) {
                    reject(err);
                } else {
                    this.dbClient = client.db(Config.dbName);//具体的数据库操作对象
                    resolve(this.dbClient);
                }
            });
        });
    }

    add(collectionName,json) {
        return new Promise((resolve,reject) => {
            this.connect().then((client) => {
                let col = client.collection(collectionName);
                col.insertOne(json,(err,result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
        });
    }

    //统计数量的方法
    count(collectionName,json){

        return new  Promise((resolve,reject)=> {
            this.connect().then((db)=> {

                var result = db.collection(collectionName).countDocuments(json);
                result.then(function (count) {

                        resolve(count);
                    }
                )
            })
        })

    }

    //查询第page页的数据，每页数据大小为pageSize. 页数： pagenumber = Math.ceil(count/pageSize)
    // db.article.find({},{title:1}).skip((page-1)*pageSize).limit(pageSize).sort({'add_time':-1})
    find(collectionName,json,fieldJson,psJson) {
        return new Promise((resolve,reject) => {
            this.connect().then((client) => {

                try {
                    let col = client.collection(collectionName);
                    let result = "";
                    if(arguments.length == 2) {
                        result= col.find(json);
                    } else if(arguments.length == 3) {
                        result= col.find(json,fieldJson);
                    } else if(arguments.length == 4) {
                        //健壮性处理
                        let page=psJson.page ||1;
                        let pageSize=psJson.pageSize||100;
                        let skipnumber=(page-1)*pageSize;
                        if(psJson.sort) {
                            result= col.find(json,fieldJson).skip(skipnumber).limit(pageSize).sort(psJson.sort);
                        } else {
                            result= col.find(json,fieldJson).skip(skipnumber).limit(pageSize);
                        }
                    } else {
                        reject('参数异常');
                    }
                    result.toArray(function(err,docs){

                        if(err){
                            reject(err);
                            return;
                        }
                        resolve(docs);
                    })
                } catch (e) {
                    reject(e);
                }
            });
        });
    }


    update(collectionName,srcJson,updatedJson) {
        return new Promise((resolve,reject) => {
            this.connect().then((client) => {
                client.collection(collectionName).updateOne(srcJson,{$set: updatedJson},(err,result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
        });
    }

    delete(collectionName,json) {
        return new Promise((resolve,reject) => {
            this.connect().then((client) => {
                client.collection(collectionName).deleteOne(json,(err,result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
        });
    }

    getObjectId(id) {
        return new ObjectID(id);
    }

}
module.exports = Db.getInstance();

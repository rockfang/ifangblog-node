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

    /*
   Db.find('user',{})  返回所有数据
   Db.find('user',{},{"title":1})    返回所有数据  只返回一列
   Db.find('user',{},{"title":1},{   返回第二页的数据
      page:2,
      pageSize:20,
      sort:{"add_time":-1}
   })
  * */
    find(collectionName,json,fieldJson,psJson){
        let attr={};
        let skipnumber=0;
        let pageSize=0;
        let page = 1;
        let sortJson = {};

        if(arguments.length==2) {
            //do nothing
        } else if(arguments.length==3){
            attr=fieldJson;
        }else if(arguments.length==4){
            attr = fieldJson;
            page = psJson.page || 1;
            pageSize = psJson.pageSize || 20;
            skipnumber = (page - 1) * pageSize;
            if (psJson.sort) {
                sortJson = psJson.sort;
            }
        }else{
            console.error('传入参数错误')
        }
        return new Promise((resolve,reject)=>{
            this.connect().then((db)=>{
                //var result=db.collection(collectionName).find(json);
                let result =db.collection(collectionName).find(json,{fields: attr}).skip(skipnumber).limit(pageSize).sort(sortJson);
                result.toArray(function(err,docs){
                    if(err){
                        reject(err);
                        return;
                    }
                    resolve(docs);
                })

            })
        })
    }


    /**
     *
     * @param collectionName
     * @param json ：[{"$unwind":"$tags"},{"$match":{"tags.name":tagName}},{$sort:{createId:-1}}] 包含排序及匹配信息
     * @param psJson： 分页信息
     * @returns {Promise<any>}
     */
    findArticle(collectionName,json,psJson){
        let skipnumber=0;
        let pageSize=0;
        let page = 1;

        if(arguments.length==3){
            page = psJson.page || 1;
            pageSize = psJson.pageSize || 20;
            skipnumber = (page - 1) * pageSize;
        }else{
            console.error('传入参数错误')
        }
        return new Promise((resolve,reject)=>{
            this.connect().then((db)=>{
                //var result=db.collection(collectionName).find(json);
                let result =db.collection(collectionName).aggregate(json).skip(skipnumber).limit(pageSize);
                result.toArray(function(err,docs){
                    if(err){
                        reject(err);
                        return;
                    }
                    resolve(docs);
                })

            })
        })
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

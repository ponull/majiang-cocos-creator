var URL = "http://192.168.31.22:9000";

cc.VERSION = 20180108; //版本号

/**
 * HTTP - 网络请求模块
 * 
 * 封装HTTP请求逻辑，与Cocos Creator的cc.loader解耦。
 * 使用标准XMLHttpRequest替代cc.loader.getXMLHttpRequest()，
 * 同时保持向后兼容。
 */
var HTTP = cc.Class({
    extends: cc.Component,
    //静态块基本信息
    statics:{
        sessionId : 0,
        userId : 0,
        master_url:URL,
        url:URL,
        
        /**
         * 创建XMLHttpRequest对象（与cc.loader解耦）
         * @returns {XMLHttpRequest}
         */
        _createXHR: function() {
            // 优先使用标准XMLHttpRequest，回退到cc.loader兼容方式
            if (typeof XMLHttpRequest !== 'undefined') {
                return new XMLHttpRequest();
            }
            if (cc.loader && cc.loader.getXMLHttpRequest) {
                return cc.loader.getXMLHttpRequest();
            }
            console.error('HTTP: XMLHttpRequest is not available');
            return null;
        },
        
        /**
         * 构建查询字符串
         * @param {object} data - 请求参数
         * @returns {string} 查询字符串
         */
        _buildQueryString: function(data) {
            var str = "?";
            for (var k in data) {
                if (data.hasOwnProperty(k)) {
                    if (str !== "?") {
                        str += "&";
                    }
                    str += k + "=" + data[k];
                }
            }
            return str;
        },
        
        //发送请求  路径 ，数据,handler,额外url
        sendRequest : function(path,data,handler,extraUrl){
            var xhr = this._createXHR();
            xhr.timeout = 5000;
            var str = this._buildQueryString(data);
            if(extraUrl == null){
                extraUrl = HTTP.url;
            }
            var requestURL = extraUrl + path + encodeURI(str);
            console.log("RequestURL:" + requestURL);
            xhr.open("GET",requestURL, true);
            if (cc.sys.isNative){
                xhr.setRequestHeader("Accept-Encoding","gzip,deflate","text/html;charset=UTF-8");
            }
            
            xhr.onreadystatechange = function() {
                if(xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)){
                    console.log("http res("+ xhr.responseText.length + "):" + xhr.responseText);
                    try {
                        var ret = JSON.parse(xhr.responseText);
                        if(handler !== null){
                            handler(ret);
                        }
                    } catch (e) {
                        console.log("err:" + e);
                    }
                    finally{
                        if(cc.vv && cc.vv.wc){
                        //       cc.vv.wc.hide();    
                        }
                    }
                }
            };
            
            if(cc.vv && cc.vv.wc){
                //cc.vv.wc.show();
            }
            xhr.send();
            return xhr;
        },
    },
});
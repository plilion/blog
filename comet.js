/**
 * jQuery comet
 *
 * Copyright (c) 2009 Mike Chen (achievo.mike.chen@gmail.com)
 *
 * @version 2.2.7
 * @author Mike Chen
 * @mailto achievo.mike.chen@gmail.com
 * @modify Mike Chen
 * @edit by tianyanrong. add if link fail . Private information
 **/

/*
CPS推送客户端

原理：采用服务器推的方式，及时把信息返回给客户端。


使用方法：
第一步：调用
cm.run({
    url:xxxx, //推送的URL路径，如：http://xxxx.com/
    token: xxxx, //Token
    asname: xxxx, //Asname
    timestamp: xxxx, //推送起始时间
    channel: xxxx, //订阅频道，用|分隔
    domain: xxxx //Domain，如果同域设置为空
})
以上的参数是必须的，下面的参数是可选的：
filter：function(){} //过滤回调函数，在发送数据消息之前调用，过滤非法数据，如果没有则为空。
doc: $(document) //推送的拥有者，数据消息将在该拥有者发送，默认是Document

第二步：订阅数据消息
$(document).bind('cpsdata', function(e, v, t){
    //当推送有数据过来的时候，这个函数将被调用，其中
    //e -- 事件的名称
    //v -- 推送回来的数据，类型：Object
    //t -- 该数据包的时间，类型：String or Number
});

以上二步就完成了订阅的全过程，Enjoy it!

如果需要了解CPS的状态，用下面的方式：
$(docment).bind('cpsconnect', function(e, d){
    //当推送状态有变化时调用该函数
    //e -- 事件的名称
    //d -- 连接情况，类型：Number，值如下：-2 -- 连接失败，-1  -- 初始化连接，[type]  -- 连接成功, 返回连接的类型, type >= 0
});

如果需要切换频道，调用上面的第一步：
cm.run({
    channel: xxxx //订阅频道，用|分隔
})
上面的第二步可以不需要。如果有特别的处理，请重新订阅数据消息。


推送具体运行方案：
在IE浏览器下，采用模式1，基于 Iframe 及 htmlfile 的流（streaming）方式，如果建立不成功，自动转为模式2，基于 Ajax 的长轮询（long-polling）方式。
在非IE浏览器，采用模式0，基于 Ajax的流（streaming）方式

在CPS连接有问题的情况下，如果有成功连接到CPS服务器的历史，则CPS客户端面会间隔5秒不断地进行重连；如果没有成功连接到CPS服务器的历史，则连接2-4次就停止，一直到下一次页面刷新。
*/

(function($){
$.comet = {};
var cm = $.comet,
iframe,//commet 需要用到Iframe
fcon, //iframe 的容器
retimes = 0, //掉线重连的次数 超过次数转断线重连时间
httpHander, //http 连接句柄
timeHander, //连接超时句柄
linkhander, //是否断线的标记 timeer
isOff = 0,  //是否发送过断开的消息
stop = 1,   //在切换频道时，阻止回调函数p()的绑定
isSuccess = 0, //是否成功过
connectCount = 0, //CPS连接次数
isOk = 1, //IE中成功信号只发送一次 1--进入发送状态,0--无法发送;
maxCount = 1, //最大重试次数
firstConnect = 1, //是否第一次连接
bag = 0, //数据包计数
linkOk = 0, //CPS服务是否正常
splitChar = "ê", //Ajax 方式的分隔符
xhr, //xmlhttprequest
itype = window.ActiveXObject ? [1, 0] : [0, 0], //指示当前的状态索引
 /*长链接的方法，
 0--基于 Ajax的流（streaming）方式, 
 1--基于 Iframe 及 htmlfile (如果Htmlfile创建不成功则不用) 的流（streaming）方式，
 2--基于 Ajax 的长轮询（long-polling）方式 */
ctype = [[0, 0], [1, 2, 1, 2]], //浏览器跳转模式，第1组为Firefox等非IE浏览器，第2组为IE
maxbag = 99999; //CPS 最大接收到的数据包数量，超过后重连CPS
var type = ctype[itype[0]][itype[1]];

//comet 设置
var st = {
    doc: $(document),
    //链接参数
    token: '',
    timestamp: 0,
    uid_flag: 1,//私有消息标记 0--有私有消息
    uid_timestamp: 0,//私有时间戳
    timeFirst: 180000,//断线重连时间间隔，是链接指没有成功过一次。
    time: (Math.round(Math.random()*1000)%20 + 30)*1000,       //掉线后间隔时间（有成功连接的记录，偶尔掉线）,请不要小于p()回调函数的间隔3秒; Math.round(Math.random()*1000)%20 + 30 产生一个30～50的随机数
    maxRetimes: 36,   //掉线重连maxRetimes次后，转为断线的频率
    asname:  '',
    channel: '',
    domain: '',
    url: '', //connection href
    filter: null //过滤数据
};

//发送CPS消息, e--event, d--data
var sendEvent = function(e, d){
    try{
        st.doc.triggerHandler(e, d);
    }catch(x){
        if(window.console){
            window.console.log(x);
        }
    }
};

//设置连接类型，如果没有这种类型返回-1
var nextType = function(){
    if(retimes > st.maxRetimes){  
        firstConnect = 1;
        retimes = 0;
    }
    retimes++;
    type = ctype[itype[0]][itype[1]];
    if(undefined === type){
        if(firstConnect){
            type = -1;
            sendEvent('cpsconnect', [-2]);//发送连接失败的消息
        }else{
            itype[1] = 0;
            type = ctype[itype[0]][itype[1]];
        }
    }
    if(type >= 0){
        try{
            httpHander.abort();//断开Ajax连接
            httpHander.onreadystatechange = function(){};
        }catch(x){}
        iframe = null;
        httpHander = null;
        if(fcon){
            try{$(fcon).empty().remove()}catch(x){};
            fcon = null;
        }
        bag = 0;
        linkOk = 0;
        cm.run();
    }
};

//构造URL链接
var getLink = function(){
    return st.url + "subscribe?token=" + st.token + "&as_name=" + st.asname + "&timestamp=" + st.timestamp + "&domain=" + st.domain + '&type=' + type + "&channel_list=" + st.channel +"&uid_flag=" + st.uid_flag +"&uid_timestamp=" + st.uid_timestamp + '&_=' + (new Date()).getTime();
};
//构造断开连接的请求
var offLink = function(b){
    if(st.domain){
        $.getJSON(st.url + 'offline?token=' + st.token + '&jsoncallback=?', b);
    }else{
        $.get(st.url + 'offline?token=' + st.token + '&jsoncallback=comet' + (new Date()).getTime(), function(x){
            b(parseInt(x.substr(x.indexOf('(') + 1, 1), 10));
        });
    }
};


/*
 CPS 连接消息：cpsconnect
 -2 -- 连接失败
 -1  -- 初始化连接 
 [type]  -- 连接成功, 返回连接的类型, type >= 0
*/
$.extend($.comet, {
    // 调用位置：主页面
    // 说明：初始化页面事件
    // 调用方式：cm.run(data);
    run: function(d){
        if(type < 0){
            isOff = 1;
            sendEvent('cpsconnect', [-2]);//发送连接失败的消息
            return;
        }
        if('object' == typeof(d)){
            $.extend(st, d);
            connectCount = 0;
            isOff = 1;
            isOk = 1;
            stop = 0;
            sendEvent('cpsconnect', [-1]);//发送初始化连接的消息
            if(d.channel){
                linkOk = 0;
            }
        }else{
            if(connectCount < maxCount && type >= 0){
                if(isSuccess){
                    connectCount++;
                }
            }else{
                if(!isOff){
                    isOff = 1;
                    sendEvent('cpsconnect', [-2]);//发送连接失败的消息
                }
                if(!isSuccess){
                    return;
                }
            }
        }
        var tx = 'cpsframe' + (new Date()).getTime();
        bag = 0;
        if(1 !== type){//type of ajax
            if(st.domain){
                if(!iframe){
                    fcon = document.createElement('div');
                    fcon.style.display = 'none';
                    document.body.appendChild(fcon);
                    fcon.innerHTML = '<iframe name="'+ tx +'"></iframe>';
                    iframe = window.frames[tx];
                    iframe.location.replace(st.url + 'run.html#' + st.domain);
                }else if(httpHander){
                    cm.iback();
                }else{
                    iframe.location.replace(st.url + 'run.html#' + st.domain);
                }
            }else{//在同域下，不需要用iframe做桥梁，直接用Ajax请求就OK
                cm.iback(window.ActiveXObject || XMLHttpRequest);
            }
            if(timeHander){
                clearTimeout(timeHander);
                timeHander = null;
            }
            timeHander = setTimeout(function(){
                timeHander = null;
                cm.iback(XMLHttpRequest);
            }, 30000);//如果没有数据回来定时重连
        }else{//type of iframe IE
            if(!iframe){//初始化Iframe，只有IE才会进入到这里面。
                try{ //在没有HTMLFile控件，或控件被禁用的情况下，采用原始的连接方法
                    httpHander = new ActiveXObject("htmlfile");
                    httpHander.open();
                    httpHander.write('<html><head>'+ (st.domain ? '<script>try{document.domain="'+ st.domain+ '";}catch(e){}</script>': '') +'</head><body></body></html>');
                    httpHander.close();
                    fcon = httpHander.createElement("div");
                    httpHander.appendChild(fcon);
                    httpHander.parentWindow.cm = $.comet;
                }catch(x){
                    sendEvent('cpsconnect', [-2]);//发送连接失败的消息
                    httpHander = window;
                    fcon = document.createElement('div');
                    fcon.style.display = 'none';
                    document.body.appendChild(fcon);
                }
                fcon.innerHTML = '<iframe name="'+ tx +'"></iframe>';
                iframe = httpHander.frames[tx];
                iframe.location.replace(getLink());
            }else{
                iframe.location.replace(getLink());
            }
            cm.done(1);
        }
        stop = 1;
    },

    // 调用位置：主页面
    // 描述：设定querystring的多个参数值
    // 调用方式：d--对象数据
    setup: function(d){
        if('object' == typeof(d)){$.extend(st, d);}
    },

    // 调用位置：IFRAME页面
    // 描述：回调函数，推送服务器请求的回调函数
    // 调用方式：cm.callback(data);
    // d为服务端返回的数据，可为 xml, json, text等型式格式
    // t为时间戳
    callback: function(d, t){
        if(st.filter){
           d = st.filter(d); 
        }
        if(d.uid_flag == '0'){//判断是否标有私有标记
            st.uid_timestamp = t;
        }else{
            st.timestamp = t;
        }
        sendEvent('cpsdata', [d, t]);//发送数据消息
        cm.done(2);
    },
    //回调函数，告诉连接成功, 需要不断地有返回值，如果超时重连
    // t--type, 0或Null为空闲，1为连接时，2为有数据时
    done: function(t){
        if(timeHander){
            clearTimeout(timeHander);
            timeHander = null;
        }
        if(linkhander){
            clearTimeout(linkhander);
            linkhander = null;            
        }
        if(type < 2){
            if(bag > maxbag && !t){//处理数据过多重连的问题
                bag = 0;
                connectCount = 0;
                linkOk = 0;
                cm.run();
            }else if(1 === type){
                bag += 20;
            }
        }
        //IE中CPS连接成功 && FF中CPS连接成功
        if(1 !== t && 2 !== t && isOff && stop == 1 && isOk){
            firstConnect = 0;
            retimes = 0;
            connectCount = 0;
            isSuccess = 1;
            isOk = 0;//值为0，禁止发信成功消息
            sendEvent('cpsconnect', [type]);//发送连接成功的消息
        }

        //IE中的CPS重连 || FF中的CPS重连
        if(window.ActiveXObject){//IE中：掉线、断线 重连
            timeHander = setTimeout(function(){
                clearTimeout(timeHander);
                timeHander = null; 
                isOk = 1;
                nextType(); //转到下一种方式
            }, firstConnect == 1 ? st.timeFirst : st.time);//如果没有数据回来定时重连
        }else{//FF中：掉线重连
            timeHander = setTimeout(function(){
                clearTimeout(timeHander);
                timeHander = null;
                isOk = 1;
                nextType(); //转到下一种方式
            }, st.time);//如果没有数据回来定时重连
        }

        //发送失败消息
        linkhander = setTimeout(function(){
            clearTimeout(linkhander);
            linkhander = null;
            isOk = 1;
            sendEvent('cpsconnect', [-2]);//发送连接失败的消息
        }, 30000);//如果没有数据回来定时重连
    },
    
    //发送断线请求回调函数
    off: function(){
        
    },
    //Ajax方式回调函数
    //x -- xmlhttprequest 对象
    iback: function(x){
        if(!x && !xhr){
            nextType();
            return;
        }
        if(x){xhr = x;}
        bag = 0;
        if(httpHander){
            try{
                httpHander.abort();//断开Ajax连接
                httpHander.onreadystatechange = function(){};
            }catch(ex){}
        }
        httpHander = window.ActiveXObject ? new xhr('Microsoft.XMLHTTP') : new xhr();
        httpHander.onreadystatechange = function(){
            if(!httpHander){return;}
            if(window.ActiveXObject && 4 !== httpHander.readyState){return;}
            if(3 === httpHander.readyState || 4 === httpHander.readyState){
                if(200 === httpHander.status){
					var t = httpHander.responseText.substr(bag);
                    bag += t.length;
                    var e = t.lastIndexOf(splitChar);
                    if(e > 0){
                        t = t.substr(0, e).split(splitChar);
                        for(var i=0,j=t.length; i<j; i++){
                            var s = t[i];
                            if('p' == s){//Ping数据，保持连接
                                cm.done();
                            }else{
                                var d;
                                try{
                                    d = window.eval('([' + s + '])');//执行数据
                                }catch(x){continue;}
                                if('object' == typeof(d) && 2 === d.length){
                                    if(st.filter){
                                       d[0] = st.filter(d[0]); 
                                    }
                                    if(d[0].uid_flag == '0'){//判断是否标有私有标记
                                        st.uid_timestamp = d[1];
                                    }else{
                                        st.timestamp = d[1];
                                    }
                                    sendEvent('cpsdata', d);//发送数据消息
                                    cm.done(2);
                                }
                            }
                        }
                    }
                }else{//FF中：断线重连
                    sendEvent('cpsconnect', [-2]);//发送连接失败的消息
                    if(timeHander){
                        clearTimeout(timeHander);
                        timeHander = null;
                    }
                    timeHander = setTimeout(function(){//网络错误，延时重连
                        clearTimeout(timeHander);
                        timeHander = null;
                        isOk = 1;
                        nextType(); //失败重连CPS
                    }, firstConnect == 1 ? st.timeFirst : st.time);
                }
            }
        };
        httpHander.open('GET', getLink(), true);
        httpHander.send('');
    }
});

$(window).bind('beforeunload', function(){
    st.doc.unbind('.comet');
    if(!iframe){return;}
    if(1 !== type && httpHander){
        try{
            httpHander.abort();//断开Ajax连接
            httpHander.onreadystatechange = function(){};
        }catch(x){}
    }
    httpHander = null;
    if(window.ActiveXObject){
        try{
            CollectGarbage(); //IE清内存
        }catch(y){}
    }
});

st.doc.bind('cpsset.comet', function(e, d){
    if('object' == typeof(d)){$.extend(st, d);}
}).bind('keydown.comet', function(e){
    if(27 === e.keyCode){//取消ESC的默认行为
        e.preventDefault();
    }
});

//comet 变量缩写，方便调用
window.cm = $.comet;
})(jQuery);
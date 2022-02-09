/**
 * 长聚兼容android与IOS函数
 * v2.0.1.0
 */
var cjwebview = (function () {
  var CjWebView = function () {};

  CjWebView.fn = CjWebView.prototype = {
    systype: function () {
      //系统类型
      var u = window.navigator.userAgent;
      var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1; //g
      if (isAndroid) {
        return '1'; //android终端
      }

      var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
      if (isIOS) {
        return '2'; //ios终端
      }
      return '0'; //其他操作系统终端
    },
    getnetwork: function () {
      //1.获取当前网络状态[1:网络未连接|2:移动数据|3:WIFI连接]
      if (this.systype() == '1') {
        return cjapp.getnetwork();
      } else if (this.systype() == '2') {
        var jsonStr = '{"id":"001", "message":"getnetwork"}';
        return window.webkit.messageHandlers.postMessageToDevice.postMessage(jsonStr);
      }
      return null;
    },
    startscan: function () {
      //2.启动商家扫码,扫码结果执行0.4.函数scanresult(扫码结果字符串)
      if (this.systype() == '1') {
        cjapp.startscan();
      } else if (this.systype() == '2') {
        var jsonStr = '{"id":"002", "message":"startscan"}'; //扫码结果回调函数为scanresult,参数为扫码结果字符串
        window.webkit.messageHandlers.postMessageToDevice.postMessage(jsonStr);
      } else {
        alert('启动商家扫码');
      }
    },
    setinfo: function (str) {
      //3.设置商家内存信息
      if (this.systype() == '1') {
        cjapp.setinfo(str);
      } else if (this.systype() == '2') {
        var jsonStr = '{"id":"003", "message":"setval","setstr":"' + str + '"}';
        window.webkit.messageHandlers.postMessageToDevice.postMessage(jsonStr);
      } else {
        alert('设置商家内存信息为:' + str);
      }
    },
    getinfo: function () {
      //4.获取商家内存设置信息
      if (this.systype() == '1') {
        return cjapp.getinfo();
      } else if (this.systype() == '2') {
        var jsonStr = '{"id":"3.2", "message":"getval"}';
        return window.webkit.messageHandlers.postMessageToDevice.postMessage(jsonStr);
      } else {
        alert('获取商家内存设置信息');
        return null;
      }
    },
    setlocalinfo: function (str) {
      //5.设置商家本地信息
      if (this.systype() == '1') {
        cjapp.setlocalinfo(str);
      } else if (this.systype() == '2') {
        var jsonStr = '{"id":"3.3", "message":"setlocalval","setstr":"' + str + '"}';
        window.webkit.messageHandlers.postMessageToDevice.postMessage(jsonStr);
      } else {
        alert('设置商家本地信息为:' + str);
      }
    },
    getlocalinfo: function () {
      //6.获取商家本地设置信息
      if (this.systype() == '1') {
        return cjapp.getlocalinfo();
      } else if (this.systype() == '2') {
        var jsonStr = '{"id":"3.2", "message":"getlocalval"}';
        return window.webkit.messageHandlers.postMessageToDevice.postMessage(jsonStr);
      } else {
        alert('获取商家本地设置信息');
        return null;
      }
    },
    setwindowforward: function (forward) {
      //7.设置手机横竖屏[1:竖屏|2:横屏]
      if (this.systype() == '1') {
        cjapp.setwindowforward(forward);
      } else if (this.systype() == '2') {
        var jsonStr = '{"id":"4.1", "message":"setwindow","forward":"' + forward + '"}';
        window.webkit.messageHandlers.postMessageToDevice.postMessage(jsonStr);
      } else {
        alert('设置手机横竖屏为:' + forward);
      }
    },
    getwindowforward: function () {
      //8.获取手机当前屏膜方向[1:竖屏|2:横屏]
      if (this.systype() == '1') {
        return cjapp.getwindowforward();
      } else if (this.systype() == '2') {
        var jsonStr = '{"id":"4.2", "message":"getwindow"}';
        return window.webkit.messageHandlers.postMessageToDevice.postMessage(jsonStr);
      } else {
        alert('获取手机当前屏膜方向');
        return null;
      }
    },
    getuserinfo: function () {
      //9.获取当前用户信息 字符串为:{sfopenid:身份OPENID,logourl:用户头像地址,username:用户昵称}
      if (this.systype() == '1') {
        return cjapp.getuserinfo();
      } else if (this.systype() == '2') {
        var jsonStr = '{"id":"5.1", "message":"getuserinfo"}';
        return window.webkit.messageHandlers.postMessageToDevice.postMessage(jsonStr);
      } else {
        alert('获取当前用户信息');
        return null;
      }
    },
    getphoneinfo: function () {
      //10.获取当前设备信息  字符串为: {softversion:长聚软件版本号,uninphone:设备编号,phoneinfo:手机信息,syslx:操作系统[android|ios]}
      if (this.systype() == '1') {
        return cjapp.getphoneinfo();
      } else if (this.systype() == '2') {
        var jsonStr = '{"id":"5.2", "message":"getsbinfo"}';
        return window.webkit.messageHandlers.postMessageToDevice.postMessage(jsonStr);
      } else {
        alert('获取当前设备信息');
        return null;
      }
    },
    settoolbarcolor: function (color) {
      //11.1.[商家应用专用]设置toolbar主题色，比如:#FFFFFF
      if (this.systype() == '1') {
        cjapp.settoolbarcolor(color);
      } else if (this.systype() == '2') {
        var jsonStr = '{"id":"6", "message":"setnewcolor","color":"' + color + '"}';
        window.webkit.messageHandlers.postMessageToDevice.postMessage(jsonStr);
      } else {
        alert('设置toolbar主题色为:' + color);
      }
    },
    gettoolbarcolor: function () {
      //11.2.[商家应用专用]获取当前toolbar主题色
      if (this.systype() == '1') {
        return cjapp.gettoolbarcolor();
      } else if (this.systype() == '2') {
      } else {
        alert('获取当前toolbar主题色');
        return null;
      }
    },
    hidetoolbar: function () {
      //11.3.[商家应用专用]隐藏toolbar
      if (this.systype() == '1') {
        cjapp.hidetoolbar();
      } else if (this.systype() == '2') {
      } else {
        alert('隐藏toolbar');
      }
    },
    ismainyy: function () {
      //12.本应用是否为主应用[true:是主应用|false:不是主应用]
      if (this.systype() == '1') {
        return cjapp.ismainyy();
      } else if (this.systype() == '2') {
        var jsonStr = '{"id":"7.1", "message":"ismain"}';
        return window.webkit.messageHandlers.postMessageToDevice.postMessage(jsonStr);
      } else {
        alert('本应用是否为主应用');
        return null;
      }
    },
    setmainyy: function () {
      //13.本应用申请为主应用
      if (this.systype() == '1') {
        cjapp.setmainyy();
      } else if (this.systype() == '2') {
        var jsonStr = '{"id":"7.2", "message":"setmain"}';
        window.webkit.messageHandlers.postMessageToDevice.postMessage(jsonStr);
      } else {
        alert('本应用申请为主应用');
      }
    },
    shakephone: function () {
      //14.手机震动
      if (this.systype() == '1') {
        cjapp.shakephone();
      } else if (this.systype() == '2') {
        var jsonStr = '{"id":"8", "message":"shakephone"}';
        window.webkit.messageHandlers.postMessageToDevice.postMessage(jsonStr);
      } else {
        alert('手机震动');
      }
    },
    updateqx: function (newqxstr) {
      //15.向当前用户申请新权限[01:关注|02:订阅消息|03:拨号|04:通讯录]，多个权限用逗号分隔
      if (this.systype() == '1') {
        cjapp.updateqx(newqxstr);
      } else if (this.systype() == '2') {
        var jsonStr = '{"id":"9.1", "message":"setqxcode","newqxstr":"' + newqxstr + '"}';
        window.webkit.messageHandlers.postMessageToDevice.postMessage(jsonStr);
      } else {
        alert('向当前用户申请新权限为:' + newqxstr);
      }
    },
    getqx: function () {
      //16.获取商家当前权限  返回权限编码,[01:关注|02:订阅消息|03:拨号|04:通讯录]，多个权限用逗号分隔
      if (this.systype() == '1') {
        return cjapp.getqx();
      } else if (this.systype() == '2') {
        var jsonStr = '{"id":"9.2", "message":"getqxcode"}';
        return window.webkit.messageHandlers.postMessageToDevice.postMessage(jsonStr);
      } else {
        alert('获取商家当前权限');
        return null;
      }
    },
    getsfphone: function (sfopenid, callbackname) {
      //17.获取指定用户的手机号[指定用户的拨号权限],回调函数参数字符串为{vflag:返回结果[0:获取成功|1:无权限],phone:手机号[有权限才有该值]}
      if (this.systype() == '1') {
        return cjapp.getsfphone(sfopenid, callbackname);
      } else if (this.systype() == '2') {
        var jsonStr =
          '{"id":"10.1", "message":"getphone","sfopenid":"' +
          sfopenid +
          '","callbackname":"' +
          callbackname +
          '"}';
        return window.webkit.messageHandlers.postMessageToDevice.postMessage(jsonStr);
      } else {
        alert('获取指定用户的手机号');
        return null;
      }
    },
    callphone: function (phone) {
      //18.拨打指定号码
      if (this.systype() == '1') {
        cjapp.callphone(phone);
      } else if (this.systype() == '2') {
        var jsonStr = '{"id":"10.2", "message":"callphone","phone":"' + phone + '"}';
        window.webkit.messageHandlers.postMessageToDevice.postMessage(jsonStr);
      } else {
        alert('拨打指定号码为:' + phone);
      }
    },
    gettxllist: function () {
      //19.获取当前用户通讯录列表[通讯录权限],返回字符串为:{vflag:返回结果[0:获取成功|1:无权限]txllist:[{SYSTEMID:通讯记录系统编号, HYSFOPENID:好友身份OPENID,HYNC:好友昵称, HYTXLOGOURL:好友头像地址}]}
      if (this.systype() == '1') {
        return cjapp.gettxllist();
      } else if (this.systype() == '2') {
        var jsonStr = '{"id":"10.3", "message":"gettxllist"}';
        return window.webkit.messageHandlers.postMessageToDevice.postMessage(jsonStr);
      } else {
        alert('获取当前用户通讯录列表');
        return null;
      }
    },
    getgps: function () {
      //20.获取GPS定位信息,返回字符串为:{dwtype:定位方式[00:无可用定位|01:网络定位|02:GPS定位],jd:经度,wd:维度,sjtime:生成时间}
      if (this.systype() == '1') {
        return cjapp.getgps();
      } else if (this.systype() == '2') {
        var jsonStr = '{"id":"11", "message":"getGPS"}';
        return window.webkit.messageHandlers.postMessageToDevice.postMessage(jsonStr);
      } else {
        alert('获取GPS定位信息');
        return null;
      }
    },
    getcjvinfo: function (callbackname) {
      //21.创建动态身份校验业务,回调函数参数字符串为: {sfopenid:所属身份OPENID,dtsjopenid:发起商家OPENID,dtjyywbh:动态校验业务编号}
      if (this.systype() == '1') {
        cjapp.getcjvinfo(callbackname);
      } else if (this.systype() == '2') {
        var jsonStr = '{"id":"12.1", "message":"getcjvinfo","callbackname":"' + callbackname + '"}';
        window.webkit.messageHandlers.postMessageToDevice.postMessage(jsonStr);
      } else {
        alert('创建动态身份校验业务');
      }
    },
    getcjjywinfo: function (callbackname) {
      //22.创建校验位信息,回调函数参数字符串为: {sfopenid:所属身份OPENID,jywbh:校验位业务编号,jyjd:校验位生成经度,jywd:校验位生成维度,jyctime:校验位生成长聚服务器时间}
      if (this.systype() == '1') {
        cjapp.getcjjywinfo(callbackname);
      } else if (this.systype() == '2') {
        var jsonStr =
          '{"id":"12.2", "message":"getcjjywinfo","callbackname":"' + callbackname + '"}';
        window.webkit.messageHandlers.postMessageToDevice.postMessage(jsonStr);
      } else {
        alert('创建校验位信息');
      }
    },
    sjajax: function (sjopenid, sjfwbh, ewparam, callbackname) {
      //23.对商家发起AJAX请求,回调函数参数为提供服务的商家返回的字符串
      if (this.systype() == '1') {
        cjapp.sjajax(sjopenid, sjfwbh, ewparam, callbackname);
      } else if (this.systype() == '2') {
        var jsonStr =
          '{"id":"13", "message":"postajax","sjopenid":"' +
          sjopenid +
          '","sjfwbh":"' +
          sjfwbh +
          '","ewparam":"' +
          ewparam +
          '","callbackname":"' +
          callbackname +
          '"}';
        window.webkit.messageHandlers.postMessageToDevice.postMessage(jsonStr);
      } else {
        alert('对商家发起AJAX请求');
      }
    },
    opensjapp: function (sjopenid) {
      //24.无业务参数打开其他商家
      if (this.systype() == '1') {
        cjapp.opensjapp(sjopenid);
      } else if (this.systype() == '2') {
        var jsonStr = '{"id":"14.1", "message":"opensjapp","sjopenid":"' + sjopenid + '"}';
        window.webkit.messageHandlers.postMessageToDevice.postMessage(jsonStr);
      } else {
        alert('无业务参数打开其他商家');
      }
    },
    paramopensjapp: function (sjopenid, ewparam) {
      //25.带业务参数打开其他商家
      if (this.systype() == '1') {
        cjapp.paramopensjapp(sjopenid, ewparam);
      } else if (this.systype() == '2') {
        var jsonStr =
          '{"id":"14.2", "message":"paramopensjapp","sjopenid":"' +
          sjopenid +
          '","ewparam":"' +
          ewparam +
          '"}';
        window.webkit.messageHandlers.postMessageToDevice.postMessage(jsonStr);
      } else {
        alert('带业务参数打开其他商家');
      }
    },
    goback: function () {
      //26.返回上页,备注:受限于0.5.拦截返回函数；只有拦截返回函数放行,此函数才有作用
      if (this.systype() == '1') {
        cjapp.goback();
      } else if (this.systype() == '2') {
        var jsonStr = '{"id":"15.1", "message":"goback"}';
        window.webkit.messageHandlers.postMessageToDevice.postMessage(jsonStr);
      } else {
        alert('返回上页');
      }
    },
    getcomefromid: function () {
      //27.获取初始打开商家来源编号[只适用商家应用]
      if (this.systype() == '1') {
        return cjapp.getcomefromid();
      } else if (this.systype() == '2') {
        var jsonStr = '{"id":"15.2", "message":"getinitfromid"}';
        return window.webkit.messageHandlers.postMessageToDevice.postMessage(jsonStr);
      } else {
        alert('获取初始打开商家来源编号');
        return null;
      }
    },
    networkewm: function (imgurl) {
      //28.解析一维码或二维码的网络图片
      if (this.systype() == '1') {
        return cjapp.networkewm(imgurl);
      } else if (this.systype() == '2') {
      } else {
        alert('解析一维码或二维码的网络图片');
        return null;
      }
    },
    localewm: function (base64imgstr) {
      //29.解析一维码或二维码的base64图片[去掉前面data:image/jpg;base64, 文本内容]
      if (this.systype() == '1') {
        return cjapp.localewm(base64imgstr);
      } else if (this.systype() == '2') {
      } else {
        alert('解析一维码或二维码的base64图片');
        return null;
      }
    },
  };

  return new CjWebView();
})();

/**
 * IOS中转函数
 */
function postMessageToDevice(json) {
  //空方法
}
/**
 * 长聚事件函数
 * 0.1.商家应用已经打开，由不可见到可见执行该函数
 */
function refresh() {}
/**
 * 长聚事件函数
 * 0.2.商家应用已经打开，由不可见到可见,执行带参数函数
 * @param paramstr:格式[key01:value01,key02:value02]
 */
function reloadpage(paramstr) {}
/**
 * 长聚事件函数
 * 0.3.网络改变函数
 * @param networkstatu:1:无可用网络|2:移动网络|3:WIFI网络
 */
function netchange(networkstatu) {}
/**
 * 长聚事件函数
 * 0.4.扫码结果回调函数
 * @param scanresultstr:扫码结果函数
 */
function scanresult(scanresultstr) {}
/**
 * 长聚事件函数
 * 0.5.拦截返回函数  无此函数或返回值为1，调用系统应用的返回功能；其他值皆终止返回事件
 */
function cjback() {
  return 1;
}

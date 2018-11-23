/*
 * core v1.4.1
 * Date: 2015-12-1
 * (c) 2013-2015 DOOCAL
 * author:doocal QQ:76168817
 */

;if (typeof jQuery === "undefined") {
  throw new Error("core requires jQuery")
}
//IIFE
!(function ($, _win) {
  //'use strict';
  var ME = this,
    _doc = _win.document,
    _storage = _win['localStorage'],
    _body = _doc.body,
    _docMode = _doc.documentMode,
    _isStrict = _doc.compatMode == "CSS1Compat",
    _userAgent = navigator.userAgent.toLowerCase(),
    _language = navigator.language || navigator.browserLanguage,
    _isSecure = /^https/i.test(_win.location.protocol),
    _prototype = Object.prototype,
    _toString = _prototype.toString,
    _hasOwn = _prototype.hasOwnProperty,
    _array = Array.prototype,
    _aslice = _array.slice,
    _push = _array.push,
    _url = _win.location.href,
    _class2type = {},
    _tmp = {},
    _cache = {};

  "Boolean Number String Function Array Date RegExp Object Error".replace(/[^, ]+/g, function (name) {
    _class2type["[object " + name + "]"] = name.toLowerCase()
  })

  //log
  function log() {
    if (window.console) {
      Function.apply.call(console.log, console, arguments)
    } else {
      window.console = {}
      console.log = function (str) {
        $(_doc).ready(function () {
          var div = _doc.createElement("pre");
          div.className = "mass_sys_log";
          div.innerHTML = str + ""; //确保为字符串
          _doc.body.appendChild(div);
        });
      }
    }
  }

  //artTemplate
  (function (global) {

    /**
     * 模板引擎
     * @name    template
     * @param   {String}            模板名
     * @param   {Object, String}    数据。如果为字符串则编译并缓存编译结果
     * @return  {String, Function}  渲染好的HTML字符串或者渲染方法
     */
    var template = function (filename, content) {
      return typeof content === 'string'
        ? compile(content, {
        filename: filename
      })
        : renderFile(filename, content);
    };

    template.version = '3.0.0';

    /**
     * 设置全局配置
     * @name    template.config
     * @param   {String}    名称
     * @param   {Any}       值
     */
    template.config = function (name, value) {
      defaults[name] = value;
    };

    var defaults = template.defaults = {
      openTag: '<?',    // 逻辑语法开始标签
      closeTag: '?>',   // 逻辑语法结束标签
      escape: true,     // 是否编码输出变量的 HTML 字符
      cache: true,      // 是否开启缓存（依赖 options 的 filename 字段）
      compress: false,  // 是否压缩输出
      parser: null      // 自定义语法格式器 @see: template-syntax.js
    };

    var cacheStore = template.cache = {};

    /**
     * 渲染模板
     * @name    template.render
     * @param   {String}    模板
     * @param   {Object}    数据
     * @return  {String}    渲染好的字符串
     */
    template.render = function (source, options) {
      return compile(source, options);
    };

    /**
     * 渲染模板(根据模板名)
     * @name    template.render
     * @param   {String}    模板名
     * @param   {Object}    数据
     * @return  {String}    渲染好的字符串
     */
    var renderFile = template.renderFile = function (filename, data) {
      var fn = template.get(filename) || showDebugInfo({
          filename: filename,
          name: 'Render Error',
          message: 'Template not found'
        });
      return data ? fn(data) : fn;
    };

    /**
     * 获取编译缓存（可由外部重写此方法）
     * @param   {String}    模板名
     * @param   {Function}  编译好的函数
     */
    template.get = function (filename) {
      var cache;
      if (cacheStore[filename]) {
        // 使用内存缓存
        cache = cacheStore[filename];
      } else if (typeof document === 'object') {
        // 加载模板并编译
        var elem = document.getElementById(filename);

        if (elem) {
          var source = (elem.value || elem.innerHTML)
            .replace(/^\s*|\s*$/g, '');
          cache = compile(source, {
            filename: filename
          });
        }
      }
      return cache;
    };


    var toString = function (value, type) {
      if (typeof value !== 'string') {
        type = typeof value;
        if (type === 'number') {
          value += '';
        } else if (type === 'function') {
          value = toString(value.call(value));
        } else {
          value = '';
        }
      }
      return value;
    };

    var escapeMap = {
      "<": "&#60;",
      ">": "&#62;",
      '"': "&#34;",
      "'": "&#39;",
      "&": "&#38;"
    };

    var escapeFn = function (s) {
      return escapeMap[s];
    };

    var escapeHTML = function (content) {
      return toString(content)
        .replace(/&(?![\w#]+;)|[<>"']/g, escapeFn);
    };

    var isArray = Array.isArray || function (obj) {
        return ({}).toString.call(obj) === '[object Array]';
      };

    var each = function (data, callback) {
      var i, len;
      if (isArray(data)) {
        for (i = 0, len = data.length; i < len; i++) {
          callback.call(data, data[i], i, data);
        }
      } else {
        for (i in data) {
          callback.call(data, data[i], i);
        }
      }
    };

    var utils = template.utils = {
      $helpers: {},
      $include: renderFile,
      $string: toString,
      $escape: escapeHTML,
      $each: each
    };

    /**
     * 添加模板辅助方法
     * @name    template.helper
     * @param   {String}    名称
     * @param   {Function}  方法
     */
    template.helper = function (name, helper) {
      helpers[name] = helper;
    };

    var helpers = template.helpers = utils.$helpers;

    /**
     * 模板错误事件（可由外部重写此方法）
     * @name    template.onerror
     * @event
     */
    template.onerror = function (e) {
      var message = 'Template Error\n\n';
      for (var name in e) {
        message += '<' + name + '>\n' + e[name] + '\n\n';
      }

      if (typeof console === 'object') {
        console.error(message);
      }
    };

    // 模板调试器
    var showDebugInfo = function (e) {
      template.onerror(e);
      return function () {
        return '{Template Error}';
      };
    };

    /**
     * 编译模板
     * 2012-6-6 @TooBug: define 方法名改为 compile，与 Node Express 保持一致
     * @name    template.compile
     * @param   {String}    模板字符串
     * @param   {Object}    编译选项
     *
     *      - openTag       {String}
     *      - closeTag      {String}
     *      - filename      {String}
     *      - escape        {Boolean}
     *      - compress      {Boolean}
     *      - debug         {Boolean}
     *      - cache         {Boolean}
     *      - parser        {Function}
     *
     * @return  {Function}  渲染方法
     */
    var compile = template.compile = function (source, options) {

      // 合并默认配置
      options = options || {};
      for (var name in defaults) {
        if (options[name] === undefined) {
          options[name] = defaults[name];
        }
      }

      var filename = options.filename;

      try {
        var Render = compiler(source, options);
      } catch (e) {
        e.filename = filename || 'anonymous';
        e.name = 'Syntax Error';
        return showDebugInfo(e);
      }

      // 对编译结果进行一次包装
      function render(data) {
        try {
          return new Render(data, filename) + '';
        } catch (e) {

          // 运行时出错后自动开启调试模式重新编译
          if (!options.debug) {
            options.debug = true;
            return compile(source, options)(data);
          }
          return showDebugInfo(e)();
        }
      }

      render.prototype = Render.prototype;
      render.toString = function () {
        return Render.toString();
      };

      if (filename && options.cache) {
        cacheStore[filename] = render;
      }

      return render;

    };

    // 数组迭代
    var forEach = utils.$each;

    // 静态分析模板变量
    var KEYWORDS =
      // 关键字
      'break,case,catch,continue,debugger,default,delete,do,else,false'
      + ',finally,for,function,if,in,instanceof,new,null,return,switch,this'
      + ',throw,true,try,typeof,var,void,while,with'

        // 保留字
      + ',abstract,boolean,byte,char,class,const,double,enum,export,extends'
      + ',final,float,goto,implements,import,int,interface,long,native'
      + ',package,private,protected,public,short,static,super,synchronized'
      + ',throws,transient,volatile'

        // ECMA 5 - use strict
      + ',arguments,let,yield'

      + ',undefined';

    var REMOVE_RE = /\/\*[\w\W]*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|"(?:[^"\\]|\\[\w\W])*"|'(?:[^'\\]|\\[\w\W])*'|\s*\.\s*[$\w\.]+/g;
    var SPLIT_RE = /[^\w$]+/g;
    var KEYWORDS_RE = new RegExp(["\\b" + KEYWORDS.replace(/,/g, '\\b|\\b') + "\\b"].join('|'), 'g');
    var NUMBER_RE = /^\d[^,]*|,\d[^,]*/g;
    var BOUNDARY_RE = /^,+|,+$/g;
    var SPLIT2_RE = /^$|,+/;

    // 获取变量
    function getVariable(code) {
      return code
        .replace(REMOVE_RE, '')
        .replace(SPLIT_RE, ',')
        .replace(KEYWORDS_RE, '')
        .replace(NUMBER_RE, '')
        .replace(BOUNDARY_RE, '')
        .split(SPLIT2_RE);
    };

    // 字符串转义
    function stringify(code) {
      return "'" + code
        // 单引号与反斜杠转义
          .replace(/('|\\)/g, '\\$1')
          // 换行符转义(windows + linux)
          .replace(/\r/g, '\\r')
          .replace(/\n/g, '\\n') + "'";
    }

    function compiler(source, options) {

      var debug = options.debug;
      var openTag = options.openTag;
      var closeTag = options.closeTag;
      var parser = options.parser;
      var compress = options.compress;
      var escape = options.escape;

      var line = 1;
      var uniq = {$data: 1, $filename: 1, $utils: 1, $helpers: 1, $out: 1, $line: 1};

      var isNewEngine = ''.trim;// '__proto__' in {}
      var replaces = isNewEngine
        ? ["$out='';", "$out+=", ";", "$out"]
        : ["$out=[];", "$out.push(", ");", "$out.join('')"];

      var concat = isNewEngine
        ? "$out+=text;return $out;"
        : "$out.push(text);";

      var print = "function(){"
        + "var text=''.concat.apply('',arguments);"
        + concat
        + "}";

      var include = "function(filename,data){"
        + "data=data||$data;"
        + "var text=$utils.$include(filename,data,$filename);"
        + concat
        + "}";

      var headerCode = "'use strict';"
        + "var $utils=this,$helpers=$utils.$helpers,"
        + (debug ? "$line=0," : "");

      var mainCode = replaces[0];

      var footerCode = "return new String(" + replaces[3] + ");"

      // html与逻辑语法分离
      forEach(source.split(openTag), function (code) {
        code = code.split(closeTag);

        var $0 = code[0];
        var $1 = code[1];

        // code: [html]
        if (code.length === 1) {
          mainCode += html($0);
          // code: [logic, html]
        } else {
          mainCode += logic($0);
          if ($1) {
            mainCode += html($1);
          }
        }
      });

      var code = headerCode + mainCode + footerCode;

      // 调试语句
      if (debug) {
        code = "try{" + code + "}catch(e){"
          + "throw {"
          + "filename:$filename,"
          + "name:'Render Error',"
          + "message:e.message,"
          + "line:$line,"
          + "source:" + stringify(source)
          + ".split(/\\n/)[$line-1].replace(/^\\s+/,'')"
          + "};"
          + "}";
      }

      try {
        var Render = new Function("$data", "$filename", code);
        Render.prototype = utils;
        return Render;
      } catch (e) {
        e.temp = "function anonymous($data,$filename) {" + code + "}";
        throw e;
      }

      // 处理 HTML 语句
      function html(code) {
        // 记录行号
        line += code.split(/\n/).length - 1;
        // 压缩多余空白与注释
        if (compress) {
          code = code
            .replace(/\s+/g, ' ')
            .replace(/<!--[\w\W]*?-->/g, '');
        }
        if (code) {
          code = replaces[1] + stringify(code) + replaces[2] + "\n";
        }
        return code;
      }

      // 处理逻辑语句
      function logic(code) {
        var thisLine = line;
        if (parser) {
          // 语法转换插件钩子
          code = parser(code, options);
        } else if (debug) {
          // 记录行号
          code = code.replace(/\n/g, function () {
            line++;
            return "$line=" + line + ";";
          });
        }

        // 输出语句. 编码: <%=value%> 不编码:<%=#value%>
        // <%=#value%> 等同 v2.0.3 之前的 <%==value%>
        if (code.indexOf('=') === 0) {
          var escapeSyntax = escape && !/^=[=#]/.test(code);
          code = code.replace(/^=[=#]?|[\s;]*$/g, '');
          // 对内容编码
          if (escapeSyntax) {
            var name = code.replace(/\s*\([^\)]+\)/, '');
            // 排除 utils.* | include | print
            if (!utils[name] && !/^(include|print)$/.test(name)) {
              code = "$escape(" + code + ")";
            }
            // 不编码
          } else {
            code = "$string(" + code + ")";
          }
          code = replaces[1] + code + replaces[2];
        }

        if (debug) {
          code = "$line=" + thisLine + ";" + code;
        }

        // 提取模板中的变量名
        forEach(getVariable(code), function (name) {
          // name 值可能为空，在安卓低版本浏览器下
          if (!name || uniq[name]) {
            return;
          }
          var value;
          // 声明模板变量
          // 赋值优先级:
          // [include, print] > utils > helpers > data
          if (name === 'print') {
            value = print;
          } else if (name === 'include') {
            value = include;
          } else if (utils[name]) {
            value = "$utils." + name;
          } else if (helpers[name]) {
            value = "$helpers." + name;
          } else {
            value = "$data." + name;
          }

          headerCode += name + "=" + value + ",";
          uniq[name] = true;

        });

        return code + "\n";
      }

    };

    global.template = template;

  })(_win);

  var type = function (obj) {//取得目标的类型
    if (obj == null) {
      return String(obj)
    }
    // 早期的webkit内核浏览器实现了已废弃的ecma262v4标准，可以将正则字面量当作函数使用，因此typeof在判定正则时会返回function
    return typeof obj === "object" || typeof obj === "function" ?
    _class2type[_toString.call(obj)] || "object" :
      typeof obj
  }

  //基类
  var base = new function () {

    var _base = function () {

    }

    _base.prototype = {
      doTimeout: function () {
        function p_doTimeout(data_key) {
          var that = this,
            elem, data = {},
            method_base = data_key ? $.fn : $,
            args = arguments,
            slice_args = 4,
            id = args[1],
            delay = args[2],
            callback = args[3];
          if (typeof id !== 'string') {
            slice_args--;
            id = data_key = 0;
            delay = args[1];
            callback = args[2]
          }
          if (data_key) {
            elem = that.eq(0);
            elem.data(data_key, data = elem.data(data_key) || {})
          } else if (id) {
            data = _cache[id] || (_cache[id] = {})
          }
          data.id && clearTimeout(data.id);
          delete data.id;

          function cleanup() {
            if (data_key) {
              elem.removeData(data_key)
            } else if (id) {
              delete _cache[id]
            }
          };

          function actually_setTimeout() {
            data.id = setTimeout(function () {
              data.fn()
            }, delay)
          };
          if (callback) {
            data.fn = function (no_polling_loop) {
              if (typeof callback === 'string') {
                callback = method_base[callback]
              }
              callback.apply(that, _aslice.call(args, slice_args)) === true && !no_polling_loop ? actually_setTimeout() : cleanup()
            };
            actually_setTimeout()
          } else if (data.fn) {
            delay === undefined ? cleanup() : data.fn(delay === false);
            return true
          } else {
            cleanup()
          }
        };
        return p_doTimeout.apply(_win, [0].concat(_aslice.call(arguments)));
      },
      //元素居中
      center: function () {
        var
          _this = this.el,
          _wh = $(_win).height(),
          _ww = $(_win).width(),
          _tw = _this.outerWidth(true),
          _th = _this.outerHeight(true),
          _fixed = _this.css("position"),
          _st = _fixed ? 0 : $(document).scrollTop(),
          _sl = _fixed ? 0 : $(document).scrollLeft(),
          _top = (_wh - _th) * 382 / 1000 + _st,
          _left = (_ww - _tw) / 2 + _sl;

        _this.css({
          width: _tw,
          height: _th,
          top: Math.max(parseInt(_top), _st) + 'px',
          left: Math.max(parseInt(_left), _sl) + 'px'
        });

        return _this;
      },
      clientXY: function (e) {
        var _left, _top, _st, _sl;

        _left = $(_win).width() - e.clientX < this.outerWidth() ? e.clientX - this.outerWidth() : e.clientX,
          _top = $(_win).height() - e.clientY < this.outerHeight() ? e.clientY - this.outerHeight() : e.clientY,
          _st = $(document).scrollTop(),
          _sl = $(document).scrollLeft();

        this.css({
          left: _left + _sl,
          top: _top + _st
        }).show();

        return this;
      }
    }

    return _base;
  };

  //浏览器检测
  var browser = new function (userAgent, language) {
    var version, webkitVersion, isEdge, iOSAgent, iOSDevice, iOSMajorVersion, iOSMinorVersion, browser = {};
    userAgent = (userAgent || navigator.userAgent).toLowerCase();
    language = language || navigator.language || navigator.browserLanguage;
    isEdge = /\sedge\//.test(userAgent);
    if (isEdge) {
      version = (userAgent.match(/(?:edge\/)([\d\.]*)/) || [])[1]
    } else {
      version = (userAgent.match(/.*(?:rv|chrome|webkit|opera|ie)[\/: ](.+?)([ \);]|$)/) || [])[1]
    }
    browser.version = version;
    webkitVersion = (userAgent.match(/webkit\/(.+?) /) || [])[1];
    iOSAgent = (userAgent.match(/\b(iPad|iPhone|iPod)\b.*\bOS (\d)_(\d)/i) || []);
    iOSDevice = iOSAgent[1];
    iOSMajorVersion = iOSAgent[2];
    iOSMinorVersion = iOSAgent[3];
    browser.windows = browser.isWindows = !!/windows/.test(userAgent);
    browser.mac = browser.isMac = !!/macintosh/.test(userAgent) || (/mac os x/.test(userAgent) && !/like mac os x/.test(userAgent));
    browser.lion = browser.isLion = !!(/mac os x 10[_\.][7-9]/.test(userAgent) && !/like mac os x 10[_\.][7-9]/.test(userAgent));
    browser.iPhone = browser.isiPhone = (iOSDevice === "iphone");
    browser.iPod = browser.isiPod = (iOSDevice === "ipod");
    browser.iPad = browser.isiPad = (iOSDevice === "ipad");
    browser.iOS = browser.isiOS = browser.iPhone || browser.iPod || browser.iPad;
    browser.iOSMajorVersion = browser.iOS ? iOSMajorVersion * 1 : undefined;
    browser.iOSMinorVersion = browser.iOS ? iOSMinorVersion * 1 : undefined;
    browser.android = browser.isAndroid = !!/android/.test(userAgent);
    browser.silk = browser.isSilk = !!/silk/.test(userAgent);
    browser.opera = /opera/.test(userAgent) ? version : 0;
    browser.isOpera = !!browser.opera;
    browser.msie = /msie \d+\.\d+|trident\/\d+\.\d.+; rv:\d+\.\d+[;\)]/.test(userAgent) && !browser.opera ? version : 0;
    browser.isIE = !!browser.msie;
    browser.isIE8OrLower = !!(browser.msie && parseInt(browser.msie, 10) <= 8);
    browser.isIE9OrLower = !!(browser.msie && parseInt(browser.msie, 10) <= 9);
    browser.isIE10OrLower = !!(browser.msie && parseInt(browser.msie, 10) <= 10);
    browser.isIE10 = !!(browser.msie && parseInt(browser.msie, 10) === 10);
    browser.isIE11 = !!(browser.msie && parseInt(browser.msie, 10) === 11);
    browser.edge = isEdge ? version : 0;
    browser.isEdge = isEdge;
    browser.mozilla = !isEdge && /mozilla/.test(userAgent) && !/(compatible|webkit|msie|trident)/.test(userAgent) ? version : 0;
    browser.isMozilla = !!browser.mozilla;
    browser.webkit = (!isEdge && /webkit/.test(userAgent)) ? webkitVersion : 0;
    browser.isWebkit = !!browser.webkit;
    browser.chrome = !isEdge && /chrome/.test(userAgent) ? version : 0;
    browser.isChrome = !!browser.chrome;
    browser.mobileSafari = /apple.*mobile/.test(userAgent) && browser.iOS ? webkitVersion : 0;
    browser.isMobileSafari = !!browser.mobileSafari;
    browser.iPadSafari = browser.iPad && browser.isMobileSafari ? webkitVersion : 0;
    browser.isiPadSafari = !!browser.iPadSafari;
    browser.iPhoneSafari = browser.iPhone && browser.isMobileSafari ? webkitVersion : 0;
    browser.isiPhoneSafari = !!browser.iphoneSafari;
    browser.iPodSafari = browser.iPod && browser.isMobileSafari ? webkitVersion : 0;
    browser.isiPodSafari = !!browser.iPodSafari;
    browser.isiOSHomeScreen = browser.isMobileSafari && !/apple.*mobile.*safari/.test(userAgent);
    browser.safari = browser.webkit && !browser.chrome && !browser.iOS && !browser.android ? webkitVersion : 0;
    browser.isSafari = !!browser.safari;
    browser.language = language.split("-", 1)[0];
    browser.current = browser.edge ? "edge" : browser.msie ? "msie" : browser.mozilla ? "mozilla" : browser.chrome ? "chrome" : browser.safari ? "safari" : browser.opera ? "opera" : browser.mobileSafari ? "mobile-safari" : browser.android ? "android" : "unknown";
    return browser
  };

  //JS缓存类
  var cache = new function () {

    function LRU(maxLength) {
      this.size = 0;
      this.limit = maxLength;
      this.head = this.tail = void 0;
      this._keymap = {};
    }

    LRU.prototype = {
      put: function (key, value) {
        var entry = {
          key: key,
          value: value
        }
        this._keymap[key] = entry
        if (this.tail) {
          this.tail.newer = entry
          entry.older = this.tail
        } else {
          this.head = entry
        }
        this.tail = entry
        if (this.size === this.limit) {
          this.shift()
        } else {
          this.size++
        }
        return value
      },
      shift: function () {
        var entry = this.head
        if (entry) {
          this.head = this.head.newer
          this.head.older =
            entry.newer =
              entry.older =
                this._keymap[entry.key] = void 0
        }
      },
      get: function (key) {
        var entry = this._keymap[key]
        if (entry === void 0)
          return
        if (entry === this.tail) {
          return entry.value
        }
        if (entry.newer) {
          if (entry === this.head) {
            this.head = entry.newer
          }
          entry.newer.older = entry.older
        }
        if (entry.older) {
          entry.older.newer = entry.newer
        }
        entry.newer = void 0
        entry.older = this.tail
        if (this.tail) {
          this.tail.newer = entry
        }
        this.tail = entry
        return entry.value
      },
      remove: function (key) {

        var entry = this._keymap[key];
        if (!entry) return;

        delete this._keymap[entry.key];

        if (entry.newer && entry.older) {
          entry.older.newer = entry.newer;
          entry.newer.older = entry.older;
        } else if (entry.newer) {
          entry.newer.older = undefined;
          this.head = entry.newer;
        } else if (entry.older) {
          entry.older.newer = undefined;
          this.tail = entry.older;
        } else {
          this.head = this.tail = undefined;
        }

        this.size--;
        return entry.value;
      },
      removeAll: function () {
        this.head = this.tail = undefined;
        this.size = 0;
        this._keymap = {};
      }
    }

    return LRU
  };

  //TIPS 提示框
  var tips = new function () {

    var _tips = function () {
      this.init.apply(this, arguments);
    }

    var prototype = {

      setOptions: function (options) {
        this.options = {
          icons: "success",
          times: 2,
          autoClose: true,
          callback: function () {
          }
        }
        if (options) {
          for (var property in options) {
            this.options[property] = options[property];
          }
        }
      },
      init: function (msg, options) {
        var
          _this = this,
          _dfd = $.Deferred();
        _this.setOptions(options);

        var tipsHtml = '' +
          '<div id="tips_box">' +
          '   <div class="tips_body">' +
          '     <div class="tips_icons tips_' + this.options.icons + '"></div>' +
          '     <span>' + msg + '</span>' +
          '   </div>' +
          '</div>';

        $("#tips_box").remove();
        _this.el = $(tipsHtml).appendTo("body");

        //居中DIV
        _this.center().show();

        //改变窗口大小重新定位
        $(window).resize(function (e) {
          _this.doTimeout('tips_resize', 250, function () {
            _this.center().show();
          })
        });

        _win.clearTimeout(_cache._timeout);
        if (_this.options.autoClose) {

          _cache._timeout = setTimeout(function () {
            if ($.isFunction(_this.options.callback)) {
              _this.options.callback.call(_this);
            }
            _this.el.remove();
            _dfd.resolve(_this, _this.options);
          }, parseInt(_this.options.times) * 1000);

        } else {
          _dfd.resolve(_this, _this.options);
        }

        return _dfd.promise();
      },
      hide: function () {
        _win.clearTimeout(_cache._timeout);
        this.el.remove();
      }
    }

    _tips.prototype = $.extend(prototype, new base());

    return _tips;
  };

  //URL操作相关
  var url = new function () {

    var _url = function () {
      this.params = this.params();
    }

    _url.prototype = {
      params: function (url) {
        var url = url || location.search.substr(1);
        var result = {}, params = url.split("&"), part, name, value, i;
        for (i = 0; !!params[i]; i++) {
          part = params[i].split("=");
          name = part[0];
          value = part[1];
          if (!!name && !!value) {
            result[name] = value
          }
        }
        return result
      }
    }

    return _url;
  };

  //打开窗口
  var openWin = new function () {

    var _openWin = function () {
      this.open.apply(this, arguments)
    }

    _openWin.prototype = {
      setOptions: function (options) {
        this.options = {
          id: "win",
          wintype: 1,
          name: _win,
          title: "",
          resizable: "yes",
          scroll: "yes",
          status: "no",
          toolbar: "no",
          location: "no",
          menu: "no",
          lock: true,
          min: false,
          max: false,
          fixed: true,
          close: ""
        }

        if (options) {
          for (var property in options) {
            this.options[property] = options[property];
          }
        }
      },
      open: function (url, width, height, options) {

        var _this = this;

        if (TT.isObject(width)) {
          options = width;
          width = "";
        }

        if (TT.isObject(height)) {
          options = height;
          height = "";
        }

        _this.setOptions(options);

        _this.url = url;
        _this.name = _this.options.name;
        _this.wintype = _this.options.wintype;
        _this.width = width || _this.options.width;
        _this.height = height || _this.options.height;
        _this.top = (_win.screen.availHeight - _this.width) / 2;
        _this.left = (_win.screen.availWidth - _this.height) / 2;
        _this.resizable = _this.options.resizable;
        _this.scroll = _this.options.scroll;
        _this.status = _this.options.status;
        _this.toolbar = _this.options.toolbar;
        _this.location = _this.options.location;
        _this.lock = _this.options.lock;
        _this.close = _this.options.close;

        switch (_this.wintype) {
          case 1:
            return _this.dialog(_this.url, _this.width, _this.height, _this.options);
            break;
          case 2:
            return _this.winOpen(_this.url, _this.width, _this.height, _this.options);
            break;
          case 3:
            return _this.modalDialog(_this.url, _this.width, _this.height, _this.options);
            break;
        }
      },
      dialog: function (url, width, height, options) {

        var options = $.extend(true, {
          width: width,
          height: height,
          cache: false,
          upload_settings: {}
        }, options);

        art.dialog.data("upload_settings", options.upload_settings);

        return art.dialog.open(GLOBAL_CONTEXTPATH + url, options, options.cache)
      },
      winOpen: function (url, width, height, options) {

        var params = 'resizable=' + this.resizable +
          ',scrollbars=' + this.scroll +
          ',status=' + this.status +
          ',toolbar=' + this.toolbar +
          ',location=' + this.location +
          ',menu=' + this.menu +
          ',left=' + this.left +
          ',top=' + this.top +
          ',width=' + this.width +
          ',height=' + this.height

        var _window = _win.open(this.url, this.name, params);

        if (TT.isFunction(this.close)) {
          this.close.call(this, _win);
        }

        return _window;
      },
      modalDialog: function (url, width, height, options) {

        var params = "scroll:" + this.scroll +
          ";resizable:" + this.resizable +
          ";help:" + this.help +
          ";status:" + this.status +
          ";center:" + this.center +
          ";dialogHeight:" + this.height +
          ";dialogWidth:" + this.width +
          ";dialogTop:" + this.top +
          ";dialogLeft:" + this.left;

        var _window;
        if (_browser.isIE) {
          if (this.lock) {
            _window = showModalDialog(url, this.name, params)
          } else {
            _window = showModelessDialog(url, this.name, params)
          }
        } else {
          _window = showModalDialog(url, this.name, params)
        }
        if (TT.isFunction(this.close)) {
          this.close.call(this, _window);
        }
        return _window;
      }
    }

    return _openWin;
  };

  //拖动的示例
  var dragDrop = new function () {

    var _drag = function () {
      this.init.apply(this, arguments);
    }

    _drag.prototype = {
      setOptions: function (options) {
        this.options = {
          limit: true,
          handle: null,
          container: "",
          maxTop: 0,
          maxLeft: 0,
          maxRight: 9999,
          maxBottom: 9999,
          maxContainer: null,
          lock: false,
          lockX: false,
          lockY: false,
          onStart: null,
          onMove: null,
          onStop: null,
          isMove: false,
          getGhost: null,
          getHolder: null,
          selectArea: null
        }

        if (options) {
          for (var property in options) {
            this.options[property] = options[property];
          }
        }
      },
      init: function (drag, options) {
        var
          _this = this;
        _this.$drag = $(drag);
        _this.drag = _this.$drag[0];

        _this.clientX = 0;
        _this.clientY = 0;

        _this.mousemove = function (e) {
          _this.move(e);
        }

        _this.mouseup = function (e) {
          _this.stop(e);
        }

        _this.setOptions(options);

        _this.$drag = !_this.options.$drag && _this.$drag;

        _this.limit = _this.options.limit;
        _this.maxTop = _this.options.maxTop;
        _this.maxLeft = _this.options.maxLeft;
        _this.maxRight = _this.options.maxRight;
        _this.maxBottom = _this.options.maxBottom;
        _this.$maxContainer = _this.options.maxContainer && $(_this.options.maxContainer);

        _this.lock = _this.options.lock;
        _this.lockX = _this.options.lockX;
        _this.lockY = _this.options.lockY;

        _this.onStart = _this.options.onStart;
        _this.onMove = _this.options.onMove;
        _this.onStop = _this.options.onStop;
        _this.getGhost = _this.options.getGhost;
        _this.getHolder = _this.options.getHolder;
        _this.selectArea = _this.options.selectArea;

        _this.$handle = (_this.options.handle && $(_this.options.handle)) || _this.$drag;
        _this.handle = _this.$handle[0];

        if (!_this.$handle) {
          return false;
        }

        _this._repair();
        _this.$handle.on("mousedown.drag", function (e) {
          //阻止默认动作
          e.preventDefault();
          e.stopPropagation();
          _this.start(e);
        })

      },
      start: function (e) {
        var _this, _e, _offset;

        //this 局部变量
        _this = this;

        //修复兼容性
        _e = $.event.fix(e);

        _this._repair();

        _offset = _this.$handle.offset();

        _this.offsetLeft = _offset.left;
        _this.offsetTop = _offset.top;

        _this.clientX = _e.clientX - _this.offsetLeft;
        _this.clientY = _e.clientY - _this.offsetTop;

        $(_doc)
          .on("mousemove.drag", _this.mousemove)
          .on("mouseup.drag", _this.mouseup);

        if (browser.isIE) {
          _this.$handle.on("losecapture.drag", _this.mouseup);
          _this.handle.setCapture();
        } else {
          $.event.add(_win, "blur", _this.mouseup);
          _e.preventDefault();
        }

        _this.onStart && _this.onStart.call(this, _e);
      },
      move: function (e) {

        var _this, _e;

        //this 局部变量
        _this = this;

        //清除选择
        _win.getSelection ? _win.getSelection().removeAllRanges() : _doc.selection.empty();

        //锁定状态禁止拖动
        if (_this.lock) {
          _this.stop(e);
          return false;
        }

        //修复兼容性
        _e = $.event.fix(e);

        _this.top = _e.clientY - _this.clientY;
        _this.left = _e.clientX - _this.clientX;

        //限定拖动范围
        if (_this.limit) {

          //设置范围参数
          var maxTop, maxLeft, maxRight, maxBottom;

          maxLeft = _this.maxLeft;
          maxRight = _this.maxRight;
          maxTop = _this.maxTop;
          maxBottom = _this.maxBottom;

          //修正范围参数
          if (_this.$maxContainer) {
            maxTop = Math.max(maxTop, 0);
            maxLeft = Math.max(maxLeft, 0);
            maxRight = Math.min(maxRight, _this.$maxContainer.width());
            maxBottom = Math.min(maxBottom, _this.$maxContainer.height());
          }

          //修正移动参数
          _this.left = Math.max(Math.min(_this.left, maxRight - _this.$drag.outerWidth(true)), maxLeft);
          _this.top = Math.max(Math.min(_this.top, maxBottom - _this.$drag.outerHeight(true)), maxTop);

        }

        var scrollTop = $(_doc).scrollTop();

        _this.$drag.css({
          left: function (index, value) {
            if (!_this.lockX) {
              return _this.left
            }
          },
          top: function (index, value) {
            if (!_this.lockY) {
              return scrollTop + _this.top;
            }
          }
        });

        _this.onMove && _this.onMove.call(this, _e);
      },
      stop: function (e) {

        var _this, _e;

        //this 局部变量
        _this = this;

        //修复兼容性
        _e = $.event.fix(e);

        $(_doc).off(".drag");

        if (browser.isIE) {
          _this.$handle.off("losecapture.drag", _this.mouseup);
          _this.handle.releaseCapture();
        } else {
          $.event.remove(_win, "blur", _this.mouseup);
        }

        _this.onStop && _this.onStop.call(this, _e);
      },
      _repair: function (e) {
        var _this = this;
        var _position = !_this.$maxContainer || _this.$maxContainer.css("position")
        if (_this.limit) {
          //修正错误范围参数
          _this.maxRight = Math.max(_this.maxRight, _this.maxLeft + _this.$drag.outerWidth(true));
          _this.maxBottom = Math.max(_this.maxBottom, _this.maxTop + _this.$drag.outerHeight(true));
          //如果有容器必须设置position为relative或absolute来相对或绝对定位，并在获取offset之前设置
          if (_position == "relative" || _position == "absolute") {
            _this.$maxContainer.css("position", "relative");
          }
        }
      }
    }

    return _drag;
  };

  var TT = function (selector, context) {
    return new TT.fn.init(selector, context);
  };

  TT.fn = TT.prototype = {
    version: "1.4.1",
    init: function (selector, context) {
      return $(selector, context);
    }
  };

  TT.fn.init.prototype = TT.fn;

  TT.extend = TT.fn.extend = $.extend;

  TT.extend({
    log: log,
    browser: browser,
    type: function (s) {
      return type(s)
    },
    now: function () {
      return (new Date()).getTime();
    },
    error: function (msg) {
      throw new Error(msg);
    },
    randomNum: function (Min, Max) {
      var Range = Max - Min;
      var Rand = Math.random();
      return (Min + Math.round(Rand * Range));
    },
    UUID: function (prefix) {
      prefix = prefix || "UUID"
      return String(Math.random() + Math.random()).replace(/\d\.\d{4}/, prefix)
    },
    isWindow: function (obj) {
      return obj && obj.document && obj.location && obj.alert && obj.setInterval;
    },
    isObject: function (s) {
      return type(s) == 'object';
    },
    isFunction: function (s) {
      return type(s) == 'function';
    },
    isDate: function (s) {
      return type(s) == 'date';
    },
    isNumber: function (value) {
      return type(value) == 'number';
    },
    isString: function (s) {
      return type(s) == 'string';
    },
    isDefined: function (s) {
      return type(s) != 'undefined';
    },
    isUndefined: function (s) {
      return type(s) == 'undefined';
    },
    isArray: function (s) {
      return type(s) == 'array';
    },
    isBoolean: function (s) {
      return type(s) == 'boolean';
    },
    isEmpty: function (s, allowBlank) {
      return s === null || s === undefined || ((this.isArray(s) && !s.length)) || (!allowBlank ? s === '' : false);
    },
    isElement: function (s) {
      return s ? !!s.tagName : false;
    },
    trim: function (s) {
      if (!"司徒正美".trim) {
        var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g
        String.prototype.trim = function () {
          return this.replace(rtrim, "")
        }
      }
      //return TT.isString(value) ? value.replace(/^\s*/, '').replace(/\s*$/, '') : value;
      return s.trim()
    }
  });

  TT.extend({
    toCurrency: function (i) {
      i = parseFloat(i, 10).toFixed(2);
      return (i == 'NaN') ? '0.00' : i;
    },
    valid: function () {
      var _this = {
        require: /.+/,
        email: /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,4}$/,
        phone: /^((\(\d{2,3}\))|(\d{3}\-))?(\(0\d{2,3}\)|0\d{2,3}-)?[1-9]\d{6,7}(\-\d{1,4})?$/,
        //Mobile : /^((\(\d{2,3}\))|(\d{3}\-))?1\d{9}|15\d{8}|18\d{8}$/,
        mobile: /^13[0-9]{9}|15[012356789][0-9]{8}|18[0256789][0-9]{8}|147[0-9]{8}$/,
        url: /^http:\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$/,
        currency: /^\d+(\.\d+)?$/,
        number: /^\d+$/,
        zip: /^[1-9]\d{5}$/,
        qq: /^[1-9]\d{4,12}$/,
        integer: /^[-\+]?\d+$/,
        double: /^[-\+]?\d+(\.\d+)?$/,
        english: /^[A-Za-z]+$/,
        chinese: /^[\u0391-\uFFE5]+$/,
        cnSafe: /[0-9a-zA-Z_.,#@!$%^&*()-+=|\?/<>]/g,
        username: /^[a-z]\w{3,}$/i,
        UnSafe: /^(([A-Z]*|[a-z]*|\d*|[-_\~!@#\$%\^&\*\.\(\)\[\]\{\}<>\?\\\/\'\"]*)|.{0,5})$|\s/,
        IsSafe: function (s) {
          return !this.UnSafe.test(s);
        },
        IdCard: function (s) {
          return this.IsIdCard(s);
        },
        date: function (s) {
          return !this.IsDate(s);
        },
        custom: function (s) {
          return this.exec(value);
        },
        IsIdCard: function (number) {
          var date, Ai;
          var verify = "10x98765432";
          var Wi = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
          var area = ['', '', '', '', '', '', '', '', '', '', '', '北京', '天津', '河北', '山西', '内蒙古', '', '', '', '', '', '辽宁', '吉林', '黑龙江', '', '', '', '', '', '', '', '上海', '江苏', '浙江', '安微', '福建', '江西', '山东', '', '', '', '河南', '湖北', '湖南', '广东', '广西', '海南', '', '', '', '重庆', '四川', '贵州', '云南', '西藏', '', '', '', '', '', '', '陕西', '甘肃', '青海', '宁夏', '新疆', '', '', '', '', '', '台湾', '', '', '', '', '', '', '', '', '', '香港', '澳门', '', '', '', '', '', '', '', '', '国外'];
          var re = number.match(/^(\d{2})\d{4}(((\d{2})(\d{2})(\d{2})(\d{3}))|((\d{4})(\d{2})(\d{2})(\d{3}[x\d])))$/i);

          if (re == null) {
            return false;
          }

          if (re[1] >= area.length || area[re[1]] == "") {
            return false;
          }

          if (re[2].length == 12) {
            Ai = number.substr(0, 17);
            date = [re[9], re[10], re[11]].join("-");
          } else {
            Ai = number.substr(0, 6) + "19" + number.substr(6);
            date = ["19" + re[4], re[5], re[6]].join("-");
          }

          if (!this.IsDate(date, "ymd")) {
            return false;
          }

          var sum = 0;
          for (var i = 0; i <= 16; i++) {
            sum += Ai.charAt(i) * Wi[i];
          }
          Ai += verify.charAt(sum % 11);

          return (number.length == 15 || number.length == 18 && number == Ai);
        },
        IsDate: function (op, formatString) {
          formatString = formatString || "ymd";
          var m, year, month, day;
          switch (formatString) {
            case "ymd" :
              m = op.match(new RegExp("^((\\d{4})|(\\d{2}))([-./])(\\d{1,2})\\4(\\d{1,2})$"));
              if (m == null) return false;
              day = m[6];
              month = m[5] * 1;
              year = (m[2].length == 4) ? m[2] : GetFullYear(parseInt(m[3], 10));
              break;
            case "dmy" :
              m = op.match(new RegExp("^(\\d{1,2})([-./])(\\d{1,2})\\2((\\d{4})|(\\d{2}))$"));
              if (m == null) return false;
              day = m[1];
              month = m[3] * 1;
              year = (m[5].length == 4) ? m[5] : GetFullYear(parseInt(m[6], 10));
              break;
            default :
              break;
          }

          if (!parseInt(month)) {
            return false;
          }

          month = month == 0 ? 12 : month;
          var date = new Date(year, month - 1, day);
          return (typeof(date) == "object" && year == date.getFullYear() && month == (date.getMonth() + 1) && day == date.getDate());

          function GetFullYear(y) {
            return ((y < 30 ? "20" : "19") + y) | 0;
          }
        },
        valid: function (value, vtype) {
          if (type(this[vtype]) == 'object' || this[vtype] == 'undefined') {
            return false;
          }
          switch (vtype) {
            case "IdCard" :
            case "date" :
            case "IsSafe":
            case "custom" :
              return !eval(this[vtype]);
              break;
            default :
              return !this[vtype].test(value);
              break;
          }
        },
        exec: function (op, reg) {
          return new RegExp(reg, "g").test(op);
        }
      };
      return _this.valid(v, d);
    }
  })

  TT.extend({
    data: function (a, b) {
      if (!TT.isEmpty(b)) {
        _storage.setItem(a, b);
      } else {
        return _storage.getItem(a);
      }
    },
    removeData: function (a) {
      !TT.isEmpty(a) ? _storage.removeItem(a) : _storage.clear();
    },
    clearData: function () {
      _storage.clear();
    },
    cookies: function (name, value, options) {
      if (typeof value != 'undefined') {
        options = options || {};
        if (value === null) {
          value = '';
          options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
          var date;
          if (typeof options.expires == 'number') {
            date = new Date();
            date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
          } else {
            date = options.expires;
          }
          expires = '; expires=' + date.toUTCString();
        }
        var path = options.path ? '; path=' + (options.path) : '';
        var domain = options.domain ? '; domain=' + (options.domain) : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
      } else {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
          var cookies = document.cookie.split(';');
          for (var i = 0; i < cookies.length; i++) {
            var cookie = TT.trim(cookies[i]);
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
            }
          }
        }
        return cookieValue;
      }
    },
    preloadImages: function () {
      var d = document;
      if (d.images) {
        if (!d.MM_p) d.MM_p = new Array();
        var i, j = d.MM_p.length,
          a = preloadImages.arguments;
        for (i = 0; i < a.length; i++) if (a[i].indexOf("#") != 0) {
          d.MM_p[j] = new Image;
          d.MM_p[j++].src = a[i];
        }
      }
    },
    loadJs: function (url, callback, options) {
      var key = this.getFileName(url);
      var ret = cacheJS.get(key);
      if (!ret) {
        options = options || {async: true, charset: "utf-8"};
        var head = _doc.getElementsByTagName('head')[0] || _doc.documentElement,
          script = _doc.createElement('script');
        script.type = "text/javascript";
        script.src = url;
        if (options.charset) {
          script.charset = options.charset;
        }
        script.onload = script.onreadystatechange = function () {
          var rs = script.readyState;
          if ('undefined' === typeof rs || 'loaded' === rs || 'complete' === rs) {
            try {
              callback && callback();
            } finally {
              script.onload = script.onreadystatechange = null;
              script = null;
            }
          }
        };
        script.src = url;
        head.appendChild(script);
        cacheJS.put(key, url);
      } else {
        callback && callback();
      }
    },
    nextTick: new function () {
      var tickImmediate = window.setImmediate;
      var tickObserver = window.MutationObserver;

      if (tickImmediate) {//IE10 \11 edage
        return tickImmediate.bind(window)
      }

      var queue = []

      function callback() {
        var n = queue.length
        for (var i = 0; i < n; i++) {
          queue[i]()
        }
        queue = queue.slice(n)
      }

      if (tickObserver) {// 支持MutationObserver
        var node = document.createTextNode("avalon")
        new tickObserver(callback).observe(node, {characterData: true})// jshint ignore:line
        return function (fn) {
          queue.push(fn)
          node.data = Math.random()
        }
      }

      if (window.VBArray) {
        return function (fn) {
          queue.push(fn)
          var node = DOC.createElement("script")
          node.onreadystatechange = function () {
            callback() //在interactive阶段就触发
            node.onreadystatechange = null
            head.removeChild(node)
            node = null
          }
          head.appendChild(node)
        }
      }

      return function (fn) {
        setTimeout(fn, 5)
      }
    },
    compile: function (id, data) {
      return template.compile(id, data);
    },
    render: function (templateId, domId, options) {
      var _me = this;

      var defaults = {
        url: "?",
        data: "",
        render: true
      }

      var c = $.extend({}, defaults, options);

      return TT.ajax({
        url: c.url,
        data: c.data
      }).done(function (d) {
        if (d.status) {
          if (c.render) {
            var html = template(templateId, d);
            $(domId).html(html);
          }
        }
      });

    },
    /**
     * 截取字符串
     * @cutstr
     * @param   {String}        字符串
     * @param   {Integer}       截取字符串长度
     */
    cutstr: function (str, len, fill) {
      if (TT.isEmpty(str)) {
        return;
      }
      var str_length = 0;
      var fill = fill ? fill : "...";
      var str_cut = new String();
      var str_len = (str + "").length;
      len = len * 2;

      for (var i = 0; i < str_len; i++) {
        a = str.charAt(i);
        str_length++;
        if (escape(a).length > 4) {
          //中文字符的长度经编码之后大于4
          str_length++;
        }
        str_cut = str_cut.concat(a);
        if (str_length >= len) {
          str_cut = str_cut.concat(fill);
          return str_cut;
        }
      }
      //如果给定字符串小于指定长度，则返回源字符串；
      if (str_length < len) {
        return str;
      }
    },
    /**
     * 对日期进行格式化
     * @dateFormat
     * @param date 要格式化的日期
     * @param format 进行格式化的模式字符串
     *     支持的模式字母有：
     *     y:年,
     *     M:年中的月份(1-12),
     *     d:月份中的天(1-31),
     *     h:小时(0-23),
     *     m:分(0-59),
     *     s:秒(0-59),
     *     S:毫秒(0-999),
     *     q:季度(1-4)
     * @return String
     */
    dateFormat: function (date, format) {
      if (TT.isEmpty(date)) {
        format = "";
      } else {
        date = new Date(date);
        var map = {
          "M": date.getMonth() + 1, //月份
          "d": date.getDate(), //日
          "h": date.getHours(), //小时
          "m": date.getMinutes(), //分
          "s": date.getSeconds(), //秒
          "q": Math.floor((date.getMonth() + 3) / 3), //季度
          "S": date.getMilliseconds() //毫秒
        };
        format = format.replace(/([yMdhmsqS])+/g, function (all, t) {
          var v = map[t];
          if (v !== undefined) {
            if (all.length > 1) {
              v = '0' + v;
              v = v.substr(v.length - 2);
            }
            return v;
          } else if (t === 'y') {
            return (date.getFullYear() + '').substr(4 - all.length);
          }
          return all;
        });
      }
      return format;
    },
    /**
     * JSON 内容转义为安全字符串
     * @str2Json
     * @return String
     */
    str2Json: function (s) {
      var newstr = "";
      for (var i = 0; i < s.length; i++) {
        c = s.charAt(i);
        switch (c) {
          case '\"':
            newstr += "\\\"";
            break;
          case '\\':
            newstr += "\\\\";
            break;
          case '/':
            newstr += "\\/";
            break;
          case '\b':
            newstr += "\\b";
            break;
          case '\f':
            newstr += "\\f";
            break;
          case '\n':
            newstr += "\\n";
            break;
          case '\r':
            newstr += "\\r";
            break;
          case '\t':
            newstr += "\\t";
            break;
          default:
            newstr += c;
        }
      }
      return newstr;
    },
    /**
     * base64 编码
     * @base64
     * @return String
     */
    base64: function () {
      // private property
      return {
        _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
        encode: function (input) {
          var output = "";
          var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
          var i = 0;
          input = this._utf8_encode(input);
          while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
              enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
              enc4 = 64;
            }
            output = output + this._keyStr.charAt(enc1)
              + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3)
              + this._keyStr.charAt(enc4);
          }
          return output;
        },
        decode: function (input) {
          var output = "";
          var chr1, chr2, chr3;
          var enc1, enc2, enc3, enc4;
          var i = 0;
          input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
          while (i < input.length) {
            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output = output + String.fromCharCode(chr1);
            if (enc3 != 64) {
              output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
              output = output + String.fromCharCode(chr3);
            }
          }
          output = this._utf8_decode(output);
          return output;
        },
        _utf8_encode: function (string) {
          string = string.replace(/\r\n/g, "\n");
          var utftext = "";
          for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
              utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
              utftext += String.fromCharCode((c >> 6) | 192);
              utftext += String.fromCharCode((c & 63) | 128);
            } else {
              utftext += String.fromCharCode((c >> 12) | 224);
              utftext += String.fromCharCode(((c >> 6) & 63) | 128);
              utftext += String.fromCharCode((c & 63) | 128);
            }

          }
          return utftext;
        },
        // private method for UTF-8 decoding
        _utf8_decode: function (utftext) {
          var string = "";
          var i = 0;
          var c = c1 = c2 = 0;
          while (i < utftext.length) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
              string += String.fromCharCode(c);
              i++;
            } else if ((c > 191) && (c < 224)) {
              c2 = utftext.charCodeAt(i + 1);
              string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
              i += 2;
            } else {
              c2 = utftext.charCodeAt(i + 1);
              c3 = utftext.charCodeAt(i + 2);
              string += String.fromCharCode(((c & 15) << 12)
                | ((c2 & 63) << 6) | (c3 & 63));
              i += 3;
            }
          }
          return string;
        }
      }
    }(),
    /**
     * 返回路径中的文件名
     * @getFileName
     * @param   {String}        带路径的文件地址
     * @return  {String}        文件名带扩展名
     */
    getFileName: function (s) {
      var pos = s.lastIndexOf("/");
      return s.substring(pos + 1);
    },
    getDomain: function () {
      var domain = document.domain, host = location.protocol + "//" + window.location.host;
      return host
    }()
  });

  TT.extend({
    url: new function () {
      return new url()
    },
    tips: function (msg, options) {
      return new tips(msg, options);
    },
    openWin: function (url, width, height, options) {
      return new openWin(url, width, height, options);
    },
    dragDrop: function (drag, options) {
      return new dragDrop(drag, options);
    }
  });

  TT.extend({
    /**
     * Jquery AJAX 方法
     * @ajax
     * @param   {Object}        参见jquery ajax options 配置
     * @return   {Integer}      返回 jquery ajax 对象
     */
    ajax: function (options) {
      var defaults = {
        global: true,
        beforeSend: $.noop,
        complete: $.noop,
        type: "POST",
        dataType: "JSON",
        timeout: 9999,
        data: "",
        error: $.noop,
        success: $.noop,
        url: "?",
        ajaxText: '\u6b63\u5728\u5904\u7406\u60a8\u7684\u8bf7\u6c42\uff0c\u8bf7\u7a0d\u7b49...'
      };
      var ops = $.extend({}, defaults, options);

      if (ops.global) {
        var ajax_tips;
        $(document).ajaxStart(function () {
          ajax_tips = $("#ajax_tips");
          if (ajax_tips.length == 0) {
            $('<div id="ajax_tips">' + ops.ajaxText + '</div>').appendTo("body");
          }
          ajax_tips.show();
        }).ajaxComplete(function () {
          $("#ajax_tips").remove();
        });
      }

      if (ops.url == '') {
        alert('\u8bf7\u6c42\u5730\u5740\u4e0d\u80fd\u4e3a\u7a7a！');
        return false;
      }

      return $.ajax({
        global: ops.global,
        beforeSend: ops.beforeSend,
        complete: ops.complete,
        type: ops.type,
        url: ops.url + (/\?/.test(ops.url) ? "&" : "?") + "IsAjax=1",
        dataType: ops.dataType,
        data: ops.data,
        timeout: ops.timeout,
        error: ops.error,
        success: ops.success
      }).done(function (d) {
        var d = d + "";
        if (d.indexOf("\"status\":-9999") > 0) {
          top.location.replace(GLOBAL_CONTEXTPATH + "/login");
        }
      }).fail(function (d) {
        TT.tips("请求出错！", {icons: "error"})
      }).always(function () {
        $("#ajax_tip").remove();
      });
    },
    /**
     * 全选 checkbox 方法
     * @chkAll
     * @param   {Object}        当前全选 checkbox 对象的 this，目前此元素只能是 checkbox
     * @param   {Object}        选中的 checkbox 的名称，非ID
     * @param   {Integer}       type=1 实现择选功能，否则同全选按扭状态
     */
    chkAll: function (obj, el, type) {
      var input = {};

      if (type == undefined) {
        if (obj.checked) {
          input = $("input[name='" + el + "']").each(function () {
            $(this).prop("checked", true);
          });
        } else {
          input = $("input[name='" + el + "']").each(function () {
            $(this).prop("checked", false);
          });
        }
      } else if (type == 1) {
        input = $("input[name='" + el + "']").each(function () {
          var _this = $(this);
          _this.prop("checked", !this.checked);
        });
      }
      return input;
    }
  });

  //JQuery插件
  $.fn.extend({
    getFromJSON: function () {
      var o = {};
      $.each(this.serializeArray(), function (index) {
        var _this = this;
        if (o[_this['name']]) {
          o[_this['name']] = o[_this['name']] + "," + _this['value'];
        } else {
          o[_this['name']] = _this['value'];
        }
      });
      return o;
    },
    //获取选中checkbox
    getChecked: function () {
      var _v = $(this).map(function () {
        return this.value;
      }).get().join(',');
      return _v;
    },
    serializeObject: function () {
      var o = {};
      var a = this.serializeArray();
      $.each(a, function () {
        if (o[this.name]) {
          if (!o[this.name].push) {
            o[this.name] = [o[this.name]];
          }
          o[this.name].push(this.value || '');
        } else {
          o[this.name] = this.value || '';
        }
      });
      return o;
    },
    scrollLoading: function (options) {
      var defaults = {
        attr: "data-url",
        container: $(window),
        callback: $.noop
      };
      var params = $.extend({}, defaults, options || {});
      params.cache = [];
      $(this).each(function () {
        var node = this.nodeName.toLowerCase(),
          url = $(this).attr(params["attr"]);
        //重组
        var data = {
          obj: $(this),
          tag: node,
          url: url
        };
        params.cache.push(data);
      });

      var callback = function (call) {
        if ($.isFunction(params.callback)) {
          params.callback.call(call.get(0));
        }
      };
      //动态显示数据
      var loading = function () {

        var contop, contHeight = params.container.height();
        if ($(window).get(0) === window) {
          contop = $(window).scrollTop();
        } else {
          contop = params.container.offset().top;
        }

        $.each(params.cache, function (i, data) {
          var o = data.obj,
            tag = data.tag,
            url = data.url,
            post, posb;

          if (o) {
            post = o.offset().top - contop,
            post + o.height();

            if ((post >= 0 && post < contHeight) || (posb > 0 && posb <= contHeight)) {
              if (url) {
                //在浏览器窗口内
                if (tag === "img") {
                  //图片，改变src
                  callback(o.attr("src", url));
                } else {
                  o.load(url, {}, function () {
                    callback(o);
                  });
                }
              } else {
                //无地址，直接触发回调
                callback(o);
              }
              data.obj = null;
            }
          }
        });
      };
      //事件触发
      //加载完毕即执行
      loading();
      //滚动执行
      params.container.off("scroll.loading").on("scroll.loading", loading);
    }
  });

  //扩展原型方法链
  String.prototype.replaceAll = function (reallyDo, replaceWith, ignoreCase) {
    if (!RegExp.prototype.isPrototypeOf(reallyDo)) {
      return this.replace(new RegExp(reallyDo, (ignoreCase ? "gi" : "g")), replaceWith);
    } else {
      return this.replace(reallyDo, replaceWith);
    }
  }

  //本项目扩展方法  ======
  TT.extend({
    /**
     * 分页涵数
     * @pagination
     * @param total 总页数
     * @param pageIndex 当前页面数
     * @param callBack 回调涵数
     * @return String
     */
    pagination: function (elem, callback, options) {
      // 创建分页
      var settings = $.extend(true, {
        pageCount: 20,
        currPage: 1,
        callback: callback,
        param: "pageSize=20"
      }, options)

      elem && $(elem).myPagination({
        pageCount: settings.pageCount,
        currPage: settings.currPage,
        ajax: {
          onClick: settings.callback,
          param: settings.param
        }
      });
    }
  })

//注入CORE
  template.helper('Ls', TT);

  TT.config = {
    debug: true
  }

//缓存JS路径
  var cacheJS = new cache(30);

  _win.Ls = TT;

  if (TT.browser.isIE8OrLower) {
    try {
      document.execCommand("BackgroundImageCache", false, true)
    } catch (e) {
    }
  }

})
(jQuery, window);


//返回顶部代码
$(function(){
	$(window).on('scroll',function(){
		var st = $(document).scrollTop();
		if( st>0 ){
			if( $('#main-container').length != 0  ){
				var w = $(window).width(),mw = $('#main-container').width();
				if( (w-mw)/2 > 70 )
					$('#go-top').css({'left':(w-mw)/2+mw+20});
				else{
					$('#go-top').css({'left':'auto'});
				}
			}
			$('#go-top').fadeIn(function(){
				$(this).removeClass('dn');
			});
		}else{
			$('#go-top').fadeOut(function(){
				$(this).addClass('dn');
			});
		}	
	});
	$('#go-top .go').on('click',function(){
		$('html,body').animate({'scrollTop':0},500);
	});
});

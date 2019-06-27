(function (document, window) {
  function xjFile(opt) {
    // 添加默认属性
    var defaultOption = {
      el: document.body,
      accept: '*',
      width: 100,
      heigth: 100,
      compress: false,
      beforeUpload: function (e) { console.log(e) },
      onProgress: function (e) { console.log(e) },
      onLoad: function (e) { console.log(e) },
      onError: function (e) { console.log(e) }
    }
  
    // 获取dom
    if (opt.el) {
      opt.el = typeof opt.el === 'object' ? opt.el : document.querySelector(opt.el)
    }
    
    // 合并传入的opt和默认的defaultOption
    this.opt = mixin(defaultOption, opt);
    this.init()
  
  }
  
  
  xjFile.prototype.init = function () {
    this.render();
    this.watch();
  }

  // 初始化添加input标签和显示图片的div
  xjFile.prototype.render = function () {
    var fragement = document.createDocumentFragment();
    file = document.createElement('input');
    imgBox = document.createElement('div');
  
    file.type = 'file';
    file.accept = this.opt.accept;
    file.className = 'xj-file';
    imgBox.className = 'xj-pre-img';
  
    // 插入fragment
    fragement.appendChild(file);
    fragement.appendChild(imgBox);
  
    // 给包裹组件设置class
    this.opt.el.appendChild(fragement);
  }
  
  // 添加上传文件监听
  xjFile.prototype.watch = function () {
    let ipt = this.opt.el.querySelector('.xj-file');
    let _this = this;
    ipt.addEventListener('change', (e) => {
      let file = ipt.files[0];
  
      let fileReader = new FileReader();
  
      // 开始读取文件时触发
      fileReader.onloadstart = function (e) {
        // 判断文件类型，不符合停止读取
        if (_this.opt.accept !== '*' && !_this.opt.accept.includes(file.type.toLowerCase())) {
          fileReader.abort();
          _this.opt.beforeUpload(e);
          console.error('文件格式有误', file.type.toLowerCase())
        }
      }
  
      // 成功读取完成时触发
      fileReader.onload = function (e) {
        let imgBox = _this.opt.el.querySelector('.xj-pre-img');
        let imgLength = 0;
        if (isImage(file.type)) {
          imgBox.innerHTML = '';
  
          // 判断是否对图片进行压缩
          if (fileReader.result.length > 1024 * 80 && _this.opt.compress) {
            // 图片大小超过80kb进行压缩
            let img = new Image();
            img.src = fileReader.result;
  
            img.onload = function (e) {
              var canvas = document.createElement('canvas');
              var context = canvas.getContext('2d');
              let data = ''; // 压缩后的图片base64数据
              context.drawImage(img, 0, 0, _this.opt.width, _this.opt.height);
              data = canvas.toDataURL('imgage/jpg');
              imgLength = data.length;
              imgBox.style.backgroundImage = `url(${data})`;
            }
          } else {
            // 图片大小不超过80kb不进行压缩
            imgLength = fileReader.result.length;
            imgBox.style.backgroundImage = `url(${fileReader.result})`
            imgBox.style.backgroundSize = `${_this.opt.width}px ${_this.opt.height}px`;
          }
        } else {
          imgBox.innerHTML = fileReader.result;
        }
        imgBox.title = file.name;
  
        _this.opt.onLoad(e)
      }
  
      // 文件读取出错事件
      fileReader.onerror = function (e) {
        _this.opt.onError(e);
      }
  
      // 文件读取进度事件
      fileReader.onprogress = function (e) {
        _this.opt.onProgress(e);
      }
  
      // 读取文件
      if (file && file.type) {
        isImage(file.type) ? fileReader.readAsDataURL(file) : fileReader.readAsTest(file);
      }
    }, false)
  }
  
  // 清除ipt和组件的值，支持链式调用
  xjFile.prototype.clearFile = function () {
    this.opt.querySelector('.xj-file').value = '';
    return this;
  }
  
  const mixin = function (target, source) {
    for (let key in source) {
      if (source[key]) {
        target[key] = source[key]
      }
    }
    return target;
  }
  
  const isImage = function (type) {
    let reg = /(image\/jpeg)|(image\/jpg)|(image\/gif)|(image\/png)/gi;
    return reg.test(type)
  }

  window.xjFile = xjFile
})(document,window)

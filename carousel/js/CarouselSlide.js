function CarouselSlide(el, config = {}) {
  if(!el) {throw Error('CarouselSlide第一个参数不能为空')}
  this.root = document.querySelector(el);
  if(!this.root) {throw Error('找不到元素')}
  this.itemsBox = this.root.querySelector('.CarItemsBox');
  this.dotsBox = this.root.querySelector('.CarDotsBox');
  this.itemLen = this.itemsBox.querySelectorAll('.CarItem').length;
  this.left = this.root.querySelector('.CarLeft');
  this.right = this.root.querySelector('.CarRight');

  this.isLoading = false

  this.config = {
    autoPlay: false,
    autoPlayTime: 1500,
    autoPlayTimer: null,
    beforeCallback: null,
    afterCallback: null,
    dotHtml: '<li></li>',
    dotTagName: 'LI',
    rootMouseInClass: 'active',
    dotActiveClass: 'active',
    currentDot: 0,
    leftSlideDistance: this.itemsBox.offsetWidth,
    leftSlideSpeed: 15,
    isThrottling: false,
    ...config,
  }

  // 复制一张图片到最后
  const firstItem = this.itemsBox.querySelector('.CarItem').cloneNode(true)
  this.itemsBox.appendChild(firstItem);

  // dots动态生成和绑定事件
  if(this.dotsBox) {
    const divTemp = document.createElement('div');
    divTemp.innerHTML = this.config.dotHtml
    const dotDemo = divTemp.childNodes[0]
    this.config.dotTagName = dotDemo.tagName

    for(let i=0; i < this.itemLen; i++) {
      let dot = dotDemo.cloneNode(true)
      dot.dataset.dotNum = i
      dot.addEventListener('mouseover', () => {
        if(this.isLoading) return;
        if(this.config.isThrottling) this.isLoading = true;
        CarouselSlide.prototype.dotSwitch.call(this, i)
        this.config.currentDot = i
        CarouselSlide.prototype.leftSlide.call(this, this.itemsBox, -i*this.config.leftSlideDistance, this.config.beforeCallback, this.config.afterCallback)
      })
      this.dotsBox.appendChild(dot);
    }
    const currentDotElem = 
      this.dotsBox.querySelectorAll(this.config.dotTagName)[this.config.currentDot];
    currentDotElem?.classList.add(this.config.dotActiveClass);
    this.itemsBox.style.left = `${-this.config.currentDot*this.config.leftSlideDistance}px` 
  }

  // 左右按钮绑定事件
  if(this.left) {
    this.left.addEventListener('click', () => {
      if(this.isLoading) return;
      if(this.config.isThrottling) this.isLoading = true;
      CarouselSlide.prototype.leftClick.call(this)
    })
  }
  if(this.right) {
    this.right.addEventListener('click', () => {
      if(this.isLoading) return;
      if(this.config.isThrottling) this.isLoading = true;
      CarouselSlide.prototype.rightClick.call(this)
    })
  }

  // 自动轮播
  if(this.config.autoPlay) {
    this.config.autoPlayTimer = setInterval(() => {
      CarouselSlide.prototype.rightClick.call(this)
    }, this.config.autoPlayTime);

    this.root.addEventListener('mouseenter', () => {
      clearInterval(this.config.autoPlayTimer);
      this.config.autoPlayTimer = null;
    })
    this.root.addEventListener('mouseleave', () => {
      this.config.autoPlayTimer = setInterval(() => {
        CarouselSlide.prototype.rightClick.call(this)
      }, this.config.autoPlayTime);
    })
  }

  // 鼠标移入root添加类名
  this.root.addEventListener('mouseenter', () => {
    this.root.classList.add(this.config.rootMouseInClass)
  })
  this.root.addEventListener('mouseleave', () => {
    this.root.classList.remove(this.config.rootMouseInClass)
  })
}


// 原型对象 -- 动画函数
CarouselSlide.prototype.leftSlide 
  = function(elem, target, beforeCallback = null, afterCallback = null) {
  clearInterval(elem.timer);
  beforeCallback && beforeCallback.call(this);
  elem.timer = setInterval(() => {
    if(elem.offsetLeft === target) {
      clearInterval(elem.timer);
      elem.timer = null;
      afterCallback && afterCallback.call(this);
    }
    else {
      let step = (target - elem.offsetLeft) / 10;
      step = step > 0 ? Math.ceil(step) : Math.floor(step);
      elem.style.left = elem.offsetLeft + step + 'px';
    }  
  }, this.config.leftSlideSpeed);
}
// 原型对象 -- dots切换
CarouselSlide.prototype.dotSwitch = function(currentDot) {
  const dots = this.dotsBox.querySelectorAll(this.config.dotTagName);
  dots.forEach(elem => {
    elem.classList.remove(this.config.dotActiveClass)
  });
  dots[currentDot].classList.add(this.config.dotActiveClass)
}
// 原型对象 -- 左边按钮点击事件（上一张）
CarouselSlide.prototype.leftClick = function() {
  if(this.config.currentDot === 0) {
    this.itemsBox.style.left = -this.itemLen * this.config.leftSlideDistance + 'px';
    this.config.currentDot = this.itemLen - 1;
  } else {
    this.config.currentDot--;
  }
  CarouselSlide.prototype.leftSlide.call(this, this.itemsBox, -this.config.currentDot * this.config.leftSlideDistance, this.config.beforeCallback, this.config.afterCallback);
  if(this.dotsBox) {
    CarouselSlide.prototype.dotSwitch.call(this, this.config.currentDot)
  }
}

// 原型对象 -- 右边按钮点击事件（下一张）
CarouselSlide.prototype.rightClick = function() {
  if(this.config.currentDot === this.itemLen) {
    this.itemsBox.style.left = 0 + 'px';
    this.config.currentDot = 1;
  } else {
    this.config.currentDot++;
  }
  if(this.dotsBox) {
    CarouselSlide.prototype.leftSlide.call(this, this.itemsBox, -this.config.currentDot * this.config.leftSlideDistance, this.config.beforeCallback, this.config.afterCallback);
    let num = this.config.currentDot !== this.itemLen ? this.config.currentDot : 0;
    CarouselSlide.prototype.dotSwitch.call(this, num)
  }
}

// -- 自动轮播 
// autoPlay: false, []
// autoPlayTime: 1500, []
// autoPlayTimer: null, 

// -- 动画执行前后的函数
// beforeCallback: null, []
// afterCallback: null, []
// #注意：如果需要用到this操作实例，则不能使用箭头函数

// -- dot的标签
// dotHtml: '<li></li>', []
// dotTagName: 'LI',

// -- 鼠标移入轮播图根元素添加的类名
// rootMouseInClass: 'active', []

// -- dot激活状态时添加的类名
// dotActiveClass: 'active', []

// -- 当前的轮播图 从0开始
// currentDot: 0, []

// -- 一次移动的距离、速度
// leftSlideDistance: this.itemsBox.offsetWidth, []
// leftSlideSpeed: 15, []

// 是否开启节流阀
// isThrottling: false, []
// #注意开启节流阀的同时，需要在afterCallback函数里写入this.isLoading = false



// <link rel="stylesheet" href="./css/CarouselSlide.css">
// <script src="./js/CarouselSlide.js"></script>

//  <div id="car1" class="CarouselSlide">
//    <ul class="CarItemsBox">
//      <li class="CarItem"><a href="javascript:;"><img src="./img/1.jpg" alt="tip"></a></li>
//      <li class="CarItem"><a href="javascript:;"><img src="./img/2.jpg" alt="tip"></a></li>
//      <li class="CarItem"><a href="javascript:;"><img src="./img/3.jpg" alt="tip"></a></li>
//      <li class="CarItem"><a href="javascript:;"><img src="./img/4.jpg" alt="tip"></a></li>
//      <li class="CarItem"><a href="javascript:;"><img src="./img/5.jpg" alt="tip"></a></li>
//    </ul>
//<>  <div class="CarLeft">左</div> 
//<>  <div class="CarRight">右</div>
//<>  <ul class="CarDotsBox"></ul> // 标签内无需写内容，在使用构造函数时填写
//  </div>
const ImageCropping = function(el, config = {}) {
  // 获取el元素失败-退出报错
  if(!document.querySelector(el)) { 
    console.error(`ImageCropping:\nFailed to get element node.\n` +
    `document.querySelector('${el}'); `); 
    return;
  }

  config = {
    // 裁剪框的类名
    moveBlockClass: '',
    // 裁剪框移动时的回调函数
    croppingChangesCallback: null,
    ...config
  }

  // 
  this.el = el
  this.root = document.querySelector(this.el)
  this.root.innerHTML = ''
  this.rootSize = Math.min(this.root.clientWidth, this.root.clientHeight)
  this.root.style.width = this.root.style.height = `${this.rootSize}px`

  // 自动添加节点
  const canvasBase = document.createElement('canvas')
  canvasBase.setAttribute('class', 'canvasBase')
  const canvasShadow = document.createElement('canvas')
  canvasShadow.setAttribute('class', 'canvasShadow')
  const moveBlock = document.createElement('div')
  moveBlock.setAttribute('class', config?.moveBlockClass ?? '')
  moveBlock.innerHTML = `
    <span data-num="0"></span>
    <span data-num="1"></span>
    <span data-num="2"></span>
    <span data-num="3"></span>`
  this.root.appendChild(canvasBase)
  this.root.appendChild(canvasShadow)
  this.root.appendChild(moveBlock)

  // 获取主要的元素
  this.canvasBase = canvasBase
  this.ctxBase = this.canvasBase.getContext('2d')
  this.canvasShadow = canvasShadow
  this.ctxShadow = this.canvasShadow.getContext('2d')

  this.ctxShadow.fillStyle = 'rgba(0,0,0, 0.5)';


  this.moveBlock = moveBlock


  this.canvasBase.width = this.rootSize
  this.canvasBase.height = this.rootSize
  this.canvasShadow.width = this.rootSize
  this.canvasShadow.height = this.rootSize

  this.moveBlock.style.width = `${this.rootSize/3}px`
  this.moveBlock.style.height = `${this.rootSize/3}px`
  this.moveBlock.style.left = `${0}px`
  this.moveBlock.style.top = `${0}px`

  // 裁剪框移动时的回调函数
  this.croppingChangesCallback = config?.croppingChangesCallback

  // console.log(this.root.clientWidth);
  // console.log(this.root.offsetWidth);

  // 裁剪框移动时的函数
  this.moveBlock.addEventListener('mousedown', (e) => {
    const moveBlock = this.moveBlock

    const downPageX = e.pageX
    const downPageY = e.pageY
    const downWidth = moveBlock.offsetWidth

    const otherX = downPageX - moveBlock.offsetLeft
    const otherY = downPageY - moveBlock.offsetTop
    let move = null;
    let up = null;

    if(e.target.nodeName === 'SPAN') {
      const num = e.target.dataset.num
      let leftToFat_Right = this.canvasShadow.width - moveBlock.offsetLeft;
      let rightToFat_Left = moveBlock.offsetLeft + moveBlock.offsetWidth;
      let topToFat_Bottom = this.canvasShadow.height - moveBlock.offsetTop;
      let bottomToFat_Top = moveBlock.offsetTop + moveBlock.offsetHeight;

      const minSize = 30
      
      if(num === '0') {
        move = (e) => {
          const maxSize = rightToFat_Left < bottomToFat_Top ? rightToFat_Left : bottomToFat_Top
          
          let size = downWidth - (e.pageX - downPageX)
          if(size < minSize) size = minSize;
          else if(size > maxSize) size = maxSize

          moveBlock.style.left = `${rightToFat_Left - size}px`
          moveBlock.style.top = `${bottomToFat_Top - size}px`
          moveBlock.style.width = `${size}px`
          moveBlock.style.height = `${size}px`

          this.__proto__.CroppingChanges(this)
        }
      } else if(num === '1') {
        move = (e) => {
          const maxSize = leftToFat_Right < bottomToFat_Top ? leftToFat_Right : bottomToFat_Top

          let size = downWidth + (e.pageX - downPageX)
          if(size < minSize) size = minSize;
          else if(size > maxSize) size = maxSize

          moveBlock.style.top = `${bottomToFat_Top - size}px`
          moveBlock.style.width = `${size}px`
          moveBlock.style.height = `${size}px`

          this.__proto__.CroppingChanges(this)
        }
      } else if(num === '2') {
        move = (e) => {
          const maxSize = leftToFat_Right < topToFat_Bottom ? leftToFat_Right : topToFat_Bottom

          let size = downWidth + (e.pageX - downPageX)
          if(size < minSize) size = minSize;
          else if(size > maxSize) size = maxSize

          moveBlock.style.width = `${size}px`
          moveBlock.style.height = `${size}px`
          this.__proto__.CroppingChanges(this)
        }
      } else if(num === '3') {
        move = (e) => {
          const maxSize = rightToFat_Left < topToFat_Bottom ? rightToFat_Left : topToFat_Bottom
          
          let size = downWidth - (e.pageX - downPageX)
          if(size < minSize) size = minSize;
          else if(size > maxSize) size = maxSize

          moveBlock.style.left = `${rightToFat_Left - size}px`
          moveBlock.style.width = `${size}px`
          moveBlock.style.height = `${size}px`

          this.__proto__.CroppingChanges(this)
        }
      }
    }
    else {
      move = (e) => {
        const maxTop = this.root.clientHeight - moveBlock.offsetHeight
        const maxLeft = this.root.clientWidth - moveBlock.offsetWidth

        let x = e.pageX - otherX
        let y = e.pageY - otherY
        if(x < 0) x = 0
        else if(x > maxLeft) x = maxLeft
        if(y < 0) y = 0
        else if(y > maxTop) y = maxTop
        moveBlock.style.left = `${x}px`
        moveBlock.style.top = `${y}px`

        this.__proto__.CroppingChanges(this)
      }
    }
    up = () => {
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mouseup', up)
      this.root.removeEventListener('mouseleave', up)
    }
    document.addEventListener('mousemove', move)
    document.addEventListener('mouseup', up)
    this.root.addEventListener('mouseleave', up)
  })

  const that = this
  // 通过input选择图片的file获取图片的base64
  this.fileInit = function(file) {
    const imgReaderl = new FileReader();
    imgReaderl.onload = (e) => {
      this.imgInit(e.target.result)
    }
    imgReaderl.readAsDataURL(file)
  }
  // 通过图片的src绘画图片 初始化
  this.imgInit = (imgSrc) => {
    const baseImg = new Image()
    baseImg.src = imgSrc
    baseImg.onload = () => {
      let baseImg_width = this.rootSize
      let baseImg_height = this.rootSize
      if(baseImg.width > baseImg.height) {
        baseImg_height = baseImg_width / baseImg.width * baseImg.height
      } else {
        baseImg_width = baseImg_height / baseImg.height * baseImg.width
      }

      this.root.style.width = `${baseImg_width}px`
      this.root.style.height = `${baseImg_height}px`
      this.canvasBase.width = baseImg_width
      this.canvasBase.height = baseImg_height
      this.canvasShadow.width = baseImg_width
      this.canvasShadow.height = baseImg_height

      const moveBlock_size = Math.min(baseImg_width, baseImg_height) / 3
      this.moveBlock.style.width = `${moveBlock_size}px`
      this.moveBlock.style.height = `${moveBlock_size}px`
      this.moveBlock.style.left = `${0}px`
      this.moveBlock.style.top = `${0}px`
      this.ctxBase.drawImage(baseImg, 0, 0, baseImg_width, baseImg_height);

      this.ctxShadow.fillStyle = 'rgba(0,0,0, 0.5)';
      this.__proto__.CroppingChanges(this)
    }

  }
  // 获得图片的base64数据
  this.getImageCroppedBase64 = function(type  = 'image/jpg') {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = this.moveBlock.offsetWidth
    canvas.height = this.moveBlock.offsetHeight
    ctx.drawImage(this.canvasBase, 
      this.moveBlock.offsetLeft, this.moveBlock.offsetTop, 
      this.moveBlock.offsetWidth, this.moveBlock.offsetHeight,
      0, 0, canvas.width, canvas.height)
    return canvas.toDataURL(type)
  }

  // console.log(this);
  // console.log(this.__proto__);
}
// 裁剪盒子移动时重新绘画
ImageCropping.prototype.CroppingChanges = function(InstanceObject) {
  const obj = InstanceObject
  const { moveBlock, canvasShadow, ctxShadow } = obj
  ctxShadow.clearRect(0, 0, canvasShadow.width, canvasShadow.height)
  ctxShadow.fillRect(0, 0, canvasShadow.width, canvasShadow.height);
  ctxShadow.clearRect(moveBlock.offsetLeft, moveBlock.offsetTop, moveBlock.offsetWidth, moveBlock.offsetHeight)
  obj?.croppingChangesCallback && obj?.croppingChangesCallback()
}
// 下载图片
ImageCropping.prototype.DownloadImage = function(base64, fileName = 'ImageCropping.jpg') {
  const el = document.createElement('a');
  el.href = base64
  el.download = fileName
  el.click()
}
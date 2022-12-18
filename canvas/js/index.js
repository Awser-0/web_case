window.addEventListener('load', () => {
  const canPic = document.querySelector('.canvasPic')
  const ctxPic = canPic.getContext('2d')

  const canvasBox1 = new ImageCropping('.canvasBox1', {
    moveBlockClass: 'moveBox',
    croppingChangesCallback() {
      ctxPic.drawImage(this.canvasBase, 
        this.moveBlock.offsetLeft, this.moveBlock.offsetTop, 
        this.moveBlock.offsetWidth, this.moveBlock.offsetHeight,
        0, 0, canPic.width, canPic.height)
    }
  })
  canvasBox1.imgInit('../img/1.jpg')
  const fileUpload = document.querySelector('.fileUpload')
  
  fileUpload.addEventListener('change', () => {
    const file = fileUpload.files[0]
    if(file) {
      // init(file);
      canvasBox1.fileInit(file)
    }
  })

  canPic.addEventListener('click', function(){
    const base64 = canvasBox1.getImageCroppedBase64()
    ImageCropping.prototype.DownloadImage(base64)
  })
})
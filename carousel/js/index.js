window.addEventListener('load', () => {
  const car1 = new CarouselSlide('#car1', {
    autoPlay: true,
    afterCallback() {
      console.log(this.config.currentDot);
    },
    currentDot: 4
  })
  console.log(car1);
})
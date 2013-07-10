function Game() {
  this.init = function() {
    console.log("init");
    this.canvas = document.getElementById('c');
    console.log(this.canvas);
    this.ctx = this.canvas.getContext('2d');
  };

  this.start = function() {
    this.ctx.fillStyle = 'red';
    this.ctx.fillRect(0, 0, 200, 200);
  };
}
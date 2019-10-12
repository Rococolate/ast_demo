export default class Vector2d{
  constructor(vx=1,vy=1){
    this.vx = vx;
    this.vy = vy;
  }
  //获取向量长度
  static length(vec){
    if (!Vector2d.is(vec)) return false;
    return Math.sqrt(vec.vx * vec.vx + vec.vy * vec.vy);
  }
  //获取向量长度的平方
  static lengthSquared(vec){
    if (!Vector2d.is(vec)) return false;
    return vec.vx * vec.vx + vec.vy * vec.vy;
  }
  //scale方法可以让我们来放大或缩小向量
  static scale(vec,scale){
    if (!Vector2d.is(vec)) return false;
    const vx = vec.vx * scale;
    const vy = vec.vy * scale;
    return new Vector2d(vx,vy);
  } 

  //向量的加法运算
  static add(vec,vec2){
    if (!Vector2d.is(vec) || !Vector2d.is(vec2)) return false;
    const vx = vec.vx + vec2.vx;
    const vy = vec.vy + vec2.vy;
    return new Vector2d(vx,vy);
  }
  
  //向量的减法运算
  static sub(vec,vec2){
    if (!Vector2d.is(vec) || !Vector2d.is(vec2)) return false;
    const vx = vec.vx - vec2.vx;
    const vy = vec.vy - vec2.vy;
    return new Vector2d(vx,vy);
  }

  //方向取反
  static negate(vec){
    if (!Vector2d.is(vec)) return false;
    const vx = -vec.vx;
    const vy = -vec.vy;
    return new Vector2d(vx,vy);
  }

  //将向量转化为一个单位向量
  static normalize(vec){
    if (!Vector2d.is(vec)) return false;
    const len = Math.sqrt(vec.vx * vec.vx + vec.vy * vec.vy);
    let vx = 0;
    let vy = 0;
    if(len){
      vx =  vec.vx / len;
      vy =  vec.vy / len;
    }
    return new Vector2d(vx,vy);
  }

  //向量的旋转 https://en.wikipedia.org/wiki/Rotation_matrix
  static rotate(vec,angle){
    if (!Vector2d.is(vec)) return false;
    const cosVal = Math.cos(angle);
    const sinVal = Math.sin(angle);
    const _vx = vec.vx * cosVal - vec.vy * sinVal;
    const _vy = vec.vx * sinVal + vec.vy * cosVal;
    const vx = Math.abs(_vx) < Number.EPSILON ? 0 : _vx;
    const vy = Math.abs(_vy) < Number.EPSILON ? 0 : _vy;
    return new Vector2d(vx,vy);
  }

  //向量的数量积
  static dot(vec,vec2){
    if (!Vector2d.is(vec)) return false;
    if (!Vector2d.is(vec2)) return false;
    return vec.vx * vec2.vx + vec.vy * vec2.vy;
  }

  static is(vec){
    const boolean = vec instanceof Vector2d;
    return boolean;
  }
} 
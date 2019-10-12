import Vector2d from "../lib/vector2d.js";
import { CreateTypeNode, operatorValue, opposite, isFullNode, isNotFullNode, isNoChildrenNode, typeValue } from "./node.js";

export const EOF = Symbol('EOF');

export class Lexer {
  constructor(){
    this.token = [];
    this.tokens = [];
    this.state = this.start;
    this.id = 0;
  }
  start(char) {
    // 数字
    if (["0","1","2","3","4","5","6","7","8","9"].includes(char)) {
      this.token.push(char);
      return this.inInt;
    }
    // .
    if (char === "."){
      this.token.push(char);
      return this.inFloat;
    }
    // 符号
    if (["+","-","*","/","(",")","[","]",",","<",">"].includes(char)) {
      this.emmitToken("SIGN", char);
      return this.start
    }
    // 空白字符
    if ([" ","\r","\n"].includes(char)) {
      return this.start;
    }
    // 介绍
    if (char === EOF){
      this.emmitToken("EOF", EOF);
      return this.start
    }
    if (char === "@"){
      this.token.push(char);
      return this.sign;
    }
  }

  sign(char) {
    if ("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").includes(char)) {
      this.token.push(char);
      return this.sign;
    } else {
      this.emmitToken("SIGN", this.token.join(""));
      this.token = [];
      return this.start(char); // put back char
    }
  }

  inInt(char) {
    if (["0","1","2","3","4","5","6","7","8","9"].includes(char)) {
      this.token.push(char);
      return this.inInt;
    } else if (char === '.') {
      this.token.push(char);
      return this.inFloat;
    } else {
      this.emmitToken("NUMBER", this.token.join(""));
      this.token = [];
      return this.start(char); // put back char
    }
  }

  inFloat(char) {
    if (["0","1","2","3","4","5","6","7","8","9"].includes(char)) {
      this.token.push(char);
      return this.inFloat;
    } else if (char === ".") {
      throw new Error("不能出现`..`");
    } else {
      if (this.token.length === 1  && this.token[0] === ".") throw new Error("不能单独出现`.`");
      this.emmitToken("NUMBER", this.token.join(""));
      this.token = [];
      return this.start(char); // put back char
    }
  }

  emmitToken(type, value) {
    // console.log(value);
    this.tokens.push({
      id:this.id++,
      type,
      value,
    })
  }

  push(char){
    this.state = this.state(char);
    return this.check();
  }
  end(){
    this.state(EOF);
    return this.check();
  }
  check(){
    // console.log(this.tokens);
    const _token = [...this.tokens];
    this.tokens = [];
    return _token;
  }
  clear(){
    this.token = [];
    this.tokens = [];
    this.state = this.start;
  }
}

// 完整的 Parser
export class Parser{
  constructor(){
    this.stack = [CreateTypeNode("ROOT")()];
    this.tempStack = [];
    this.ParNodeSize = 0;
    this.VecNodeSize = 0;
  }
  async push(token){
    const top = this.stack[this.stack.length - 1];

    const rob = (type,children) =>{
      const child = children.pop();
      this.stack.push(CreateTypeNode(type)(child));
    }

    const retire = (type) => {
      this.stack.push(CreateTypeNode(type)(this.stack.pop()));
    }

    const link = (type) =>{
      const value = operatorValue[type];
      // console.log(stack[stack.length -2].type,stack[stack.length -1].type,type);
      // console.log(typeValue(stack[stack.length -2]),typeValue(stack[stack.length -1]),value);
      while(isFullNode(this.stack[this.stack.length -1]) &&  isNotFullNode(this.stack[this.stack.length - 2]) && (value <= typeValue(this.stack[this.stack.length -1])) && (value <= typeValue(this.stack[this.stack.length -2])) ) {
        // console.log(value);
        this.stack[this.stack.length - 2].children.push(this.stack.pop());
      }
    }

    const remove = (type) => {
      link(type);
      //  找到最近的( 其余push到tempStack
      while(this.stack.length > 0 && !(this.stack[this.stack.length - 1].type === type && !this.stack[this.stack.length - 1].children)){
        this.tempStack.push(this.stack.pop());
      }
      // 修改最近的( 
      const top = this.stack[this.stack.length - 1];
      if (top.type === type){
        top.type = opposite[type];
        top.children = [];
        // tempStack的Node压给(
        while(this.tempStack.length > 0){
          top.children.push(this.tempStack.pop());
        }
        top.maxChildren = top.children.length;
      } 
    }

    const stackPush = (node) => {
      this.stack.push(node);
    }

    const topChildPush = (node) => {
      top.children.push(node);
    }

    
    // console.log(token);
    // console.log(top);
    // console.log(JSON.stringify(stack));
    
    if (token.type === "EOF") {
      // ( 1 + 2 EOF
      if (this.ParNodeSize > 0) throw new Error("还有没有闭合的(");
      if (this.VecNodeSize > 0) throw new Error("还有没有闭合的[");
      // EOF
      return remove("ROOT");
    }

    if (token.value === "[" ) {
      // 1[
      // 1 + 1 [
      if (isFullNode(top)) throw new Error("非顶端[前面不能有满项");
      this.VecNodeSize ++;
      return stackPush(CreateTypeNode("[")());
    }

    if (token.value === "," ) {
      // ,
      // ,,
      // (,
      // [,
      if (isNoChildrenNode(top)) throw new Error(",不能接在空符后面");
      // [ 1 + ,
      if (isNotFullNode(top)) throw new Error(",不能接在非满项后面");
      link("[")
      return stackPush(CreateTypeNode(",")());
    }

    if (token.value === "]" ) {
      // []]
      if (this.VecNodeSize <= 0) throw new Error("缺少匹配的[");
      // [1+]
      if (isNotFullNode(top)) throw new Error("]前不能有非满项");
      this.VecNodeSize --;
      return remove("[");
    }

    if (token.value === "(" ) {
      // 1(
      // 1 + 1 (
      if (isFullNode(top)) throw new Error("not a function");
      this.ParNodeSize ++;
      // (
      return stackPush(CreateTypeNode("(")());
    }

    if (token.value === ")" ) {
      //  ())
      if (this.ParNodeSize <= 0) throw new Error("Unexpected token )");
      this.ParNodeSize --;
      // ()
      if (isNoChildrenNode(top)) throw new Error("Unexpected token )");
      // (1+)
      if (isNotFullNode(top)) throw new Error("Unexpected token )");
      return remove("(");
    }

    
    if (token.type === "SIGN") {
      // 后置符号
      if (isFullNode(top)) {
        if (token.value === "@len") throw new Error(token.value + "符号是前置符");
        if (token.value === "@lens") throw new Error(token.value + "符号是前置符");
        if (operatorValue[token.value] > operatorValue[top.type]){
            // 1 + 2 * 
            // console.log("rob");
            return rob(token.value,top.children);
          } else {
            //  1 +
            //  1 + 2 + 
            link(token.value);
            return retire(token.value);
          }
      }

      // 前置符号
      if (
        (isNoChildrenNode(top)) || // (-
        (isNotFullNode(top)) // 1 + -
      ){
        if (token.value === "-") return stackPush(CreateTypeNode("NEGATE")()); // 取负公用符号 - 
        if (token.value === "@len") return stackPush(CreateTypeNode("@len")());
        if (token.value === "@lens") return stackPush(CreateTypeNode("@lens")());
        if (token.value === "+") return ; // + 号静默
        throw new Error(token.value + "符号不能前置");
      }
      
    }

    if (token.type === "NUMBER") {
      //  1 1 
      //  1 + 1 1
      if (isFullNode(top)) throw new Error("数字前一项不能是满项")
      const number = CreateTypeNode(token.type)(token.value);
      if (isNotFullNode(top)){
        return topChildPush(number);
      } else {
        return stackPush(number);
      }
    }

    
  }
  clear(){
    this.stack = [CreateTypeNode("ROOT")()];
    this.tempStack = [];
    this.ParNodeSize = 0;
    this.VecNodeSize = 0;
  }
  end(){
    return this.stack[0];
  }
}

export function evaluate(node){
  if (node === null) return null;
  if (node === undefined) return null;
  const {type,children} = node;

  if (type === "NUMBER") return Number(children[0]);

  if (type === "ROOT_END") return evaluate(children[0]);

  if (type === ")") return evaluate(children[0]);

  if (type === "]") {
    const notWall = children.filter(item => item.type !== ",");
    const a = evaluate(notWall[0]);
    const b = evaluate(notWall[1]);
    const isNumA = typeof a === "number";
    const isNumB = typeof b === "number";
    if (isNumA && isNumB) {
      return new Vector2d(a,b);
    } else {
      throw new Error("只有两个数量才能生成向量");
    }
  }

  if (type === "+") {
    const a = evaluate(children[0]);
    const b = evaluate(children[1]);
    if (Vector2d.is(a) && Vector2d.is(b)){
      return Vector2d.add(a,b);
    } else {
      return a + b;
    }
  }
  if (type === "-") {
    const a = evaluate(children[0]);
    const b = evaluate(children[1]);
    if (Vector2d.is(a) && Vector2d.is(b)){
      return Vector2d.sub(a,b);
    } else {
      return a - b;
    }
  }

  if (type === ">" || type === "<") {
    const a = evaluate(children[0]);
    const b = evaluate(children[1]);
    const isVecA = Vector2d.is(a);
    const isVecB = Vector2d.is(b);
    const isNumA = typeof a === "number";
    const isNumB = typeof b === "number";
    if(isVecA && isNumB) {
      throw new Error("向量与数字不能比较");
    } else if (isVecB && isNumA) {
      throw new Error("向量与数字不能比较");
    } else if (isVecB && isVecA) {
      throw new Error("向量与向量不能比较");
    } else {
      if (type === ">") return a > b;
      if (type === "<") return a < b;
    }
  }

  if (type === "*" || type === "/") {
    const a = evaluate(children[0]);
    const b = evaluate(children[1]);
    const isVecA = Vector2d.is(a);
    const isVecB = Vector2d.is(b);
    const isNumA = typeof a === "number";
    const isNumB = typeof b === "number";
    if ( isNumA && isNumB ){
      if (type === "*") return a * b;
      if (type === "/") return a / b;
    } else if(isVecA && isNumB) {
      if (type === "*") return Vector2d.scale(a,b);
      if (type === "/") return Vector2d.scale(a,1/b);
    } else if (isVecB && isNumA) {
      if (type === "*") return Vector2d.scale(b,a);
      if (type === "/") return Vector2d.scale(b,1/a);
    } else {
      throw new Error("两个向量不能相乘，请用@dot");
    }
  }

  if (type === "NEGATE") {
    const a = evaluate(children[0]);
    if (Vector2d.is(a)){
      return Vector2d.scale(a,-1);
    } else {
      return a * -1;
    }
  }

  if (type === "@dot"){
    const a = evaluate(children[0]);
    const b = evaluate(children[1]);
    const isVecA = Vector2d.is(a);
    const isVecB = Vector2d.is(b);
    if (isVecA && isVecB) {
      return Vector2d.dot(a,b);
    } else {
      throw new Error("只有向量和向量能点乘");
    }
  }

  if (type === "@rot"){
    const a = evaluate(children[0]);
    const b = evaluate(children[1]);
    const isVecA = Vector2d.is(a);
    const isVecB = Vector2d.is(b);
    const isNumA = typeof a === "number";
    const isNumB = typeof b === "number";
    if (isVecA && isNumB) {
      return Vector2d.rotate(a,b);
    } else if (isVecB && isNumA) {
      return Vector2d.rotate(b,a);
    } else {
      throw new Error("只有向量和数量能旋转");
    }
  }

  if (type === "@deg"){
    const a = evaluate(children[0]);
    const isNumA = typeof a === "number";
    if (isNumA){
      return a / 180 * Math.PI;
    } else {
      throw new Error("非数字不能转换deg");
    }
  }

  if (type === "@len"){
    const a = evaluate(children[0]);
    const isVecA = Vector2d.is(a);
    if (isVecA){
      return Vector2d.length(a);
    } else {
      throw new Error("非向量不能计算模");
    }
  }

  if (type === "@lens"){
    const a = evaluate(children[0]);
    const isVecA = Vector2d.is(a);
    if (isVecA){
      return Vector2d.lengthSquared(a);
    } else {
      throw new Error("非向量不能计算模平方");
    }
  }
  
}
<template>
  <div class="show-ast">
   <div class="stack">
     <h2>stack</h2>
     <div class="stack_in"><Node v-for="item in stack" :key="item.id" :node="item"></Node></div>
   </div>
   <div class="stack">
     <h2>temp stack</h2>
     <div class="stack_in"><Node v-for="item in tempStack" :key="item.id" :node="item"></Node></div>
   </div>
  </div>
</template>

<script>
import Node from "./Node.vue";
import { CLEAR } from "../js/const.js";
import { CreateTypeNode, operatorValue, opposite, isFullNode, isNotFullNode, isNoChildrenNode, typeValue } from "../js/node.js";
import { wait } from "../js/wait.js";
const SLEEP_TIME = 200;
export default {
  name: 'ShowAst',
  components: {
    Node,
  },
  props: {
    input:Array
  },
  data(){
    return {
      //  为了加入动画，将 AST Parser 拆开融入 vm 里
      stack : [CreateTypeNode("ROOT")()],
      tempStack : [],
      ParNodeSize : 0,
      VecNodeSize : 0,
      orderList:[],
      isAnimation:false,
    }
  },
  watch:{
    input(newArray){
      let _array = [...newArray];
      // console.log(JSON.stringify(_array));
      
      if (_array[0] === CLEAR) return this.clear();
      while(_array.length > 0){
        this.orderList.push(_array.shift());
      }
      if (newArray.length > 0 && newArray[0] !== null) this.checkOrder();
    }
  },
  methods:{
    async checkOrder(){
      if (this.isAnimation === false && this.orderList.length > 0){
        this.isAnimation = true;
        const shift = this.orderList.shift();
        await this.push(shift);
        this.isAnimation = false;
        if (shift.type === "EOF") this.end();
        await this.checkOrder();
      }
    },
    async push(token){
      const top = this.stack[this.stack.length - 1];

      const rob = async(type,children) =>{
        console.log("rob");
        await wait(SLEEP_TIME);
        const child = children.pop();
        this.stack.push(CreateTypeNode(type)(child));
      }

      const retire = async(type) => {
        console.log("retire");
        this.stack.push(CreateTypeNode(type)(this.stack.pop()));
      }

      const link = async(type) =>{
        console.log("link");
        const value = operatorValue[type];
        // console.log(stack[stack.length -2].type,stack[stack.length -1].type,type);
        // console.log(typeValue(stack[stack.length -2]),typeValue(stack[stack.length -1]),value);
        while(isFullNode(this.stack[this.stack.length -1]) &&  isNotFullNode(this.stack[this.stack.length - 2]) && (value <= typeValue(this.stack[this.stack.length -1])) && (value <= typeValue(this.stack[this.stack.length -2])) ) {
          // console.log(value);
          await wait(SLEEP_TIME);
          this.stack[this.stack.length - 2].children.push(this.stack.pop());
        }
      }

      const remove = async(type) => {
        console.log("remove");
        await link(type);
        //  找到最近的( 其余push到tempStack
        while(this.stack.length > 0 && !(this.stack[this.stack.length - 1].type === type && this.stack[this.stack.length - 1].maxChildren === 0)){
          await wait(SLEEP_TIME);
          this.tempStack.push(this.stack.pop());
        }
        // 修改最近的( 
        const top = this.stack[this.stack.length - 1];
        if (top.type === type){
          top.type = opposite[type];
          // top.children = [];
          // tempStack的Node压给(
          while(this.tempStack.length > 0){
            await wait(SLEEP_TIME);
            top.children.push(this.tempStack.pop());
          }
          top.maxChildren = top.children.length;
        } 
      }

      const stackPush = async(node) => {
        await wait(SLEEP_TIME);
        this.stack.push(node);
      }

      const topChildPush = async(node) => {
        await wait(SLEEP_TIME);
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
        await link("[");
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
              await link(token.value);
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

      
    },
    clear(){
      this.stack = [CreateTypeNode("ROOT")()];
      this.tempStack = [];
      this.ParNodeSize = 0;
      this.VecNodeSize = 0;
    },
    end(){
      this.$emit("output",this.stack[0]);
    }
  }
}
</script>

<style scoped>
  
  .show-ast{
    height: 100px;
    margin-top: 100px;
    display: flex;
  }
  .stack{
    flex:1;
    position: relative;
  }
  .stack > .node {
    margin:0 2em;
  }
</style>

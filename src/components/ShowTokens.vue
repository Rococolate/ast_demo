<template>
  <div class="show-tokens">
   <span v-for="(item) in tokens" :key="item.id" class="fade-in" @animationstart="animationstart" @animationend="animationend" @animationcancel="animationend" :class="TOKEN_TYPE[item.type].className">{{item.value === EOF ? "EOF" : item.value}}</span>
  </div>
</template>

<script>
import { EOF } from "../js/ast.js";
import { TOKEN_TYPE } from "../js/type.js";
import { CLEAR } from "../js/const.js";
export default {
  name: 'ShowTokens',
  props: {
    addTokens:Array
  },
  data(){
    return {
      EOF,
      TOKEN_TYPE,
      tokens:[],
      orderList:[],
      inAnimation:null,
      isAnimation:false,
    }
  },
  watch:{
    addTokens(newArray){
      const _array = [...newArray];
      if (_array[0] === CLEAR) return this.clear();
      while(_array.length > 0){
        this.orderList.push(_array.shift());
      }
      if (this.isAnimation === false && this.orderList.length > 0 && newArray.length > 0) {
        this.push();
      }
    }
  },
  methods:{
    clear(){
      this.orderList = [];
      this.tokens = [];
      this.isAnimation = false;
    },
    animationstart(){
      this.isAnimation = true;
    },
    animationend(){
      this.$emit("output",this.inAnimation);
      if (this.orderList.length > 0) {
        this.push();
      } else {
        this.isAnimation = false;
      }
    },
    push(){
      this.inAnimation = this.orderList.shift();
      this.tokens.push(this.inAnimation);
    }
  }
}
</script>

<style scoped>
  @keyframes fade-in {
    from{opacity:0}
    to{opacity:1}
  }
  .fade-in{
    animation: fade-in 0.2s linear 0s;
  }
  .show-tokens{
    font-size: 32px;
    margin-top: 60px;
    height: 1em;
  }
  .number{
    min-width: 0.8em;
    display: inline-block;
    padding:0 0.2em;
    background-color: #4caf50;
    border-radius: 0.2em;
    color:#fff;
    margin:0 0.1em;
    font-weight: bold;
  }
  .eof{
    min-width: 0.8em;
    display: inline-block;
    padding:0 0.2em;
    background-color: #f44336;
    border-radius: 0.2em;
    color:#fff;
    margin:0 0.1em;
    font-weight: bold;
  }
  .sign{
    display: inline-block;
    padding:0 0.2em;
    background-color: #3f51b5;
    border-radius: 0.2em;
    color:#fff;
    margin:0 0.1em;
    font-weight: bold;
    min-width: 0.8em;
  }
</style>

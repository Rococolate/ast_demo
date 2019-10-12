<template>
  <div id="app">
    <div>
      <h2>evaluate</h2>
      <p class="answer">{{ answer }}</p>
    </div>
    <InputText @input="pushText" @clear="clearText" @sure="sureText" />
    <ShowTokens :addTokens="addTokens" @output="tokenOutput" />
    <ShowAst :input="inputTokens" @output="outputAst" />

  </div>
</template>

<script>
  import InputText from './components/InputText.vue';
  import ShowTokens from './components/ShowTokens.vue';
  import ShowAst from './components/ShowAst.vue';
  import {
    evaluate,
    Lexer
  } from "./js/ast.js";
  import {
    CLEAR
  } from "./js/const.js";

  export default {
    name: 'app',
    components: {
      InputText,
      ShowTokens,
      ShowAst,
    },
    data() {
      return {
        addTokens: [],
        inputTokens: [],
        Lexer: new Lexer(),
        answer: "",
      }
    },
    mounted() {
    },
    methods: {
      outputAst(ast) {
        console.log(ast);
        console.log(JSON.stringify(ast));
        this.answer = evaluate(ast);
      },
      tokenOutput(token) {
        this.inputTokens = [token];
      },
      pushText(char) {
        const tokens = this.Lexer.push(char);
        if (tokens.length !== 0) {
          this.addTokens = tokens;
        }
      },
      clearText() {
        this.Lexer.clear();
        this.addTokens = [CLEAR];
        this.inputTokens = [CLEAR];
        this.answer = "";
      },
      sureText() {
        const tokens = this.Lexer.end();
        if (tokens.length !== 0) {
          this.addTokens = tokens;
        }
      },

    }
  }
</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
  }

  .answer {
    font-size: 24px;
    font-weight: bold;
    height: 1em;
  }
</style>
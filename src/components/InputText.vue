<template>
  <div class="input-text">
    <input type="text" @keydown.delete="prevent" @input="inputHandle" ref="input">
    <span class="input-text_button" @click="sureButtonClickHandle">sure</span>
    <span class="input-text_button" @click="clearButtonClickHandle">clear</span>
  </div>
</template>

<script>
export default {
  name: 'InputText',
  methods:{
    prevent(event){
      event.preventDefault();
    },
    clearButtonClickHandle(){
      this.$refs.input.value = "";
      // console.log("clear");
      this.$emit("clear");
    },
    sureButtonClickHandle(){
      // console.log("sure");
      this.$emit("sure");
    },
    inputHandle(){
      const value = this.$refs.input.value.slice(-1);
      // console.log(value);
      this.$emit("input",value);
    }
  }
}
</script>

<style scoped>
  .input-text{
    font-size: 32px;
  }
  input[type=text]{
    width: 300px;
    border-radius: 0.2em;
    border:1px solid #cccccc;
    padding:0.2em;
    font-size: 28px;

  }
  .input-text_button{
    display: inline-block;
    background-color: #2196f3;
    color: #fff;
    margin:0 0.4em;
    padding:0 0.5em;
    font-weight: bold;
    border-radius: 0.2em;
    cursor: pointer;
  }
</style>

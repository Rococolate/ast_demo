<template>
  <div class="node fade-in" :class="className">
    <span>{{text}}</span>
    <div class="children" v-if="node.children && node.children.length > 0">
      <Node v-for="(item,index) in node.children" :key="item.id ? item.id : item" :node="item" :style="rotate(index,node.children.length)"></Node>
    </div>
  </div>
</template>

<script>
const BASE_DEG = 10;
export default {
  name: 'Node',
  components: {
    Node,
  },
  props: {
    node:[Object,String]
  },
  computed:{
    level:_vm => _vm.deep(),
    text:_vm => _vm.node.type ? _vm.shortName(_vm.node.type) : _vm.node,
    className: _vm => {
      return {
        "literal":!_vm.node.name,
        [_vm.node.name]:_vm.node && _vm.node.name,
      }
    }
  },
  data(){
    return {
    }
  },
  watch:{
  },
  methods:{
    rotate(index,length){
      const middle = (length - 1) / 2;
      const base = middle - index;
      const deg = base * BASE_DEG * this.level; 
      return `transform: rotate(${deg}deg);`
    },
    deep(){
      let level = 0;
      function findDeep(node,range=0){
        if (node.children && node.children.length > 0) {
          const _range = ++ range;
          if (_range > level) level = _range;
          return node.children.map(item => findDeep(item,_range));
        } else {
          return range;
        }
      }
      findDeep(this.node);
      return level;
    },
    shortName(type){
      if (type === "ROOT") return "RT";
      if (type === "ROOT_END") return "RE";
      if (type === "NUMBER") return "N";
      if (type === "NEGATE") return "NE";
      return type;
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
    animation: fade-in 0.3s linear 0s;
  }
  .node{
    min-width: 0.8em;
    display: inline-block;
    padding:0 0.2em;
    background-color: #3f51b5;
    border-radius: 0.2em;
    color:#fff;
    margin:0 0.4em;
    font-weight: bold;
    position: relative;
    transition: all 0.5s;
    transform:rotate(0);
  }
  .children{
    position: absolute;
    top:110%;
    left:50%;
    transform: translateX(-50%);
    white-space: nowrap;
  }
  
  .literal{
    position: absolute;
    background-color: #4caf50;
    top:0;
    left:0;
    margin:0;
    transform: translateX(-50%) translateY(-110%) !important;
  }
  .root{
    background-color: #f44336;
  }
</style>

let id = 0;

function createId(){
  return `node-${id++}`;
}

function RootNode(){
  return {
    id:createId(),
    type:"ROOT",
    name:"root",
    children:[],
    maxChildren:0,
  }
}

function BiggerNode(){
  return {
    id:createId(),
    type:">",
    children:[...arguments],
    maxChildren:2,
    name:"bigger",
  }
}

function SmallerNode(){
  return {
    id:createId(),
    type:"<",
    children:[...arguments],
    maxChildren:2,
    name:"smaller",
  }
}

function AddNode(){
  return {
    id:createId(),
    type:"+",
    children:[...arguments],
    maxChildren:2,
    name:"add",
  }
}

function SubNode(){
  return {
    id:createId(),
    type:"-",
    children:[...arguments],
    maxChildren:2,
    name:"sub",
  }
}

function MulNode(){
  return {
    id:createId(),
    type:"*",
    children:[...arguments],
    maxChildren:2,
    name:"mul",
  }
}

function DivNode(){
  return {
    id:createId(),
    type:"/",
    children:[...arguments],
    maxChildren:2,
    name:"div",
  }
}

function DotNode(){
  return {
    id:createId(),
    type:"@dot",
    children:[...arguments],
    maxChildren:2,
    name:"dot",
  }
}

function RotNode(){
  return {
    id:createId(),
    type:"@rot",
    children:[...arguments],
    maxChildren:2,
    name:"rot",
  }
}

function NegNode(){
  return {
    id:createId(),
    type:"NEGATE",
    children:[...arguments],
    maxChildren:1,
    name:"neg",
  }
}

function LenNode(){
  return {
    id:createId(),
    type:"@len",
    children:[...arguments],
    maxChildren:1,
    name:"len",
  }
}

function LensNode(){
  return {
    id:createId(),
    type:"@lens",
    children:[...arguments],
    maxChildren:1,
    name:"lens",
  }
}

function ParNode(){
  return {
    id:createId(),
    type:"(",
    name:"par",
    children:[],
    maxChildren:0,
  }
}

function NumberNode(){
  return {
    id:createId(),
    type:"NUMBER",
    children:[...arguments],
    maxChildren:1,
    name:"number",
  }
}

function DegNode(){
  return {
    id:createId(),
    type:"@deg",
    children:[...arguments],
    maxChildren:1,
    name:"deg",
  }
}

function VecNode(){
  return {
    id:createId(),
    type:"[",
    name:"vec",
    children:[],
    maxChildren:0,
  }
}

function WallNode(){
  return {
    id:createId(),
    type:",",
    name:"wall",
    children:[],
    maxChildren:0,
  }
}

export function CreateTypeNode(type){
  if (type === "+") return AddNode;
  if (type === "-") return SubNode;
  if (type === "*") return MulNode;
  if (type === "/") return DivNode;
  if (type === ">") return BiggerNode;
  if (type === "<") return SmallerNode;
  if (type === "@dot") return DotNode;
  if (type === "@rot") return RotNode;
  if (type === "@len") return LenNode;
  if (type === "@lens") return LensNode;
  if (type === "NEGATE") return NegNode;
  if (type === "NUMBER") return NumberNode;
  if (type === "@deg") return DegNode;
  if (type === ",") return WallNode;
  if (type === "[") return VecNode;
  if (type === "(") return ParNode;
  if (type === "ROOT") return RootNode;
}

export const operatorValue = {
  "ROOT" : 0, 
  "(" : 1,
  "[" : 1,
  "@dot" : 2, 
  "<" : 3,
  ">" : 3,
  "+" : 4,
  "-" : 4,
  "*" : 5,
  "/" : 5,
  "@rot" : 5,
  "@len" : 6, // 取模
  "@lens" : 6, // 取模平方
  "NEGATE" : 6, // 取负
  "@deg" : 7,
  "NUMBER" : 8, // 取正
  ")" : 9,
  "]" : 9,
  "ROOT_END" : 10,
}

export const opposite = {
  "(" : ")" ,
  "[" : "]" ,
  "ROOT" : "ROOT_END" ,
}

export function isFullNode(node){
  if (isNoChildrenNode(node)) return false;
  return node && node.children && node.children.length >= node.maxChildren;
}

export function isNotFullNode(node){
  if (isNoChildrenNode(node)) return false;
  return node && node.children && node.children.length < node.maxChildren;
}

export function isNoChildrenNode(node){
  return node.maxChildren === 0;
}

export function typeValue(node){
  if (node === undefined) throw new Error("node is undefined");
  return operatorValue[node.type];
}
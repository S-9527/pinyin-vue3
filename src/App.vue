<script setup lang="ts">
import pyData from './assets/data.ts'
import {ref, computed, onMounted, watchEffect} from 'vue'
import {
  addRecord,
  clearRecord,
  getRollbackStack,
  getUndoStack,
  rollbackRecord,
  undoRecord
} from "./core/record.ts";
import Longpress from "./directives/long-press";

enum RecordType {
  NORMAL = 'normal',
  WRONGS = 'wrongs'
}

const vLongpress = Longpress
const mode = ref<RecordType>(RecordType.NORMAL)
const project = computed(() => {
  return mode.value === RecordType.WRONGS ? '错题本练习，' : '题库练习，'
})

const current = ref()
const wrongs = ref()
const words = ref(pyData)
const show = ref(false)

const isWrongs = computed(() => mode.value === RecordType.WRONGS)
const hasWrongs = computed(() => wrongs.value.length > 0)

onMounted(() => {
  words.value.forEach(item => addRecord(item))
  current.value = getUndoStack().shift()
})

function showOptions() {
  show.value = true
}

function prev() {
  if (getRollbackStack().isEmpty()) return
  current.value = rollbackRecord(current.value)
}

function next() {
  if (getUndoStack().isEmpty()) {
    alert('恭喜你 练完了，刷新重来！')
    return
  }
  current.value = undoRecord(current.value)
}

function addWrongs() {
  if (wrongs.value.includes(current.value)) return
  wrongs.value.push(current.value)
  localStorage.setItem("pinyin-wrongs", JSON.stringify(wrongs.value))
}

function removeCurrentWrong() {
  wrongs.value = wrongs.value.filter((item: string) => item !== current.value)
  localStorage.setItem("pinyin-wrongs", JSON.stringify(wrongs.value))
  current.value = undoRecord(current.value)
  if (wrongs.value.length === 0) exitWrongs()
}

function clearAll() {
  wrongs.value = []
  localStorage.setItem("pinyin-wrongs", JSON.stringify(wrongs.value))
  exitWrongs()
}

watchEffect(() => {
  wrongs.value = JSON.parse(localStorage.getItem("pinyin-wrongs") || "[]")
})

function openWrongs() {
  setData(wrongs.value)
  mode.value = RecordType.WRONGS
}

function exitWrongs() {
  setData(pyData)
  mode.value = RecordType.NORMAL
}

function setData(list: string[]) {
  clearRecord()
  words.value = list
  words.value.forEach(item => addRecord(item))
  current.value = getUndoStack().shift()
}
</script>

<template>
  <div class="container">
    <div class="main" @click="next" v-longpress="showOptions">
      {{ current }}
    </div>
    <div class="desc">{{ project }}剩余：{{ getUndoStack().size() }}</div>
  </div>
  <div class="menu-wrapper" v-if="show" @click="show = false">
    <div class="menu" v-if="!isWrongs">.
      <div class="menu-item" @click="prev">上一个</div>
      <div class="menu-item" @click="addWrongs">加入错题本</div>
      <div class="menu-item" @click="openWrongs" v-show="hasWrongs">
        进入错题本 {{ `[${wrongs.length}个]` }}
      </div>
    </div>
    <div class="menu" v-else>
      <div class="menu-item" @click="prev">上一个</div>
      <div class="menu-item" @click="removeCurrentWrong">
        记住了，移出：<span>{{ current }}</span>
      </div>
      <div class="menu-item" @click="clearAll" style="color: #F56C6C;">清空错题本</div>
      <div class="menu-item" @click="exitWrongs">退出错题本</div>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
}

.main {
  font-family: 'pinyin', serif;
  font-size: calc(20vw * 1.2);
  text-align: center;
  line-height: 90vh;
  user-select: none;
  cursor: default;
}

.desc {
  padding-top: 12px;
  text-align: center;
  user-select: none;
  cursor: default;
  color: rgb(157, 157, 157);
}

.menu-wrapper {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9;
  display: flex;
  justify-content: center;
  align-items: center;
}

.menu {
  display: flex;
  flex-direction: column;
}

.menu-wrapper .menu .menu-item {
  width: 25vw;
  min-width: 200px;
  text-align: center;
  background-color: #fff;
  padding: 20px 0;
  border-radius: 10px;
  cursor: pointer;
  user-select: none;
}

.menu-wrapper .menu .menu-item + .menu-item {
  margin-top: 25px;
}
</style>

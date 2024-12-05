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
const showCompletionModal = ref(false)

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
    showCompletionModal.value = true
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

function resetPractice() {
  showCompletionModal.value = false
  setData(mode.value === RecordType.WRONGS ? wrongs.value : pyData)
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex flex-col justify-center items-center p-4">
    <div class="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
      <div
          class="main text-6xl sm:text-8xl md:text-9xl font-bold text-center py-20 cursor-pointer transition-colors duration-300 select-none"
          @click="next"
          v-longpress="showOptions"
      >
        {{ current }}
      </div>
      <div class="bg-indigo-600 text-white py-4 px-6 flex justify-between items-center">
        <span class="text-lg font-semibold">{{ project }}</span>
        <span class="text-sm">剩余：{{ getUndoStack().size() }}</span>
      </div>
    </div>

    <transition name="fade">
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" v-if="show" @click="show = false">
        <div class="bg-white rounded-lg shadow-xl p-6 w-80">
          <h2 class="text-2xl font-bold mb-4 text-center text-indigo-600">选项菜单</h2>
          <div v-if="!isWrongs">
            <button @click="prev" class="w-full py-3 mb-3 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors duration-300">上一个</button>
            <button @click="addWrongs" class="w-full py-3 mb-3 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors duration-300">加入错题本</button>
            <button v-show="hasWrongs" @click="openWrongs" class="w-full py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-300">
              进入错题本 {{ `[${wrongs.length}个]` }}
            </button>
          </div>
          <div v-else>
            <button @click="prev" class="w-full py-3 mb-3 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors duration-300">上一个</button>
            <button @click="removeCurrentWrong" class="w-full py-3 mb-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-300">
              记住了，移出：<span class="font-bold">{{ current }}</span>
            </button>
            <button @click="clearAll" class="w-full py-3 mb-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-300">清空错题本</button>
            <button @click="exitWrongs" class="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-300">退出错题本</button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="scale">
      <div v-if="showCompletionModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl p-6 w-80 transform transition-all duration-300 ease-in-out" :class="{ 'scale-100 opacity-100': showCompletionModal, 'scale-95 opacity-0': !showCompletionModal }">
          <h2 class="text-2xl font-bold mb-4 text-center text-indigo-600">恭喜你！</h2>
          <p class="text-lg text-center mb-6">你已经完成了所有的题目！</p>
          <div class="flex justify-center">
            <button @click="resetPractice" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              重新开始
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>

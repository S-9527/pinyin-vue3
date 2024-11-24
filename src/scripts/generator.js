import pinyin from "pinyin"
import * as fs from "node:fs";


const data = fs
    .readFileSync("./source.txt", "utf-8")
    .replace(/\s*/g, "")

const result = []
for (const c of data) {
    result.push(pinyin.default(c)[0][0])
}

fs.writeFileSync("../assets/data.ts", `export default ${JSON.stringify(result)}`)
console.log('生成成功')
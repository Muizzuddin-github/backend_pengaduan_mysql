import path from "path"
import { fileURLToPath } from "url"

const getDirName = () => {
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    const __dirname2 = path.dirname(__dirname)
    return __dirname2
}

export default getDirName
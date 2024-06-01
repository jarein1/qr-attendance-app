import * as path from "path";
import * as url from "url";

// generating the path to the root directory (aka. attendace-register folder)
const __dirpath = path.join(
    path.dirname(url.fileURLToPath(
        import.meta.url)),
    ".."
);

// exporting the path for other files to use it
export { __dirpath };
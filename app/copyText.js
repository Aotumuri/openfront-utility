var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function copyText(value) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const fallbackCopy = () => {
            const temp = document.createElement("textarea");
            temp.value = value;
            temp.style.position = "fixed";
            temp.style.opacity = "0";
            document.body.appendChild(temp);
            temp.focus();
            temp.select();
            document.execCommand("copy");
            temp.remove();
        };
        if ((_a = navigator.clipboard) === null || _a === void 0 ? void 0 : _a.writeText) {
            try {
                yield navigator.clipboard.writeText(value);
            }
            catch (_b) {
                fallbackCopy();
            }
        }
        else {
            fallbackCopy();
        }
        document.dispatchEvent(new CustomEvent("pattern:copied"));
    });
}

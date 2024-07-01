console.log(`SEAL is swimming here!!`);
console.log(`
        ⏜
        ⎛ ◕ᴥ◕⎞   ---------------  ⎛◕ᴥ◕ ⎞
        ⎝ ⊃   ⊃ | @超可愛小海豹  | ⊂   ⊂ ⎠
         \\   ⎠   ---------------  ⎝   /
          \\ /       |陳奕銓|        \ /
           ω                        ω
`);

// content.js

let isHoverEnabled = false; // 默认关闭鼠标悬停功能
let lastPrintedWord = null; // 存储最后一次打印的单词
let isTemporarilyEnabled = false; // 用于存储 Alt 键按下时的临时状态
let hoverTimeout; // 用于存储悬停计时器
const delay = 200;

document.addEventListener('mousemove', function (event) {
    if (!isHoverEnabled && !isTemporarilyEnabled) return; // 如果功能关闭，则不执行任何操作

    clearTimeout(hoverTimeout); // 清除之前的计时器

    let element = document.elementFromPoint(event.clientX, event.clientY);
    if (element) {
        hoverTimeout = setTimeout(() => captureWord(element, event.clientX, event.clientY), delay);
    }
});

document.addEventListener('keydown', function (event) {
    if (event.altKey && event.key === 'w') {
        isHoverEnabled = !isHoverEnabled; // 切换功能开关
        console.log(`Mouse hover dictionary is now ${isHoverEnabled ? 'enabled' : 'disabled'}.`);
    }
    if (event.ctrlKey && !isHoverEnabled && !isTemporarilyEnabled) {
        isTemporarilyEnabled = true;
        console.log(`Mouse hover dictionary is now temporarily enabled.`);
    }
});

document.addEventListener('keyup', function (event) {
    if (!event.ctrlKey && isTemporarilyEnabled) {
        isTemporarilyEnabled = false;
        console.log(`Mouse hover dictionary temporary state disabled.`);
    }
});

document.addEventListener('mouseup', function (event) {
    if (event.altKey) {
        let selectedText = window.getSelection().toString().trim();
        if (selectedText) {
            removeExistingBox();
            let box = createBox(selectedText, event.clientX, event.clientY);
            document.body.appendChild(box);

            setTimeout(() => {
                window.addEventListener('click', handleClickOutsideBox, true);
            }, 10);
        }
    }
});

function captureWord(element, x, y) {
    const pattern = /[^a-zA-Z0-9'-]/;

    // 获取元素内部的纯文本内容
    let text = element.textContent || element.innerText || "";
    let range = document.createRange();

    // 遍历子节点以找到鼠标悬停的文本节点
    let textNode = null;
    for (let node of element.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
            range.selectNodeContents(node);
            let rects = range.getClientRects();
            for (let rect of rects) {
                if (rect.left <= x && rect.right >= x && rect.top <= y && rect.bottom >= y) {
                    textNode = node;
                    break;
                }
            }
        } else {
            range.selectNodeContents(node);
            let rects = range.getClientRects();
            for (let rect of rects) {
                if (rect.left <= x && rect.right >= x && rect.top <= y && rect.bottom >= y) {
                    textNode = node;
                    break;
                }
            }
        }
        if (textNode) break;
    }

    if (textNode) {
        let textContent = textNode.nodeType === Node.TEXT_NODE ? textNode.textContent : textNode.innerText;
        let wordRange = document.caretRangeFromPoint(x, y);

        if (wordRange) {
            let startOffset = wordRange.startOffset;
            let [wordStart, wordEnd] = findWordBoundaries(textContent, startOffset);
            let word = textContent.substring(wordStart, wordEnd).replace(pattern, ''); // 去除除字母、數字、'和-以外的所有字符

            if (word && word !== lastPrintedWord) { // 檢查是否與上次打印的單詞不同
                // console.log(word);
                lastPrintedWord = word; // 更新最後一次打印的單詞

                let sel = window.getSelection();
                sel.removeAllRanges(); // 清除舊的選擇範圍
                let highlightRange = document.createRange();
                highlightRange.setStart(textNode, wordStart);
                highlightRange.setEnd(textNode, wordEnd);
                sel.addRange(highlightRange); // 添加新的選擇範圍

                removeExistingBox(); // 移除旧的弹出窗口
                let box = createBox(word, x, y);
                document.body.appendChild(box);

                setTimeout(() => {
                    window.addEventListener('click', handleClickOutsideBox, true);
                }, 10);
            }
        }
    }

    range.detach(); // 清理範圍
}

function findWordBoundaries(text, pos) {
    const pattern = /[^a-zA-Z0-9'-]/;
    let start = pos;
    let end = pos;

    // 往左找到單詞開始，忽略指定標點
    while (start > 0 && !/\s/.test(text[start - 1]) && !pattern.test(text[start - 1])) {
        start--;
    }

    // 往右找到單詞結尾，同樣忽略指定標點
    while (end < text.length && !/\s/.test(text[end]) && !pattern.test(text[end])) {
        end++;
    }

    return [start, end];
}

function createBox(text, x, y) {
    let box = document.createElement('div');
    box.textContent = '搜尋中…';
    box.style.position = 'absolute';
    box.style.left = `${x + window.scrollX}px`; // 考虑页面滚动
    box.style.top = `${y + 10 + window.scrollY}px`; // 考虑页面滚动
    box.style.backgroundColor = 'black';
    box.style.border = 'none';
    box.style.borderRadius = '10px';
    box.style.padding = '30px';
    box.style.color = 'white';
    box.style.boxShadow = '0px 0px 30px 0px rgba(0, 0, 0, 0.5)';
    box.style.zIndex = 1000000;
    box.style.maxWidth = '50vw';
    box.style.fontFamily = 'Arial, sans-serif';
    box.id = 'text-selection-box';

    chrome.runtime.sendMessage({ action: "searchDictionary", text: text }, function (response) {
        const dictionaryContent = document.createElement('div');
        dictionaryContent.innerHTML = response;
        box.textContent = '';
        box.appendChild(dictionaryContent);

        box.querySelectorAll('.EXAMPLE-toggle').forEach(function (toggle) {
            toggle.addEventListener('click', function () {
                toggle.innerHTML = toggle.innerHTML === '顯示例句' ? '隱藏例句' : '顯示例句';
                const targetId = toggle.getAttribute('data-target');
                const targetElement = document.getElementById(targetId);
                targetElement.style.display = targetElement.style.display === 'none' ? 'block' : 'none';
            });
        });
    });

    return box;
}

function handleClickOutsideBox(event) {
    let box = document.getElementById('text-selection-box');
    if (box && !box.contains(event.target)) {
        box.remove();
        window.removeEventListener('click', handleClickOutsideBox, true);
    }
}

function removeExistingBox() {
    window.removeEventListener('click', handleClickOutsideBox, true);
    let existingBox = document.getElementById('text-selection-box');
    if (existingBox) {
        existingBox.remove();
    }
}

document.addEventListener('mouseup', function (e) {
    let selectedText = window.getSelection().toString().trim();
    if (selectedText.length > 0 && e.altKey) {
        removeExistingBox();
        let box = createBox(selectedText, e.pageX, e.pageY);
        console.log(`SEAL is swimming here!!`);
        console.log(`
        ⏜
        ⎛ ◕ᴥ◕⎞   ---------------  ⎛◕ᴥ◕ ⎞
        ⎝ ⊃   ⊃ | @超可愛小海豹  | ⊂   ⊂ ⎠
         \\   ⎠   ---------------  ⎝   /
          \\ /       |陳奕銓|        \ /
           ω                        ω
        `);
        document.body.appendChild(box);

        setTimeout(() => {
            window.addEventListener('click', handleClickOutsideBox, true);
        }, 10);
    }
});


function createBox(text, x, y) {
    let box = document.createElement('div');
    box.textContent = '搜尋中…';
    box.style.position = 'absolute';
    box.style.left = `${x}px`;
    box.style.top = `${y+10}px`;
    box.style.backgroundColor = 'black';
    box.style.border = 'none';
    box.style.borderRadius = '10px'
    box.style.padding = '30px';
    box.style.color = 'white';
    box.style.boxShadow = '0px 0px 30px 0px rgba(0, 0, 0, 0.5)';
    box.style.zIndex = 1000000;
    box.style.maxWidth = '50vw';
    box.style.fontFamily = 'Arial, sans-serif'
    box.id = 'text-selection-box';
    
    
    chrome.runtime.sendMessage({action: "searchDictionary", text: text}, function(response) {
        const dictionaryContent = document.createElement('div');
        dictionaryContent.innerHTML = response;
        box.textContent = '';
        box.appendChild(dictionaryContent);

        box.querySelectorAll('.EXAMPLE-toggle').forEach(function(toggle) {
            toggle.addEventListener('click', function() {
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
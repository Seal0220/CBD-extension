chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.action === "searchDictionary") {
            searchCambridgeDictionary(request.text).then(sendResponse);
            return true;
        }
    }
);

function hashJoaat(b){for(var a=0,c=b.length;c--;)a+=b.charCodeAt(c),a+=a<<10,a^=a>>6;a+=a<<3;a^=a>>11;return((a+(a<<15)&4294967295)>>>0).toString(16)};

function searchCambridgeDictionary(text) {
    console.log('search ' + text);
    const url = 'https://dictionary.cambridge.org/zht/詞典/英語-漢語-繁體/' + text;

    return new Promise((resolve, reject) => {
        fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            }
        })
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const targetDiv = doc.querySelectorAll('.entry .entry-body .pr.entry-body__el');

                let styled = document.createElement('style');
                styled.innerHTML = `
                    .EXAMPLE-toggle {
                        width: fit-content;
                        margin: 0 0 10px 10px;
                        background-color: #1c1c1c;
                        border-radius: 30px;
                        padding: 5px 10px;
                        cursor: pointer;
                        font-size: 12px;
                    }
                    .EXAMPLE-toggle:hover {
                        background-color: #292929;
                    }

                    #OPEN {
                        width: 20px;
                        height: 20px;
                        right: 0; 
                        position: absolute; 
                        z-index: 1000001;
                        padding: 5px;
                        border-radius: 30px;
                        background-color: black;
                        cursor: pointer;
                        display: flex;
                        align-items: center; 
                        justify-content: center;
                        box-shadow: 0px 0px 30px 0px rgba(0, 0, 0, 0.5);
                    }
                    #OPEN:hover {
                        background-color: #141414;
                    }
                `;

                let beautifulDiv = document.createElement('div');
                beautifulDiv.style.display = 'flex';
                beautifulDiv.style.flexDirection = 'column';
                beautifulDiv.style.gap = '20px';
                beautifulDiv.appendChild(styled);
                beautifulDiv.innerHTML += `
                    <div id="OPEN" style="transform: translate(0px, -65px);">
                        <a href="${url}" target="_blank">
                            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="auto" height="auto" viewBox="0 0 24 24">
                                <path fill="white" d="M 5 3 C 3.9069372 3 3 3.9069372 3 5 L 3 19 C 3 20.093063 3.9069372 21 5 21 L 19 21 C 20.093063 21 21 20.093063 21 19 L 21 12 L 19 12 L 19 19 L 5 19 L 5 5 L 12 5 L 12 3 L 5 3 z M 14 3 L 14 5 L 17.585938 5 L 8.2929688 14.292969 L 9.7070312 15.707031 L 19 6.4140625 L 19 10 L 21 10 L 21 3 L 14 3 z"></path>
                            </svg>
                        </a>
                    </div>
                `
                
                if (targetDiv.length !== 0) {
                    targetDiv.forEach(ele => {
                        console.log(ele)
                        let textDict = {
                            text: ele.querySelector('.pos-header .hw.dhw')?.textContent.trim() || '',
                            attr: ele.querySelector('.pos-header .pos.dpos')?.textContent.trim() || '',
                            UKaccent: `/${ele.querySelector('.pos-header .uk .ipa.dipa.lpr-2.lpl-1')?.textContent.trim() || ''}/`,
                            USaccent: `/${ele.querySelector('.pos-header .us .ipa.dipa.lpr-2.lpl-1')?.textContent.trim() || ''}/`,
                            content: Array.from(ele.querySelectorAll('.pos-body .pr.dsense')).map(contentEle => {
                                return {
                                    level: contentEle.querySelector('.ddef_h .epp-xref.dxref')?.textContent.trim() || '',
                                    translation: contentEle.querySelector('.def-body .trans')?.textContent.trim() || '',
                                    define: contentEle.querySelector('.ddef_h .def.ddef_d.db')?.textContent.trim() || '',
                                    examples: Array.from(contentEle.querySelectorAll('.def-body .examp.dexamp')).map(exampleEle => {
                                        return {
                                            example: exampleEle.querySelector('.eg')?.textContent.trim() || '',
                                            example_translation: exampleEle.querySelector('.trans')?.textContent.trim() || '',
                                        }
                                    }),
                                }
                            }),

                        }

                        let eleDiv = `
                            <div>
                                <div id="TITLE">
                                    <div id="TITLE-TEXT" style="font-size:16px; font-weight: 900; margin-bottom: 10px;">${textDict.text}</div>
                                    <div id="TITLE-ATTR" style="color: #c9c9c9; display: flex; align-items: left; font-size:12px; font-weight: 600; margin-bottom: 5px;">
                                        <div>${textDict.attr}</div>
                                        <div id="TITLE-ACCENT" style="color: #a1a1a1; font-size:10px; font-weight: 300; margin: 1px 0 0 10px;">
                                            [UK: ${textDict.UKaccent}] [US: ${textDict.USaccent}]
                                        </div>
                                    </div>
                                </div>
                                <hr style="margin: 5px 0 12px 0;"/>
                                <div id="CONTENTS" style="display: flex; flex-direction: column; gap: 15px;">
                                    ${textDict.content.map(contentEle => {
                                        return `
                                            <div id="CONTENT">
                                                <div style="margin-bottom: 15px;">
                                                    <div id="DEFINE">
                                                        <div style="width: fit-content; font-size:14px; font-weight: 800; padding: 5px 10px; color: black; background-color: white; border-radius: 30px; margin-bottom: 5px;">${contentEle.translation}</div>
                                                        <div style="font-size: 13px; font-weight: 300; margin: 0 0 12px 10px; color: #a1a1a1; display: flex; align-items: left;">
                                                            <div style="display: flex; align-items: center; justify-content: center; width: fit-content; font-size: 10px; font-weight: 600; padding: 2px 5px; color: black; background-color: #c9c9c9; border-radius: 10px; margin-right: 7px;">
                                                                ${contentEle.level}
                                                            </div>
                                                            <div>${contentEle.define}</div>
                                                        </div>
                                                    </div>
                                                    ${contentEle.examples.length !== 0? (() => {
                                                        let contentDefineHash = hashJoaat(contentEle.define);
                                                        return `
                                                            <div id="EXAMPLE">
                                                                <div class="EXAMPLE-toggle" data-target="${contentDefineHash}">顯示例句</div>
                                                                <div id="${contentDefineHash}" style="margin-left: 10px; display: none; background-color: #1c1c1c; border-radius: 10px; width: calc(100% - 20px); padding: 20px; box-sizing: border-box;">
                                                                    <ul style="color: #c9c9c9; list-style-type: disc; margin-left: 20px;">
                                                                        ${contentEle.examples.map(exampleEle => {
                                                                            return `
                                                                                <li>
                                                                                    <div style="width: fit-content; font-size:12px; font-weight: 700; margin-bottom: 3px;">${exampleEle.example}</div>
                                                                                    <div style="font-size:11px; font-weight: 300; margin: 0 0 10px 10px;">${exampleEle.example_translation}</div>
                                                                                </li>
                                                                            `
                                                                        }).join('')}
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        ` ;
                                                    })(): ''}
                                                </div>
                                            </div>
                                        `
                                    }).join('')}
                                </div>
                            </div>
                        `

                        beautifulDiv.innerHTML += eleDiv;
                    });

                    resolve(beautifulDiv.outerHTML);
                } else {
                    resolve('未找到匹配的單字');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                reject(error);
            });
    });
}

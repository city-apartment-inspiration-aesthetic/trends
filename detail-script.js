document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const keywordFromQuery = params.get('q') || '';
    
    // Menghapus angka dan tanda strip di akhir parameter URL
    const cleanQuery = keywordFromQuery.replace(/-\d+$/, '');
    
    if (!cleanQuery) {
        runAGC('');
        return;
    }

    const targetHtml = cleanQuery + '.html';

    fetch(targetHtml)
        .then(response => {
            if (response.ok) {
                return response.text();
            }
            throw new Error('File not found');
        })
        .then(htmlData => {
            document.open();
            document.write(htmlData);
            document.close();
        })
        .catch(error => {
            const keyword = cleanQuery.replace(/-/g, ' ').trim();
            runAGC(keyword);
        });

    function runAGC(keyword) {
        const detailTitle = document.getElementById('detail-title');
        const detailImageContainer = document.getElementById('detail-image-container');
        const detailBody = document.getElementById('detail-body');
        
        const displayedKeywords = new Set();
        let suggestionsList = [];

        if (keyword) {
            displayedKeywords.add(keyword.toLowerCase());
        }
        
        function capitalizeEachWord(str) { 
            if (!str) return ''; 
            return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '); 
        }
        
        function generateSeoTitle(baseKeyword) { 
            const hookWords = ['Beautiful', 'Aesthetic', 'Modern', 'Minimalist', 'Cozy', 'Elegant', 'Luxury', 'Creative', 'Stunning', 'Inspiring']; 
            const suffixWords = ['Home Decor', 'Design Ideas', 'Interior Inspo', 'Room Decor', 'Decorating Tips'];
            const randomHook = hookWords[Math.floor(Math.random() * hookWords.length)]; 
            const randomSuffix = suffixWords[Math.floor(Math.random() * suffixWords.length)];
            return `${randomHook} ${capitalizeEachWord(baseKeyword)} ${randomSuffix}`; 
        }

        function fetchDescriptionTemplate(term, title) {
            fetch('deskripsi.txt')
                .then(response => response.text())
                .then(data => {
                    const templates = data.split('---').map(t => t.trim()).filter(t => t.length > 0);
                    if(templates.length > 0) {
                        const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
                        let parsedText = processSpintax(randomTemplate);
                        parsedText = parsedText.replace(/%keyword%/g, `<strong>${capitalizeEachWord(term)}</strong>`);
                        
                        const htmlContent = parsedText.split('\n').map(line => `<p>${line}</p>`).join('');
                        if(detailBody) detailBody.innerHTML = htmlContent;
                    } else {
                        fallbackDescription(term);
                    }
                })
                .catch(() => fallbackDescription(term));
        }

        function fallbackDescription(term) {
            const spintaxArticleTemplate = `{Discover|Explore} the best <strong>${capitalizeEachWord(term)}</strong> {home decor|interior design} ideas to {instantly upgrade|beautifully elevate} your {living space|room}.`;
            if(detailBody) detailBody.innerHTML = `<p>${processSpintax(spintaxArticleTemplate)}</p>`;
        }

        function processSpintax(text) {
            const spintaxPattern = /{([^{}]+)}/g;
            while (spintaxPattern.test(text)) {
                text = text.replace(spintaxPattern, (match, choices) => {
                    const options = choices.split('|');
                    return options[Math.floor(Math.random() * options.length)];
                });
            }
            return text;
        }

        if (!keyword) { 
            if(detailTitle) detailTitle.textContent = 'Decor Idea Not Found'; 
            if(detailBody) detailBody.innerHTML = '<p>Sorry, the requested decor idea could not be found. Please return to the <a href="index.html">homepage</a>.</p>'; 
            return; 
        }

        function populateMainContent(term) {
            const newTitle = generateSeoTitle(term);
            document.title = `${newTitle} | Home Decor Ideas`;
            if(detailTitle) detailTitle.textContent = newTitle;

            // Rasio gambar utama menjadi 2:3 (width 600, height 900)
            const queryImage = term + " home decor interior";
            const mainImageUrl = `https://tse1.mm.bing.net/th?q=${encodeURIComponent(queryImage)}&w=600&h=900&c=7&rs=1&p=0&dpr=1.5&pid=1.7`;
            
            // Membungkus gambar dengan link yang mengarah ke detail.html?q=
            if(detailImageContainer) {
                detailImageContainer.innerHTML = `<a href="detail.html?q="><img src="${mainImageUrl}" alt="${newTitle}" style="width:100%; border-radius:8px; object-fit:cover; aspect-ratio: 2/3;"></a>`;
            }

            fetchDescriptionTemplate(term, newTitle);
        }

        function generateRelatedPosts(term) {
            const script = document.createElement('script');
            script.src = `https://suggestqueries.google.com/complete/search?client=youtube&jsonp=handleRelatedSuggest&hl=en&q=${encodeURIComponent(term + " home decor")}`;
            document.head.appendChild(script);
            script.onload = () => script.remove();
            script.onerror = () => { 
                script.remove(); 
                appendRandomKeywords();
            }
        }

        window.handleRelatedSuggest = function(data) {
            const suggestions = data[1];
            
            if (suggestions && suggestions.length > 0) {
                suggestions.forEach(item => {
                    const relatedTerm = typeof item === 'string' ? item : item[0];
                    let cleanTerm = relatedTerm ? relatedTerm.replace(/home decor/gi, '').trim() : '';
                    if (!cleanTerm) cleanTerm = relatedTerm;

                    const termLower = cleanTerm.toLowerCase();
                    
                    if (termLower && !displayedKeywords.has(termLower)) {
                        suggestionsList.push(cleanTerm);
                        displayedKeywords.add(termLower);
                    }
                });
            }
            appendRandomKeywords();
        };

        function appendRandomKeywords() {
            fetch('keyword.txt')
                .then(response => response.text())
                .then(data => {
                    const keywords = data.split('\n')
                        .map(k => k.trim())
                        .filter(k => k.length > 0 && !displayedKeywords.has(k.toLowerCase()));
                    
                    // Shuffle keyword.txt
                    for (let i = keywords.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [keywords[i], keywords[j]] = [keywords[j], keywords[i]];
                    }
                    
                    // Siapkan array pembagian 4 teratas dan 6 bawah
                    let topItems = suggestionsList.slice(0, 4);
                    let neededForTop = 4 - topItems.length;
                    
                    let bottomItems = [];
                    let keywordIndex = 0;

                    // Penuhi kekurangan 4 pertama bila suggest tidak sampai 4
                    while(neededForTop > 0 && keywordIndex < keywords.length) {
                        topItems.push(keywords[keywordIndex]);
                        displayedKeywords.add(keywords[keywordIndex].toLowerCase());
                        keywordIndex++;
                        neededForTop--;
                    }

                    // Ambil 6 sisanya untuk bagian bawah
                    while(bottomItems.length < 6 && keywordIndex < keywords.length) {
                        bottomItems.push(keywords[keywordIndex]);
                        displayedKeywords.add(keywords[keywordIndex].toLowerCase());
                        keywordIndex++;
                    }
                    
                    renderCards(topItems, 'related-posts-top');
                    renderCards(bottomItems, 'related-posts-bottom');
                })
                .catch(error => {
                    console.error('Gagal mengambil keyword.txt:', error);
                });
        }

        function renderCards(items, containerId) {
            const container = document.getElementById(containerId);
            if(!container) return;
            
            items.forEach(term => {
                const keywordForUrl = term.replace(/\s/g, '-').toLowerCase();
                const linkUrl = `detail.html?q=${encodeURIComponent(keywordForUrl)}`;
                
                // Rasio gambar 2:3 untuk thumbnail (400x600)
                const queryImage = term + " home decor";
                const imageUrl = `https://tse1.mm.bing.net/th?q=${encodeURIComponent(queryImage)}&w=400&h=600&c=7&rs=1&p=0&dpr=1.5&pid=1.7`;
                
                const newRelatedTitle = generateSeoTitle(term);
                // Menggunakan div.normal-title, bukan h3
                const card = `<article class="content-card"><a href="${linkUrl}"><img src="${imageUrl}" alt="${newRelatedTitle}" loading="lazy"><div class="content-card-body"><div class="normal-title">${newRelatedTitle}</div></div></a></article>`;
                container.innerHTML += card;
            });
        }

        populateMainContent(keyword);
        generateRelatedPosts(keyword);
    }
});

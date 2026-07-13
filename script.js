document.addEventListener('DOMContentLoaded', function() {
    let allKeywords = [];
    let currentIndex = 0;
    const batchSize = 15;
    let isLoading = false;
    const contentContainer = document.getElementById('auto-content-container');
    const loader = document.getElementById('loader');
        
    function shuffleArray(array) { 
        for (let i = array.length - 1; i > 0; i--) { 
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; 
        } 
    }
    
    function capitalizeEachWord(str) { 
        if (!str) return ''; 
        return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '); 
    }

    function loadKeywords() {
        fetch('keyword.txt')
            .then(response => response.text())
            .then(data => {
                allKeywords = data.split('\n').map(k => k.trim()).filter(k => k.length > 0);
                shuffleArray(allKeywords);
                loadMoreContent();
            })
            .catch(error => {
                console.error('Error loading keywords:', error);
                if(loader) loader.textContent = 'Failed to load content.';
            });
    }

    function generateSeoTitle(baseKeyword) {
        const hookWords = ['Beautiful', 'Aesthetic', 'Modern', 'Minimalist', 'Cozy', 'Elegant', 'Luxury', 'Creative', 'Stunning', 'Inspiring'];
        const suffixWords = ['Home Decor', 'Design Ideas', 'Interior Inspo', 'Room Decor', 'Decorating Tips'];
        const randomHook = hookWords[Math.floor(Math.random() * hookWords.length)];
        const randomSuffix = suffixWords[Math.floor(Math.random() * suffixWords.length)];
        return `${randomHook} ${capitalizeEachWord(baseKeyword)} ${randomSuffix}`;
    }

    function loadMoreContent() {
        if (isLoading || currentIndex >= allKeywords.length) return;
        isLoading = true;
        if(loader) loader.style.display = 'block';

        const endIndex = Math.min(currentIndex + batchSize, allKeywords.length);
        const fragment = document.createDocumentFragment();

        for (let i = currentIndex; i < endIndex; i++) {
            const keyword = allKeywords[i];
            const title = generateSeoTitle(keyword);
            const keywordForUrl = keyword.replace(/\s/g, '-').toLowerCase();
            const linkUrl = `detail.html?q=${encodeURIComponent(keywordForUrl)}`;
            
            // Rasio gambar diubah mencari rasio 2:3 -> 400x600
            const queryImage = keyword + " home decor interior";
            const imageUrl = `https://tse1.mm.bing.net/th?q=${encodeURIComponent(queryImage)}&w=400&h=600&c=7&rs=1&p=0&dpr=1.5&pid=1.7`;

            const article = document.createElement('article');
            article.className = 'content-card';
            // Menyesuaikan judul untuk memakai div text normal
            article.innerHTML = `
                <a href="${linkUrl}">
                    <img src="${imageUrl}" alt="${title}" loading="lazy">
                    <div class="content-card-body">
                        <div class="normal-title">${title}</div>
                    </div>
                </a>
            `;
            fragment.appendChild(article);
        }

        if(contentContainer) contentContainer.appendChild(fragment);
        currentIndex = endIndex;
        isLoading = false;
        
        if (currentIndex >= allKeywords.length) {
            if(loader) loader.style.display = 'none';
        }
    }

    window.addEventListener('scroll', () => {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 100) {
            loadMoreContent();
        }
    });

    loadKeywords();
});

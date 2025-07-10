
// 自动生成目录
function generateTOC() {
    const content = document.querySelector('.report-content');
    const tocContent = document.getElementById('toc-content');
    
    if (!content || !tocContent) return;
    
    const headings = content.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    if (headings.length === 0) {
        document.querySelector('.toc').style.display = 'none';
        return;
    }
    
    const tocList = document.createElement('ul');
    
    headings.forEach((heading, index) => {
        if (!heading.id) {
            heading.id = 'heading-' + index;
        }
        
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#' + heading.id;
        a.textContent = heading.textContent;
        a.className = 'toc-' + heading.tagName.toLowerCase();
        
        li.appendChild(a);
        tocList.appendChild(li);
    });
    
    tocContent.appendChild(tocList);
}

// 平滑滚动
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// 滚动进度
function updateReadingProgress() {
    const content = document.querySelector('.report-content');
    const progressBar = document.getElementById('readingProgress');
    
    if (!content || !progressBar) return;
    
    const scrollTop = window.pageYOffset;
    const docHeight = content.offsetHeight;
    const winHeight = window.innerHeight;
    const scrollPercent = scrollTop / (docHeight - winHeight);
    const scrollPercentRounded = Math.round(scrollPercent * 100);
    
    progressBar.style.width = Math.min(scrollPercentRounded, 100) + '%';
}

// 回到顶部按钮
function setupBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    
    if (!backToTopBtn) return;
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// 代码复制功能
function setupCodeCopy() {
    document.querySelectorAll('pre code').forEach(block => {
        const button = document.createElement('button');
        button.textContent = '复制';
        button.style.cssText = `
            position: absolute;
            top: 8px;
            right: 8px;
            background: #374151;
            color: white;
            border: none;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
            opacity: 0.8;
            transition: opacity 0.2s;
        `;
        
        const pre = block.parentElement;
        if (pre) {
            pre.style.position = 'relative';
            pre.appendChild(button);
            
            button.addEventListener('click', () => {
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(block.textContent || '').then(() => {
                        button.textContent = '已复制';
                        setTimeout(() => {
                            button.textContent = '复制';
                        }, 2000);
                    });
                }
            });
            
            button.addEventListener('mouseenter', () => {
                button.style.opacity = '1';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.opacity = '0.8';
            });
        }
    });
}

// 高亮当前章节
function highlightCurrentSection() {
    const headings = document.querySelectorAll('.report-content h1, .report-content h2, .report-content h3');
    const tocLinks = document.querySelectorAll('.toc a');
    
    let current = '';
    
    headings.forEach(heading => {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 100) {
            current = heading.id;
        }
    });
    
    tocLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
}

// 侧边栏切换
function setupSidebarToggle() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebarToggle && sidebar && overlay) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('active');
        });
        
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });
    }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    generateTOC();
    setupSmoothScroll();
    setupBackToTop();
    setupCodeCopy();
    setupSidebarToggle();
    
    // 滚动事件监听
    window.addEventListener('scroll', () => {
        updateReadingProgress();
        highlightCurrentSection();
    });
    
    // 初始化进度和高亮
    updateReadingProgress();
    highlightCurrentSection();
});

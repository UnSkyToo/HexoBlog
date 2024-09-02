// 折叠面板功能
document.querySelectorAll('.accordion').forEach(button => {
    button.addEventListener('click', () => {
        const panel = button.nextElementSibling;
        const isActive = button.classList.contains('active');

        // Toggle the panel
        panel.style.display = isActive ? 'none' : 'block';

        // Toggle the active class
        button.classList.toggle('active', !isActive);
    });
});

// 搜索功能
document.getElementById('search').addEventListener('input', (event) => {
    const query = event.target.value.toLowerCase();
    document.querySelectorAll('.category').forEach(category => {
        const links = category.querySelectorAll('a');
        let visible = false;
        links.forEach(link => {
            if (link.textContent.toLowerCase().includes(query)) {
                link.parentElement.style.display = 'block';
                visible = true;
            } else {
                link.parentElement.style.display = 'none';
            }
        });
        category.style.display = visible ? 'block' : 'none';
    });
});

// // 默认展开第一个分类
// document.addEventListener('DOMContentLoaded', () => {
//     const firstAccordion = document.querySelector('.accordion');
//     if (firstAccordion) {
//         const firstPanel = firstAccordion.nextElementSibling;
//         firstAccordion.classList.add('active');
//         firstPanel.style.display = 'block';
//     }
// });
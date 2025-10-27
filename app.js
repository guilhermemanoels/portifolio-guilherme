// Ano no footer
document.getElementById('year').textContent = new Date().getFullYear();

// Mobile menu
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
menuBtn?.addEventListener('click', () => {
    const open = !mobileMenu.classList.contains('pointer-events-none');
    if (open) {
        mobileMenu.classList.add('opacity-0', 'pointer-events-none');
        mobileMenu.classList.remove('scale-y-100', 'opacity-100');
        mobileMenu.classList.add('scale-y-0');
    } else {
        mobileMenu.classList.remove('opacity-0', 'pointer-events-none', 'scale-y-0');
        mobileMenu.classList.add('opacity-100', 'scale-y-100');
    }
});

// Baixar CV (substitua pelo seu arquivo .pdf quando tiver)
const cvLinks = [document.getElementById('dl-cv'), document.getElementById('dl-cv-mobile')].filter(Boolean);
cvLinks.forEach(el => el.addEventListener('click', (e) => {
    e.preventDefault();
    // Troque por: window.open('./Guilherme-Manoel-CV.pdf','_blank');
    alert('Adicione seu arquivo de CV e atualize o link neste botão.');
}));

// Filtro de projetos
const chips = document.querySelectorAll('.chip');
const cards = document.querySelectorAll('.project');
chips.forEach(chip => chip.addEventListener('click', () => {
    chips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    const filter = chip.dataset.filter;
    cards.forEach(card => {
        const tags = card.dataset.tags.split(' ');
        const show = filter === 'all' || tags.includes(filter);
        card.style.display = show ? '' : 'none';
    });
}));

// Interseção (animação de entrada dos cards)
const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
        }
    });
}, { threshold: .15 });
cards.forEach(c => io.observe(c));

// Modal de preview
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalImg = document.getElementById('modalImg');
const modalStack = document.getElementById('modalStack');
const modalClose = document.getElementById('modalClose');

document.querySelectorAll('.btn-link[data-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
        try {
            const data = JSON.parse(btn.dataset.modal);
            modalTitle.textContent = data.title || 'Projeto';
            modalDesc.textContent = data.desc || '';
            modalImg.src = data.img || '';
            modalStack.textContent = data.stack || '';
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        } catch (err) {
            console.error('Modal data inválido:', err);
        }
    });
});

modalClose.addEventListener('click', () => {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
});
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
});

// Formulário (mailto:)
const form = document.getElementById('contactForm');
form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const nome = fd.get('nome');
    const email = fd.get('email');
    const msg = fd.get('mensagem');
    const to = 'seuemail@exemplo.com'; // <-- troque para seu e-mail real
    const subject = encodeURIComponent(`Contato do Portfólio — ${nome}`);
    const body = encodeURIComponent(`Nome: ${nome}\nE-mail: ${email}\n\nMensagem:\n${msg}`);
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
});

// Copiar e-mail
const copyEmailBtn = document.getElementById('copyEmail');
const copyFeedback = document.getElementById('copyFeedback');
copyEmailBtn?.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText('seuemail@exemplo.com'); // <-- troque para seu e-mail
        copyFeedback.classList.remove('hidden');
        setTimeout(() => copyFeedback.classList.add('hidden'), 1800);
    } catch (e) {
        alert('Não foi possível copiar o e-mail.');
    }
});

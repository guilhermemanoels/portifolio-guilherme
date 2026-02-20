(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ===== CONFIG (opcional) =====
  // Se você tiver um endpoint real (Formspree, backend etc), coloque a URL aqui.
  // Ex.: const CONTACT_ENDPOINT = "https://formspree.io/f/xxxxxx";
  const CONTACT_ENDPOINT = ""; // vazio = modo demo

  // ===== YEAR =====
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ===== MOBILE MENU (A11y + click outside) =====
  const menuBtn = $("#menuBtn");
  const mobileMenu = $("#mobileMenu");

  function setMobileMenu(open) {
    if (!menuBtn || !mobileMenu) return;

    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");

    if (open) {
      mobileMenu.classList.remove("max-h-0", "opacity-0", "pointer-events-none");
      mobileMenu.classList.add("max-h-[520px]", "opacity-100");
    } else {
      mobileMenu.classList.add("max-h-0", "opacity-0", "pointer-events-none");
      mobileMenu.classList.remove("max-h-[520px]", "opacity-100");
    }
  }

  function isMenuOpen() {
    return menuBtn?.getAttribute("aria-expanded") === "true";
  }

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => setMobileMenu(!isMenuOpen()));

    // close on link click
    $$("#mobileMenu a").forEach((a) => a.addEventListener("click", () => setMobileMenu(false)));

    // close on ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setMobileMenu(false);
    });

    // close on click outside
    document.addEventListener("click", (e) => {
      if (!isMenuOpen()) return;
      const target = e.target;
      const clickedInside = mobileMenu.contains(target) || menuBtn.contains(target);
      if (!clickedInside) setMobileMenu(false);
    });
  }

  // ===== REVEAL PROJECTS =====
  const projects = $$(".project");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("in");
      });
    },
    { threshold: 0.12 }
  );
  projects.forEach((el) => io.observe(el));

  // ===== FILTER PROJECTS =====
  const chips = $$(".chip");
  const grid = $("#grid-projetos");

  function setActiveChip(chip) {
    chips.forEach((c) => {
      c.dataset.active = "false";
      c.setAttribute("aria-pressed", "false");
    });
    chip.dataset.active = "true";
    chip.setAttribute("aria-pressed", "true");
  }

  function normalizeTags(raw) {
    return (raw || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function applyFilter(filter) {
    projects.forEach((card) => {
      const tags = normalizeTags(card.dataset.tags);
      const show = filter === "all" || tags.includes(filter);
      card.style.display = show ? "" : "none";
    });

    // A11y: joga foco no grid pra leitor de tela perceber mudança
    if (grid) grid.focus();
  }

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      setActiveChip(chip);
      applyFilter(chip.dataset.filter || "all");
    });
  });

  // ===== MODAL (A11y: ESC, click outside, focus trap, restore focus) =====
  const modal = $("#modal");
  const modalTitle = $("#modalTitle");
  const modalDesc = $("#modalDesc");
  const modalImg = $("#modalImg");
  const modalStack = $("#modalStack");
  const modalClose = $("#modalClose");
  const modalPanel = $("#modal")?.querySelector('[tabindex="-1"]');

  let lastFocusEl = null;

  function getFocusable(container) {
    return $$(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      container
    ).filter((el) => !el.classList.contains("hidden") && el.offsetParent !== null);
  }

  function openModal(data, openerEl) {
    if (!modal) return;
    lastFocusEl = openerEl || document.activeElement;

    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    if (modalTitle) modalTitle.textContent = data.title || "Projeto";
    if (modalDesc) modalDesc.textContent = data.desc || "";
    if (modalStack) modalStack.textContent = data.stack || "";

    if (modalImg) {
      modalImg.src = data.img || "";
      modalImg.alt = data.title ? `Preview do projeto ${data.title}` : "Preview do projeto";
      modalImg.loading = "lazy";
      modalImg.decoding = "async";
    }

    // foco inicial
    const focusables = getFocusable(modal);
    (focusables[0] || modalClose || modalPanel || modal).focus?.();
  }

  function closeModal() {
    if (!modal) return;

    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    if (lastFocusEl?.focus) lastFocusEl.focus();
    lastFocusEl = null;
  }

  // Open modal buttons
  $$("[data-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      try {
        const data = JSON.parse(btn.getAttribute("data-modal") || "{}");
        openModal(data, btn);
      } catch {
        openModal({ title: "Projeto", desc: "Dados inválidos do modal." }, btn);
      }
    });
  });

  if (modalClose) modalClose.addEventListener("click", closeModal);

  if (modal) {
    // click outside (overlay)
    modal.addEventListener("click", (e) => {
      const target = e.target;
      if (target?.getAttribute?.("data-close") === "true") closeModal();
    });

    document.addEventListener("keydown", (e) => {
      if (modal.classList.contains("hidden")) return;

      if (e.key === "Escape") closeModal();

      // focus trap
      if (e.key === "Tab") {
        const focusables = getFocusable(modal);
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  // ===== CONTACT FORM (demo + endpoint opcional) =====
  const form = $("#contactForm");
  const status = $("#formStatus");
  const btnEnviar = $("#btnEnviar");

  async function sendToEndpoint(payload) {
    const res = await fetch(CONTACT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Falha no envio");
    return res;
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const fd = new FormData(form);

      // honeypot
      if ((fd.get("website") || "").toString().trim() !== "") return;

      const nome = (fd.get("nome") || "").toString().trim();
      const email = (fd.get("email") || "").toString().trim();
      const mensagem = (fd.get("mensagem") || "").toString().trim();

      if (!nome || !email || !mensagem) {
        if (status) status.textContent = "Por favor, preencha todos os campos.";
        return;
      }

      if (status) status.textContent = "Enviando...";
      if (btnEnviar) btnEnviar.disabled = true;

      try {
        if (CONTACT_ENDPOINT) {
          await sendToEndpoint({ nome, email, mensagem, createdAt: new Date().toISOString() });
        } else {
          // demo
          await new Promise((r) => setTimeout(r, 600));
        }

        form.reset();
        if (status) status.textContent = "Mensagem enviada! Vou te responder em breve 🙂";
      } catch {
        if (status) status.textContent = "Erro ao enviar. Tente novamente.";
      } finally {
        if (btnEnviar) btnEnviar.disabled = false;
      }
    });
  }
})();
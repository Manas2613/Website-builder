const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");
if (menuBtn && navLinks) {
  menuBtn.addEventListener("click", () => navLinks.classList.toggle("show"));
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => navLinks.classList.remove("show"));
  });
}

const revealEls = document.querySelectorAll(".reveal");
if (revealEls.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => observer.observe(el));
}

const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");
if (contactForm && formMessage) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    formMessage.textContent = "✅ Thank you! Your message has been received.";
    contactForm.reset();
  });
}

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

const briefForm = document.getElementById("briefForm");
if (briefForm) {
  briefForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(briefForm);
    const payload = Object.fromEntries(formData.entries());
    localStorage.setItem("webbuddyBrief", JSON.stringify(payload));
    window.location.href = "generated-site.html";
  });
}

const previewMount = document.getElementById("generatedPreview");
if (previewMount) {
  const raw = localStorage.getItem("webbuddyBrief");
  if (!raw) {
    previewMount.innerHTML = '<p class="mini-note">No brief found. <a href="website-brief.html">Fill website brief</a>.</p>';
  } else {
    const data = JSON.parse(raw);
    const sections = (data.sections || "Home, About, Services, Contact")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const tone = data.tone || "Professional";
    const colors = data.colors || "Black, gold, white";
    const businessName = data.businessName || "Your Brand";

    previewMount.innerHTML = `
      <div class="web-preview">
        <div class="bar">${businessName} • ${tone} Tone</div>
        <div class="body">
          <h3>${data.headline || "A premium experience for your customers"}</h3>
          <p>${data.description || "This generated draft website is tailored from your brief and ready for enhancement."}</p>
          <p><strong>Style:</strong> ${tone} | <strong>Colors:</strong> ${colors}</p>
          <p><strong>Requested features:</strong> ${data.features || "Contact form, animations, responsive layout"}</p>
          <div style="margin:.75rem 0;">
            ${sections.map((s) => `<span class="pill">${s}</span>`).join(" ")}
          </div>
          <hr style="margin:1rem 0; border:0; border-top:1px solid #eee;" />
          <h4>Sample content blocks</h4>
          <ul>
            <li>Hero with strong call-to-action</li>
            <li>Service cards aligned to your offer</li>
            <li>Trust/Testimonials area</li>
            <li>Contact section with conversion-focused form</li>
          </ul>
        </div>
      </div>
    `;
  }
}

const planTitle = document.getElementById("planTitle");
if (planTitle) {
  const params = new URLSearchParams(window.location.search);
  const plan = params.get("plan") || "pro";
  const config = {
    pro: { name: "Pro", price: "$1.99 / month" },
    plus: { name: "Plus", price: "$4.99 / month" }
  };
  const selected = config[plan] || config.pro;
  planTitle.textContent = `${selected.name} Plan Checkout`;
  const priceMount = document.getElementById("planPrice");
  if (priceMount) priceMount.textContent = selected.price;
}

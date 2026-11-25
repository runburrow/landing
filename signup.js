// Self-serve sign-up: the form posts to the Burrow fleet, which creates the
// instance and emails its details. Without JS the form still posts and the
// fleet answers with a plain page. With JS it checks the address as you
// type and shows the answer in place.
(() => {
  "use strict";
  const form = document.querySelector("[data-signup]");
  if (!form) return;
  const fleet = form.dataset.fleet.replace(/\/$/, "");
  const sub = form.elements.subdomain;
  const email = form.elements.email;
  const help = form.querySelector("[data-subdomain-help]");
  const status = form.querySelector("[data-signup-status]");
  const submit = form.querySelector("button[type=submit]");
  const helpText = help.textContent;

  // A referral code from /join/?c=<code> (the default link), /join/<code>
  // (where the host rewrites it), ?code= or ?ref=, or else from an earlier
  // visit to a join page, so it survives browsing around before signing up.
  const store = {
    get() { try { return localStorage.getItem("burrow-ref") || ""; } catch { return ""; } },
    set(v) { try { localStorage.setItem("burrow-ref", v); } catch { /* private mode */ } },
  };
  const codeRE = /^[a-z0-9]{4,32}$/;
  const fromPath = (location.pathname.match(/\/join\/([^/?#]+)/) || [])[1] || "";
  const query = new URLSearchParams(location.search);
  const fromQuery = query.get("c") || query.get("code") || query.get("ref") || "";
  const decode = (v) => { try { return decodeURIComponent(v).toLowerCase(); } catch { return ""; } }; // a stray "%" throws
  let ref = [fromPath, fromQuery].map(decode).find((v) => codeRE.test(v)) || "";
  if (ref) store.set(ref);
  else ref = codeRE.test(store.get()) ? store.get() : "";
  form.elements.ref.value = ref;
  document.querySelectorAll("[data-ref-code]").forEach((el) => { el.textContent = `Invite code ${ref}`; el.hidden = !ref; });

  const setHelp = (text, state) => {
    help.textContent = text;
    help.classList.toggle("is-ok", state === "ok");
    help.classList.toggle("is-bad", state === "bad");
    sub.setAttribute("aria-invalid", String(state === "bad"));
  };
  const show = (text, bad) => {
    status.hidden = false;
    status.textContent = text;
    status.classList.toggle("is-bad", !!bad);
  };

  // Lowercase as you type, and ask the fleet whether the address is free.
  let timer = 0;
  let asked = "";
  sub.addEventListener("input", () => {
    const v = sub.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (v !== sub.value) sub.value = v;
    window.clearTimeout(timer);
    if (!v) { setHelp(helpText); return; }
    if (!sub.checkValidity()) { setHelp("Lowercase letters, digits and dashes, starting and ending with a letter or digit.", "bad"); return; }
    timer = window.setTimeout(async () => {
      asked = v;
      try {
        const resp = await fetch(`${fleet}/_fleet/signup/check?subdomain=${encodeURIComponent(v)}`, { headers: { Accept: "application/json" } });
        const out = await resp.json();
        if (asked !== sub.value) return; // typed on since
        if (out.available) setHelp(`${v}.${form.dataset.domain} is free.`, "ok");
        else setHelp(out.reason || "That address isn't available.", "bad");
      } catch {
        setHelp(helpText); // can't reach the fleet; the submit will say why
      }
    }, 350);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!sub.value || !sub.checkValidity()) { setHelp("Pick an address first.", "bad"); sub.focus(); return; }
    if (!email.value || !email.checkValidity()) { show("Enter your email address. That's where your Burrow's details go.", true); email.focus(); return; }
    submit.disabled = true;
    const label = submit.textContent;
    submit.textContent = "Creating…";
    try {
      const resp = await fetch(form.action, { method: "POST", body: new URLSearchParams(new FormData(form)), headers: { Accept: "application/json" } });
      const out = await resp.json().catch(() => ({ ok: false, message: "Something went wrong on our side. Try again in a few minutes." }));
      show(out.message, !out.ok);
      if (out.ok) {
        [...form.elements].forEach((el) => { if (el.tagName === "INPUT") el.disabled = true; });
        submit.hidden = true;
      } else if (out.field && form.elements[out.field]) {
        if (out.field === "subdomain") setHelp(out.message, "bad");
        form.elements[out.field].focus();
      }
    } catch {
      show("Couldn't reach the server. Check your connection and try again, or email us instead.", true);
    } finally {
      submit.disabled = false;
      submit.textContent = label;
    }
  });
})();

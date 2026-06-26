(() => {
  const isPreviewable = (img) => {
    if (!img.src) return false;
    if (img.naturalWidth > 0 && img.naturalWidth <= 1 && img.naturalHeight <= 1) return false;
    const parent = img.parentElement;
    if (!parent) return true;
    if (parent.tagName === "A") {
      const href = parent.getAttribute("href") || "";
      const isExternalLink = /^https?:\/\//i.test(href);
      const isBlank = parent.getAttribute("target") === "_blank";
      // 父级是 a 且 target="_blank" 且 href 非 http/https 开头 → 可预览
      if (isBlank && !isExternalLink) return true;
      // 父级是 a 但不满足上述条件 → 不预览（让链接正常跳转）
      return false;
    }
    // 父级非 a 标签 → 可预览
    return true;
  };

  const getImageSrc = (img) => {
    return img.dataset.canonicalSrc || img.dataset.src || img.src;
  };

  const overlay = document.createElement("div");
  overlay.id = "gh-image-preview-overlay";
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 2147483647;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.75);
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s ease, visibility 0.2s ease;
    cursor: zoom-out;
  `;

  const previewImg = document.createElement("img");
  previewImg.style.cssText = `
    max-width: 92vw;
    max-height: 92vh;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.35);
    cursor: default;
    transition: transform 0.2s ease;
  `;

  const spinner = document.createElement("div");
  spinner.style.cssText = `
    position: absolute;
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: gh-preview-spin 0.8s linear infinite;
  `;

  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = "&#10005;";
  closeBtn.setAttribute("aria-label", "Close preview");
  closeBtn.style.cssText = `
    position: absolute;
    top: 16px;
    right: 16px;
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 50%;
    background: rgba(255,255,255,0.15);
    color: #fff;
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease;
    z-index: 1;
  `;
  closeBtn.onmouseenter = () => (closeBtn.style.background = "rgba(255,255,255,0.3)");
  closeBtn.onmouseleave = () => (closeBtn.style.background = "rgba(255,255,255,0.15)");

  const style = document.createElement("style");
  style.textContent = `
    @keyframes gh-preview-spin {
      to { transform: rotate(360deg); }
    }
    #gh-image-preview-overlay img {
      opacity: 0;
      transition: opacity 0.25s ease;
    }
    #gh-image-preview-overlay img.loaded {
      opacity: 1;
    }
  `;
  document.head.appendChild(style);

  overlay.appendChild(spinner);
  overlay.appendChild(previewImg);
  overlay.appendChild(closeBtn);
  document.body.appendChild(overlay);

  const show = () => {
    overlay.style.opacity = "1";
    overlay.style.visibility = "visible";
  };
  const hide = () => {
    overlay.style.opacity = "0";
    overlay.style.visibility = "hidden";
    previewImg.classList.remove("loaded");
    previewImg.src = "";
  };

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay || e.target === closeBtn) hide();
  });

  previewImg.addEventListener("click", (e) => e.stopPropagation());

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.style.visibility === "visible") hide();
  });

  previewImg.addEventListener("load", () => {
    spinner.style.display = "none";
    previewImg.classList.add("loaded");
  });

  previewImg.addEventListener("error", () => {
    spinner.style.display = "none";
    previewImg.alt = "Failed to load image";
  });

  const bindPreview = (img) => {
    img.style.cursor = "zoom-in";
    img.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const src = getImageSrc(img);
      if (!src) return;

      spinner.style.display = "block";
      previewImg.classList.remove("loaded");
      previewImg.src = src;
      show();
    });
  };

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        if (node.tagName === "IMG") {
          if (!node.dataset.ghPreview && isPreviewable(node)) {
            node.dataset.ghPreview = "1";
            bindPreview(node);
          }
        } else if (node.querySelectorAll) {
          node.querySelectorAll("img").forEach((img) => {
            if (!img.dataset.ghPreview && isPreviewable(img)) {
              img.dataset.ghPreview = "1";
              bindPreview(img);
            }
          });
        }
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });

  const init = () => {
    document.querySelectorAll("img").forEach((img) => {
      if (!img.dataset.ghPreview && isPreviewable(img)) {
        img.dataset.ghPreview = "1";
        bindPreview(img);
      }
    });
  };

  init();
})();

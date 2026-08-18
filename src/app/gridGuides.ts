export type GuideState = {
  isBlackEnabled: () => boolean;
  isCenterEnabled: () => boolean;
};

function injectGridGuideStyle() {
  if (document.getElementById("grid-guide-style")) return;
  const style = document.createElement("style");
  style.id = "grid-guide-style";
  style.textContent = `
      .cell.guide-v { border-left: 2px solid #222 !important; }
      .cell.guide-h { border-top: 2px solid #222 !important; }
      .cell.center-v { border-left: 2px solid red !important; }
      .cell.center-h { border-top: 2px solid blue !important; }
      .guide-btn-on { background: #222; color: #fff; font-weight: bold; }
      .guide-btn-off { background: #eee; color: #222; }
    `;
  document.head.appendChild(style);
}

export function setupGridGuides(
  toolbox: HTMLElement | null,
  onChange: () => void
): GuideState {
  injectGridGuideStyle();
  const blackGuideBtn = document.createElement("button");
  blackGuideBtn.innerHTML = '<i data-lucide="grid-2x2" aria-hidden="true"></i>';
  blackGuideBtn.id = "gridGuideBlackBtn";
  blackGuideBtn.title = "Toggle black grid guide";
  blackGuideBtn.setAttribute("aria-label", "Toggle black grid guide");

  const centerGuideBtn = document.createElement("button");
  centerGuideBtn.innerHTML = '<i data-lucide="crosshair" aria-hidden="true"></i>';
  centerGuideBtn.id = "gridGuideCenterBtn";
  centerGuideBtn.title = "Toggle red and blue center guide";
  centerGuideBtn.setAttribute("aria-label", "Toggle red and blue center guide");

  if (toolbox) {
    const guideControls = document.createElement("div");
    guideControls.className = "guide-controls";
    guideControls.append(blackGuideBtn, centerGuideBtn);
    toolbox.appendChild(guideControls);
    (
      window as Window & {
        lucide?: { createIcons: (options?: unknown) => void };
      }
    ).lucide?.createIcons({ attrs: { "stroke-width": 2 } });
  }

  let gridGuideBlack = false;
  let gridGuideCenter = false;

  function updateGuideBtnStyle() {
    blackGuideBtn.className = gridGuideBlack ? "guide-btn-on" : "guide-btn-off";
    centerGuideBtn.className = gridGuideCenter
      ? "guide-btn-on"
      : "guide-btn-off";
  }

  blackGuideBtn.onclick = () => {
    gridGuideBlack = !gridGuideBlack;
    updateGuideBtnStyle();
    onChange();
  };

  centerGuideBtn.onclick = () => {
    gridGuideCenter = !gridGuideCenter;
    updateGuideBtnStyle();
    onChange();
  };

  updateGuideBtnStyle();

  return {
    isBlackEnabled: () => gridGuideBlack,
    isCenterEnabled: () => gridGuideCenter,
  };
}

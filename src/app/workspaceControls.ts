type WorkspaceControlsOptions = {
  workspace: HTMLElement;
  viewport: HTMLElement;
  zoomInButton: HTMLButtonElement;
  zoomOutButton: HTMLButtonElement;
  resetButton: HTMLButtonElement;
  zoomValue: HTMLOutputElement;
};

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.15;
// Wheel input varies substantially between a mouse and a trackpad. A small
// exponential factor keeps both inputs predictable without jumping on each tick.
const WHEEL_ZOOM_SENSITIVITY = 0.0005;

type TouchPoint = {
  clientX: number;
  clientY: number;
};

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return (
    target.isContentEditable ||
    tagName === "input" ||
    tagName === "select" ||
    tagName === "textarea"
  );
}

export function initWorkspaceControls(options: WorkspaceControlsOptions) {
  const { workspace, viewport, zoomInButton, zoomOutButton, resetButton, zoomValue } =
    options;
  let zoom = 1;
  let panX = 0;
  let panY = 0;
  let panPointerId: number | null = null;
  let panStartX = 0;
  let panStartY = 0;
  let startPanX = 0;
  let startPanY = 0;
  let isSpacePressed = false;
  let didSpacePan = false;
  const touchPoints = new Map<number, TouchPoint>();
  let pinchStartDistance = 0;
  let pinchStartZoom = 1;
  let isPinching = false;

  const clampZoom = (value: number) =>
    Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));

  const render = () => {
    viewport.style.transform = `translate(calc(-50% + ${panX}px), calc(-50% + ${panY}px)) scale(${zoom})`;
    zoomValue.value = `${Math.round(zoom * 100)}%`;
  };

  const setZoom = (nextZoom: number, anchor?: { clientX: number; clientY: number }) => {
    const clampedZoom = clampZoom(nextZoom);
    if (clampedZoom === zoom) return;
    if (anchor) {
      const workspaceRect = workspace.getBoundingClientRect();
      const viewportWidth = viewport.offsetWidth;
      const viewportHeight = viewport.offsetHeight;
      const anchorX = anchor.clientX - workspaceRect.left;
      const anchorY = anchor.clientY - workspaceRect.top;
      const localX =
        (anchorX - workspaceRect.width / 2 + viewportWidth / 2 - panX) / zoom;
      const localY =
        (anchorY - workspaceRect.height / 2 + viewportHeight / 2 - panY) / zoom;
      panX =
        anchorX - workspaceRect.width / 2 + viewportWidth / 2 - localX * clampedZoom;
      panY =
        anchorY - workspaceRect.height / 2 + viewportHeight / 2 - localY * clampedZoom;
    }
    zoom = clampedZoom;
    render();
  };

  const reset = () => {
    zoom = 1;
    panX = 0;
    panY = 0;
    render();
  };

  const isPanGesture = (event: PointerEvent) =>
    isSpacePressed ||
    event.button === 1 ||
    event.altKey ||
    event.metaKey ||
    event.target === workspace ||
    event.target === viewport;

  const startPinch = () => {
    const points = [...touchPoints.values()];
    if (points.length < 2) return;
    const [first, second] = points;
    pinchStartDistance = Math.hypot(
      second.clientX - first.clientX,
      second.clientY - first.clientY
    );
    if (pinchStartDistance === 0) return;
    pinchStartZoom = zoom;
    isPinching = true;
    if (panPointerId !== null && workspace.hasPointerCapture(panPointerId)) {
      workspace.releasePointerCapture(panPointerId);
    }
    panPointerId = null;
    workspace.classList.remove("is-panning");
    workspace.classList.add("is-pinching");
  };

  const updatePinch = () => {
    const points = [...touchPoints.values()];
    if (!isPinching || points.length < 2 || pinchStartDistance === 0) return;
    const [first, second] = points;
    const distance = Math.hypot(
      second.clientX - first.clientX,
      second.clientY - first.clientY
    );
    setZoom(pinchStartZoom * (distance / pinchStartDistance), {
      clientX: (first.clientX + second.clientX) / 2,
      clientY: (first.clientY + second.clientY) / 2,
    });
  };

  const finishPinch = () => {
    if (touchPoints.size >= 2) return;
    isPinching = false;
    workspace.classList.remove("is-pinching");
  };

  workspace.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch") {
      touchPoints.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY });
      if (touchPoints.size >= 2) {
        startPinch();
        event.preventDefault();
        event.stopPropagation();
      }
      return;
    }
    if (!isPanGesture(event)) return;
    event.preventDefault();
    event.stopPropagation();
    didSpacePan = isSpacePressed;
    panPointerId = event.pointerId;
    panStartX = event.clientX;
    panStartY = event.clientY;
    startPanX = panX;
    startPanY = panY;
    workspace.classList.add("is-panning");
    workspace.setPointerCapture(event.pointerId);
  }, { capture: true });

  workspace.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") {
      if (!touchPoints.has(event.pointerId)) return;
      touchPoints.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY });
      if (isPinching) {
        event.preventDefault();
        event.stopPropagation();
        updatePinch();
      }
      return;
    }
    if (panPointerId !== event.pointerId) return;
    panX = startPanX + event.clientX - panStartX;
    panY = startPanY + event.clientY - panStartY;
    render();
  }, { capture: true });

  const stopPan = (event: PointerEvent) => {
    if (event.pointerType === "touch") {
      touchPoints.delete(event.pointerId);
      finishPinch();
      return;
    }
    if (panPointerId !== event.pointerId) return;
    panPointerId = null;
    workspace.classList.remove("is-panning");
    if (workspace.hasPointerCapture(event.pointerId)) {
      workspace.releasePointerCapture(event.pointerId);
    }
  };

  workspace.addEventListener("pointerup", stopPan, { capture: true });
  workspace.addEventListener("pointercancel", stopPan, { capture: true });
  workspace.addEventListener(
    "click",
    (event) => {
      if (!didSpacePan) return;
      event.preventDefault();
      event.stopPropagation();
      didSpacePan = false;
    },
    { capture: true }
  );

  document.addEventListener("keydown", (event) => {
    if (event.code !== "Space" || isEditableTarget(event.target)) return;
    isSpacePressed = true;
    workspace.classList.add("is-space-pan");
    event.preventDefault();
  });

  document.addEventListener("keyup", (event) => {
    if (event.code !== "Space") return;
    isSpacePressed = false;
    workspace.classList.remove("is-space-pan");
  });

  window.addEventListener("blur", () => {
    isSpacePressed = false;
    workspace.classList.remove("is-space-pan");
  });

  workspace.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      const nextZoom = zoom * Math.exp(-event.deltaY * WHEEL_ZOOM_SENSITIVITY);
      setZoom(nextZoom, {
        clientX: event.clientX,
        clientY: event.clientY,
      });
    },
    { passive: false }
  );

  zoomInButton.addEventListener("click", () => setZoom(zoom + ZOOM_STEP));
  zoomOutButton.addEventListener("click", () => setZoom(zoom - ZOOM_STEP));
  resetButton.addEventListener("click", reset);

  render();
  return { reset };
}

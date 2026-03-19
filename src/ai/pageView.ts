import type { LoadedDataset } from "./dataset.js";
import type { GeneratedCandidate, GeneratePatternResult } from "./generator.js";
import { renderMatrixToCanvas } from "../shared/patternRender.js";

const PREVIEW_PRIMARY = "#f7f0e6";
const PREVIEW_SECONDARY = "#183236";

export type CandidateCardActions = {
  onUsePreview: (candidate: GeneratedCandidate) => void;
  onCopyBase64: (candidate: GeneratedCandidate) => void;
  onCopyJsonEntry: (candidate: GeneratedCandidate) => void;
  onOpenEditor: (candidate: GeneratedCandidate) => void;
  onDownloadPng: (candidate: GeneratedCandidate) => void;
};

type AiPageViewElements = {
  statusMessage: HTMLParagraphElement;
  normalizedPrompt: HTMLElement;
  matchSummary: HTMLElement;
  datasetStats: HTMLElement;
  datasetError: HTMLElement;
  datasetFailures: HTMLUListElement;
  candidateResults: HTMLElement;
  candidateCount: HTMLElement;
  selectedPreviewCanvas: HTMLCanvasElement;
  selectedStrategy: HTMLElement;
  selectedMeta: HTMLElement;
  selectedBase64: HTMLTextAreaElement;
};

export function createAiPageView(elements: AiPageViewElements) {
  const {
    statusMessage,
    normalizedPrompt,
    matchSummary,
    datasetStats,
    datasetError,
    datasetFailures,
    candidateResults,
    candidateCount,
    selectedPreviewCanvas,
    selectedStrategy,
    selectedMeta,
    selectedBase64,
  } = elements;

  function setStatus(message: string) {
    statusMessage.textContent = message;
  }

  function updateDatasetView(dataset: LoadedDataset) {
    datasetStats.textContent = `Total ${dataset.totalEntries} · Decoded ${dataset.decodedEntries} · Failed ${dataset.failedEntries}`;
    datasetError.hidden = dataset.error === null;
    datasetError.textContent = dataset.error ?? "";
    datasetFailures.innerHTML = "";

    dataset.failures.slice(0, 12).forEach((failure) => {
      const item = document.createElement("li");
      item.textContent = `${failure.id}: ${failure.message}`;
      datasetFailures.appendChild(item);
    });
  }

  function updatePromptSummary(
    result: GeneratePatternResult | null,
    datasetEntryCount: number
  ) {
    normalizedPrompt.textContent = result?.normalizedPrompt || "—";
    if (!result) {
      matchSummary.textContent = datasetEntryCount > 0
        ? "Load a prompt to score dataset matches."
        : "Prompt-only fallback is ready.";
      return;
    }

    matchSummary.textContent =
      result.matches.length > 0
        ? result.matches
            .slice(0, 3)
            .map(match => `${match.entry.name} (${match.score.toFixed(1)})`)
            .join(" · ")
        : datasetEntryCount > 0
          ? "No close dataset matches. Using prompt-seeded fallback."
          : "No dataset loaded. Using prompt-seeded fallback.";
  }

  function renderSelectedCandidate(candidate: GeneratedCandidate | null) {
    const context = selectedPreviewCanvas.getContext("2d");
    if (!context) {
      throw new Error("Selected preview canvas is missing a 2D context.");
    }

    if (!candidate) {
      context.clearRect(0, 0, selectedPreviewCanvas.width, selectedPreviewCanvas.height);
      selectedStrategy.textContent = "No selection";
      selectedMeta.textContent = "Generate candidates, then choose one for a larger preview.";
      selectedBase64.value = "";
      return;
    }

    renderMatrixToCanvas({
      canvas: selectedPreviewCanvas,
      context,
      matrix: candidate.matrix,
      scale: candidate.scale,
      primaryColor: PREVIEW_PRIMARY,
      secondaryColor: PREVIEW_SECONDARY,
      width: 960,
      height: 320,
    });

    selectedStrategy.textContent = `${candidate.strategy} · ${candidate.score.toFixed(2)}`;
    selectedMeta.textContent = `Sources: ${candidate.sources.join(", ")} · ${candidate.width}x${candidate.height} · scale ${1 << candidate.scale}x`;
    selectedBase64.value = candidate.pattern;
  }

  function renderCandidateCards(
    candidates: GeneratedCandidate[],
    selectedId: string | null,
    actions: CandidateCardActions
  ) {
    candidateResults.innerHTML = "";
    candidateCount.textContent = `${candidates.length} options`;

    if (candidates.length === 0) {
      const placeholder = document.createElement("div");
      placeholder.className = "candidate-placeholder";
      placeholder.textContent = "Generate from a prompt to see multiple candidate patterns.";
      candidateResults.appendChild(placeholder);
      return;
    }

    candidates.forEach((candidate) => {
      const card = document.createElement("article");
      card.className = "candidate-card";
      if (candidate.id === selectedId) {
        card.classList.add("selected");
      }

      const title = document.createElement("div");
      title.className = "candidate-title";
      title.textContent = candidate.strategy;

      const meta = document.createElement("div");
      meta.className = "candidate-meta";
      meta.textContent = `${candidate.sources.join(", ")} · score ${candidate.score.toFixed(2)}`;

      const canvas = document.createElement("canvas");
      canvas.className = "candidate-canvas";

      const actionRow = document.createElement("div");
      actionRow.className = "candidate-actions";
      const buttonConfigs: Array<[string, () => void, boolean]> = [
        ["Use in Preview", () => actions.onUsePreview(candidate), true],
        ["Copy Base64", () => actions.onCopyBase64(candidate), false],
        ["Copy JSON Entry", () => actions.onCopyJsonEntry(candidate), false],
        ["Open in Main Editor", () => actions.onOpenEditor(candidate), false],
        ["Download PNG", () => actions.onDownloadPng(candidate), false],
      ];

      buttonConfigs.forEach(([label, onClick, primary]) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = label;
        if (primary) {
          button.classList.add("btn-primary");
        }
        button.addEventListener("click", onClick);
        actionRow.appendChild(button);
      });

      card.append(title, meta, canvas, actionRow);
      candidateResults.appendChild(card);

      renderMatrixToCanvas({
        canvas,
        matrix: candidate.matrix,
        scale: candidate.scale,
        primaryColor: PREVIEW_PRIMARY,
        secondaryColor: PREVIEW_SECONDARY,
        width: 480,
        height: 180,
      });
    });
  }

  return {
    setStatus,
    updateDatasetView,
    updatePromptSummary,
    renderSelectedCandidate,
    renderCandidateCards,
  };
}

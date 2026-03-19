import { buildTrainingDataset, loadDatasetFromJson, type LoadedDataset } from "./ai/dataset.js";
import {
  generatePatternFromPrompt,
  type GeneratedCandidate,
  type GeneratePatternResult,
} from "./ai/generator.js";
import { createAiPageView, type CandidateCardActions } from "./ai/pageView.js";
import { slugifyText } from "./ai/text.js";
import { renderMatrixToCanvas } from "./shared/patternRender.js";

function createEmptyDataset(): LoadedDataset {
  return {
    entries: [],
    failures: [],
    totalEntries: 0,
    decodedEntries: 0,
    failedEntries: 0,
    error: null,
  };
}

function getRequiredElement<T extends HTMLElement>(id: string) {
  const element = document.getElementById(id) as T | null;
  if (!element) {
    throw new Error(`Missing required element: #${id}`);
  }
  return element;
}

document.addEventListener("DOMContentLoaded", () => {
  const promptInput = getRequiredElement<HTMLTextAreaElement>("promptInput");
  const generateBtn = getRequiredElement<HTMLButtonElement>("generateBtn");
  const regenerateBtn = getRequiredElement<HTMLButtonElement>("regenerateBtn");
  const datasetInput = getRequiredElement<HTMLTextAreaElement>("datasetInput");
  const loadDatasetBtn = getRequiredElement<HTMLButtonElement>("loadDatasetBtn");
  const exportTrainingBtn = getRequiredElement<HTMLButtonElement>("exportTrainingBtn");

  const view = createAiPageView({
    statusMessage: getRequiredElement<HTMLParagraphElement>("statusMessage"),
    normalizedPrompt: getRequiredElement<HTMLElement>("normalizedPrompt"),
    matchSummary: getRequiredElement<HTMLElement>("matchSummary"),
    datasetStats: getRequiredElement<HTMLElement>("datasetStats"),
    datasetError: getRequiredElement<HTMLElement>("datasetError"),
    datasetFailures: getRequiredElement<HTMLUListElement>("datasetFailures"),
    candidateResults: getRequiredElement<HTMLElement>("candidateResults"),
    candidateCount: getRequiredElement<HTMLElement>("candidateCount"),
    selectedPreviewCanvas: getRequiredElement<HTMLCanvasElement>("selectedPreviewCanvas"),
    selectedStrategy: getRequiredElement<HTMLElement>("selectedStrategy"),
    selectedMeta: getRequiredElement<HTMLElement>("selectedMeta"),
    selectedBase64: getRequiredElement<HTMLTextAreaElement>("selectedBase64"),
  });

  const state = {
    dataset: createEmptyDataset(),
    lastResult: null as GeneratePatternResult | null,
    seedOffset: 0,
    selectedId: null as string | null,
  };

  function copyText(value: string) {
    const fallbackCopy = () => {
      const temp = document.createElement("textarea");
      temp.value = value;
      temp.style.position = "fixed";
      temp.style.opacity = "0";
      document.body.appendChild(temp);
      temp.select();
      document.execCommand("copy");
      temp.remove();
    };

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(value).catch(fallbackCopy);
      return;
    }

    fallbackCopy();
  }

  function downloadBlob(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  function createEditorUrl(pattern: string) {
    const url = new URL("./index.html", window.location.href);
    url.hash = pattern;
    return url.toString();
  }

  function createJsonEntry(candidate: GeneratedCandidate) {
    const promptLabel = promptInput.value.trim() || "generated pattern";
    return JSON.stringify(
      {
        name: `${slugifyText(promptLabel)}_${slugifyText(candidate.strategy)}`,
        pattern: candidate.pattern,
        description: `Generated from prompt "${promptLabel}" using ${candidate.strategy}.`,
        affiliateCode: null,
        product: null,
        colorPalettes: [],
      },
      null,
      2
    );
  }

  function downloadCandidatePng(candidate: GeneratedCandidate) {
    const canvas = document.createElement("canvas");
    renderMatrixToCanvas({
      canvas,
      matrix: candidate.matrix,
      scale: candidate.scale,
      primaryColor: "#f7f0e6",
      secondaryColor: "#183236",
      width: 960,
      height: 320,
    });
    canvas.toBlob((blob) => {
      if (!blob) return;
      downloadBlob(blob, `${slugifyText(promptInput.value || candidate.strategy)}.png`);
    }, "image/png");
  }

  function findSelectedCandidate() {
    return state.lastResult?.candidates.find(candidate => candidate.id === state.selectedId) ?? null;
  }

  const candidateActions: CandidateCardActions = {
    onUsePreview: (candidate) => {
      state.selectedId = candidate.id;
      renderCurrentState();
    },
    onCopyBase64: candidate => copyText(candidate.pattern),
    onCopyJsonEntry: candidate => copyText(createJsonEntry(candidate)),
    onOpenEditor: candidate => window.open(createEditorUrl(candidate.pattern), "_blank", "noopener"),
    onDownloadPng: candidate => downloadCandidatePng(candidate),
  };

  function renderCurrentState() {
    view.renderCandidateCards(
      state.lastResult?.candidates ?? [],
      state.selectedId,
      candidateActions
    );
    view.renderSelectedCandidate(findSelectedCandidate());
  }

  function runGeneration(resetSeed: boolean) {
    if (!promptInput.value.trim()) {
      view.setStatus("Enter a prompt first.");
      return;
    }

    if (resetSeed) {
      state.seedOffset = 0;
    }

    // Current MVP path:
    // prompt -> normalized text -> retrieval -> matrix mutations/hybrids -> ranked candidates.
    const result = generatePatternFromPrompt(promptInput.value, {
      datasetEntries: state.dataset.entries,
      defaultWidth: 66,
      defaultHeight: 10,
      defaultScale: 1,
      seedOffset: state.seedOffset,
      candidateCount: 6,
    });

    state.lastResult = result;
    state.selectedId = result.candidates[0]?.id ?? null;
    view.updatePromptSummary(result, state.dataset.entries.length);
    renderCurrentState();
    view.setStatus(
      result.candidates.length > 0
        ? `Generated ${result.candidates.length} candidates.`
        : "No candidates generated."
    );
  }

  loadDatasetBtn.addEventListener("click", () => {
    // Dataset loading is fault-tolerant: each entry is decoded independently so
    // invalid pattern strings stay visible as failures without breaking the page.
    state.dataset = loadDatasetFromJson(datasetInput.value);
    view.updateDatasetView(state.dataset);
    view.updatePromptSummary(state.lastResult, state.dataset.entries.length);
    view.setStatus(
      state.dataset.error
        ? `Dataset error: ${state.dataset.error}`
        : `Loaded dataset with ${state.dataset.decodedEntries} decoded entries.`
    );
  });

  exportTrainingBtn.addEventListener("click", () => {
    if (state.dataset.entries.length === 0) {
      view.setStatus("Load a dataset before exporting training data.");
      return;
    }

    // Training export keeps normalized text + decoded matrices for offline model work.
    const payload = JSON.stringify(buildTrainingDataset(state.dataset.entries), null, 2);
    downloadBlob(
      new Blob([payload], { type: "application/json" }),
      "openfront-training-dataset.json"
    );
    view.setStatus(`Exported ${state.dataset.entries.length} decoded samples.`);
  });

  generateBtn.addEventListener("click", () => runGeneration(true));
  regenerateBtn.addEventListener("click", () => {
    state.seedOffset += 1;
    runGeneration(false);
  });
  promptInput.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      runGeneration(true);
    }
  });

  view.updateDatasetView(state.dataset);
  view.updatePromptSummary(null, state.dataset.entries.length);
  renderCurrentState();
});

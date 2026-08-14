export async function copyText(value: string) {
  const fallbackCopy = () => {
    const temp = document.createElement("textarea");
    temp.value = value;
    temp.style.position = "fixed";
    temp.style.opacity = "0";
    document.body.appendChild(temp);
    temp.focus();
    temp.select();
    document.execCommand("copy");
    temp.remove();
  };

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      fallbackCopy();
    }
  } else {
    fallbackCopy();
  }
  document.dispatchEvent(new CustomEvent("pattern:copied"));
}

export function openBackgroundTab(url: string, e?: React.MouseEvent) {
  if (e) {
    e.preventDefault();
  }

  // Open the new tab using window.open
  const newWin = window.open(url, "_blank", "noopener,noreferrer");

  if (newWin) {
    // Immediately pull focus back to the current main window
    newWin.blur();
    window.focus();
  }
}

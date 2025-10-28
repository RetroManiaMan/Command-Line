// This function handles the commands typed in the command line overlay
async function executeCommand(raw) {
  console.log("Running executeCommand with:", raw);
  
  const parts = raw.trim().split(/\s+/);
  const cmd = parts[0].toLowerCase();

  // Command to open a URL
  if (cmd === "/open") {
    const url = raw.slice(5).trim(); // Get the URL after /open
    if (!url) {
      showNotification("Usage: /open <url>");
      return;
    }
    chrome.tabs.create({ url: normalizeUrl(url) || `https://www.google.com/search?q=${encodeURIComponent(url)}` });
    return;
  }

  // Command to search something on Google
  if (cmd === "/search") {
    const query = raw.slice(8).trim();  // Get the search query after /search
    if (!query) {
      showNotification("Usage: /search <query>");
      return;
    }
    const encoded = encodeURIComponent(query);
    chrome.tabs.create({ url: `https://www.google.com/search?q=${encoded}` });
    return;
  }

  // AI Assistant Command - Powered by ChatGPT (me!)
  if (cmd === "/ask") {
    const question = raw.slice(5).trim(); // Remove /ask from the question
    if (!question) {
      showNotification("Usage: /ask <question>");
      return;
    }
    // Simulate a response from AI for now
    showNotification(`ChatGPT says: "That's a great question!"`);
    highlightInput();  // Add vibrant highlight when the user asks AI something
    return;
  }

  // Calculator Command - Simple math using JavaScript eval() function
  if (cmd === "/calc") {
    const mathExpression = raw.slice(6).trim(); // Get the expression after /calc
    if (!mathExpression) {
      showNotification("Usage: /calc <math_expression>");
      return;
    }
    try {
      const result = eval(mathExpression);
      showNotification(`Result: ${result}`);
    } catch (error) {
      showNotification("Invalid math expression. Try again.");
    }
    return;
  }

  // If the command is not recognized
  showNotification("Unknown command. Try /help.");
}

// This helper function ensures the URL is valid and adds "https://" if missing
function normalizeUrl(maybeUrl) {
  try {
    if (!/^https?:\/\//i.test(maybeUrl)) {
      maybeUrl = "https://" + maybeUrl;
    }
    const u = new URL(maybeUrl);
    return u.href;
  } catch (e) {
    return null;
  }
}

// This function displays a notification in the overlay (helpful for user feedback)
function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "cmdline-suggestion active";
  notification.textContent = message;
  suggestionsEl.appendChild(notification);
  setTimeout(() => {
    if (suggestionsEl.contains(notification)) suggestionsEl.removeChild(notification);
  }, 3000);
}

// Highlight the input when /ask ai is typed
function highlightInput() {
  const inputField = document.querySelector(".cmdline-input");
  inputField.style.border = "3px solid #ff4b5c";  // Vibrant red border
  setTimeout(() => {
    inputField.style.border = "";  // Reset after 1 second
  }, 1000);
}

// This function will handle key presses when interacting with the command line overlay
function attachEventListener() {
  const input = document.querySelector(".cmdline-input");
  if (!input) {
    console.log("Input field not found!");
    return;
  }

  input.addEventListener("keydown", async (e) => {
    if (e.key === "Escape") {
      hideOverlay();
      e.preventDefault();
      return;
    }

    // Handle Enter key to execute the command
    if (e.key === "Enter") {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      await executeCommand(text);  // Calls the function we just added
      // Add the command to history
      if (!history.length || history[0] !== text) {
        history.unshift(text);
        if (history.length > 200) history.pop();
        saveHistory();
      }
      hideOverlay();
      return;
    }

    // Handle up/down arrows for cycling through history
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      historyIndex = Math.min(historyIndex + 1, history.length - 1);
      input.value = history[historyIndex] || "";
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (history.length === 0) return;
      historyIndex = Math.max(historyIndex - 1, -1);
      input.value = historyIndex === -1 ? "" : history[historyIndex];
      return;
    }

    // Update suggestions on typing
    setTimeout(updateSuggestions, 0);
  });
}

// Delay to ensure input element is loaded and add event listener
setTimeout(attachEventListener, 1000); // Adding a delay to ensure input is available

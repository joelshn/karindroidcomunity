// Mobile menu toggle
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger")
  const navMenu = document.getElementById("nav-menu")

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active")
      navMenu.classList.toggle("active")
    })

    // Close menu when clicking on a link
    document.querySelectorAll(".nav-link").forEach((n) =>
      n.addEventListener("click", () => {
        hamburger.classList.remove("active")
        navMenu.classList.remove("active")
      }),
    )
  }
})

// GitHub API configuration
const GITHUB_CONFIG = {
  owner: "joelshn", // Replace with your GitHub username
  repo: "karindroidcomunity", // Replace with your repository name
  get token() {
    return localStorage.getItem("github_token") || "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" // Fallback to hardcoded token
  },
  branch: "main",
}

// GitHub API functions
async function githubRequest(endpoint, method = "GET", data = null) {
  const token = GITHUB_CONFIG.token
  if (!token || token === "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") {
    throw new Error("GitHub token not configured")
  }

  const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${endpoint}`

  const options = {
    method,
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
  }

  if (data) {
    options.body = JSON.stringify(data)
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} - ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error("GitHub API request failed:", error)
    throw error
  }
}

async function readJSONFile(filename) {
  try {
    // First try GitHub API
    const response = await githubRequest(filename)
    const content = atob(response.content)
    return JSON.parse(content)
  } catch (error) {
    console.warn(`GitHub API failed for ${filename}, trying direct fetch:`, error)

    // Fallback to direct file fetch (for local files)
    try {
      const response = await fetch(filename)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (fetchError) {
      console.error(`Both GitHub API and direct fetch failed for ${filename}:`, fetchError)

      // Return default data structure
      if (filename.includes("participants")) {
        return {}
      } else if (filename.includes("giveaways")) {
        // Return example giveaway data if file doesn't exist
        return [
          {
            id: "example-dominus",
            name: "Dominus Empyreus",
            description: "¡Gana este increíble Dominus Empyreus para tu avatar de Roblox!",
            image: "https://tr.rbxcdn.com/38c6edcbcf3baf3b6f4e6e5f8b5c4a2a/420/420/Hat/Png",
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
            createdAt: new Date().toISOString(),
            status: "active",
          },
        ]
      }
      return []
    }
  }
}

async function writeJSONFile(filename, data) {
  try {
    const content = btoa(JSON.stringify(data, null, 2))

    // Try to get existing file to get SHA
    let sha = null
    try {
      const existing = await githubRequest(filename)
      sha = existing.sha
    } catch (error) {
      // File doesn't exist, that's okay
    }

    const payload = {
      message: `Update ${filename}`,
      content: content,
      branch: GITHUB_CONFIG.branch,
    }

    if (sha) {
      payload.sha = sha
    }

    await githubRequest(filename, "PUT", payload)
    showMessage("Datos guardados correctamente", "success")
    return true
  } catch (error) {
    console.error(`Error writing ${filename}:`, error)
    if (error.message.includes("GitHub token not configured") || error.message.includes("401")) {
      showMessage("Error de autenticación: Configura tu token de GitHub en el panel de administración", "error")
    } else {
      showMessage(`Error al guardar: ${error.message}`, "error")
    }
    return false
  }
}

// Utility functions
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

function showMessage(message, type = "success") {
  const messageDiv = document.createElement("div")
  messageDiv.className = `message ${type}`
  messageDiv.innerHTML = `<i class="fas fa-${type === "success" ? "check-circle" : "exclamation-circle"}"></i> ${message}`

  // Add styles for the message
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 1000;
    max-width: 400px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    background: ${type === "success" ? "#28a745" : "#dc3545"};
  `

  document.body.appendChild(messageDiv)

  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.remove()
    }
  }, 5000)
}

// Initialize data files if they don't exist
async function initializeDataFiles() {
  const giveaways = await readJSONFile("data/giveaways.json")
  if (!giveaways) {
    await writeJSONFile("data/giveaways.json", [])
  }

  const participants = await readJSONFile("data/participants.json")
  if (!participants) {
    await writeJSONFile("data/participants.json", {})
  }
}

// Call initialization when script loads
initializeDataFiles()

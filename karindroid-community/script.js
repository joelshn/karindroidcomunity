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
  token: "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", // Replace_with your GitHub token
  branch: "main",
}

// GitHub API functions
async function githubRequest(endpoint, method = "GET", data = null) {
  const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${endpoint}`

  const options = {
    method,
    headers: {
      Authorization: `token ${GITHUB_CONFIG.token}`,
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
      throw new Error(`GitHub API error: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error("GitHub API request failed:", error)
    throw error
  }
}

async function readJSONFile(filename) {
  try {
    const response = await githubRequest(filename)
    const content = atob(response.content)
    return JSON.parse(content)
  } catch (error) {
    console.error(`Error reading ${filename}:`, error)
    return null
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
    return true
  } catch (error) {
    console.error(`Error writing ${filename}:`, error)
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
  messageDiv.className = type
  messageDiv.innerHTML = `<i class="fas fa-${type === "success" ? "check-circle" : "exclamation-circle"}"></i> ${message}`

  const container = document.querySelector(".container")
  container.insertBefore(messageDiv, container.firstChild)

  setTimeout(() => {
    messageDiv.remove()
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

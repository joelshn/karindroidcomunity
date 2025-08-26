// Tab management
function showTab(tabName) {
  // Hide all tabs
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.style.display = "none"
  })

  // Remove active class from all buttons
  document.querySelectorAll("#admin-tabs button").forEach((btn) => {
    btn.classList.remove("active")
  })

  // Show selected tab
  document.getElementById(tabName).style.display = "block"

  // Add active class to selected button
  const activeBtn = tabName === "add-giveaway" ? "tab-add" : tabName === "manage-giveaways" ? "tab-manage" : "tab-draw"
  document.getElementById(activeBtn).classList.add("active")

  // Load content based on tab
  if (tabName === "manage-giveaways") {
    loadAdminGiveaways()
  } else if (tabName === "draw-winner") {
    loadActiveGiveawaysForDraw()
  }
}

// Add new giveaway
async function addGiveaway(event) {
  event.preventDefault()

  const formData = new FormData(event.target)
  const giveaway = {
    id: generateId(),
    name: formData.get("item-name"),
    image: formData.get("item-image"),
    endDate: formData.get("end-date"),
    description: formData.get("description") || "",
    createdAt: new Date().toISOString(),
  }

  try {
    const giveaways = (await readJSONFile("data/giveaways.json")) || []
    giveaways.push(giveaway)

    const success = await writeJSONFile("data/giveaways.json", giveaways)

    if (success) {
      showMessage("Sorteo creado exitosamente!", "success")
      event.target.reset()
    } else {
      showMessage("Error al crear el sorteo.", "error")
    }
  } catch (error) {
    console.error("Error adding giveaway:", error)
    showMessage("Error al crear el sorteo.", "error")
  }
}

// Load giveaways for admin management
async function loadAdminGiveaways() {
  const listDiv = document.getElementById("admin-giveaways-list")

  try {
    const giveaways = (await readJSONFile("data/giveaways.json")) || []
    const participants = (await readJSONFile("data/participants.json")) || {}

    if (giveaways.length === 0) {
      listDiv.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-gift" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.5;"></i>
                    <h3>No hay sorteos creados</h3>
                    <p>Crea tu primer sorteo en la pestaña "Agregar Sorteo"</p>
                </div>
            `
      return
    }

    listDiv.innerHTML = giveaways
      .map((giveaway) => {
        const participantCount = participants[giveaway.id] ? participants[giveaway.id].length : 0
        const isActive = new Date(giveaway.endDate) > new Date()
        const status = isActive ? "Activo" : "Finalizado"
        const statusColor = isActive ? "#28a745" : "#6c757d"

        return `
                <div class="giveaway-card">
                    <div style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap;">
                        <img src="${giveaway.image}" alt="${giveaway.name}" 
                             style="width: 100px; height: 100px; object-fit: cover; border-radius: 10px;"
                             onerror="this.src='/roblox-brainrot.png'">
                        <div style="flex: 1; min-width: 200px;">
                            <h3>${giveaway.name}</h3>
                            <div class="giveaway-meta">
                                <div class="meta-item">
                                    <i class="fas fa-calendar"></i>
                                    <span>Termina: ${formatDate(giveaway.endDate)}</span>
                                </div>
                                <div class="meta-item">
                                    <i class="fas fa-users"></i>
                                    <span>${participantCount} participantes</span>
                                </div>
                                <div class="meta-item">
                                    <i class="fas fa-circle" style="color: ${statusColor};"></i>
                                    <span>${status}</span>
                                </div>
                            </div>
                        </div>
                        <div style="display: flex; gap: 10px; flex-direction: column;">
                            <button class="btn-danger" onclick="deleteGiveaway('${giveaway.id}')">
                                <i class="fas fa-trash"></i> Eliminar
                            </button>
                            ${
                              isActive
                                ? `<button class="btn-primary" onclick="endGiveaway('${giveaway.id}')">
                                <i class="fas fa-stop"></i> Finalizar
                            </button>`
                                : ""
                            }
                        </div>
                    </div>
                </div>
            `
      })
      .join("")
  } catch (error) {
    console.error("Error loading admin giveaways:", error)
    listDiv.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-triangle"></i> 
                Error al cargar los sorteos.
            </div>
        `
  }
}

// Delete giveaway
async function deleteGiveaway(giveawayId) {
  if (!confirm("¿Estás seguro de que quieres eliminar este sorteo?")) {
    return
  }

  try {
    const giveaways = (await readJSONFile("data/giveaways.json")) || []
    const participants = (await readJSONFile("data/participants.json")) || {}

    // Remove giveaway
    const updatedGiveaways = giveaways.filter((g) => g.id !== giveawayId)

    // Remove participants
    delete participants[giveawayId]

    const success1 = await writeJSONFile("data/giveaways.json", updatedGiveaways)
    const success2 = await writeJSONFile("data/participants.json", participants)

    if (success1 && success2) {
      showMessage("Sorteo eliminado exitosamente!", "success")
      loadAdminGiveaways()
    } else {
      showMessage("Error al eliminar el sorteo.", "error")
    }
  } catch (error) {
    console.error("Error deleting giveaway:", error)
    showMessage("Error al eliminar el sorteo.", "error")
  }
}

// End giveaway early
async function endGiveaway(giveawayId) {
  if (!confirm("¿Estás seguro de que quieres finalizar este sorteo?")) {
    return
  }

  try {
    const giveaways = (await readJSONFile("data/giveaways.json")) || []

    // Update end date to now
    const updatedGiveaways = giveaways.map((g) => {
      if (g.id === giveawayId) {
        return { ...g, endDate: new Date().toISOString() }
      }
      return g
    })

    const success = await writeJSONFile("data/giveaways.json", updatedGiveaways)

    if (success) {
      showMessage("Sorteo finalizado exitosamente!", "success")
      loadAdminGiveaways()
    } else {
      showMessage("Error al finalizar el sorteo.", "error")
    }
  } catch (error) {
    console.error("Error ending giveaway:", error)
    showMessage("Error al finalizar el sorteo.", "error")
  }
}

// Load active giveaways for drawing winners
async function loadActiveGiveawaysForDraw() {
  const listDiv = document.getElementById("active-giveaways-for-draw")

  try {
    const giveaways = (await readJSONFile("data/giveaways.json")) || []
    const participants = (await readJSONFile("data/participants.json")) || {}

    const now = new Date()
    const endedGiveaways = giveaways.filter(
      (g) => new Date(g.endDate) <= now && participants[g.id] && participants[g.id].length > 0,
    )

    if (endedGiveaways.length === 0) {
      listDiv.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-trophy" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.5;"></i>
                    <h3>No hay sorteos listos para realizar</h3>
                    <p>Los sorteos deben haber finalizado y tener participantes para poder realizar el sorteo.</p>
                </div>
            `
      return
    }

    listDiv.innerHTML = endedGiveaways
      .map((giveaway) => {
        const participantCount = participants[giveaway.id].length

        return `
                <div class="giveaway-card">
                    <div style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap;">
                        <img src="${giveaway.image}" alt="${giveaway.name}" 
                             style="width: 100px; height: 100px; object-fit: cover; border-radius: 10px;"
                             onerror="this.src='/roblox-brainrot.png'">
                        <div style="flex: 1; min-width: 200px;">
                            <h3>${giveaway.name}</h3>
                            <div class="giveaway-meta">
                                <div class="meta-item">
                                    <i class="fas fa-calendar"></i>
                                    <span>Finalizó: ${formatDate(giveaway.endDate)}</span>
                                </div>
                                <div class="meta-item">
                                    <i class="fas fa-users"></i>
                                    <span>${participantCount} participantes</span>
                                </div>
                            </div>
                        </div>
                        <button class="btn-success" onclick="drawWinner('${giveaway.id}')">
                            <i class="fas fa-trophy"></i> Sortear Ganador
                        </button>
                    </div>
                </div>
            `
      })
      .join("")
  } catch (error) {
    console.error("Error loading giveaways for draw:", error)
    listDiv.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-triangle"></i> 
                Error al cargar los sorteos.
            </div>
        `
  }
}

// Draw winner
async function drawWinner(giveawayId) {
  try {
    const giveaways = (await readJSONFile("data/giveaways.json")) || []
    const participants = (await readJSONFile("data/participants.json")) || {}

    const giveaway = giveaways.find((g) => g.id === giveawayId)
    const giveawayParticipants = participants[giveawayId] || []

    if (giveawayParticipants.length === 0) {
      showMessage("No hay participantes en este sorteo.", "error")
      return
    }

    // Random winner selection
    const randomIndex = Math.floor(Math.random() * giveawayParticipants.length)
    const winner = giveawayParticipants[randomIndex]

    // Show winner announcement
    const announcement = `
            <div style="text-align: center; padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 15px; margin: 20px 0;">
                <i class="fas fa-trophy" style="font-size: 4rem; margin-bottom: 20px; color: #ffd700;"></i>
                <h2>¡Tenemos un Ganador!</h2>
                <h3 style="font-size: 2rem; margin: 20px 0;">${winner}</h3>
                <p>Ha ganado: <strong>${giveaway.name}</strong></p>
                <button class="btn-primary" onclick="copyWinnerInfo('${winner}', '${giveaway.name}')" style="margin-top: 20px;">
                    <i class="fas fa-copy"></i> Copiar Información del Ganador
                </button>
            </div>
        `

    document.getElementById("active-giveaways-for-draw").innerHTML =
      announcement + document.getElementById("active-giveaways-for-draw").innerHTML

    showMessage(`¡${winner} ha ganado ${giveaway.name}!`, "success")
  } catch (error) {
    console.error("Error drawing winner:", error)
    showMessage("Error al realizar el sorteo.", "error")
  }
}

// Copy winner information
function copyWinnerInfo(winner, prize) {
  const text = `🎉 ¡GANADOR DEL SORTEO! 🎉\n\nGanador: ${winner}\nPremio: ${prize}\n\n¡Felicidades! 🎊`

  navigator.clipboard
    .writeText(text)
    .then(() => {
      showMessage("Información del ganador copiada al portapapeles!", "success")
    })
    .catch(() => {
      showMessage("Error al copiar la información.", "error")
    })
}

// Initialize admin panel
document.addEventListener("DOMContentLoaded", () => {
  // Check GitHub token configuration
  checkGitHubToken()

  // Show first tab by default
  showTab("add-giveaway")

  // Set minimum date to now for new giveaways
  const endDateInput = document.getElementById("end-date")
  if (endDateInput) {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    endDateInput.min = now.toISOString().slice(0, 16)
  }
})

// Declare necessary functions and variables
function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

async function readJSONFile(filePath) {
  try {
    const response = await fetch(`https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/contents/${filePath}`, {
      headers: {
        Authorization: `token ${getGitHubToken()}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (response.status === 404) {
      // File doesn't exist, return empty array/object
      return filePath.includes("participants") ? {} : []
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    const content = atob(data.content)
    return JSON.parse(content)
  } catch (error) {
    console.error("Error reading JSON file:", error)
    return filePath.includes("participants") ? {} : []
  }
}

async function writeJSONFile(filePath, data) {
  try {
    const token = getGitHubToken()
    if (!token) {
      showMessage("Token de GitHub no configurado. Ve a la consola para configurarlo.", "error")
      console.log('Para configurar el token de GitHub, ejecuta: localStorage.setItem("github_token", "tu_token_aqui")')
      return false
    }

    // First, try to get the current file to get its SHA
    let sha = null
    try {
      const currentFile = await fetch(`https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/contents/${filePath}`, {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      })

      if (currentFile.ok) {
        const currentData = await currentFile.json()
        sha = currentData.sha
      }
    } catch (e) {
      // File doesn't exist, that's ok
    }

    const content = btoa(JSON.stringify(data, null, 2))

    const body = {
      message: `Update ${filePath}`,
      content: content,
      ...(sha && { sha }),
    }

    const response = await fetch(`https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/contents/${filePath}`, {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    return response.ok
  } catch (error) {
    console.error("Error writing JSON file:", error)
    return false
  }
}

function getGitHubToken() {
  return localStorage.getItem("github_token")
}

function setGitHubToken() {
  const token = prompt("Ingresa tu token de GitHub (se guardará localmente):")
  if (token) {
    localStorage.setItem("github_token", token)
    showMessage("Token de GitHub configurado correctamente!", "success")
  }
}

function checkGitHubToken() {
  const token = getGitHubToken()
  if (!token) {
    const setupDiv = document.createElement("div")
    setupDiv.innerHTML = `
      <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; margin: 20px 0; border-radius: 10px;">
        <h3><i class="fas fa-exclamation-triangle" style="color: #f39c12;"></i> Configuración Requerida</h3>
        <p>Para que el panel de administración funcione, necesitas configurar un token de GitHub.</p>
        <ol>
          <li>Ve a <a href="https://github.com/settings/tokens" target="_blank">GitHub Settings > Developer settings > Personal access tokens</a></li>
          <li>Crea un nuevo token con permisos de "repo"</li>
          <li>Copia el token y haz clic en el botón de abajo</li>
        </ol>
        <button class="btn-primary" onclick="setGitHubToken()">
          <i class="fas fa-key"></i> Configurar Token de GitHub
        </button>
        <p style="margin-top: 10px; font-size: 0.9em; color: #666;">
          <strong>Nota:</strong> También necesitas reemplazar "YOUR_USERNAME" y "YOUR_REPO" en el código con tu información real de GitHub.
        </p>
      </div>
    `
    document
      .querySelector(".admin-container")
      .insertBefore(setupDiv, document.querySelector(".admin-container").firstChild)
  }
}

function showMessage(message, type) {
  const messageDiv = document.createElement("div")
  messageDiv.className = `message ${type}`
  messageDiv.textContent = message
  document.body.appendChild(messageDiv)

  setTimeout(() => {
    document.body.removeChild(messageDiv)
  }, 3000)
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

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

// Initialize data with examples if not exists
function initializeData() {
  if (!localStorage.getItem("giveaways")) {
    const exampleGiveaways = [
      {
        id: "example1",
        name: "Dominus Empyreus",
        image: "/dominus-empyreus-roblox-hat.png",
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        description: "Increíble Dominus Empyreus para el ganador!",
        createdAt: new Date().toISOString(),
      },
      {
        id: "example2",
        name: "1000 Robux",
        image: "/robux-roblox-currency.png",
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
        description: "1000 Robux directos a tu cuenta!",
        createdAt: new Date().toISOString(),
      },
    ]
    localStorage.setItem("giveaways", JSON.stringify(exampleGiveaways))
  }

  if (!localStorage.getItem("participants")) {
    const exampleParticipants = {
      example1: ["Player123", "GamerPro456", "RobloxFan789", "NoobMaster2024", "BuilderKing"],
      example2: ["CoolPlayer1", "AwesomeGamer", "RobloxLover"],
    }
    localStorage.setItem("participants", JSON.stringify(exampleParticipants))
  }
}

// Add new giveaway
function addGiveaway(event) {
  event.preventDefault()
  console.log("[v0] Adding new giveaway...")

  const formData = new FormData(event.target)
  const giveaway = {
    id: generateId(),
    name: formData.get("item-name"),
    image: formData.get("item-image"),
    endDate: formData.get("end-date"),
    description: formData.get("description") || "",
    createdAt: new Date().toISOString(),
  }

  console.log("[v0] New giveaway data:", giveaway)

  try {
    const giveaways = JSON.parse(localStorage.getItem("giveaways") || "[]")
    giveaways.push(giveaway)
    localStorage.setItem("giveaways", JSON.stringify(giveaways))

    console.log("[v0] Giveaway saved successfully")
    showMessage("¡Sorteo creado exitosamente!", "success")
    event.target.reset()

    // Refresh the manage tab if it's visible
    if (document.getElementById("manage-giveaways").style.display !== "none") {
      loadAdminGiveaways()
    }
  } catch (error) {
    console.error("[v0] Error adding giveaway:", error)
    showMessage("Error al crear el sorteo.", "error")
  }
}

// Load giveaways for admin management
function loadAdminGiveaways() {
  console.log("[v0] Loading admin giveaways...")
  const listDiv = document.getElementById("admin-giveaways-list")

  try {
    const giveaways = JSON.parse(localStorage.getItem("giveaways") || "[]")
    const participants = JSON.parse(localStorage.getItem("participants") || "{}")

    console.log("[v0] Loaded giveaways:", giveaways)
    console.log("[v0] Loaded participants:", participants)

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
                   onerror="this.src='/generic-virtual-item.png'">
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
    console.error("[v0] Error loading admin giveaways:", error)
    listDiv.innerHTML = `
      <div class="error">
        <i class="fas fa-exclamation-triangle"></i> 
        Error al cargar los sorteos.
      </div>
    `
  }
}

// Delete giveaway
function deleteGiveaway(giveawayId) {
  if (!confirm("¿Estás seguro de que quieres eliminar este sorteo?")) {
    return
  }

  try {
    const giveaways = JSON.parse(localStorage.getItem("giveaways") || "[]")
    const participants = JSON.parse(localStorage.getItem("participants") || "{}")

    // Remove giveaway
    const updatedGiveaways = giveaways.filter((g) => g.id !== giveawayId)

    // Remove participants
    delete participants[giveawayId]

    localStorage.setItem("giveaways", JSON.stringify(updatedGiveaways))
    localStorage.setItem("participants", JSON.stringify(participants))

    showMessage("Sorteo eliminado exitosamente!", "success")
    loadAdminGiveaways()
  } catch (error) {
    console.error("Error deleting giveaway:", error)
    showMessage("Error al eliminar el sorteo.", "error")
  }
}

// End giveaway early
function endGiveaway(giveawayId) {
  if (!confirm("¿Estás seguro de que quieres finalizar este sorteo?")) {
    return
  }

  try {
    const giveaways = JSON.parse(localStorage.getItem("giveaways") || "[]")

    // Update end date to now
    const updatedGiveaways = giveaways.map((g) => {
      if (g.id === giveawayId) {
        return { ...g, endDate: new Date().toISOString() }
      }
      return g
    })

    localStorage.setItem("giveaways", JSON.stringify(updatedGiveaways))

    showMessage("Sorteo finalizado exitosamente!", "success")
    loadAdminGiveaways()
  } catch (error) {
    console.error("Error ending giveaway:", error)
    showMessage("Error al finalizar el sorteo.", "error")
  }
}

// Load active giveaways for drawing winners
function loadActiveGiveawaysForDraw() {
  const listDiv = document.getElementById("active-giveaways-for-draw")

  try {
    const giveaways = JSON.parse(localStorage.getItem("giveaways") || "[]")
    const participants = JSON.parse(localStorage.getItem("participants") || "{}")

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
                   onerror="this.src='/generic-virtual-item.png'">
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
function drawWinner(giveawayId) {
  try {
    const giveaways = JSON.parse(localStorage.getItem("giveaways") || "[]")
    const participants = JSON.parse(localStorage.getItem("participants") || "{}")

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

// Utility functions
function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

function showMessage(message, type) {
  const messageDiv = document.createElement("div")
  messageDiv.className = `message ${type}`
  messageDiv.textContent = message
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 5px;
    color: white;
    font-weight: bold;
    z-index: 10000;
    max-width: 300px;
    ${type === "success" ? "background-color: #28a745;" : "background-color: #dc3545;"}
  `
  document.body.appendChild(messageDiv)

  setTimeout(() => {
    if (document.body.contains(messageDiv)) {
      document.body.removeChild(messageDiv)
    }
  }, 3000)
}

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

// Initialize admin panel
document.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] Initializing admin panel...")

  // Initialize data with examples
  initializeData()

  // Show first tab by default
  showTab("add-giveaway")

  // Set minimum date to now for new giveaways
  const endDateInput = document.getElementById("end-date")
  if (endDateInput) {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    endDateInput.min = now.toISOString().slice(0, 16)
  }

  console.log("[v0] Admin panel initialized successfully")
})

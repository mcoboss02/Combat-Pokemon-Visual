/////////////////////////////////////////////////
// Stage3.js
// Created by: Manuel Cobos Solís
// Created date: 08/11/2024
/////////////////////////////////////////////////

/////////////////////////////////////////////////
// IMPORTS
/////////////////////////////////////////////////
import { calculateDamage, applyDamage } from "./CombatLogic.js";


/////////////////////////////////////////////////
// GLOBAL VARS
/////////////////////////////////////////////////
let backgroundMusic;
let playerPokemon, opponentPokemon;


/////////////////////////////////////////////////
// FUNCTIONS
/////////////////////////////////////////////////

/**
 * Plays the background music for the battle.
 * The audio is loaded from a file, set to loop indefinitely,
 * and the volume is adjusted to 40%.
 * If an error occurs while playing, it logs an error message to the console.
 */
function playBackgroundMusic() {
    backgroundMusic = new Audio("../sounds/battle.mp3");
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.4;
    backgroundMusic.play().catch((err) => {
        console.error("Error al reproducir la música de fondo:", err);
    });
}

/**
 * Stops the background music from playing.
 * If the music is currently playing, it is paused and the time is reset to 0.
 * If no music is playing, this function has no effect.
 */
function stopBackgroundMusic() {
    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }
}

/**
 * Retrieves the Pokémon data from cookies based on the provided cookie name.
 * 
 * @param {string} cookieName - The name of the cookie to search for.
 * @returns {Object|null} The parsed Pokémon data if the cookie is found, or null if not.
 */
function getPokemonFromCookies(cookieName) {
    const cookies = document.cookie.split("; ");
    const pokemonCookie = cookies.find((cookie) =>
        cookie.startsWith(`${cookieName}=`)
    );
    if (pokemonCookie) {
        return JSON.parse(pokemonCookie.split("=")[1]);
    }
    return null;
}

/**
 * Appends a new message to the combat log displayed on the page.
 * 
 * @param {string} message - The message to be added to the combat log.
 */
function addLog(message) {
    const logContainer = document.getElementById("combat-log");
    const logEntry = document.createElement("li");
    logEntry.textContent = message;
    logContainer.appendChild(logEntry);
}

/**
 * Updates the displayed information for the player and opponent Pokémon.
 * 
 * @param {Object} playerPokemon - The player's Pokémon.
 * @param {Object} opponentPokemon - The opponent's Pokémon.
 */
function updateUI(playerPokemon, opponentPokemon) {
    updateHPBar("player", playerPokemon.hp);
    updateHPBar("opponent", opponentPokemon.hp);

    document.getElementById("player-img").src = playerPokemon.img;
    document.getElementById("opponent-img").src = opponentPokemon.img;
}

/**
 * Displays a popup message with a delay and sets up a restart button.
 * 
 * The popup displays a given message after a specified delay. Once
 * displayed, the popup's restart button stops the background music and
 * redirects the user to Stage1.html.
 * 
 * @param {string} message - The message to display in the popup.
 * @param {number} [delay=4000] - The delay in milliseconds before showing the popup.
 */
function showPopupWithDelay(message, delay = 4000) {
    setTimeout(() => {
        const popup = document.getElementById("popup");
        const popupMessage = document.getElementById("popup-message");
        popupMessage.textContent = message;
        popup.classList.remove("hidden");

        const restartButton = document.getElementById("popup-restart");
        restartButton.addEventListener("click", () => {
            stopBackgroundMusic();
            window.location.href = "./Stage1.html";
        });
    }, delay);
}

/**
 * Plays the defeat animation for a Pokémon container.
 *
 * This function adds a defeat animation class to the specified Pokémon container
 * and sets a timeout to hide the container after the animation is complete.
 *
 * @param {string} role - The role of the Pokémon ('player' or 'opponent') whose
 * animation is to be played. This corresponds to the container's ID prefix.
 */
function playDefeatAnimation(role) {
    const pokemonContainer = document.getElementById(`${role}-pokemon`);
    if (pokemonContainer) {
        pokemonContainer.classList.add("defeat-animation");
        setTimeout(() => {
            pokemonContainer.style.visibility = "hidden";
        }, 3000);
    }
}

/**
 * Checks if a winner has been determined in the current combat.
 * If a winner has been determined, it stops the background music, updates the UI,
 * plays a defeat animation for the losing Pokémon, and shows a popup with a delay.
 * It returns true if a winner has been determined, false otherwise.
 * @param {Object} playerPokemon - The player's Pokémon.
 * @param {Object} opponentPokemon - The opponent's Pokémon.
 * @returns {boolean} True if a winner has been determined, false otherwise.
 */
function checkWinner(playerPokemon, opponentPokemon) {
    if (playerPokemon.hp <= 0) {
        stopBackgroundMusic();
        updateUI(playerPokemon, opponentPokemon);
        playDefeatAnimation("player");
        showPopupWithDelay("¡Perdiste! Tu Pokémon fue derrotado.", 4000);
        return true;
    }
    if (opponentPokemon.hp <= 0) {
        stopBackgroundMusic();
        updateUI(playerPokemon, opponentPokemon);
        playDefeatAnimation("opponent");
        showPopupWithDelay("¡Ganaste! Derrotaste al Pokémon oponente.", 4000);
        return true;
    }
    return false;
}

/**
 * Heals a Pokémon.
 * If the Pokémon already has full HP, it is considered unable to heal and returns 0.
 * Otherwise, it heals a random value between 10 and 29 HP, but no more than
 * necessary to complete its HP. The effective healing value is returned.
 * @param {Object} pokemon - The Pokémon to heal.
 * @returns {number} The effective healing value.
 */
function healPokemon(pokemon) {
    if (pokemon.hp >= pokemon.max_hp) {
        addLog(`¡${pokemon.name} no puede curarse porque ya tiene HP completo! Pierde el turno.`);
        return 0;
    }
    const healAmount = Math.floor(Math.random() * 20) + 10;
    const actualHeal = Math.min(healAmount, pokemon.max_hp - pokemon.hp);
    pokemon.hp += actualHeal;
    return actualHeal;
}

/**
 * Updates the HP bar and text display for a Pokémon based on its current HP.
 * 
 * This function adjusts the width and value of the progress element representing
 * the HP bar, updates the displayed HP text, and changes the visual styling
 * of the Pokémon container based on the percentage of HP remaining.
 * 
 * @param {string} role - The role of the Pokémon ('player' or 'opponent') whose
 * HP bar is being updated.
 * @param {number} hp - The current HP of the Pokémon.
 */
function updateHPBar(role, hp) {

    // HTML references, get by '$role' value 
    const hpBar = document.getElementById(`${role}-hp`);
    const hpText = document.getElementById(`${role}-current-hp`);

    if (!hpBar || !hpText) return;

    let lifePercentage;

    if (role === "player") {
        lifePercentage = (hp / playerPokemon.max_hp) * 100;
    } else if (role === "opponent") {
        lifePercentage = (hp / opponentPokemon.max_hp) * 100;
    }

    hpBar.style.width = `${playerPokemon.max_hp*3}px`;

    hpBar.value = hp;
    if (role === "player") {
        hpText.textContent = `${hp}/${playerPokemon.max_hp}`;
    } else if (role === "opponent") {
        hpText.textContent = `${hp}/${opponentPokemon.max_hp}`;
    }

    const container = document.getElementById(`${role}-pokemon`);
    container.classList.remove("low-hp", "medium-hp", "high-hp");

    if (lifePercentage > 80) {
        container.classList.add("high-hp");
    } else if (lifePercentage > 40) {
        container.classList.add("medium-hp");
    } else {
        container.classList.add("low-hp");
    }
}

/**
 * Initializes the combat by displaying the player and opponent Pokémon and
 * enabling the battle buttons. The current turn is set to the player.
 * 
 * @param {Object} playerPokemon - The player's Pokémon.
 * @param {Object} opponentPokemon - The opponent's Pokémon.
 */
function initCombat(playerPokemon, opponentPokemon) {
    let currentTurn = "player";
    updateUI(playerPokemon, opponentPokemon);

    const buttons = {
        attack: document.getElementById("attack-btn"),
        special: document.getElementById("special-btn"),
        heal: document.getElementById("heal-btn"),
    };

    /**
     * Enables all the combat buttons.
     */
    const enableButtons = () => {
        for (let key in buttons) {
            buttons[key].disabled = false;
        }
    };

    /**
     * Disables all the combat buttons.
     */
    const disableButtons = () => {
        for (let key in buttons) {
            buttons[key].disabled = true;
        }
    };

    /**
     * Executes the player's or opponent's turn based on the current turn.
     * If it is the player's turn, applies the selected action to the opponent's
     * Pokémon and updates the battle log. If it is the opponent's turn, makes
     * the opponent attack or heal randomly and updates the battle log.
     * If either Pokémon's HP reaches 0, the game is over and the function returns.
     * 
     * @param {string} action - The action to execute. Can be "attack", "special", or "heal".
     */
    const executeTurn = (action) => {
        if (currentTurn === "player") {
            if (action === "attack") {
                const damage = calculateDamage(playerPokemon, opponentPokemon, false);
                applyDamage(opponentPokemon, damage);
                addLog(`¡${playerPokemon.name} atacó a ${opponentPokemon.name} causando ${damage} de daño!`);
            
            } else if (action === "special") {
                const damage = calculateDamage(playerPokemon, opponentPokemon, true);
                applyDamage(opponentPokemon, damage);
                addLog(`¡${playerPokemon.name} usó un ataque especial causando ${damage} de daño!`);
            
            } else if (action === "heal") {
                const healAmount = healPokemon(playerPokemon);
                if (healAmount > 0) {
                    addLog(`¡${playerPokemon.name} se curó y recuperó ${healAmount} HP!`);
                }
            }
            if (checkWinner(playerPokemon, opponentPokemon)) return;
            currentTurn = "opponent";
            disableButtons();
            setTimeout(() => enemyTurn(playerPokemon, opponentPokemon), 2000);
        }
    };

    buttons.attack.addEventListener("click", () => executeTurn("attack"));
    buttons.special.addEventListener("click", () => executeTurn("special"));
    buttons.heal.addEventListener("click", () => executeTurn("heal"));

    /**
     * Makes the opponent Pokémon perform a random action.
     * If the opponent Pokémon chooses to attack, uses the calculateDamage
     * function to determine the amount of damage to deal to the player's
     * Pokémon and updates the battle log. If the opponent Pokémon chooses
     * to heal, uses the healPokemon function to heal the opponent Pokémon
     * and updates the battle log. After the opponent's turn is over, the
     * function checks if there is a winner. If there is, the game is over
     * and the function returns. Otherwise, the function updates the UI
     * and enables the buttons to allow the player to take their turn.
     * 
     * @param {Object} playerPokemon - The player's Pokémon object.
     * @param {Object} opponentPokemon - The opponent's Pokémon object.
     */
    const enemyTurn = (playerPokemon, opponentPokemon) => {
        const actions = ["attack", "special", "heal"];
        const randomAction = actions[Math.floor(Math.random() * actions.length)];

        if (randomAction === "attack") {
            const damage = calculateDamage(opponentPokemon, playerPokemon, false);
            applyDamage(playerPokemon, damage);
            addLog(`¡${opponentPokemon.name} atacó a ${playerPokemon.name} causando ${damage} de daño!`);
        
        } else if (randomAction === "special") {
            const damage = calculateDamage(opponentPokemon, playerPokemon, true);
            applyDamage(playerPokemon, damage);
            addLog(`¡${opponentPokemon.name} usó un ataque especial causando ${damage} de daño!`);
        
        } else if (randomAction === "heal") {
            const healAmount = healPokemon(opponentPokemon);
            if (healAmount > 0) {
                addLog(`¡${opponentPokemon.name} se curó y recuperó ${healAmount} HP!`);
            }
        }
        if (checkWinner(playerPokemon, opponentPokemon)) return;
        updateUI(playerPokemon, opponentPokemon);
        currentTurn = "player";
        enableButtons();
    };
}

/////////////////////////////////////////////////
// EXECUTION
/////////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", () => {
    const popup = document.getElementById("popup");
    popup.classList.add("hidden");

    playerPokemon = getPokemonFromCookies("playerPokemon");
    opponentPokemon = getPokemonFromCookies("opponentPokemon");

    if (!playerPokemon || !opponentPokemon) {
        alert("Faltan datos de combate. Serás redirigido al Stage1.");
        window.location.href = "./Stage1.html";
        return;
    }

    playerPokemon.max_hp = playerPokemon.hp;
    opponentPokemon.max_hp = opponentPokemon.hp;

    const initialHpBarOpponent = document.getElementById("opponent-hp");
    initialHpBarOpponent.setAttribute("max", opponentPokemon.hp);

    const initialHpBarPlayer = document.getElementById("player-hp");
    initialHpBarPlayer.setAttribute("max", playerPokemon.hp);

    playBackgroundMusic();
    initCombat(playerPokemon, opponentPokemon);
});

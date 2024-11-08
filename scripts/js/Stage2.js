/////////////////////////////////////////////////
// Stage2.js
// Created by: Manuel Cobos Solís
// Created date: 08/11/2024
/////////////////////////////////////////////////

/////////////////////////////////////////////////
// IMPORTS
/////////////////////////////////////////////////
import { pokemons } from "../../data/Pokemons.js";

/////////////////////////////////////////////////
// FUNCTIONS
/////////////////////////////////////////////////

/**
 * Play a sound File
 *
 * @param {string} soundFile - Location of file.
 * @returns {void}
 */
function playSound(soundFile) {
    const audio = new Audio(soundFile);
    audio.addEventListener("error", () => {
        console.error(`Error: No se pudo cargar el archivo de sonido ${soundFile}`);
    });
    audio.play().catch((err) => {
        console.error(`Error al reproducir el sonido ${soundFile}:`, err);
    });
}

/**
 * Loads the selected Pokémon from the cookies.
 * If the cookie exists, returns the loaded data.
 * If the cookie does not exist, returns null.
 *
 * @returns {Object|null} The selected Pokémon data or null if not found.
 */
function getPokemonFromCookies() {
    const cookies = document.cookie.split("; ");
    const selectedPokemonCookie = cookies.find((cookie) =>
        cookie.startsWith("selectedPokemon=")
    );
    if (selectedPokemonCookie) {
        return JSON.parse(selectedPokemonCookie.split("=")[1]);
    }
    return null;
}

/**
 * Returns a boolean indicating if the Pokémon is shiny or not.
 * The probability of a Pokémon being shiny is 10%.
 *
 * @returns {boolean} Whether the Pokémon is shiny or not.
 */
function isShiny() {
    return Math.random() < 0.1;
}

/**
 * Gets an opponent Pokémon for the given player Pokémon.
 * The opponent Pokémon is randomly selected from the available Pokémon.
 * The probability of the opponent Pokémon being shiny is 10%.
 * The shiny status of the opponent Pokémon is stored in the returned object.
 *
 * @param {Object} playerPokemon - The player's Pokémon object.
 * @returns {Object} The opponent Pokémon object with shiny status.
 */
function getOpponentPokemon(playerPokemon) {
    let availablePokemons = pokemons.filter(
        (pokemon) => pokemon.name !== playerPokemon.name
    );
    const opponentPokemon = availablePokemons[Math.floor(Math.random() * availablePokemons.length)];

    const shiny = isShiny();
    if (shiny) {
        opponentPokemon.img = opponentPokemon.img.replace("normal-sprite", "shiny-sprite");
    }
    opponentPokemon.shiny = shiny;

    return opponentPokemon;
}

/**
 * Saves the given player and opponent Pokémon to the cookies.
 * Updates the image URL if either Pokémon is shiny to reflect
 * the shiny appearance. The cookies are saved with a max-age
 * of 24 hours.
 * 
 * @param {Object} playerPokemon - The player's Pokémon to save.
 * @param {Object} opponentPokemon - The opponent's Pokémon to save.
 */
function savePokemonsToCookies(playerPokemon, opponentPokemon) {
    if (playerPokemon.shiny) {
        playerPokemon.img = playerPokemon.img.replace("normal-sprite", "shiny-sprite");
    }
    if (opponentPokemon.shiny) {
        opponentPokemon.img = opponentPokemon.img.replace("normal-sprite", "shiny-sprite");
    }

    document.cookie = `playerPokemon=${JSON.stringify(playerPokemon)}; path=/; max-age=86400;`;
    document.cookie = `opponentPokemon=${JSON.stringify(opponentPokemon)}; path=/; max-age=86400;`;
}

/**
 * Shows the presentation of the player and opponent Pokémon.
 * This function is responsible for loading the HTML elements of the presentation,
 * setting the images, names and types of both Pokémon, and adding animations and sounds.
 * After the animation, it saves both Pokémon to the cookies and redirects to Stage3.html.
 * @param {Object} playerPokemon - The player's Pokémon object.
 * @param {Object} opponentPokemon - The opponent's Pokémon object.
 */
function showPresentation(playerPokemon, opponentPokemon) {

    // HTML references
    const playerContainer = document.getElementById("pokemon-player");
    const opponentContainer = document.getElementById("pokemon-opponent");
    const vsContainer = document.getElementById("vs-container");

    // Set images and names to Player's Pokemon
    document.getElementById("player-img").src = playerPokemon.img;
    document.getElementById("player-name").textContent = playerPokemon.name;
    document.getElementById("player-types").textContent = `Tipos: ${playerPokemon.types.join(", ")}`;
    if (playerPokemon.shiny) {
        document.getElementById("player-name").innerHTML += " ✨";
    }

    // Set images and names to Opponent's Pokemon
    document.getElementById("opponent-img").src = opponentPokemon.img;
    document.getElementById("opponent-name").textContent = opponentPokemon.name;
    document.getElementById("opponent-types").textContent = `Tipos: ${opponentPokemon.types.join(", ")}`;
    if (opponentPokemon.shiny) {
        document.getElementById("opponent-name").innerHTML += " ✨";
    }

    // Intro animation for Player Pokemon.
    setTimeout(() => {
        playerContainer.classList.add("animate-in");
    }, 500);

    // VS text
    setTimeout(() => {
        playSound("../sounds/vs.mp3");
        vsContainer.style.opacity = 1;
    }, 1500);

    // Intro animation for Opponent Pokemon
    setTimeout(() => {
        opponentContainer.classList.add("animate-in");
    }, 2000);

    // Go to Stage3.html after 4 seconds
    setTimeout(() => {
        savePokemonsToCookies(playerPokemon, opponentPokemon);
        window.location.href = "./Stage3.html";
    }, 4000);
}

/////////////////////////////////////////////////
// EXECUTION
/////////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", () => {
    const playerPokemon = getPokemonFromCookies();

    if (!playerPokemon) {
        alert("No has seleccionado un Pokémon. Serás redirigido al Stage1.");
        window.location.href = "./Stage1.html";
        return;
    }

    const opponentPokemon = getOpponentPokemon(playerPokemon);
    showPresentation(playerPokemon, opponentPokemon);
});

/////////////////////////////////////////////////
// Stage1.js
// Created by: Manuel Cobos Solís
// Created date: 08/11/2024
/////////////////////////////////////////////////

/////////////////////////////////////////////////
// IMPORTS
/////////////////////////////////////////////////
import { pokemons } from "../../data/Pokemons.js";


/////////////////////////////////////////////////
// VARS WITH HTML REFERENCES 
/////////////////////////////////////////////////
const pokemonList = document.getElementById("pokemon-list");
const pokemonDetails = document.getElementById("pokemon-details");
const confirmSelectionBtn = document.getElementById("confirm-selection");


/////////////////////////////////////////////////
// LOCAL VARS
/////////////////////////////////////////////////
let selectedPokemon = null;


/////////////////////////////////////////////////
// FUNCTIONS
/////////////////////////////////////////////////

/**
 * Determines if a Pokémon is shiny.
 * @returns {boolean} True if the Pokémon is shiny, false otherwise.
 * The probability of a Pokémon being shiny is 10%.
 */
function isShiny() {
  return Math.random() < 0.1;
}

/**
 * Saves the given Pokémon to the cookies.
 * @param {Object} pokemon The Pokémon to save.
 * If the Pokémon is shiny, the image URL is modified to reflect this.
 * The cookie is saved with a max-age of 24 hours.
 */
function savePokemonToCookies(pokemon) {
  if (pokemon.shiny) {
    pokemon.img = pokemon.img.replace("normal-sprite", "shiny-sprite");
  }
  document.cookie = `selectedPokemon=${JSON.stringify(pokemon)}; path=/; max-age=86400;`;
}

/**
 * Loads the selected Pokémon from the cookies.
 * If the cookie exists, calls `selectPokemon` with the loaded data and `shiny` set to the value loaded from the cookie.
 * If the cookie does not exist, does not do anything.
 */
function loadPokemonFromCookies() {
  const cookies = document.cookie.split("; ");
  const selectedPokemonCookie = cookies.find((cookie) =>
    cookie.startsWith("selectedPokemon=")
  );
  if (selectedPokemonCookie) {
    const pokemonData = JSON.parse(selectedPokemonCookie.split("=")[1]);
    selectPokemon(pokemonData, pokemonData.shiny, false);
  }
}

/**
 * Displays a list of Pokémon as interactive cards on the page.
 * Each card represents a Pokémon and may have a shiny appearance with a 10% probability.
 * The card includes an image and the name of the Pokémon.
 * Adds event listeners to each card to handle selection and detail display.
 * Clicking a card selects the Pokémon, showing its details and enabling further actions.
 * Hovering over a card temporarily displays the Pokémon's details.
 * The list is appended to the `pokemonList` element.
 */
function displayPokemonList() {
  pokemons.forEach((pokemon) => {
    const shiny = isShiny();
    const imageUrl = shiny ? pokemon.img.replace("normal-sprite", "shiny-sprite") : pokemon.img;
    const card = document.createElement("div");
    card.classList.add("pokemon-card");

    if (shiny) card.classList.add("shiny");

    card.innerHTML = `
      <img src="${imageUrl}" alt="${pokemon.name}">
      <h3>${pokemon.name}</h3>
    `;

    card.addEventListener("click", () => selectPokemon(pokemon, shiny));
    card.addEventListener("mouseover", () => displayPokemonDetails(pokemon, shiny));
    card.addEventListener("mouseout", () => resetToSelectedPokemon());

    pokemonList.appendChild(card);
  });
}

/**
 * Displays the details of a given Pokémon on the page.
 * The details include the name, types, attack, defense, and HP of the Pokémon.
 * If the Pokémon is shiny, a gold "✨ Shiny ✨" label is added below the HP.
 * The details are displayed in the element with the id "pokemon-details".
 * @param {Object} pokemon The Pokémon to display the details of.
 * @param {boolean} shiny Whether the Pokémon is shiny or not.
 */
function displayPokemonDetails(pokemon, shiny = false) {
  const imageUrl = shiny ? pokemon.img.replace("normal-sprite", "shiny-sprite") : pokemon.img;

  pokemonDetails.innerHTML = `
    <img src="${imageUrl}" alt="${pokemon.name}" style="width:100%; max-height:150px;">
    <h3>${pokemon.name}</h3>
    <p><strong>Tipos:</strong> ${pokemon.types.join(", ")}</p>
    <p><strong>Ataque:</strong> ${pokemon.attack}</p>
    <p><strong>Defensa:</strong> ${pokemon.defense}</p>
    <p><strong>HP:</strong> ${pokemon.hp}</p>
    ${shiny ? '<p style="color: gold; font-weight: bold;">✨ Shiny ✨</p>' : ""}
  `;
}

/**
 * Selects a Pokémon, optionally applying a shiny appearance and saving it.
 * 
 * This function updates the currently selected Pokémon with the given data,
 * modifies the image URL if the Pokémon is shiny, and displays its details.
 * It enables the confirmation button for selection and saves the Pokémon
 * to cookies if specified.
 *
 * @param {Object} pokemon - The Pokémon to be selected.
 * @param {boolean} shiny - Whether the Pokémon is shiny or not. Default is false.
 * @param {boolean} save - Whether to save the selected Pokémon to cookies. Default is true.
 */
function selectPokemon(pokemon, shiny = false, save = true) {
  selectedPokemon = { ...pokemon, shiny };

  if (shiny) {
    selectedPokemon.img = selectedPokemon.img.replace(
      "normal-sprite",
      "shiny-sprite"
    );
  }

  displayPokemonDetails(pokemon, shiny);
  confirmSelectionBtn.disabled = false;

  if (save) {
    savePokemonToCookies(selectedPokemon);
  }
}

/**
 * Resets the Pokémon details to the currently selected Pokémon.
 *
 * If a Pokémon has been selected, this function will display its details
 * again. If no Pokémon has been selected, the details will be cleared.
 */
function resetToSelectedPokemon() {
  if (selectedPokemon) {
    displayPokemonDetails(selectedPokemon, selectedPokemon.shiny);
  } else {
    clearPokemonDetails();
  }
}

/**
 * Clears the Pokémon details section to its initial state.
 *
 * This function is called when the user selects a new Pokémon, or when the
 * page is first loaded.
 */
function clearPokemonDetails() {
  pokemonDetails.innerHTML = `<p>Selecciona un Pokémon para ver sus detalles.</p>`;
}

/**
 * Event listeners
 * Confirm that the selected Pokemon has save to cookies.
 */
confirmSelectionBtn.addEventListener("click", () => {
  if (selectedPokemon) {
    savePokemonToCookies(selectedPokemon);
    window.location.href = "./Stage2.html";
  }
});


/////////////////////////////////////////////////
// EXECUTION
/////////////////////////////////////////////////
displayPokemonList();
loadPokemonFromCookies();
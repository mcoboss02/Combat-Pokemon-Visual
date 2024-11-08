/////////////////////////////////////////////////
// ComatLogic.js
// Created by: Manuel Cobos Solís
// Created date: 08/11/2024
/////////////////////////////////////////////////

/**
 * Calculates the amount of damage that one Pokémon will deal to another.
 *
 * This takes into account the attacker's attack stat, the defender's defense stat, and
 * whether the attack is special or not. If the attack is special, the attacker's attack
 * stat is multiplied by 1.5. Then, the defender's defense stat is subtracted from the
 * attacker's attack stat to get the final damage. If the result is negative, the final
 * damage is set to 5.
 *
 * @param {Object} attacker the Pokémon that is attacking
 * @param {Object} defender the Pokémon that is being attacked
 * @param {boolean} isSpecial whether the attack is special or physical
 * @returns {number} the amount of damage that the attacker will deal to the defender
 */
export function calculateDamage(attacker, defender, isSpecial) {
    const baseDamage = isSpecial ? attacker.attack * 1.5 : attacker.attack;
    const reducedDamage = baseDamage - defender.defense;
    return Math.max(reducedDamage, 5); 
}

/**
 * Applies damage to a Pokémon, reducing its HP.
 *
 * The function subtracts the given damage from the Pokémon's current HP.
 * If the resulting HP is less than zero, it sets the HP to zero to
 * ensure it doesn't go negative.
 *
 * @param {Object} pokemon - The Pokémon whose HP is being reduced
 * @param {number} damage - The amount of damage to be applied
 */
export function applyDamage(pokemon, damage) {
    pokemon.hp = Math.max(pokemon.hp - damage, 0);
}
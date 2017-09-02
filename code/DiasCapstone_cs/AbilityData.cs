using UnityEngine;
using System.Collections;

/*
 *	Stores basic information about a corresponding ability
 *	To be used in the Game Lobby, to allow the player to see information about the given ability
 *	A parallel database of all AbilityData is stored in AbilityDatabase
 */
public class AbilityData 
{
	public string abilityName {get; private set;}
	public string scriptName {get; private set;}
	public string abilityDescription {get; private set;}
	public float cooldownLength {get; private set;}			//a cooldownLength of < 0 indicates that an ability does not have a cooldown

	public AbilityData(string ability_name, string script_name, string ability_description, float cooldown_length)
	{
		abilityName = ability_name;
		scriptName = script_name;
		abilityDescription = ability_description;
		cooldownLength = cooldown_length;
	}

	/*
	 *	Adds this ability to the given player, via the following steps:
	 *		1. Creates the ability represented by this AbilityData
	 * 		2. Sets that abilty's AbilityData to this AbilityData
	 *		3. Adds this ability to the player's ability list
	 * 		4. Adds the player's reference to the ability
	 */
	public void AddToPlayer(CharacterBuildScript player)
	{
		Ability ability = (Ability)player.gameObject.AddComponent(scriptName);
		ability.abilityData = this;
		player.AddAbility(ability);
		ability.AddPlayer(player);
	}
}

using UnityEngine;
using System.Collections;
using System.Collections.Generic;

/*
 *	AbilityDatabase - contains AbilityData for all abilities in the game
 *	
 *	This is incomplete.  More abilities are being added as they are created.
 */
public static class AbilityDatabase
{
	public static AbilityData MISSING_ABILITY_DATA = new AbilityData("", "", "", -1f);

	static List<AbilityData> roleAbilities;
	static List<AbilityData> moveAbilities;

	static AbilityDatabase()
	{
		roleAbilities = new List<AbilityData>();
		roleAbilities.Add(new AbilityData("Cone Push", 		"AbilityConePushScript", 			"Pushes other players away from you, in a cone area in front of the player", 									2f));
		roleAbilities.Add(new AbilityData("Box Drop", 		"AbilityBoxDropScript", 			"Drops a box out of the sky on unsuspecting players", 															0.002f));
		roleAbilities.Add(new AbilityData("Area Push", 		"AbilityAreaPushScript", 			"Pushes other players away from you, in a circular area around the player", 									2f));
		roleAbilities.Add(new AbilityData("Blink",			"AbilityBlinkScript", 				"Teleports the player up while they are on the ground, safely away from incoming attacks or other players", 	2f));
		roleAbilities.Add(new AbilityData("Create Wall", 	"AbilityCreateWall", 				"Creates a wall in front of the player that will block movement and some abilities", 							3f));
		roleAbilities.Add(new AbilityData("Gravity Toggle", "AbilityGravityToggleScript", 		"Toggles gravity on and off for this player", 																	-1f));

		moveAbilities = new List<AbilityData>();
		moveAbilities.Add(new AbilityData("Double Jump", 	"AbilityDoubleJump", 				"Adds a bonus jump to the number of times a player can jump", 													-1f));
		moveAbilities.Add(new AbilityData("Dash", 			"AbilityDash", 						"Allows the player to quickly dash forward", 																	3f));
	}

	public static AbilityData GetRoleAbility(int x)
	{
		if(x >= 0 && x < roleAbilities.Count)
			return roleAbilities[x];

		Debug.LogError("Ability Database Error Trying to grab Role ability beyond database");
		return MISSING_ABILITY_DATA;
	}

	public static AbilityData GetMoveAbility(int x)
	{
		if(x >= 0 && x < moveAbilities.Count)
			return moveAbilities[x];

		Debug.LogError("Ability Database Error Trying to grab Move ability beyond database");
		return MISSING_ABILITY_DATA;
	}

	/*
	 *	Always returns a new list, so the abilties in the database are never edited
	 */
	public static List<AbilityData> GetRoleAbilities()
	{
		return new List<AbilityData>(roleAbilities);
	}

	/*
	 *	Always returns a new list, so the abilties in the database are never edited
	 */
	public static List<AbilityData> GetMoveAbilities()
	{
		return new List<AbilityData>(moveAbilities);
	}

	/*
	 *	Get's the ability from the given integer
	 */
	public static AbilityData GetDataFromNetValue(int abilityNetValue)
	{
		if(abilityNetValue < roleAbilities.Count)
			return roleAbilities[abilityNetValue];
		else
			return moveAbilities[abilityNetValue - roleAbilities.Count];
	}

	/*
	 *	Get's an integer representing the ability, for sending the data over the network
	 */
	public static int GetNetworkValue(AbilityData a)
	{
		if(roleAbilities.Contains(a))
			return roleAbilities.IndexOf(a);
		else
			return roleAbilities.Count + moveAbilities.IndexOf(a);
	}
}

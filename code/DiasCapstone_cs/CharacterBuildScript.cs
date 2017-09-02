using UnityEngine;
using System.Collections;
using System.Collections.Generic;

[RequireComponent (typeof (NetworkView))]
public class CharacterBuildScript : MonoBehaviour 
{
	public int jumpCount {get; private set;}	//Current number of jumps remaining for the player
	public int totalJumps {get; set;}			//Maximum number of jumps a player can do - needs public set in order to be modified by abilities

	/*
	 *	abilities - List of all the abilities this character can cast
	 *		0. Jump ability
	 *		1. Dash ability
	 *		2-5. 4 abilities based on the character's role (i.e. light, support, heavy)
	 */
	List<Ability> abilities;
	public CharacterBuildData buildData;		//stores a reference to this player's build

	CameraControllerScript cam;					//Handles the different camera, including the character camera
	HUDScript hud;								//draws the HUD to the screen
	ScoreMenuScript scoreMenu;					//draws the score menu when the player is holding tab
	PlayerDataScript playerData;				//Stores parallel data about each player's build on each client
	NetworkManagerScript networkManager;		//Handles connection to the server/hosting a server, and the client's netID
	CharacterNameDisplayScript nameDisplay;		//draws the character's name above the player during gameplay

	/*
	 *	Called by Unity after the gameobject is created, and before any other start method is called.
	 */
	void Awake () 
	{
		jumpCount = totalJumps = GameSettings.standardJumpCount;
		abilities = new List<Ability>();

		GameObject game = GameObject.FindGameObjectWithTag("GameController");
		hud = game.GetComponent<HUDScript>();
		scoreMenu = game.GetComponent<ScoreMenuScript>();
		networkManager = game.GetComponent<NetworkManagerScript>();
		playerData = game.GetComponent<PlayerDataScript>();
		nameDisplay = transform.Find("CharacterNameDisplay").GetComponent<CharacterNameDisplayScript>();
	}

	/*
	 *	Called after the Character Prefab is Network instantiated
	 *	Handles all setup for this character based on the build stored by the given player's playerID.
	 */
	[RPC]
	void ApplyBuild(NetworkViewID playerID, NetworkMessageInfo info)
	{
		buildData = playerData.GetPlayerData(playerID);		//grab our Player's buildData from PlayerData
		buildData.character = this;							//mark this CharacterBuildScript in the PlayerData, under the appropriate player

		//for the overhead name display, mark our build
		nameDisplay.RegisterPlayerData(buildData);

		//Set the player's color based on the team they have selected
		transform.Find("CharacterModel").renderer.material.SetColor("_Color", buildData.team.color);

		//Always add the two movement abilities first, jump, then dash
		AbilityDatabase.GetMoveAbility(buildData.jumpAbility).AddToPlayer(this);	//jump
		AbilityDatabase.GetMoveAbility(buildData.dashAbility).AddToPlayer(this);	//dash
		
		//add the role abilities
		AbilityDatabase.GetRoleAbility(buildData.ability1).AddToPlayer(this);
		AbilityDatabase.GetRoleAbility(buildData.ability2).AddToPlayer(this);
		AbilityDatabase.GetRoleAbility(buildData.ability3).AddToPlayer(this);
		AbilityDatabase.GetRoleAbility(buildData.ability4).AddToPlayer(this);

		//if this is our player, register the build with the HUD
		if(networkView.isMine)
			hud.RegisterCharacterBuild(this);

		//start the cooldowns for this player
		RestartAbilities();
	}

	/*
	 *	Called by Unity when the gameobject this script is attached to is destroyed
	 */
	void OnDestroy()
	{
		hud.ClearCharacterBuild();
		buildData.character = null;
	}

	/*
	 *	Called by the RespawnManagerScript when the character is respawned onto the map
	 */
	public void RespawnAction(bool start)
	{
		//tell the menus that this player is respawning
		hud.RespawnAction(start);
		scoreMenu.RespawnAction(start);

		//if we are ending the respawn action, reset the abilities to castable
		if(!start)
			RestartAbilities();
	}

	/*
	 *	Return all this player's abilities to the uncasted position.
	 */
	public void RestartAbilities()
	{
		foreach(Ability a in abilities)
			a.Reset();
	}

	/*
	 *	Always returns a new list, so the caller can't modify this player's ability list
	 */
	public List<Ability> GetAbilities()
	{
		return new List<Ability>(abilities);
	}

	public Ability GetAbility(int abilityNum)
	{
		return abilities[abilityNum];
	}

	public void AddAbility(Ability ability)
	{
		abilities.Add(ability);
	}

	/*
	 *	Return the current jump count to the max number of jumps the player is allowed
	 */
	public void ResetJumpCount()
	{
		jumpCount = totalJumps;
	}

	/*
	 *	Jumping is handled in the CharacterMovementScript, and the ability does not need to be "cast" in the same manner as other abilities
	 */
	public void DoJump()
	{
		jumpCount--;
	}

	/*
	 *	Tell all clients that this character is Dashing, and do the dash locally
	 */
	public void DoDash()
	{
		//dash will always be ability 1
		networkView.RPC("CastAbility", RPCMode.All, Vector3.zero, Quaternion.identity, 1);
	}

	public bool CanJump()
	{
		return jumpCount > 0;
	}

	public bool CanDash()
	{
		return abilities[1].CanCast();
	}

	/*
	 *	Trys to cast the 4 
	 *	this should only be used locally by the player that is actually doing the casting
	 */
	public void Cast(bool ability1, bool ability2, bool ability3, bool ability4, bool dashing) 
	{
		TryCast(ability1, 2);
		TryCast(ability2, 3);
		TryCast(ability3, 4);
		TryCast(ability4, 5);

		if(dashing && CanDash())
			DoDash();
	}

	/*
	 *	Attempts to cast the given ability
	 *	If the ability can be cast, it is sent to all clients to activate that ability for the player
	 */
	void TryCast(bool trying, int abilityNum)
	{
		if(trying && abilities[abilityNum].CanCast())
			networkView.RPC("CastAbility", RPCMode.All, abilities[abilityNum].GetCastPosition(), abilities[abilityNum].GetCastDirection(), abilityNum);
	}
	
	
	/*
	 *	RPC method that is called on this object for each client.
	 */
	[RPC]
	public void CastAbility(Vector3 castLoc, Quaternion castDir, int abilityNum, NetworkMessageInfo info) 
	{
		abilities[abilityNum].Cast(castLoc, castDir);
	}
}
